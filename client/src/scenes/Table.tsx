import { Outlines } from "@react-three/drei";
import { palette } from "@potluck/shared";
import { Avatar } from "../components/Avatar";
import { LocalAvatarController } from "../components/LocalAvatarController";
import { SpecialsBoard } from "../components/SpecialsBoard";
import type { RosterEntry } from "../net/useLobby";
import type { MovementVector } from "../hooks/useMovementInput";

interface TableProps {
  roster: RosterEntry[];
  getInput: () => MovementVector;
  onLocalMove: (x: number, z: number) => void;
  bubbles: Record<string, string>;
}

export function Table({ roster, getInput, onLocalMove, bubbles }: TableProps) {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 24]} />
        <meshStandardMaterial color="#E8C77A" flatShading />
      </mesh>

      {/* table top */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.15, 20]} />
        <meshStandardMaterial color={palette.tableWood} flatShading />
        <Outlines thickness={0.03} color={palette.outline} />
      </mesh>
      {/* table pedestal */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.55, 12]} />
        <meshStandardMaterial color={palette.tableWoodDark} flatShading />
        <Outlines thickness={0.03} color={palette.outline} />
      </mesh>

      {/* benches */}
      {[
        [0, 0.28, 2.6, 0] as const,
        [0, 0.28, -2.6, 0] as const,
        [2.6, 0.28, 0, Math.PI / 2] as const,
        [-2.6, 0.28, 0, Math.PI / 2] as const,
      ].map(([x, y, z, rot], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, rot, 0]} castShadow>
          <boxGeometry args={[2, 0.15, 0.5]} />
          <meshStandardMaterial color={palette.bench} flatShading />
          <Outlines thickness={0.03} color={palette.outline} />
        </mesh>
      ))}

      <SpecialsBoard />

      {roster.map((entry, i) =>
        entry.isSelf ? (
          <LocalAvatarController
            key={entry.sessionId}
            entry={entry}
            getInput={getInput}
            onMove={onLocalMove}
            bubbleText={bubbles[entry.sessionId]}
          />
        ) : (
          <Avatar
            key={entry.sessionId}
            positionRef={entry.positionRef}
            color={entry.color}
            hat={entry.hat}
            name={entry.name}
            bubbleText={bubbles[entry.sessionId]}
            bobOffset={i}
          />
        )
      )}
    </group>
  );
}
