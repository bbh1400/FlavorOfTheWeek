# Potluck — Design Bible

## One-liner
A cozy browser party game for friend groups. Everyone's low-poly chef avatar
hangs out at a shared virtual Table. Join with a room code, no installs. Every
week the Table gets a new **Special** — a short rotating minigame (the
"flavor of the week") plugged into the same hub, so the roster of games grows
while the hangout space stays familiar.

Think: the social glue of Jackbox + the persistent hangout space of a
Discord voice call + a rotating cabinet of quick (5-10 min) minigames, in a
chunky low-poly kitchen/diner aesthetic.

## Why this concept
- **"Flavor of the week" is literal, not just a metaphor.** The whole game is
  food/kitchen themed, so "this week's Special" is diegetic — it's the
  literal specials board over the Table, not an abstract patch note.
- **Low session friction.** Friends need a link + a name, nothing to install.
  This matters more than graphical fidelity for a friend-group game.
- **Persistent hub + rotating content solves the "one game only lasts a
  month" problem.** The Table (lobby, avatars, chat, specials board) is
  built once and stays. Only the minigame module changes. This is also what
  makes unattended nightly development tractable: each night can ship one
  self-contained module without re-touching the core.
- **Art style is chosen to be AI-buildable.** No hand sculpting, no external
  3D software. Everything is primitive geometry (spheres, capsules, cones,
  boxes) + flat/toon materials + a cheap outline shader, all expressible in
  code. This is the actual reason the style resembles the "chunky flat-shaded
  low-poly co-op game" look (games like PEAK, Human Fall Flat, Fall Guys) —
  that look is a side effect of primitive-friendly geometry, which is exactly
  what a code-only art pipeline can produce well.

## Core loop
1. Host opens the site, clicks "Host a Table," gets a 4-letter room code.
2. Friends open the site, enter the code + a name, pick an avatar color/hat.
3. Everyone lands in the Lobby (the Table) — free-roam low-poly space,
   simple WASD/tap movement, proximity voice-chat-shaped chat bubbles (text
   first; voice is a stretch goal, NOT week 1).
4. The Specials Board shows this week's minigame. Host starts it when ready.
5. Minigame runs (5-10 min), score/results shown back at the Table.
6. Repeat / vote for another round / end session.

## The Table (persistent hub — build once, keep stable)
- Low-poly dining hall: one big table, bench seating, a "Specials Board"
  (literally a chalkboard/menu prop) showing the active rotation.
- Avatars: sphere head, capsule body, cone/box hat variant, flat material
  per player (color picked at join). No rigged animation needed for v1 —
  simple squash/bob idle + lerp movement reads fine at this scale.
- Room-code based sessions. No accounts. Session state lives server-side
  (authoritative) for the duration of the lobby; nothing persists after
  everyone leaves in v1 (no DB needed yet).
- Text chat bubbles above avatars. Emote wheel (stretch goal).

## The Special (rotating minigame slot — this is what nightly work extends)
Each Special is a self-contained module:
- `client/src/specials/<name>/` — its 3D scene/UI, mounted into the same
  R3F canvas as the Table.
- `server/src/specials/<name>/` — a Colyseus room (or sub-room state
  machine) implementing its rules.
- Registered in a single `SPECIALS` registry (see `shared/src/specials.ts`)
  with metadata: id, display name, min/max players, est. duration, one-line
  pitch, icon/color for the Specials Board.
- Must be playable start-to-finish in under ~10 minutes, support 2-8
  players gracefully (design around "whoever showed up tonight"), and need
  no new core-engine features — if a Special idea needs a Table change,
  that change happens first, as its own task, before the Special.

### Launch Specials roadmap (in build order)
1. **Recipe Roulette** — bluffing/voting game. Each round one player gets a
   secret "dish" prompt; everyone else submits a fake ingredient list to
   blend in with the real one; the group votes on which list is the real
   recipe. (Fibbage-shaped, easiest to build: no physics, just UI + timers +
   voting, proves the room/round/scoring plumbing everything else reuses.)
2. **Hot Potato Dash** — real-time physics party mini. Players are chunky
   capsule-blobs on a shrinking low-poly platform, last one standing wins
   (King of the Hill / Fall-Guys-lite). Proves physics + real-time position
   sync on top of the same room plumbing.
