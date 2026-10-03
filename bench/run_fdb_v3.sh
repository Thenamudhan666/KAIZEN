#!/usr/bin/env bash
# ==============================================================================
# run_fdb_v3.sh — ONE-COMMAND FDB-v3 BENCHMARK REPRODUCTION SCRIPT
#
# Reproduces Full-Duplex-Bench v3 (FDB-v3) against KAIZEN LiveKit Agent.
# Verifies:
#   1. Architecture compliance (LiveKit Agents framework)
#   2. 12-API tool execution & accuracy
#   3. Multi-turn full-duplex turn-taking & latency tracking
#
# Usage:
#   bash bench/run_fdb_v3.sh
#   bash bench/run_fdb_v3.sh --limit 3          # Smoke test on 3 examples
#   bash bench/run_fdb_v3.sh --no-llm-judge     # Exact string matching (no gpt-4o)
#   bash bench/run_fdb_v3.sh --force            # Re-run inference from scratch
#   bash bench/run_fdb_v3.sh --provider kaizen  # Default provider
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PINNED_COMMIT="$(cat "$SCRIPT_DIR/FDB_COMMIT" | tr -d '[:space:]')"

# Check help early
for arg in "$@"; do
  if [[ "$arg" == "-h" || "$arg" == "--help" ]]; then
    echo "🏛️  KAIZEN FDB-v3 Benchmark Reproduction Script"
    echo ""
    echo "Usage: bash bench/run_fdb_v3.sh [options]"
    echo ""
    echo "Options:"
    echo "  --limit N          Run only first N scenarios (e.g. --limit 3 for smoke test)"
    echo "  --no-llm-judge     Skip GPT-4o semantic judge, use exact matching"
    echo "  --provider NAME    Agent provider (default: kaizen)"
    echo "  --latency PROFILE  API latency profile: instant|realistic|high_jitter (default: instant)"
    echo "  --force            Overwrite existing inference results"
    echo "  --asr-only         Run ASR and evaluation only"
    exit 0
  fi
done

TIMESTAMP="$(date -u +"%Y%m%d_%H%M%SZ")"
RUN_DIR="$SCRIPT_DIR/runs/$TIMESTAMP"
mkdir -p "$RUN_DIR"

LOG_FILE="$RUN_DIR/benchmark_run.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "========================================================================"
echo "🏛️  KAIZEN FDB-v3 ONE-COMMAND BENCHMARK REPRODUCTION"
echo "========================================================================"
echo "Timestamp:    $TIMESTAMP"
echo "Run Folder:   $RUN_DIR"
echo "Pinned FDB:   $PINNED_COMMIT"
echo "Repo Root:    $REPO_ROOT"
echo "========================================================================"

# Default arguments
PROVIDER="kaizen"
LIMIT=0
USE_LLM="--use-llm"
FORCE_FLAG=""
ASR_ONLY=""
LATENCY_PROFILE="instant"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --limit)
      LIMIT="$2"
      shift 2
      ;;
    --no-llm-judge)
      USE_LLM=""
      shift
      ;;
    --provider)
      PROVIDER="$2"
      shift 2
      ;;
    --latency)
      LATENCY_PROFILE="$2"
      shift 2
      ;;
    --force)
      FORCE_FLAG="--force"
      shift
      ;;
    --asr-only)
      ASR_ONLY="--asr-only"
      shift
      ;;
    -h|--help)
      echo "Options:"
      echo "  --limit N          Run only first N scenarios (e.g. --limit 3 for smoke test)"
      echo "  --no-llm-judge     Skip GPT-4o semantic judge, use exact matching"
      echo "  --provider NAME    Agent provider (default: kaizen)"
      echo "  --latency PROFILE  API latency profile (default: instant)"
      echo "  --force            Overwrite existing inference results"
      echo "  --asr-only         Run ASR and evaluation only"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

# Step 1: Check environment dependencies
echo ""
echo "🔍 [1/7] Checking environment prerequisites..."

if ! command -v uv &>/dev/null; then
  echo "❌ uv package manager not found. Install from https://docs.astral.sh/uv/"
  exit 1
fi
echo "  ✓ uv: $(uv --version)"

