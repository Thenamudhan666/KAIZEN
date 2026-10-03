#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_agent.py

Unit tests for KAIZEN LiveKit Agent:
- FDB-v3 telemetry contract verification
- Voyager sandbox isolation (pass, fail, timeout)
- Socratic argument graph deconstruction
"""

import os
import json
import pytest
import tempfile
import sys
from pathlib import Path

# Add agent directory to sys.path
agent_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(agent_dir))

from tools.fdb_tools import FDBBenchmarkTools, LatencyTracker
from tools.mock_apis import MockAPIRegistry
from tools.voyager_tool import run_sandbox_verification, compile_and_verify_skill
from tools.socratic_tool import run_socratic_analysis


def test_telemetry_contract_format(tmp_path, monkeypatch):
    """Verify tool call logging matches FDB-v3 harness schema."""
    monkeypatch.setenv("FDB_TMP", str(tmp_path))
    tracker = LatencyTracker()
    room_name = "eval-testroom1"
    tools = FDBBenchmarkTools(tracker=tracker, room_name=room_name)

    tools.log_tool_call("search_flights", {"destination": "Tokyo", "date": "2026-08-20"}, 100.0, 100.25)

    log_file = tmp_path / "agent_tool_calls.log"
    assert log_file.exists(), "Telemetry log file must be created"

    lines = log_file.read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 1

    entry = json.loads(lines[0])
    assert entry["room"] == room_name
    assert entry["call"]["function"] == "search_flights"
    assert entry["call"]["args"]["destination"] == "Tokyo"
    assert entry["call"]["args"]["date"] == "2026-08-20"
    assert entry["call"]["timestamp_start"] == 100.0
    assert entry["call"]["timestamp_end"] == 100.25


def test_heartbeat_latency_report(tmp_path, monkeypatch):
    """Verify latency breakdown produces machine-readable LATENCY_TRACK_JSON."""
    monkeypatch.setenv("FDB_TMP", str(tmp_path))
    tracker = LatencyTracker()
    tracker.user_done_at = 10.0
    tracker.tool_start_at = 10.5
    tracker.tool_end_at = 10.7
    tracker.agent_start_at = 11.2

    tracker.log_breakdown(tool_name="search_flights", room_name="eval-testroom2")

    hb_file = tmp_path / "agent_heartbeat.log"
    assert hb_file.exists()

    content = hb_file.read_text(encoding="utf-8")
    assert "LATENCY_TRACK_JSON: " in content

    json_str = [line for line in content.splitlines() if line.startswith("LATENCY_TRACK_JSON: ")][0]
    metrics = json.loads(json_str.replace("LATENCY_TRACK_JSON: ", ""))

    assert metrics["room"] == "eval-testroom2"
    assert metrics["tool"] == "search_flights"
    assert metrics["reasoning"] == 0.5
    assert metrics["execution"] == 0.2
    assert metrics["synthesis"] == 0.5
    assert metrics["total"] == 1.2


def test_voyager_sandbox_success():
    """Verify clean code passes the isolated sandbox."""
    code = """def add(a, b): return a + b"""
    tests = """assert add(2, 3) == 5"""
    passed, msg = run_sandbox_verification(code, tests, timeout_seconds=3)
    assert passed is True
    assert "passed" in msg.lower()


def test_voyager_sandbox_failure():
    """Verify faulty assertions fail cleanly without crashing."""
    code = """def add(a, b): return a + b"""
    tests = """assert add(2, 3) == 99, "Addition error" """
    passed, msg = run_sandbox_verification(code, tests, timeout_seconds=3)
    assert passed is False
    assert "test failure" in msg.lower() or "assertionerror" in msg.lower()


def test_voyager_sandbox_timeout():
    """Verify infinite loop triggers timeout protection."""
    code = """def hang():
    while True: pass
hang()"""
    tests = """assert True"""
    passed, msg = run_sandbox_verification(code, tests, timeout_seconds=1)
    assert passed is False
    assert "timed out" in msg.lower()


def test_voyager_skill_persistence(tmp_path):
    """Verify compilation persists verified markdown skill to vault."""
    skill = compile_and_verify_skill(
        problem_solved="Dynamic Programming Memoization",
        solution_code="def memo_fib(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = memo_fib(n-1, memo) + memo_fib(n-2, memo)\n    return memo[n]",
        skill_domain="Algorithms",
        vault_base_dir=str(tmp_path),
    )
    assert skill["testsPassed"] is True
    assert skill["persisted"] is True
    assert os.path.exists(skill["filePath"])
    content = Path(skill["filePath"]).read_text(encoding="utf-8")
    assert "Dynamic Programming Memoization" in content
    assert "VERIFIED_SANDBOX_PASS" in content


def test_socratic_argument_analysis():
    """Verify Socratic analysis deconstructs propositions into structured schema."""
    result = run_socratic_analysis("Greedy choice guarantees globally optimal interval selection without backtracking")
    assert "verdict" in result
    assert "graph" in result
    assert "probingQuestion" in result
    assert "nodes" in result["graph"]
    assert "edges" in result["graph"]
    assert len(result["graph"]["nodes"]) >= 2
    assert len(result["probingQuestion"]) > 5
