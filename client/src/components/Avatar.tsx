import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Outlines } from "@react-three/drei";
import * as THREE from "three";
import { palette } from "@potluck/shared";
import type { Vec2Ref } from "../net/useLobby";

interface AvatarProps {
  positionRef: Vec2Ref; // target x/z, mutated externally every frame or on network update
  color: string;
  hat?: number; // 0 = none, 1 = cone (chef-ish), 2 = box (toque-ish)
  name?: string;
  bubbleText?: string;
  bobOffset?: number;
  // 1 = snap straight to positionRef (used for the local, already-predicted
  // player); <1 = ease toward it over time (used for remote players so
  // infrequent network updates don't look like teleports).
  smoothing?: number;
}

// Chunky low-poly "chef blob": sphere head + capsule body + optional hat.
// Deliberately primitive-only, flat-shaded, outlined — see DESIGN.md > Art bible.
export function Avatar({
  positionRef,
  color,
  hat = 1,
  name,
  bubbleText,
  bobOffset = 0,
  smoothing = 0.15,
}: AvatarProps) {
  const group = useRef<THREE.Group>(null);
  const rendered = useRef({ x: positionRef.x, z: positionRef.z });

  useLayoutEffect(() => {
    rendered.current = { x: positionRef.x, z: positionRef.z };
    if (group.current) {
      group.current.position.x = positionRef.x;
      group.current.position.z = positionRef.z;
    }
    // Only snap on mount — subsequent updates are handled by the lerp below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime() + bobOffset;
    rendered.current.x = THREE.MathUtils.lerp(rendered.current.x, positionRef.x, smoothing);
    rendered.current.z = THREE.MathUtils.lerp(rendered.current.z, positionRef.z, smoothing);
    group.current.position.x = rendered.current.x;
    group.current.position.z = rendered.current.z;
    group.current.position.y = Math.sin(t * 2) * 0.05;
  });

  return (
    <group ref={group}>
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
      {name && (
        <Html position={[0, 2.05, 0]} center distanceFactor={8} zIndexRange={[10, 0]} occlude={false}>
          <div className="avatar-name-tag">{name}</div>
        </Html>
      )}
      {bubbleText && (
        <Html position={[0, 2.5, 0]} center distanceFactor={8} zIndexRange={[20, 0]} occlude={false}>
          <div className="avatar-chat-bubble">{bubbleText}</div>
        </Html>
      )}
    </group>
  );
}