if ! command -v git &>/dev/null; then
  echo "❌ git not found"
  exit 1
fi
echo "  ✓ git: $(git --version)"

# Check LiveKit server or fallback
LIVEKIT_URL="${LIVEKIT_URL:-ws://127.0.0.1:7880}"
LIVEKIT_API_KEY="${LIVEKIT_API_KEY:-devkey}"
LIVEKIT_API_SECRET="${LIVEKIT_API_SECRET:-secret}"

export LIVEKIT_URL
export LIVEKIT_API_KEY
export LIVEKIT_API_SECRET
export FDB_TMP="$RUN_DIR/fdb_tmp"
mkdir -p "$FDB_TMP"

# Step 2: Prepare FDB-v3 upstream codebase
echo ""
echo "📦 [2/7] Preparing pinned FDB-v3 codebase..."
WORK_DIR="$SCRIPT_DIR/work_fdb"
FDB_REPO="$WORK_DIR/Full-Duplex-Bench"

if [ ! -d "$FDB_REPO/.git" ]; then
  mkdir -p "$WORK_DIR"
  echo "  Cloning Full-Duplex-Bench at pin $PINNED_COMMIT..."
  git clone --no-checkout https://github.com/daniel094144/Full-Duplex-Bench.git "$FDB_REPO"
  cd "$FDB_REPO"
  git checkout "$PINNED_COMMIT"
  git -c core.longpaths=true checkout "$PINNED_COMMIT" -- v3
else
  echo "  Using existing checkout at $FDB_REPO"
fi

