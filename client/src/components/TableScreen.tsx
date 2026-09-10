import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Room } from "colyseus.js";
import { palette } from "@potluck/shared";
import { Table } from "../scenes/Table";
import { TouchJoystick } from "./TouchJoystick";
import { ChatBox } from "./ChatBox";
import { useLobby } from "../net/useLobby";
import { useChatBubbles } from "../net/useChatBubbles";
import { useMovementInput } from "../hooks/useMovementInput";
import type { LobbyRoomState } from "../net/colyseus";

interface TableScreenProps {
  room: Room<LobbyRoomState>;
  onLeave: () => void;
}

export function TableScreen({ room, onLeave }: TableScreenProps) {
  const { roster, code } = useLobby(room);
  const { bubbles, sendChat } = useChatBubbles(room);
  const { getInput, joystick } = useMovementInput();

  function handleLocalMove(x: number, z: number) {
    room.send("move", { x, z });
  }

  return (
    <div className="table-screen">
      <Canvas
        shadows
        camera={{ position: [0, 6, 9], fov: 45 }}
        style={{ background: palette.background }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Table roster={roster} getInput={getInput} onLocalMove={handleLocalMove} bubbles={bubbles} />
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={16}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>

      <div className="hud-top">
        <div className="room-code-banner">
          Room code: <strong>{code}</strong>
        </div>
        <button type="button" className="leave-button" onClick={onLeave}>
          Leave
        </button>
      </div>

      <ChatBox onSend={sendChat} />
      <TouchJoystick vector={joystick} />
    </div>
  );
}
