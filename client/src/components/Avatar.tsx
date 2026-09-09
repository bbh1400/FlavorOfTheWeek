import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import * as THREE from "three";
import { palette } from "@potluck/shared";

interface AvatarProps {
  position: [number, number, number];
  color: string;
  hat?: number; // 0 = none, 1 = cone (chef-ish), 2 = box (toque-ish)
  name?: string;
  bobOffset?: number;
}

// Chunky low-poly "chef blob": sphere head + capsule body + optional hat.
// Deliberately primitive-only, flat-shaded, outlined — see DESIGN.md > Art bible.
export function Avatar({ position, color, hat = 1, bobOffset = 0 }: AvatarProps) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime() + bobOffset;
    group.current.position.y = position[1] + Math.sin(t * 2) * 0.05;
  });

  return (
    <group ref={group} position={position}>
      {/* body */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.4, 0.5, 4, 8]} />
        <meshStandardMaterial color={color} flatShading />
        <Outlines thickness={0.04} color={palette.outline} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.38, 12, 10]} />
        <meshStandardMaterial color="#F4D9B0" flatShading />
        <Outlines thickness={0.04} color={palette.outline} />
      </mesh>
      {/* hat */}
      {hat === 1 && (
        <mesh castShadow position={[0, 1.75, 0]}>
          <coneGeometry args={[0.28, 0.4, 10]} />
          <meshStandardMaterial color={color} flatShading />
          <Outlines thickness={0.04} color={palette.outline} />
        </mesh>
      )}
      {hat === 2 && (
        <mesh castShadow position={[0, 1.68, 0]}>
          <boxGeometry args={[0.5, 0.26, 0.5]} />
          <meshStandardMaterial color={color} flatShading />
          <Outlines thickness={0.04} color={palette.outline} />
        </mesh>
      )}
    </group>
  );
}
