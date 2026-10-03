#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
latency_injector.py

Configurable delay injection layer for mock APIs.
Simulates real-world API latency to test how voice agents handle
system loading time during multi-step tool calling.
"""

import time
import random
from dataclasses import dataclass
from typing import Optional


@dataclass
class LatencyProfile:
    name: str
    min_ms: int = 0
    max_ms: int = 0
    fixed_ms: Optional[int] = None
    progressive_factor: float = 1.0
    jitter: bool = True

    def get_delay_ms(self, call_index: int = 0) -> int:
        if self.fixed_ms is not None:
            base = self.fixed_ms
        elif self.jitter:
            base = random.randint(self.min_ms, self.max_ms)
        else:
            base = (self.min_ms + self.max_ms) // 2

        if self.progressive_factor != 1.0 and call_index > 0:
            base = int(base * (self.progressive_factor ** call_index))

        return base


LATENCY_PROFILES = {
    "instant": LatencyProfile(name="instant", fixed_ms=0, jitter=False),
    "fast": LatencyProfile(name="fast", min_ms=50, max_ms=200, jitter=True),
    "normal": LatencyProfile(name="normal", min_ms=200, max_ms=800, jitter=True),
    "slow": LatencyProfile(name="slow", min_ms=1000, max_ms=3000, jitter=True),
    "degraded": LatencyProfile(name="degraded", min_ms=500, max_ms=2000, progressive_factor=1.5, jitter=True),
    "timeout_risk": LatencyProfile(name="timeout_risk", min_ms=3000, max_ms=8000, jitter=True),
}

API_LATENCY_DEFAULTS = {
    "search_flights": "normal",
    "book_flight": "slow",
    "update_identity_doc": "fast",
    "get_card_benefits": "fast",
    "get_exchange_rate": "fast",
    "modify_autopay": "slow",
    "search_apartments": "normal",
    "update_search_filter": "fast",
    "calculate_commute": "normal",
    "track_order": "fast",
    "search_products": "normal",
    "add_to_cart": "fast",
}


@dataclass
class LatencyCallLog:
    api_name: str
    call_index: int
    profile_name: str
    injected_delay_ms: int
    timestamp: float


class LatencyInjector:
    def __init__(self, profile="instant", per_api_profiles=None, enabled=True):
        self.default_profile = LATENCY_PROFILES.get(profile, LATENCY_PROFILES["instant"])
        self.per_api_profiles = per_api_profiles or {}
        self.enabled = enabled
        self.call_counts = {}
        self.call_log = []

    def _get_profile(self, api_name):
        if not self.enabled or self.default_profile.name == "instant":
            return LATENCY_PROFILES["instant"]
        if api_name in self.per_api_profiles:
            profile_name = self.per_api_profiles[api_name]
        elif api_name in API_LATENCY_DEFAULTS:
            profile_name = API_LATENCY_DEFAULTS[api_name]
        else:
            return self.default_profile
        return LATENCY_PROFILES.get(profile_name, self.default_profile)

    def inject(self, api_name, call_index=None):
        if not self.enabled:
            return 0

        if call_index is None:
            call_index = self.call_counts.get(api_name, 0)
            self.call_counts[api_name] = call_index + 1

        profile = self._get_profile(api_name)
        delay_ms = profile.get_delay_ms(call_index)

        if delay_ms > 0:
            time.sleep(delay_ms / 1000.0)

        log_entry = LatencyCallLog(
            api_name=api_name,
            call_index=call_index,
            profile_name=profile.name,
            injected_delay_ms=delay_ms,
            timestamp=time.time(),
        )
        self.call_log.append(log_entry)
        return delay_ms

    def reset(self):
        self.call_counts.clear()
        self.call_log.clear()
