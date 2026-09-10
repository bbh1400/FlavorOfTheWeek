# Nightly build VM

Runs one unattended Claude Code session per night inside a persistent
Vagrant/VirtualBox VM, instead of a cloud routine — gives it a real
browser (screenshot-based visual checks) and Blender (real model
authoring), and keeps the blast radius of an unattended
`--dangerously-skip-permissions` session inside a disposable guest rather
than the bare host.

## One-time setup (done)
- `vagrant up` (first run) provisions the VM: Node 24, Blender, Google
  Chrome, and the Claude Code CLI.
- The VM reuses the host's existing Claude Code login
  (`~/.claude/.credentials.json`, copied in at provision time) rather
  than a separate API key. If the nightly session ever starts failing
  with an auth error, that credential likely expired/rotated — re-copy
  it with `vagrant provision --provision-with file` and restart the VM.
- Host crontab runs `dev_box/run_nightly.sh` once a night (see the
  crontab entry itself for the exact time).

## No git automation, on purpose
The repo directory is a live VirtualBox synced folder
(`config.vm.synced_folder ".." → /home/vagrant/potluck` in the
Vagrantfile) — the guest and host see the exact same files in real time.
That's the entire continuity mechanism between nights; no git commit or
push happens automatically. The nightly agent is explicitly told not to
run `git add`/`commit`/`push` (see `nightly_prompt.txt`) — you review
what changed and commit/push it yourself each morning, same as any other
Claude Code session on this machine.

## What happens each night
`run_nightly.sh`: `vagrant up` (boots the persistent VM — fast after the
first run) → runs `claude -p "$(cat nightly_prompt.txt)"
--dangerously-skip-permissions` inside the guest, working directory
`/home/vagrant/potluck` (the shared repo) → `vagrant halt` to free host
resources until tomorrow. Output logged to
`dev_box/nightly-YYYY-MM-DD.log` (gitignored).

## Checking on it
- `cd dev_box && vagrant status` — is the VM up/halted right now.
- `cat dev_box/nightly-*.log` — raw output of a given night's run.
- `git status` / `git diff` (repo root, from the host) — what a night
  (or several, if you skip a morning) actually changed, before you
  commit it.
- `PROGRESS.md` (repo root) — the narrative build log the agent
  maintains, independent of git history.
- `vagrant ssh` — drop into the VM directly if something needs
  hand-debugging.

## Known risk, accepted deliberately
`--dangerously-skip-permissions` with a VM that has internet access is
explicitly beyond what Anthropic recommends ("recommended only for
sandboxes with no internet access") — it's needed here because there's
no human around to approve tool calls at 3am. The VM boundary (not the
permission flag) is what's actually containing the risk: a wrong turn
can mess up the guest OS or the files in this synced repo folder, but
not the rest of the host — and since nothing auto-commits or pushes,
you always get to review before anything reaches git history.
