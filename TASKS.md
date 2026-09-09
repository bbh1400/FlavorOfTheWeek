# Task Backlog

Read `DESIGN.md` first. Read `PROGRESS.md` next (the log of what already
happened). Then come back here.

**Rules for working this list:**
- Take the **first unchecked task**, top to bottom. Don't skip ahead even if
  a later task looks more fun — the order encodes dependencies.
- A task is "done" only when the app still builds/runs (`npm run dev` in
  both `client` and `server` without crashing) and, if it changed player-
  visible behavior, you've sanity-checked it (headless is fine — read the
  code path, or use a quick script — full browser testing isn't available
  in this environment).
- At the end of every session, no matter how much got done: check off
  what's actually complete, add any new tasks you discovered, and write a
  `PROGRESS.md` entry (see the template there). Commit your work. Never
  leave the tree mid-edit / non-building at the end of a session.
- If you get properly stuck (a design ambiguity DESIGN.md doesn't resolve),
  don't guess wildly — pick the simplest interpretation consistent with
  DESIGN.md, note the assumption in PROGRESS.md, and move on. Forward
  progress every night matters more than getting every judgment call
  perfect.
- Keep tasks small enough to plausibly finish in one ~6-hour unattended
  window. If a task is clearly bigger than that, split it into sub-tasks
  the first time you touch it (edit this file to do so).

## Phase 0 — Scaffold (bootstrapped manually, not by a nightly session)
- [x] Repo structure, npm workspaces (`client`, `server`, `shared`)
- [x] `DESIGN.md`, `TASKS.md`, `PROGRESS.md`, README
- [x] Client: Vite + React + R3F rendering a static low-poly Table scene
      (table, benches, specials board prop, 2-3 sample avatars) with the
      toon-outline shading approach from the art bible
- [x] Server: minimal Colyseus server boots, one `LobbyRoom` exists (no
      gameplay logic yet)
- [x] `shared`: palette constants, `Player` type, empty `SPECIALS` registry

## Phase 1 — Make the Table actually multiplayer
- [ ] Client connects to the Colyseus server on load; joining/creating a
      room actually works end-to-end (host gets a real room code, a
      second browser tab/client can join with it)
- [ ] `LobbyRoom` state: list of players (id, name, chosen color/hat,
      position). Broadcast joins/leaves.
- [ ] Render one avatar per connected player at the Table, driven by real
      room state (not the static sample avatars from Phase 0 — remove
      those once real ones work)
- [ ] Name entry + avatar color/hat picker UI before entering the Table
- [ ] Basic movement: WASD/arrow keys (and on-screen touch stick for
      mobile) moves your avatar; position synced to the room and rendered
      for everyone else with simple lerp smoothing
- [ ] Text chat: a chat box + chat bubbles that appear above the sending
      avatar for a few seconds

## Phase 2 — Specials plumbing
- [ ] Define the `Special` module contract in `shared` (metadata shape:
      id, name, min/max players, est. duration, pitch, accent color) per
      DESIGN.md's registry description
- [ ] Specials Board prop at the Table renders whatever's in the registry
      (even with zero real Specials yet, it should show "Coming soon")
- [ ] Host-only "Start Special" flow: host picks from available Specials,
      server transitions the room (or hands off to a sub-room) into
      "in-special" state, all clients swap their rendered scene
      accordingly
- [ ] Clean return-to-Table flow after a Special ends (this is explicitly
      called out in DESIGN.md as part of "fully playable end-to-end" —
      don't skip it)

## Phase 3 — Special #1: Recipe Roulette
- [ ] Server-side round/timer/prompt/voting state machine for Recipe
      Roulette (see DESIGN.md for the rules)
- [ ] A small prompt bank (secret "dish" prompts + what counts as a
      plausible fake ingredient) — start with ~20 prompts, more can be
      added anytime without code changes if stored as data
- [ ] Client UI: prompt reveal (secret-holder vs everyone-else views),
      submission phase, voting phase, results/scoring reveal
- [ ] Scoring + a short "results at the Table" moment before returning to
      the Lobby
- [ ] End-to-end playtest note in PROGRESS.md once 2+ simulated clients can
      play a full round via the state machine (script-driven Colyseus
      client test counts if a real browser isn't available)

## Phase 4 — Special #2: Hot Potato Dash
- [ ] (Not detailed yet — break this down at the top of the session that
      reaches it, once Recipe Roulette has proven the Specials plumbing.
      Expect: server-authoritative physics tick, shrinking platform,
      elimination logic, simple last-one-standing win condition.)

## Phase 5 — Special #3: Guess the Dish
- [ ] (Not detailed yet — reuse Recipe Roulette's round/timer/scoring
      skeleton with a canvas-drawing submission UI instead of text.)

## Icebox (not scheduled — don't work these until the above is solid)
- Voice chat / proximity audio
- Emote wheel
- Hosting/deployment setup
- Mobile polish pass
- Persistent player profiles across sessions
