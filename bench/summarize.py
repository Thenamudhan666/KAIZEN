#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
summarize.py

Summarizes FDB-v3 benchmark evaluation outputs into clean, formatted RESULTS.md.
Never fabricates logs or scores: parses only real output files produced by the harness.
"""

import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

# Ensure utf-8 output encoding across platforms
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def load_json_safe(path: Path) -> dict:
    if path.exists():
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Failed to load {path}: {e}", file=sys.stderr)
    return {}


def generate_results_markdown(
    provider: str,
    eval_report: dict,
    pass_report: dict,
    latency_report: dict,
    batch_summary: dict,
    run_dir: Path,
) -> str:
    evaluated_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    # Metrics extraction
    total_scenarios = pass_report.get("total_scenarios", eval_report.get("total_scenarios", 0))
    passed = pass_report.get("passed", 0)
    failed = pass_report.get("failed", 0)
    pass_rate = pass_report.get("overall_pass_rate", 0.0)

    by_metric = eval_report.get("by_metric", {})
    tool_f1 = by_metric.get("tool_selection_acc")
    arg_acc = by_metric.get("argument_acc")
    resp_qual = by_metric.get("response_qual")

    tt = eval_report.get("turn_taking", {})
    turn_take_rate = tt.get("turn_take_rate")

    # Latencies
    agg_latency = latency_report.get("aggregate", {})
    fr_lat = agg_latency.get("first_response_latency", {})
    tc_lat = agg_latency.get("tool_call_latency", {})
    tk_lat = agg_latency.get("task_completion_latency", {})

    lines = [
        f"# FDB-v3 Benchmark Evaluation Results — `{provider}`",
        f"\n**Evaluated At:** {evaluated_at}",
        f"**Run Directory:** `{run_dir.name}`",
        f"**Framework:** LiveKit Agents (Full-Duplex WebRTC)",
        f"**Model:** Gemini 3.1 Flash Live Preview (`google.realtime.RealtimeModel`)",
        "\n---",
        "\n## 1. Executive Summary",
        "\n| Metric | Score | Target / Reference | Notes |",
        "|---|---|---|---|",
        f"| **Overall Task Pass Rate** | **{pass_rate * 100:.1f}%** ({passed}/{total_scenarios}) | Strict Binary | All tools called with correct arguments |",
    ]

    if tool_f1 is not None:
        lines.append(f"| **Tool Selection F1** | **{tool_f1 * 100:.1f}%** | Multi-domain | Precision & Recall across 12 tools |")
    if arg_acc is not None:
        lines.append(f"| **Argument Accuracy** | **{arg_acc * 100:.1f}%** | Parameter Match | Strict / Semantic argument matching |")
    if resp_qual is not None:
        lines.append(f"| **Spoken Response Quality** | **{resp_qual * 100:.1f}%** | Spoken Clarity | Natural conversational synthesis |")
    if turn_take_rate is not None:
        lines.append(f"| **Turn-Taking Success** | **{turn_take_rate * 100:.1f}%** | Full-Duplex | Responded without dropped turns |")

    if fr_lat and "mean" in fr_lat:
        lines.append(f"| **First Response Latency** | **{fr_lat['mean']:.2f}s ± {fr_lat.get('std', 0):.2f}s** | Median: {fr_lat.get('median', 0):.2f}s | Audio onset latency |")
    if tc_lat and "mean" in tc_lat:
        lines.append(f"| **Tool Call Latency** | **{tc_lat['mean']:.2f}s ± {tc_lat.get('std', 0):.2f}s** | Median: {tc_lat.get('median', 0):.2f}s | User speech end to API call |")
    if tk_lat and "mean" in tk_lat:
        lines.append(f"| **Task Completion Latency** | **{tk_lat['mean']:.2f}s ± {tk_lat.get('std', 0):.2f}s** | Median: {tk_lat.get('median', 0):.2f}s | User speech end to spoken answer |")

    # Domain Breakdown
    by_domain = pass_report.get("by_domain", {})
    if by_domain:
        lines.extend([
            "\n## 2. Pass Rate by Domain",
            "\n| Domain | Pass Rate | Tool Scope |",
            "|---|---|---|",
        ])
        domain_tools = {
            "travel_identity": "search_flights, book_flight, update_identity_doc",
            "finance_billing": "get_card_benefits, get_exchange_rate, modify_autopay",
            "housing_location": "search_apartments, calculate_commute, update_search_filter",
            "ecommerce_support": "track_order, search_products, add_to_cart",
        }
        for dom, rate in sorted(by_domain.items()):
            scope = domain_tools.get(dom, "Domain tools")
            lines.append(f"| `{dom}` | **{rate * 100:.1f}%** | {scope} |")

    # Difficulty Breakdown
    by_difficulty = pass_report.get("by_difficulty", {})
    if by_difficulty:
        lines.extend([
            "\n## 3. Pass Rate by Complexity (Difficulty)",
            "\n| Difficulty Level | Required Tool Calls | Pass Rate |",
            "|---|---|---|",
        ])
        diff_labels = {"easy": "1 Tool Call", "medium": "2 Tool Calls", "hard": "3 Tool Calls"}
        for diff, rate in sorted(by_difficulty.items()):
            label = diff_labels.get(diff, diff)
            lines.append(f"| `{diff.capitalize()}` | {label} | **{rate * 100:.1f}%** |")

    # Disfluency Breakdown
    by_disfluency = pass_report.get("by_disfluency_feature", {})
    if by_disfluency:
        lines.extend([
            "\n## 4. Robustness to Natural Disfluency Features",
            "\n| Disfluency Feature | Pass Rate | Description |",
            "|---|---|---|",
        ])
        for feat, rate in sorted(by_disfluency.items()):
            lines.append(f"| `{feat}` | **{rate * 100:.1f}%** | Human spoken speech artifact |")

    # Artifacts Manifest
    lines.extend([
        "\n## 5. Verifiable Run Artifacts",
        f"- Evaluation Report: `{provider}_evaluation_report.json`",
        f"- Pass Rate Report: `{provider}_pass_rate_report.json`",
        f"- Latency Report: `{provider}_latency_report.json`",
        f"- Agent Telemetry: `agent_tool_calls.log`",
        f"- Agent Heartbeat: `agent_heartbeat.log`",
        "\n> Generated autonomously by KAIZEN benchmark reproduction suite.",
    ])

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Summarize FDB-v3 reports into RESULTS.md")
    parser.add_argument("--run-dir", type=str, required=True, help="Directory containing report files")
    parser.add_argument("--provider", type=str, default="kaizen", help="Provider name")
    parser.add_argument("--output", type=str, default=None, help="Output markdown path")
    args = parser.parse_args()

    run_dir = Path(args.run_dir).resolve()
    provider = args.provider

    # Try both prefixed and non-prefixed filenames
    eval_report = load_json_safe(run_dir / f"{provider}_evaluation_report.json")
    if not eval_report:
        eval_report = load_json_safe(run_dir / "evaluation_report.json")

    pass_report = load_json_safe(run_dir / f"{provider}_pass_rate_report.json")
    if not pass_report:
        pass_report = load_json_safe(run_dir / "pass_rate_report.json")

    latency_report = load_json_safe(run_dir / f"{provider}_latency_report.json")
    batch_summary = load_json_safe(run_dir / f"evaluation_summary_{provider}.json")

    md_content = generate_results_markdown(
        provider=provider,
        eval_report=eval_report,
        pass_report=pass_report,
        latency_report=latency_report,
        batch_summary=batch_summary,
        run_dir=run_dir,
    )

    out_path = Path(args.output) if args.output else run_dir / "RESULTS.md"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    print(f"✅ Generated summary results: {out_path}")


if __name__ == "__main__":
    main()
