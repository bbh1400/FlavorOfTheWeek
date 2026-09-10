import { useEffect, useRef, useState } from "react";
import { getStateCallbacks, Room } from "colyseus.js";
import type { LivePlayerState, LobbyRoomState } from "./colyseus";

export interface Vec2Ref {
  x: number;
  z: number;
}

export interface RosterEntry {
  sessionId: string;
  name: string;
  color: string;
  hat: number;
  isSelf: boolean;
  // Mutated in place on every network position update (remote players) or
  // every frame (the local player's own controller) — deliberately NOT
  // React state, so position updates never trigger a re-render; only
  // roster membership changes (join/leave) do.
  positionRef: Vec2Ref;
}

export function useLobby(room: Room<LobbyRoomState> | null) {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [code, setCode] = useState("");
  const entries = useRef(new Map<string, RosterEntry>());

  useEffect(() => {
    entries.current.clear();
    setRoster([]);
    setCode("");
    if (!room) return;

    // Reflection mode (no shared rootSchema passed to client.create/join)
    // means room.state is a real Colyseus Schema/MapSchema instance at
    // runtime, but its static type here is just the plain LobbyRoomState
    // interface — `any` sidesteps that mismatch for the callback-proxy calls
    // below without lying about the hook's own return type.
    const $ = getStateCallbacks(room) as any;
    setCode((room.state as unknown as LobbyRoomState).code);

    const unbindCode = $(room.state).listen("code", (value: string) => setCode(value));

    const unbindAdd = $(room.state).players.onAdd((player: LivePlayerState, sessionId: string) => {
      const isSelf = sessionId === room.sessionId;
      const entry: RosterEntry = {
        sessionId,
        name: player.name,
        color: player.color,
        hat: player.hat,
        isSelf,
        positionRef: { x: player.x, z: player.z },
      };
      entries.current.set(sessionId, entry);
      setRoster(Array.from(entries.current.values()));

      // The local player's own position is owned by client-side prediction
      // (see LocalAvatarController) — applying the network echo on top of it
      // would fight the prediction and cause visible jitter, so only remote
      // players' positions are driven from state sync.
      if (!isSelf) {
        $(player).listen("x", (value: number) => {
          entry.positionRef.x = value;
        });
        $(player).listen("z", (value: number) => {
          entry.positionRef.z = value;
        });
      }
    });

    const unbindRemove = $(room.state).players.onRemove((_player: LivePlayerState, sessionId: string) => {
      entries.current.delete(sessionId);
      setRoster(Array.from(entries.current.values()));
    });

    return () => {
      unbindCode();
      unbindAdd();
      unbindRemove();
    };
  }, [room]);

  return { roster, code };
}
