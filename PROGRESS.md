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
