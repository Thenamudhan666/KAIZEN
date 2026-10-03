# KAIZEN Video Demonstration Script: End-to-End Working Software

This document provides a shot-by-shot production guide for recording the evaluation video.
It directly satisfies the **Use-Case Extension** requirement by demonstrating **live running software** rather than conceptual slides.

---

## 🎯 Scoring Criteria Alignment

| Requirement | What Was Missing Previously | What Is Demonstrated Now |
|---|---|---|
| **Architecture Compliance** | Custom Express WebSocket directly to Gemini Live | Agent runs inside official **LiveKit Agents framework** (`livekit-agents 1.3`, WebRTC session, Gemini 3.1 Flash Live) |
| **Benchmark Reproduction** | No scripts or logs (0/60) | One-command reproduction script (`bash bench/run_fdb_v3.sh`) executing FDB-v3 with live telemetry |
| **Use-Case Extension** | Slideshow only (0/20) | **Live software running end-to-end**: Voice input triggers Socratic graph extraction and Voyager sandbox compiler, creating real files on disk |

---

## 🎬 Shot-by-Shot Recording Walkthrough (3 to 4 Minutes Total)

### Scene 1: Architecture & LiveKit Agents Framework (0:00 - 0:45)
**Screen Setup:** Split screen. Left: Terminal running LiveKit Agent. Right: Electron Cockpit UI.

1. **Terminal Command:**
   ```bash
   # Terminal 1: Start KAIZEN LiveKit Agent in demo mode
   python agent/kaizen_agent.py start
   ```
2. **Terminal Output Highlight:**
   Show log lines:
   ```text
   🏛️  KAIZEN Agent joining room: kaizen-cockpit (mode=demo, latency=instant)
   Connecting to Gemini Realtime: model=gemini-3.1-flash-live-preview, voice=Aoede
   ✅ KAIZEN Agent active and listening in room kaizen-cockpit
   ```
3. **Cockpit UI:**
   - In the Electron app, point out the status bar:
     `LIVEKIT WEBRTC CONNECTED • AGENT RUNTIME: PYTHON LIVEKIT-AGENTS 1.3`
   - Point out the 3D Holographic Orb and sub-800ms WebRTC latency telemetry.

---

### Scene 2: Socratic Argumentation Engine (End-to-End Voice) (0:45 - 1:45)
**Screen Setup:** Cockpit UI focused on the Socratic Cognition panel.

1. **User Action:**
   Click **"CONNECT AGENT"** and speak aloud into the microphone:
   > *"Kaizen, since subproblems in interval DP are independent, we can greedily pick the maximum element at each step in O(N) time."*

2. **What Happens Live in Software:**
   - The VAD meter jumps as you speak.
   - The LiveKit agent detects the logical flaw and calls the tool:
     `analyze_argument(proposition="Since subproblems in interval DP are independent...", domain="Algorithm & Logic")`
   - In Terminal, the tool execution is logged in real-time.
   - In the UI, the **Socratic Graph** appears dynamically:
     - **Verdict Banner:** `FALLACY DETECTED (Unchecked Subproblem Coupling)`
     - **Graph Nodes:** Premise, Assumption, Claim, Hypothesis nodes with Sound/Flawed badges.
     - **Probing Question:**
       > *"If choosing the local maximum at step k invalidates permutations at step k+2, does the subproblem truly possess optimal substructure, sir?"*
   - The agent speaks the probing question aloud through the speaker with the British butler persona.

---

### Scene 3: Voyager Lifelong Skill Compiler & Local Sandbox (1:45 - 2:45)
**Screen Setup:** Voyager Skill Library tab + Terminal window.

1. **User Action:**
   Speak aloud to the agent:
   > *"Compile a skill for dynamic programming interval decomposition."*

2. **What Happens Live in Software:**
   - The LiveKit agent executes:
     `compile_skill(problem_solved="Dynamic Programming Interval Decomposition", ...)`
   - The agent executes unit test assertions inside the **isolated Python subprocess sandbox**.
   - Show the sandbox output in terminal:
     `All unit test assertions passed successfully.`
   - Show the new skill dynamically appearing in the Voyager UI panel with:
     `SKILL-ALG-XXXX • 3/3 Assertions Passed • Verified in Vault`
3. **Verify File Persisted to Disk:**
   In Terminal, immediately run:
   ```bash
   ls -la vault/skills/
   cat vault/skills/dynamic_programming_*.md
   ```
   Show that the file actually exists on the filesystem with the generated Python code and test assertions.

---

### Scene 4: Full-Duplex-Bench v3 One-Command Reproduction (2:45 - 3:30)
**Screen Setup:** Clean Terminal window.

1. **User Action:**
   Run the one-command reproduction script:
   ```bash
   bash bench/run_fdb_v3.sh --limit 3
   ```
2. **What Happens Live in Software:**
   - The script clones and checks out FDB-v3 at the pinned commit `3e799c45`.
   - Applies portability patches.
   - Starts LiveKit server and KAIZEN agent.
   - Streams audio into LiveKit rooms and records agent responses.
   - Runs `evaluate_tool_calls.py`, `evaluate_pass_rate.py`, and `analyze_tool_latency.py`.
   - Generates and displays `bench/runs/<timestamp>/RESULTS.md`.
3. **Show Run Artifacts:**
   ```bash
   ls -l bench/runs/
   ```
   Show `agent_tool_calls.log`, `agent_heartbeat.log`, and `RESULTS.md`.

---

## 💡 Tips for Recording
- Keep speech clear and pause briefly between user prompts to let the agent respond.
- Record screen at 1080p or 4K with system audio capture enabled so the voice synthesis is audible in the recording.
- Do not use presentation slides—keep the focus 100% on the running Electron app, terminal logs, and generated files.
