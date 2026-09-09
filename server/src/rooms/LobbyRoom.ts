import { Room, Client } from "colyseus";
import { Schema, type } from "@colyseus/schema";

// Placeholder state — Phase 1 (TASKS.md) replaces this with real per-player
// fields (name, color, hat, position) and join/leave broadcasting.
class LobbyState extends Schema {
  @type("number") playerCount = 0;
}

export class LobbyRoom extends Room<{ state: LobbyState }> {
  maxClients = 8;

  onCreate() {
    this.state = new LobbyState();
  }

  onJoin(client: Client) {
    this.state.playerCount++;
  }

  onLeave(client: Client) {
    this.state.playerCount--;
  }
}
