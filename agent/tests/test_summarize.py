#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_summarize.py

Unit test for bench/summarize.py.
"""

import os
import json
import subprocess
import sys
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent.parent
summarize_script = repo_root / "bench" / "summarize.py"


def test_summarize_generates_markdown(tmp_path):
    # Setup mock reports
    eval_report = {
        "total_scenarios": 10,
        "turn_taking": {"turn_taken": 10, "total": 10, "turn_take_rate": 1.0, "no_response": 0},
        "by_metric": {"tool_selection_acc": 0.95, "argument_acc": 0.92, "response_qual": 0.88},
    }
    pass_report = {
        "total_scenarios": 10,
        "overall_pass_rate": 0.90,
        "passed": 9,
        "failed": 1,
        "by_domain": {"travel_identity": 1.0, "finance_billing": 0.8},
        "by_difficulty": {"easy": 1.0, "medium": 0.85},
    }
    latency_report = {
        "aggregate": {
            "first_response_latency": {"mean": 1.25, "median": 1.10, "std": 0.2},
            "tool_call_latency": {"mean": 0.45, "median": 0.40, "std": 0.1},
            "task_completion_latency": {"mean": 2.10, "median": 1.95, "std": 0.3},
        }
    }

    with open(tmp_path / "kaizen_evaluation_report.json", "w") as f:
        json.dump(eval_report, f)
    with open(tmp_path / "kaizen_pass_rate_report.json", "w") as f:
        json.dump(pass_report, f)
    with open(tmp_path / "kaizen_latency_report.json", "w") as f:
        json.dump(latency_report, f)

    out_file = tmp_path / "RESULTS.md"
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    proc = subprocess.run(
        [sys.executable, str(summarize_script), "--run-dir", str(tmp_path), "--provider", "kaizen", "--output", str(out_file)],
        capture_output=True,
        text=True,
        env=env,
    )
    assert proc.returncode == 0
    assert out_file.exists()
    content = out_file.read_text(encoding="utf-8")
    assert "90.0%" in content
    assert "95.0%" in content
    assert "travel_identity" in content
    assert "First Response Latency" in content
