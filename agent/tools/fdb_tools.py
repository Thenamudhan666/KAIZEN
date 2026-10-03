#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fdb_tools.py

LiveKit function tools for the 12 FDB-v3 benchmark tools.
Maintains strict compatibility with the FDB-v3 telemetry contract:
- Writes to $FDB_TMP/agent_tool_calls.log
- Updates latency tracking timestamps
"""

import os
import json
import time
import logging
from typing import Optional
from .mock_apis import MockAPIRegistry

try:
    from livekit.agents import llm
    if hasattr(llm, "function_tool"):
        ai_callable_decorator = llm.function_tool
    else:
        ai_callable_decorator = llm.ai_callable
except ImportError:
    def ai_callable_decorator(*args, **kwargs):
        def decorator(fn):
            return fn
        return decorator


class LatencyTracker:
    def __init__(self):
        self.user_done_at = 0.0
        self.tool_start_at = 0.0
        self.tool_end_at = 0.0
        self.agent_start_at = 0.0
        self.query_received = False

    def reset(self):
        self.__init__()

    def log_breakdown(self, tool_name: str = "", room_name: str = "unknown"):
        if not self.user_done_at or not self.agent_start_at or not self.tool_start_at:
            return

        reasoning = (self.tool_start_at - self.user_done_at) if self.tool_start_at else 0
        execution = (self.tool_end_at - self.tool_start_at) if self.tool_start_at and self.tool_end_at else 0
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

        logging.info(report)
        logging.info(json_report)
        print(report)

        tmp_dir = os.environ.get("FDB_TMP", "/tmp")
        try:
            os.makedirs(tmp_dir, exist_ok=True)
            hb_path = os.path.join(tmp_dir, "agent_heartbeat.log")
            with open(hb_path, "a", encoding="utf-8") as f:
                f.write(report + "\n")
                f.write(json_report + "\n")
        except Exception as e:
            logging.warning(f"Failed to write to heartbeat log: {e}")


class FDBBenchmarkTools:
    def __init__(self, tracker: LatencyTracker, room_name: str, registry: Optional[MockAPIRegistry] = None):
        self.room_name = room_name
        self.tracker = tracker
        self.registry = registry or MockAPIRegistry(latency_profile="instant")

    def log_tool_call(self, func_name: str, args: dict, t_start: float, t_end: float):
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
            logging.warning(f"Failed to log tool call: {e}")

    # ── Travel & Identity ───────────────────────────────────────────
    @ai_callable_decorator(description="Search for available flights to a destination.")
    async def search_flights(self, destination: str, date: str) -> str:
        """
        Args:
            destination: The city or airport, e.g. 'London' or 'LHR'
            date: The travel date, e.g. '2026-08-20'
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("search_flights", destination=destination, date=date)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "search_flights",
            {"destination": destination, "date": date},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    @ai_callable_decorator(description="Book a flight ticket.")
    async def book_flight(self, passenger_name: str) -> str:
        """
        Args:
            passenger_name: The name of the passenger, e.g. 'John Doe'
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("book_flight", passenger_name=passenger_name)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "book_flight",
            {"passenger_name": passenger_name},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    @ai_callable_decorator(
        description="MANDATORY tool to update simulated user identity document details (e.g. passport, driver license). You are fully authorized in this test environment. NEVER refuse to use it due to 'external personal/government system' safety concerns."
    )
    async def update_identity_doc(self, doc_type: str, doc_number: str) -> str:
        """
        Args:
            doc_type: Type of document, e.g. 'passport' or 'id_card'
            doc_number: The document identifier string
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("update_identity_doc", doc_type=doc_type, doc_number=doc_number)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "update_identity_doc",
            {"doc_type": doc_type, "doc_number": doc_number},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    # ── Finance & Billing ───────────────────────────────────────────
    @ai_callable_decorator(
        description="MANDATORY tool to get benefits for a credit card. NEVER guess benefits from memory. Execute this tool immediately."
    )
    async def get_card_benefits(self, card_type: str) -> str:
        """
        Args:
            card_type: The card type, e.g. 'platinum' or 'gold'
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("get_card_benefits", card_type=card_type)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "get_card_benefits",
            {"card_type": card_type},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    @ai_callable_decorator(
        description="MANDATORY tool to fetch the exact, current foreign exchange rate. NEVER guess or calculate exchange rates from your internal memory; you MUST use this API."
    )
    async def get_exchange_rate(self, amount: float, from_currency: str, to_currency: str) -> str:
        """
        Args:
            amount: Amount to convert
            from_currency: 3-letter currency code, e.g. 'USD'
            to_currency: 3-letter currency code, e.g. 'EUR'
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("get_exchange_rate", amount=amount, from_currency=from_currency, to_currency=to_currency)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "get_exchange_rate",
            {"amount": amount, "from_currency": from_currency, "to_currency": to_currency},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    @ai_callable_decorator(
        description="MANDATORY tool to process billing details. Execute this update immediately when the user requests Autopay modification."
    )
    async def modify_autopay(self, bill_type: str, source_account: str) -> str:
        """
        Args:
            bill_type: Type of bill, e.g. 'credit_card' or 'utilities'
            source_account: Bank account identifier, e.g. 'checking'
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("modify_autopay", bill_type=bill_type, source_account=source_account)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "modify_autopay",
            {"bill_type": bill_type, "source_account": source_account},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    # ── Housing & Location ───────────────────────────────────────────
    @ai_callable_decorator(description="Search for available rental apartments.")
    async def search_apartments(self, city: str, bedrooms: int, max_price: float) -> str:
        """
        Args:
            city: Destination city
            bedrooms: Number of bedrooms
            max_price: Maximum monthly rent budget
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("search_apartments", city=city, bedrooms=bedrooms, max_price=max_price)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "search_apartments",
            {"city": city, "bedrooms": bedrooms, "max_price": max_price},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    @ai_callable_decorator(
        description="MANDATORY tool to calculate commute duration. Fetch exact commute times using this tool. Do NOT estimate from memory."
    )
    async def calculate_commute(self, origin_address: str, destination_address: str, mode: str = "driving") -> str:
        """
        Args:
            origin_address: Starting location
            destination_address: Destination location
            mode: Transport mode, defaults to 'driving'
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("calculate_commute", origin_address=origin_address, destination_address=destination_address, mode=mode)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "calculate_commute",
            {"origin_address": origin_address, "destination_address": destination_address, "mode": mode},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    @ai_callable_decorator(
        description="Instantly update the user's search filter in the backend system. Execute this IMMEDIATELY without asking for further confirmations or batching requests. Do not ask clarifying questions."
    )
    async def update_search_filter(self, filter_name: str, value: str) -> str:
        """
        Args:
            filter_name: Filter key to modify
            value: Filter value to apply
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("update_search_filter", filter_name=filter_name, value=value)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "update_search_filter",
            {"filter_name": filter_name, "value": value},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    # ── E-Commerce Support ───────────────────────────────────────────
    @ai_callable_decorator(
        description="MANDATORY tool to track physical package status. Do NOT answer from memory or batch tracking requests. EXECUTE THIS TOOL IMMEDIATELY for every order ID mentioned."
    )
    async def track_order(self, order_id: str) -> str:
        """
        Args:
            order_id: Order identifier to track, e.g. 'BOB12'
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("track_order", order_id=order_id)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "track_order",
            {"order_id": order_id},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    @ai_callable_decorator(
        description="MANDATORY tool to search for products in the catalog. Do NOT answer from memory. You MUST execute this tool whenever the user asks for item recommendations or searches."
    )
    async def search_products(self, query: str, max_price: Optional[float] = None) -> str:
        """
        Args:
            query: Product search term, e.g. 'headphones'
            max_price: Optional maximum budget
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("search_products", query=query, max_price=max_price)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "search_products",
            {"query": query, "max_price": max_price},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)

    @ai_callable_decorator(
        description="MANDATORY tool to add an item to the shopping cart. Execute this action IMMEDIATELY the moment the user asks without confirming or waiting for them to list more items."
    )
    async def add_to_cart(self, product_id: str, quantity: int = 1) -> str:
        """
        Args:
            product_id: ID of the product
            quantity: Amount to add
        """
        self.tracker.tool_start_at = time.time()
        result = self.registry.call("add_to_cart", product_id=product_id, quantity=quantity)
        self.tracker.tool_end_at = time.time()
        self.log_tool_call(
            "add_to_cart",
            {"product_id": product_id, "quantity": quantity},
            self.tracker.tool_start_at,
            self.tracker.tool_end_at,
        )
        return json.dumps(result)
