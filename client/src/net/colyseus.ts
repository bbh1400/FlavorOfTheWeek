import { Client, Room } from "colyseus.js";
import { generateRoomCode } from "@potluck/shared";

const SERVER_PORT = 2567;

// No `rootSchema` is passed to create/join below — colyseus.js falls back to
// its automatic reflection handshake, decoding the room's schema at runtime.
// That's the officially supported path and it avoids needing to share
// @colyseus/schema decorated classes (a server-only concern) with the client.
export interface LivePlayerState {
  sessionId: string;
  name: string;
  color: string;
  hat: number;
  x: number;
  z: number;
}

export interface LobbyRoomState {
  code: string;
  players: Map<string, LivePlayerState>;
}

export interface JoinDetails {
  name: string;
  color: string;
  hat: number;
}

function resolveEndpoint(): string {
  const envUrl = import.meta.env.VITE_SERVER_URL as string | undefined;
  if (envUrl) return envUrl;
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.hostname}:${SERVER_PORT}`;
}

let client: Client | null = null;

function getClient(): Client {
  if (!client) client = new Client(resolveEndpoint());
  return client;
}

export function hostRoom(details: JoinDetails): Promise<Room<LobbyRoomState>> {
  // The code must be generated *before* room creation and sent as a create()
  // option — Colyseus's room-listing filterBy() (used by joinRoomByCode
  // below) only ever sees fields present in the create-time options, so
  // there's no way to have the server assign the code after the fact.
  const code = generateRoomCode();
  return getClient().create<LobbyRoomState>("lobby", { ...details, code });
}

export function joinRoomByCode(code: string, details: JoinDetails): Promise<Room<LobbyRoomState>> {
  return getClient().join<LobbyRoomState>("lobby", { ...details, code: code.trim().toUpperCase() });
}
