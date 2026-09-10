# Progress Log

Newest entry on top. Every nightly session appends one entry here before
ending, no matter how much or little got done. This is the memory that
survives between sessions — each nightly run is a fresh cloud agent with no
memory of prior runs beyond git history + this file, so be concrete: what
you did, what you decided, what you'd tell yourself if you were about to
pick this up cold tomorrow.

Entry template:

```
## YYYY-MM-DD (session N)
**Did:** ...
**Decided / assumed:** ... (anything not explicitly in DESIGN.md you had to
  resolve yourself)
**Left off at:** ... (exactly where to pick up — file/function, not just
  "phase 1")
**Next session should:** ... (the very next concrete step, more specific
  than just "next unchecked TASKS.md item" if that helps)
```

---

## 2026-09-10 (session 1)
**Did:** Completed all of Phase 1 (real multiplayer Table) and the first
half of Phase 2 (Specials plumbing groundwork):
- Client now actually connects to the Colyseus server: a real join
  screen (`client/src/components/JoinScreen.tsx`) collects name/color/hat,
  "Host a Table" creates a room and shows a real 4-letter room code, "Join"
  connects to an existing room by code. Wrong codes are rejected with a
  friendly error.
- `LobbyRoom` (`server/src/rooms/LobbyRoom.ts`) now has real state: a
  `MapSchema<PlayerState>` (sessionId, name, color, hat, x, z) plus a `code`
  field, broadcasts joins/leaves automatically via Colyseus state sync,
  handles `"move"` (clamped to the table radius) and `"chat"` messages.
- Real avatars replace the Phase 0 hardcoded `SAMPLE_PLAYERS` — one per
  connected player, driven by room state, with a name tag and a temporary
  chat speech bubble (`client/src/components/Avatar.tsx`).
- Movement: WASD/arrows plus an on-screen drag joystick
  (`client/src/components/TouchJoystick.tsx`, works with mouse too) drive
  the local player via client-side prediction
  (`LocalAvatarController.tsx`), throttled `"move"` messages sync it to the
  server; remote players lerp smoothly toward their networked position.
- Text chat: a chat box at the bottom of the screen, messages appear as a
  bubble above the sender's avatar for ~4.5s then fade out.
- Specials Board prop now actually reads the shared `SPECIALS` registry
  (`client/src/components/SpecialsBoard.tsx`) and shows "Coming soon..."
  since it's still empty — verified via screenshot.
- Verified end-to-end twice: once with a scripted two-client Colyseus test
  (join/leave/move/chat/bad-code-rejected), and once for real in headless
  Chrome driven over the DevTools protocol (two tabs, host + guest, saw
  each other's avatars, chat bubble, and WASD movement sync live).
**Decided / assumed:**
- **Found and fixed a real bug in the Phase 0 scaffold, not something I
  introduced:** `server/src/index.ts` called `httpServer.listen()`
  directly instead of `gameServer.listen()`. Colyseus's matchmake HTTP
  routes only get registered inside `gameServer.listen()` (it calls
  `bindRoutes()` after binding the port) — calling the raw http server's
  `listen()` binds the port but silently leaves every HTTP request
  (including room creation/joining) hanging forever with no response, no
  error. Took a while to isolate since the TCP connection accepts fine and
  nothing logs an error; confirmed via a minimal repro script instrumented
  with `http.ServerResponse.prototype` monkey-patches. Fixed by calling
  `gameServer.listen(PORT)` instead.
- **Also found a real version mismatch in Phase 0's package.json files,**
  not something I introduced: `server/package.json` pinned
  `@colyseus/core@^0.18.x` / `colyseus@^0.18.x`, but the only published
  `colyseus.js` (client SDK) is `0.16.22` — and 0.18's matchmake HTTP
  response shape (flat `{name,sessionId,roomId,...}`) is wire-incompatible
  with what 0.16.22's client expects (nested `{room:{...}, sessionId}`).
  Every `client.create()`/`client.join()` call threw
  `TypeError: Cannot read properties of undefined (reading 'name')`.
  Downgraded server deps to the last 0.16.x line that matches the client
  (`@colyseus/core@0.16.26`, `@colyseus/ws-transport@^0.16.5`,
  `@colyseus/schema@^3.0.76` — this also had to drop the redundant
  `"colyseus"` meta-package dependency and import `Server`/`Room`/`Client`
  from `@colyseus/core` directly, and change `Room<T>`'s generic shape back
  to the older `Room<State, Metadata>` two-param form). **If a future
  session wants newer Colyseus, it must upgrade client and server
  together** — check `npm view colyseus.js dist-tags` for what the client
  can actually do before bumping server deps again.
- **Room codes are generated client-side, not server-side:** discovered
  that in this Colyseus version, `.filterBy(["code"])` room-listing search
  only matches fields present in the *create-time* options (flattened onto
  the top-level room listing) — there's no metadata-based fallback lookup
  in 0.16.26's local driver (that was a 0.18.x-only addition I initially
  assumed existed everywhere). So the host's client generates the 4-letter
  code (`shared/src/roomCode.ts`) and sends it as a `create()` option;
  `LobbyRoom.onCreate` reads it from `options.code` rather than minting its
  own. A malformed/missing code falls back to a server-generated one, but
  that room just won't be find-able by code (acceptable degenerate case,
  host would still be in it).