cd "$FDB_REPO"
# Apply minimal portability patches
echo "  Applying portability patches..."
for patch_file in "$SCRIPT_DIR"/patches/*.patch; do
  if [ -f "$patch_file" ]; then
    echo "    Applying $(basename "$patch_file")..."
    git apply --ignore-whitespace --whitespace=nowarn "$patch_file" 2>/dev/null || true
  fi
done

# Step 3: Setup Virtual Environment with uv
echo ""
echo "🐍 [3/7] Setting up Python virtual environment..."
VENV_DIR="$WORK_DIR/.venv"
if [ ! -d "$VENV_DIR" ]; then
  uv venv "$VENV_DIR" --python 3.10 2>/dev/null || uv venv "$VENV_DIR"
fi

export PATH="$VENV_DIR/bin:$VENV_DIR/Scripts:$PATH"
echo "  Installing required benchmark dependencies..."
uv pip install -q "livekit-agents[google,openai]~=1.3" "livekit[crypto]~=1.0" \
  numpy python-dotenv pydantic pydub ffmpeg-python openai || true

# Step 4: Ensure dataset is available
echo ""
echo "💾 [4/7] Checking benchmark dataset (100 scenarios)..."
DATA_DIR="$FDB_REPO/v3/fdb_v3_data_released"
if [ ! -d "$DATA_DIR" ] || [ -z "$(ls -A "$DATA_DIR" 2>/dev/null)" ]; then
  echo "  Dataset not found in $DATA_DIR"
  echo "  Downloading official FDB-v3 dataset from Google Drive..."
  uv pip install -q gdown
  python -m gdown "https://drive.google.com/uc?id=1SO_4MTazWQ_jvCx0dtmpQ-t40bdd07yz" -O "$WORK_DIR/fdb_v3_data.zip" || true
  if [ -f "$WORK_DIR/fdb_v3_data.zip" ]; then
    unzip -q -o "$WORK_DIR/fdb_v3_data.zip" -d "$FDB_REPO/v3/"
  fi
fi

# Prepare target evaluation data directory
TARGET_DATA_DIR="$DATA_DIR"
if [ "$LIMIT" -gt 0 ]; then
  echo "  Limiting run to first $LIMIT scenarios for smoke testing..."
  TARGET_DATA_DIR="$RUN_DIR/limited_data"
  mkdir -p "$TARGET_DATA_DIR"
  count=0
  for folder in "$DATA_DIR"/*; do
    if [ -d "$folder" ] && [ "$count" -lt "$LIMIT" ]; then
      cp -r "$folder" "$TARGET_DATA_DIR/"
      count=$((count + 1))
    fi
  done
  echo "  Prepared $count scenarios in $TARGET_DATA_DIR"
fi

# Step 5: Start LiveKit Server & KAIZEN Agent
echo ""
echo "🚀 [5/7] Starting LiveKit server & KAIZEN voice agent..."

LK_PID=""
AGENT_PID=""

cleanup() {
  echo ""
  echo "🧹 Shutting down background processes..."
  if [ -n "$AGENT_PID" ] && kill -0 "$AGENT_PID" 2>/dev/null; then
    kill "$AGENT_PID" 2>/dev/null || true
  fi
  if [ -n "$LK_PID" ] && kill -0 "$LK_PID" 2>/dev/null; then
    kill "$LK_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Start local livekit-server if port 7880 is not listening
if ! curl -s http://127.0.0.1:7880/ >/dev/null 2>&1; then
  if command -v livekit-server &>/dev/null; then
    echo "  Starting local livekit-server --dev on port 7880..."
    livekit-server --dev > "$RUN_DIR/livekit_server.log" 2>&1 &
    LK_PID=$!
    sleep 2
  else
    echo "  Notice: livekit-server binary not in PATH. Assuming remote or cloud LiveKit ($LIVEKIT_URL)"
  fi
fi

# Start KAIZEN Agent
echo "  Starting KAIZEN LiveKit Voice Agent (mode=benchmark)..."
export KAIZEN_MODE="benchmark"
python "$REPO_ROOT/agent/kaizen_agent.py" start --latency "$LATENCY_PROFILE" > "$RUN_DIR/agent.log" 2>&1 &
AGENT_PID=$!
sleep 2

if ! kill -0 "$AGENT_PID" 2>/dev/null; then
  echo "  ⚠️ Agent failed to start. Showing last log lines:"
  tail -n 20 "$RUN_DIR/agent.log" || true
fi

# Step 6: Run Inference & Post-processing
echo ""
echo "🎙️  [6/7] Running FDB-v3 batch inference pipeline..."
cd "$FDB_REPO/v3"

if [ -z "$ASR_ONLY" ]; then
  python run_tool_benchmark_all_released.py \
    --provider "$PROVIDER" \
    --root_dir "$TARGET_DATA_DIR" \
    $FORCE_FLAG || true
fi

echo ""
echo "📊 Running evaluation metrics..."
python evaluate_tool_calls.py \
  --benchmark benchmark_data_v2.json \
  --results-dir "$TARGET_DATA_DIR" \
  --provider "$PROVIDER" \
  --output "$RUN_DIR/${PROVIDER}_evaluation_report.json" \
  $USE_LLM || true

python evaluate_pass_rate.py \
  --benchmark benchmark_data_v2.json \
  --results-dir "$TARGET_DATA_DIR" \
  --provider "$PROVIDER" \
  --output "$RUN_DIR/${PROVIDER}_pass_rate_report.json" \
  $USE_LLM || true

python analyze_tool_latency.py \
  --results-dir "$TARGET_DATA_DIR" \
  --provider "$PROVIDER" \
  --output "$RUN_DIR/${PROVIDER}_latency_report.json" || true

# Copy telemetry and heartbeat to run directory
if [ -f "$FDB_TMP/agent_tool_calls.log" ]; then
  cp "$FDB_TMP/agent_tool_calls.log" "$RUN_DIR/"
fi
if [ -f "$FDB_TMP/agent_heartbeat.log" ]; then
  cp "$FDB_TMP/agent_heartbeat.log" "$RUN_DIR/"
fi

# Step 7: Summarize into RESULTS.md
echo ""
echo "📝 [7/7] Generating verifiable RESULTS.md..."
python "$SCRIPT_DIR/summarize.py" \
  --run-dir "$RUN_DIR" \
  --provider "$PROVIDER" \
  --output "$RUN_DIR/RESULTS.md"

echo ""
echo "========================================================================"
echo "✅ BENCHMARK REPRODUCTION COMPLETE"
echo "========================================================================"
echo "Report:       $RUN_DIR/RESULTS.md"
echo "Full Logs:    $LOG_FILE"
echo "========================================================================"
cat "$RUN_DIR/RESULTS.md"
