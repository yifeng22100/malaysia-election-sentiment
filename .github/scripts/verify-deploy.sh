#!/usr/bin/env bash
# Post-push verification for the daily-update workflow: a run can exit 0 and
# look successful while GitHub Pages fails to actually deploy the change
# (this happened once locally, during a real GitHub-side outage, and nothing
# in a plain success/fail check would have caught it). Mirrors the same check
# in the local launchd job's run-daily-update.sh.
set -uo pipefail

HEAD_BEFORE="${1:?usage: verify-deploy.sh <head-before-sha>}"
HEAD_AFTER="$(git rev-parse HEAD)"

if [ "$HEAD_BEFORE" = "$HEAD_AFTER" ]; then
  echo "No new commit this run — nothing to publish."
  exit 0
fi

git fetch -q origin main
if [ "$(git rev-parse origin/main)" != "$HEAD_AFTER" ]; then
  echo "::warning::local HEAD is not on origin/main — the push may not have landed."
  exit 1
fi

API="https://api.github.com/repos/yifeng22100/malaysia-election-sentiment/actions/runs?per_page=15"
RESULT="timeout"
for i in $(seq 1 24); do
  RESULT="$(curl -s --max-time 25 "$API" | SHA="$HEAD_AFTER" python3 -c "
import json, sys, os
sha = os.environ['SHA']
try:
    runs = json.load(sys.stdin).get('workflow_runs', [])
except Exception:
    print('unknown')
    raise SystemExit
for r in runs:
    if r.get('head_sha') == sha:
        print(r.get('conclusion') or r.get('status') or 'unknown')
        break
else:
    print('notfound')
")"
  case "$RESULT" in
    success|failure|cancelled|timed_out) break ;;
  esac
  sleep 30
done

case "$RESULT" in
  success)
    echo "VERIFY: OK — Pages deployed $HEAD_AFTER." ;;
  failure|cancelled|timed_out)
    echo "::warning::Pages deployment for $HEAD_AFTER ended '$RESULT' — commit is safe on GitHub but the live site is not updated." ;;
  *)
    echo "::warning::No finished Pages run found for $HEAD_AFTER after ~12 min (state: $RESULT) — probably just a slow/queued build." ;;
esac
