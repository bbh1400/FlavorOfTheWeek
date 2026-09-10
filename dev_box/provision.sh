#!/usr/bin/env bash
set -euo pipefail

# --- Base packages -----------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git build-essential ca-certificates gnupg unzip \
  blender

# --- Node.js (match host major version) ---------------------------------
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 24 ]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi

# --- Google Chrome (real .deb, avoids the flaky Ubuntu chromium snap) ---
if ! command -v google-chrome-stable >/dev/null; then
  curl -fsSL -o /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  apt-get install -y /tmp/chrome.deb
  rm -f /tmp/chrome.deb
fi

# --- Claude Code CLI (native install, as the vagrant user) ---------------
sudo -u vagrant -H bash -c 'command -v claude >/dev/null || curl -fsSL https://claude.ai/install.sh | bash'

# --- Claude Code credentials (copied in by the file provisioner) ---------
chmod 700 /home/vagrant/.claude
chmod 600 /home/vagrant/.claude/.credentials.json
chown -R vagrant:vagrant /home/vagrant/.claude

echo "Provisioning complete."
