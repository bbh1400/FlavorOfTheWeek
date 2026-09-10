import { Room, Client } from "@colyseus/core";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { palette, generateRoomCode } from "@potluck/shared";

export class PlayerState extends Schema {
  @type("string") sessionId = "";
  @type("string") name = "chef";
  @type("string") color: string = palette.avatarColors[0];
  @type("number") hat = 1;
  @type("number") x = 0;
  @type("number") z = 0;
}

export class LobbyState extends Schema {
  @type("string") code = "";
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}

interface JoinOptions {
  code?: string;
  name?: string;
  color?: string;
  hat?: number;
}

interface MoveMessage {
  x: number;
  z: number;
}

interface ChatMessage {
  text: string;
}

const MAX_NAME_LENGTH = 16;
const MAX_CHAT_LENGTH = 140;
const TABLE_RADIUS = 8.5; // keep players from wandering off the floor circle

const VALID_CODE = /^[A-Z]{4}$/;

export class LobbyRoom extends Room<LobbyState> {
  maxClients = 8;

  onCreate(options: JoinOptions) {
    this.setState(new LobbyState());
    // Colyseus's room-listing filterBy(["code"]) (registered in
    // server/src/index.ts) only ever sees fields present in these
    // *create-time* options, so the client always generates and supplies the
    // code — this fallback only covers a malformed/missing option, in which
    // case the room simply won't be joinable by code (still fine to create).
    this.state.code = VALID_CODE.test(options.code ?? "") ? (options.code as string) : generateRoomCode();

    this.onMessage<MoveMessage>("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || typeof message?.x !== "number" || typeof message?.z !== "number") return;
      if (!Number.isFinite(message.x) || !Number.isFinite(message.z)) return;
      const clampedRadius = Math.min(Math.hypot(message.x, message.z), TABLE_RADIUS);
      const angle = Math.atan2(message.z, message.x);
      player.x = Math.cos(angle) * clampedRadius;
      player.z = Math.sin(angle) * clampedRadius;
    });

    this.onMessage<ChatMessage>("chat", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      const text = message?.text?.trim().slice(0, MAX_CHAT_LENGTH);
      if (!player || !text) return;
      this.broadcast("chat", { sessionId: client.sessionId, text });
    });
  }

  onJoin(client: Client, options: JoinOptions) {
    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.name = (options.name || "Chef").trim().slice(0, MAX_NAME_LENGTH) || "Chef";
    player.color = palette.avatarColors.find((c) => c === options.color) ?? palette.avatarColors[0];
    const hat = options.hat;
    player.hat = hat === 0 || hat === 1 || hat === 2 ? hat : 1;

    // Spread joiners around the table so they don't stack on top of each other.
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 1.5;
    player.x = Math.cos(angle) * radius;
    player.z = Math.sin(angle) * radius;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}
