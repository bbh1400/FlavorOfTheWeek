import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "http";
import { LobbyRoom } from "./rooms/LobbyRoom.js";

const PORT = Number(process.env.PORT) || 2567;
const httpServer = createServer();

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define("lobby", LobbyRoom);

httpServer.listen(PORT, () => {
  console.log(`Potluck server listening on ws://localhost:${PORT}`);
});
