#!/usr/bin/env bash
# Invoked nightly by the host's crontab (see dev_box/README.md). Brings up
# the persistent VM, runs one unattended Claude Code session inside it,
# then halts the VM again to free host resources until tomorrow night.
set -uo pipefail
cd "$(dirname "$0")"

LOG="./nightly-$(date +%Y-%m-%d).log"

{
  echo "=== Potluck nightly run: $(date) ==="

  vagrant up
  if [ $? -ne 0 ]; then
    echo "vagrant up failed, aborting run."
    exit 1
  fi

  PROMPT="$(cat ./nightly_prompt.txt)"
  vagrant ssh -c "cd /home/vagrant/potluck && claude -p \"\$(cat /home/vagrant/potluck/dev_box/nightly_prompt.txt)\" --dangerously-skip-permissions --model claude-sonnet-5"

  echo "=== Session finished: $(date), halting VM ==="
  vagrant halt
} >> "$LOG" 2>&1