3. **Guess the Dish** — drawing-and-guess game themed as "sketch the secret
   recipe," reusing Recipe Roulette's round/timer/scoring skeleton with a
   canvas-drawing UI swapped in.

Do not start Special #2 until #1 is fully playable end-to-end (including
returning to the Table cleanly). Depth over breadth — one great rotation
beats three half-built ones.

## Art bible
The style below is the actual constraint (low-poly, flat/toon-shaded,
primitive-derived silhouettes) — it exists because it's buildable by an
unattended pipeline, not because everything must literally be
in-code geometry. Both production paths are fully allowed and can be
mixed freely:
- **Code-built primitives** — `SphereGeometry`, `CapsuleGeometry`,
  `ConeGeometry`, `BoxGeometry`, `CylinderGeometry`, boolean-free,
  composed directly in the client (as the Table/Avatar already are).
  Fastest path, zero asset pipeline, best for anything simple or that
  needs to vary a lot at runtime (avatar colors/hats, procedural set
  dressing).
- **Blender-authored models** — headless Blender (`blender --background
  --python script.py`) is available in the nightly VM and is fully
  approved for building actual models, exported as glTF and loaded via
  `@react-three/drei`'s `useGLTF`. Reach for this for anything that would
  be awkward or ugly as pure primitives (more detailed props, a
  recognizable dish/food model for a Special, a hero prop for the
  Specials Board). Keep exported models low-poly and flat/toon-shaded to
  match the primitive-built pieces — same silhouette rules apply
  regardless of which path built the mesh (see shading below). Store
  authoring scripts under `art/blender/` (not committed binary .blend
  files where avoidable — a Python script that builds and exports the
  model is easier to review, tweak, and re-run than a binary blob) and
  exported output under `client/public/models/`.
- **Shading:** flat/toon look — `MeshToonMaterial` or `MeshStandardMaterial`
  with low `roughness`/no smooth-shading (`flatShading: true`) plus a cheap
  inverted-hull outline (backface-culled slightly-scaled dark duplicate mesh)
  for the graphic-novel/co-op-party-game silhouette read.
- **Palette:** bright, saturated, warm — kept in
  `shared/src/theme/palette.ts` as the single source of truth so every
  Special reuses the same swatches instead of inventing new ones.
- **Lighting:** one soft directional "sun" + ambient fill, baked shadows off
  (real-time soft shadow is fine at this poly count) — keep it cheap, this
  has to run on a friend's aging laptop over wifi.
- **Camera:** fixed-ish orbit/isometric-leaning camera for the Table and
  most Specials — easier to read multiplayer chaos than a first-person
  camera, and cheaper to build (no per-player camera rig complexity).

## Tech stack
- **Monorepo**, npm workspaces: `client`, `server`, `shared`.
- **Client:** Vite + React + TypeScript + `@react-three/fiber` +
  `@react-three/drei` (three.js underneath).
- **Server:** Node + TypeScript + Colyseus (authoritative rooms, built-in
  state sync — exactly the "room code, shared state, everyone sees the same
  thing" shape this game needs).
- **Shared:** types, the Specials registry, palette/theme constants —
  imported by both client and server so game rules never drift between them.
- **No database in v1.** Room state is in-memory per Colyseus room. Add
  persistence only if a specific Special needs cross-session state (none do
  yet).
- **Hosting:** not decided yet — deliberately deferred. Get the game good
  locally first; pick hosting (Fly.io/Render/etc.) once there's something
  worth putting a URL on.

## Non-goals (v1)
- Accounts/login, persistent profiles, cosmetic shop, monetization.
- Voice chat (text chat bubbles are enough to start).
- Mobile-native app — browser only, but keep controls simple enough that
  mobile browser play isn't ruled out later.
- Rigged/skinned character animation — procedural idle/lerp motion only.

## How nightly work should use this doc
This file is the constitution. `TASKS.md` is the current backlog derived
from it, in build order. `PROGRESS.md` is the running log of what actually
happened each session (since every nightly cloud run starts with zero
memory of prior runs — git history + these two files are the only
continuity). Read DESIGN.md → PROGRESS.md → TASKS.md, in that order, at the
start of every session, before writing code.
