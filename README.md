# Potluck

A browser-based party game for friend groups. Join a shared low-poly Table
with a room code, no installs. Every week the Table gets a new **Special**
— a short rotating minigame, the "flavor of the week."

See [`DESIGN.md`](./DESIGN.md) for the full concept and art direction,
[`TASKS.md`](./TASKS.md) for the current backlog, and
[`PROGRESS.md`](./PROGRESS.md) for the session-by-session build log.

## Structure
```
client/   Vite + React + React Three Fiber (the game you see)
server/   Node + TypeScript + Colyseus (authoritative multiplayer rooms)
shared/   Types, palette, and the Specials registry shared by both
```

## Running locally
```
npm install
npm run dev --workspace server   # starts the Colyseus server
npm run dev --workspace client   # starts the Vite dev server
```
