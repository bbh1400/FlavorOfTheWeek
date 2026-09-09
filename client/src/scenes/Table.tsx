import { Outlines } from "@react-three/drei";
import { palette } from "@potluck/shared";
import { Avatar } from "../components/Avatar";

// Phase 0 static scene: proves the art style + tech stack before any
// networking exists. See TASKS.md Phase 1 — these 3 hardcoded avatars get
// replaced by ones driven by real Colyseus room state.
const SAMPLE_PLAYERS = [
  { color: palette.avatarColors[0], position: [-1.4, 0, 1.6] as [number, number, number], hat: 1 },
  { color: palette.avatarColors[3], position: [1.6, 0, 1.4] as [number, number, number], hat: 2 },
  { color: palette.avatarColors[5], position: [0, 0, -1.8] as [number, number, number], hat: 1 },
];

export function Table() {
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

      {/* specials board */}
      <group position={[0, 1.6, -4.2]}>
        <mesh castShadow>
          <boxGeometry args={[2.4, 1.6, 0.12]} />
          <meshStandardMaterial color={palette.boardGreen} flatShading />
          <Outlines thickness={0.035} color={palette.outline} />
        </mesh>
        <mesh position={[0, -1.05, 0]} castShadow>
          <boxGeometry args={[0.15, 0.9, 0.15]} />
          <meshStandardMaterial color={palette.tableWoodDark} flatShading />
        </mesh>
      </group>

      {SAMPLE_PLAYERS.map((p, i) => (
        <Avatar key={i} position={p.position} color={p.color} hat={p.hat} bobOffset={i} />
      ))}
    </group>
  );
}