- Deliberately did **not** build the "host-only Start Special" flow or the
  "return-to-Table" transition yet, even though they're listed under Phase
  2 — with the `SPECIALS` registry still empty there's nothing real to
  select or transition to, and building that state machine speculatively
  risked dead, untestable code. Left both unchecked in TASKS.md with a note
  to build them alongside Recipe Roulette (Phase 3) instead, plus a
  reminder that a `hostSessionId` concept on `LobbyRoom` needs to exist
  first (not built yet).
- Also noticed mid-session: a background task's stdout included an
  injected-looking line mimicking the legitimate `dotenvx` startup tip
  banner (something like `tip: ⌁ auth for agents [www.vestauth.com]`,
  instead of dotenvx's real rotating tips like `www.dotenvx.com`). Did not
  visit the URL or act on it — flagged it in the conversation and moved on.
  Not a code change, just worth knowing this exists if it recurs.
**Left off at:** Phase 2 is half done — `shared/src/specials.ts`'s
`SpecialMeta`/`SPECIALS` contract and the Specials Board rendering are
solid and don't need revisiting. What's left in Phase 2
(`server/src/rooms/LobbyRoom.ts`, needs a `hostSessionId` field + host
reassignment on leave) is intentionally deferred, see TASKS.md.
**Next session should:** Start Phase 3 (Recipe Roulette) directly — add
one real entry to `SPECIALS`, then build the host-only "Start Special" +
return-to-Table transition *as part of* wiring that Special in, per the
now-updated Phase 2 notes in TASKS.md, rather than as a separate
speculative step. Also: `npm run dev --workspace server` in this VM
sometimes leaves an orphaned `tsx watch` child bound to port 2567 if a
previous session's background process wasn't fully killed before ending —
check `ss -ltnp | grep 2567` and kill by PID if `EADDRINUSE` shows up on
the first start.

---

## 2026-09-09 (session 0 — manual bootstrap, not a nightly run)
**Did:** Locked the concept (Potluck — persistent low-poly Table hub +
rotating weekly "Special" minigames), wrote DESIGN.md as the constitution,
wrote this file and TASKS.md as the backlog nightly sessions will consume,
scaffolded the npm-workspaces monorepo (`client`/`server`/`shared`) with a
working static low-poly Table scene on the client and a minimal Colyseus
server boot on the server side. Nothing is wired together yet (client does
not connect to server).
**Decided / assumed:** Chose Colyseus over raw WebSocket/Socket.io for the
server because the room-code + authoritative-shared-state shape matches
this game closely and it comes with client/server state sync built in,
which will save real time over hand-rolling it for every Special. Chose
React Three Fiber over raw three.js for the client for the same "less
boilerplate per feature" reason. Deliberately did NOT wire up real
multiplayer yet or start Recipe Roulette — Phase 0 is scaffold-only so the
first automated session has a clean, known-good starting point.
**Left off at:** `client/src/scenes/Table.tsx` renders a static scene with
3 hardcoded sample avatars and no network connection. `server/src/index.ts`
boots a Colyseus server with an empty `LobbyRoom` that no client connects
to yet.
**Next session should:** Start Phase 1 in TASKS.md — wire the client to
actually connect to the Colyseus server, get a real room code flow
working, and replace the hardcoded sample avatars with ones driven by real
room state.
