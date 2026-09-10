import { useState } from "react";
import { Room } from "colyseus.js";
import { JoinScreen } from "./components/JoinScreen";
import { TableScreen } from "./components/TableScreen";
import type { LobbyRoomState } from "./net/colyseus";

export default function App() {
  const [room, setRoom] = useState<Room<LobbyRoomState> | null>(null);

  if (!room) {
    return <JoinScreen onConnected={setRoom} />;
  }

  return (
    <TableScreen
      room={room}
      onLeave={() => {
        room.leave();
        setRoom(null);
      }}
    />
  );
}
