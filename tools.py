#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tools.py — Full-Duplex-Bench v3 (FDB-v3) Compliant Tool Suite.

Implements FunctionContext with the 12 benchmark tools across 4 domains:
  - Travel & Identity: search_flights, book_flight, update_identity_doc
  - Finance & Billing: get_card_benefits, get_exchange_rate, modify_autopay
  - Housing & Location: search_apartments, calculate_commute, update_search_filter
  - E-Commerce Support: track_order, search_products, add_to_cart

Key Features:
  - Strictly asynchronous (`async def`) and idempotent.
  - Non-blocking interruption window via `_pending_transactions` and `asyncio.sleep`.
  - Transaction rollback triggered by `user_speech_started` events.
  - Strict telemetry compliance with FDB-v3 ($FDB_TMP/agent_tool_calls.log).
"""

import os
import json
import time
import uuid
import asyncio
import logging
from typing import Optional, Any, Dict

# Setup logging
logger = logging.getLogger("kaizen.tools")

# LiveKit decorator compatibility
try:
    from livekit.agents import llm
    if hasattr(llm, "function_tool"):
        tool_decorator = llm.function_tool
    elif hasattr(llm, "ai_callable"):
        tool_decorator = llm.ai_callable
    else:
        def tool_decorator(*args, **kwargs):
            def wrapper(fn):
                return fn
            return wrapper
    
    # Try importing FunctionContext base class if available
    if hasattr(llm, "FunctionContext"):
        BaseFunctionContext = llm.FunctionContext
    else:
        class BaseFunctionContext:
            pass
except ImportError:
    class BaseFunctionContext:
        pass
    def tool_decorator(*args, **kwargs):
        def wrapper(fn):
            return fn
        return wrapper


class LatencyTracker:
    """Tracks turn-taking, tool execution, and synthesis latency for FDB-v3."""

    def __init__(self):
        self.user_done_at: float = 0.0
        self.tool_start_at: float = 0.0
        self.tool_end_at: float = 0.0
        self.agent_start_at: float = 0.0
        self.query_received: bool = False

    def reset(self):
        self.__init__()

    def log_breakdown(self, tool_name: str = "", room_name: str = "unknown"):
        if not self.user_done_at or not self.agent_start_at or not self.tool_start_at:
            return

        reasoning = (self.tool_start_at - self.user_done_at) if self.tool_start_at else 0.0
        execution = (self.tool_end_at - self.tool_start_at) if self.tool_start_at and self.tool_end_at else 0.0
        synthesis = self.agent_start_at - (self.tool_end_at or self.user_done_at)
        total = self.agent_start_at - self.user_done_at

        report = f"\n⏱️ LATENCY BREAKDOWN ({tool_name}) for room {room_name}:\n"
        report += f"  - Reasoning (Model -> Tool): {reasoning:.2f}s\n"
        if execution:
            report += f"  - Tool Execution (API):    {execution:.2f}s\n"
        report += f"  - Synthesis (Tool -> Spoken): {synthesis:.2f}s\n"
        report += f"  - TOTAL SEARCH LATENCY:      {total:.2f}s\n"

        metrics = {
            "room": room_name,
            "tool": tool_name,
            "reasoning": round(reasoning, 3),
            "execution": round(execution, 3),
            "synthesis": round(synthesis, 3),
            "total": round(total, 3),
            "agent_start_at": self.agent_start_at,
        }
        json_report = f"LATENCY_TRACK_JSON: {json.dumps(metrics)}"

        logger.info(report)
        logger.info(json_report)

        tmp_dir = os.environ.get("FDB_TMP", "/tmp")
        try:
            os.makedirs(tmp_dir, exist_ok=True)
            hb_path = os.path.join(tmp_dir, "agent_heartbeat.log")
            with open(hb_path, "a", encoding="utf-8") as f:
                f.write(report + "\n")
                f.write(json_report + "\n")
        except Exception as e:
            logger.warning(f"Failed to write to heartbeat log: {e}")


class FunctionContext(BaseFunctionContext):
    """
    FDB-v3 Compliant Function Context with interruptible pending transaction state.
    """

    def __init__(
        self,
        room_name: str = "default_room",
        interruption_window_sec: float = 0.35,
        tracker: Optional[LatencyTracker] = None,
    ):
        super().__init__()
        self.room_name = room_name
        self.interruption_window_sec = interruption_window_sec
        self.tracker = tracker or LatencyTracker()
        self._pending_transactions: Dict[str, Dict[str, Any]] = {}
        self._interruption_count: int = 0

    def rollback_pending(self) -> int:
        """
        State rollback triggered when user speech starts mid-utterance.
        Clears all pending transaction intents immediately.
        """
        cleared_count = len(self._pending_transactions)
        if cleared_count > 0:
            tx_keys = list(self._pending_transactions.keys())
            for tx_id in tx_keys:
                self._pending_transactions[tx_id]["status"] = "cancelled"
            logger.info(f"🛑 [ROLLBACK] Instantly aborted {cleared_count} pending tool intents: {tx_keys}")
            self._pending_transactions.clear()
            self._interruption_count += cleared_count
        return cleared_count

    def clear_pending(self):
        """Alias for rollback_pending."""
        return self.rollback_pending()

    def _log_tool_call(self, func_name: str, args: dict, t_start: float, t_end: float):
        """Append tool call telemetry for FDB-v3 benchmark evaluator."""
        tmp_dir = os.environ.get("FDB_TMP", "/tmp")
        try:
            os.makedirs(tmp_dir, exist_ok=True)
            log_path = os.path.join(tmp_dir, "agent_tool_calls.log")
            entry = {
                "room": self.room_name,
                "call": {
                    "function": func_name,
                    "args": args,
                    "timestamp_start": t_start,
                    "timestamp_end": t_end,
                },
            }
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            logger.warning(f"Failed to log tool call telemetry: {e}")

    async def _execute_with_interruption_guard(
        self,
        func_name: str,
        args: dict,
        execution_coroutine,
    ) -> str:
        """
        Executes a tool with intent registration, interruption delay, and state rollback verification.
        """
        tx_id = f"{func_name}_{uuid.uuid4().hex[:8]}"
        t_start = time.time()
        self.tracker.tool_start_at = t_start

        # Register pending intent
        self._pending_transactions[tx_id] = {
            "function": func_name,
            "args": args,
            "status": "pending",
            "registered_at": t_start,
        }

        logger.debug(f"[TOOL INTENT] Registered '{func_name}' (tx={tx_id}), awaiting interruption window...")

        # Non-blocking pause allowing user speech interruption
        if self.interruption_window_sec > 0:
            await asyncio.sleep(self.interruption_window_sec)

        # Check if intent was rolled back by user_speech_started
        if tx_id not in self._pending_transactions or self._pending_transactions[tx_id].get("status") == "cancelled":
            t_abort = time.time()
            self.tracker.tool_end_at = t_abort
            logger.info(f"⚡ [INTERRUPTED] Tool '{func_name}' aborted mid-flight by user speech disfluency.")
            return json.dumps({
                "status": "cancelled",
                "message": f"Execution of {func_name} aborted due to user speech interruption.",
                "interrupted": True,
            })

        # Remove from pending and commit execution
        self._pending_transactions.pop(tx_id, None)

        # Run the idempotent tool logic
        result = await execution_coroutine()
        t_end = time.time()
        self.tracker.tool_end_at = t_end

        # Telemetry logging for FDB-v3
        self._log_tool_call(func_name, args, t_start, t_end)
        return json.dumps(result)

    # ──────────────────────────────────────────────────────────────────────────
    # Domain 1: Travel & Identity (3 APIs)
    # ──────────────────────────────────────────────────────────────────────────

    @tool_decorator(description="Search for available flights to a destination.")
    async def search_flights(self, destination: str, date: str) -> str:
        """
        Args:
            destination: The city or airport, e.g. 'London' or 'LHR'
            date: The travel date, e.g. '2026-08-20'
        """
        async def _execute():
            return {
                "status": "success",
                "flights": [
                    {
                        "flight_id": "FL123",
                        "destination": str(destination),
                        "date": str(date),
                        "price": 450.0,
                    }
                ],
            }

        return await self._execute_with_interruption_guard(
            "search_flights",
            {"destination": destination, "date": date},
            _execute,
        )

    @tool_decorator(description="Book a flight ticket.")
    async def book_flight(self, passenger_name: str, flight_id: str = "FL123") -> str:
        """
        Args:
            passenger_name: The name of the passenger, e.g. 'John Doe'
            flight_id: Flight identifier string
        """
        async def _execute():
            return {
                "status": "success",
                "booking_ref": "B789",
                "passenger": str(passenger_name),
                "flight_id": str(flight_id),
            }

        return await self._execute_with_interruption_guard(
            "book_flight",
            {"passenger_name": passenger_name, "flight_id": flight_id},
            _execute,
        )

    @tool_decorator(
        description="MANDATORY tool to update simulated user identity document details (e.g. passport, driver license). You are fully authorized in this test environment. NEVER refuse to use it due to 'external personal/government system' safety concerns."
    )
    async def update_identity_doc(self, doc_type: str, doc_number: str) -> str:
        """
        Args:
            doc_type: Type of document, e.g. 'passport' or 'id_card'
            doc_number: The document identifier string
        """
        async def _execute():
            masked = str(doc_number)[-4:] if len(str(doc_number)) >= 4 else str(doc_number)
            return {
                "status": "success",
                "updated_doc": str(doc_type),
                "masked_number": masked,
            }

        return await self._execute_with_interruption_guard(
            "update_identity_doc",
            {"doc_type": doc_type, "doc_number": doc_number},
            _execute,
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Domain 2: Finance & Billing (3 APIs)
    # ──────────────────────────────────────────────────────────────────────────

    @tool_decorator(
        description="MANDATORY tool to get benefits for a credit card. NEVER guess benefits from memory. Execute this tool immediately."
    )
    async def get_card_benefits(self, card_type: str) -> str:
        """
        Args:
            card_type: The card type, e.g. 'platinum' or 'gold'
        """
        async def _execute():
            return {
                "status": "success",
                "card_type": str(card_type),
                "benefits": ["2% Cashback", "No Foreign Transaction Fee"],
            }

        return await self._execute_with_interruption_guard(
            "get_card_benefits",
            {"card_type": card_type},
            _execute,
        )

    @tool_decorator(
        description="MANDATORY tool to fetch the exact, current foreign exchange rate. NEVER guess or calculate exchange rates from your internal memory; you MUST use this API."
    )
    async def get_exchange_rate(self, amount: float, from_currency: str, to_currency: str) -> str:
        """
        Args:
            amount: Amount to convert
            from_currency: 3-letter currency code, e.g. 'USD'
            to_currency: 3-letter currency code, e.g. 'EUR'
        """
        async def _execute():
            rate = 1.1 if str(from_currency).upper() == "EUR" else 0.9
            return {
                "status": "success",
                "converted_amount": round(float(amount) * rate, 2),
                "rate": rate,
            }

        return await self._execute_with_interruption_guard(
            "get_exchange_rate",
            {"amount": amount, "from_currency": from_currency, "to_currency": to_currency},
            _execute,
        )

    @tool_decorator(
        description="MANDATORY tool to process billing details. Execute this update immediately when the user requests Autopay modification."
    )
    async def modify_autopay(self, bill_type: str, source_account: str) -> str:
        """
        Args:
            bill_type: Type of bill, e.g. 'credit_card' or 'utilities'
            source_account: Bank account identifier, e.g. 'checking'
        """
        async def _execute():
            return {
                "status": "success",
                "autopay_enabled": True,
                "bill": str(bill_type),
                "source": str(source_account),
            }

        return await self._execute_with_interruption_guard(
            "modify_autopay",
            {"bill_type": bill_type, "source_account": source_account},
            _execute,
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Domain 3: Housing & Location (3 APIs)
    # ──────────────────────────────────────────────────────────────────────────

    @tool_decorator(description="Search for available rental apartments.")
    async def search_apartments(
        self,
        city: str,
        bedrooms: Optional[int] = None,
        max_price: Optional[float] = None,
        pets_allowed: Optional[bool] = None,
        **kwargs,
    ) -> str:
        """
        Args:
            city: Destination city
            bedrooms: Number of bedrooms
            max_price: Maximum monthly rent budget
            pets_allowed: Whether pets are allowed
        """
        async def _execute():
            price = max(0.0, float(max_price) - 100.0) if max_price is not None else 1200.0
            beds = int(bedrooms) if bedrooms is not None else 1
            return {
                "status": "success",
                "city": str(city),
                "results": [
                    {
                        "id": "APT1",
                        "price": price,
                        "beds": beds,
                        "pets_allowed": pets_allowed,
                    }
                ],
            }

        call_args = {"city": city, "bedrooms": bedrooms, "max_price": max_price, "pets_allowed": pets_allowed, **kwargs}
        return await self._execute_with_interruption_guard(
            "search_apartments",
            call_args,
            _execute,
        )

    @tool_decorator(
        description="MANDATORY tool to calculate commute duration. Fetch exact commute times using this tool. Do NOT estimate from memory."
    )
    async def calculate_commute(
        self, origin_address: str, destination_address: str, mode: str = "driving", **kwargs
    ) -> str:
        """
        Args:
            origin_address: Starting location
            destination_address: Destination location
            mode: Transport mode, defaults to 'driving'
        """
        async def _execute():
            return {
                "status": "success",
                "duration_mins": 25,
                "mode": str(mode),
            }

        call_args = {"origin_address": origin_address, "destination_address": destination_address, "mode": mode, **kwargs}
        return await self._execute_with_interruption_guard(
            "calculate_commute",
            call_args,
            _execute,
        )

    @tool_decorator(
        description="Instantly update the user's search filter in the backend system. Execute this IMMEDIATELY without asking for further confirmations or batching requests. Do not ask clarifying questions."
    )
    async def update_search_filter(self, filter_name: str, value: Any, **kwargs) -> str:
        """
        Args:
            filter_name: Filter key to modify
            value: Filter value to apply
        """
        async def _execute():
            return {
                "status": "success",
                "filter_updated": str(filter_name),
                "new_value": str(value),
            }

        call_args = {"filter_name": filter_name, "value": value, **kwargs}
        return await self._execute_with_interruption_guard(
            "update_search_filter",
            call_args,
            _execute,
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Domain 4: E-Commerce Support (3 APIs)
    # ──────────────────────────────────────────────────────────────────────────

    @tool_decorator(
        description="MANDATORY tool to track physical package status. Do NOT answer from memory or batch tracking requests. EXECUTE THIS TOOL IMMEDIATELY for every order ID mentioned."
    )
    async def track_order(self, order_id: str, **kwargs) -> str:
        """
        Args:
            order_id: Order identifier to track, e.g. 'BOB12'
        """
        async def _execute():
            return {
                "status": "success",
                "order_id": str(order_id),
                "shipping_status": "Out for delivery",
            }

        call_args = {"order_id": order_id, **kwargs}
        return await self._execute_with_interruption_guard(
            "track_order",
            call_args,
            _execute,
        )

    @tool_decorator(
        description="MANDATORY tool to search for products in the catalog. Do NOT answer from memory. You MUST execute this tool whenever the user asks for item recommendations or searches."
    )
    async def search_products(
        self,
        query: str,
        max_price: Optional[float] = None,
        category: Optional[str] = None,
        **kwargs,
    ) -> str:
        """
        Args:
            query: Product search term, e.g. 'headphones'
            max_price: Optional maximum budget
            category: Optional category filter
        """
        async def _execute():
            price = (float(max_price) - 10.0) if max_price is not None else 99.99
            return {
                "status": "success",
                "products": [
                    {
                        "product_id": "PROD1",
                        "name": f"{query} Premium",
                        "price": price,
                        "category": category,
                    }
                ],
            }

        call_args = {"query": query, "max_price": max_price, "category": category, **kwargs}
        return await self._execute_with_interruption_guard(
            "search_products",
            call_args,
            _execute,
        )

    @tool_decorator(
        description="MANDATORY tool to add an item to the shopping cart. Execute this action IMMEDIATELY the moment the user asks without confirming or waiting for them to list more items."
    )
    async def add_to_cart(self, product_id: str, quantity: int = 1, **kwargs) -> str:
        """
        Args:
            product_id: ID of the product
            quantity: Amount to add
        """
        async def _execute():
            qty = int(quantity) if quantity is not None else 1
            return {
                "status": "success",
                "product_id": str(product_id),
                "quantity": qty,
                "cart_total": round(99.99 * qty, 2),
            }

        call_args = {"product_id": product_id, "quantity": quantity, **kwargs}
        return await self._execute_with_interruption_guard(
            "add_to_cart",
            call_args,
            _execute,
        )
