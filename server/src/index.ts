import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "http";
import { LobbyRoom } from "./rooms/LobbyRoom.js";

const PORT = Number(process.env.PORT) || 2567;
const httpServer = createServer();

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define("lobby", LobbyRoom).filterBy(["code"]);

// Must call gameServer.listen() (not httpServer.listen() directly) — this is
// what actually registers the matchmake HTTP routes (bindRoutes()) in
// addition to binding the port. Skipping it leaves the port open but every
// HTTP request (room creation/joining) hangs forever with no response.
gameServer.listen(PORT).then(() => {
  console.log(`Potluck server listening on ws://localhost:${PORT}`);
});
