import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Avatar } from "./Avatar";
import type { RosterEntry } from "../net/useLobby";
import type { MovementVector } from "../hooks/useMovementInput";

const MOVE_SPEED = 3.2; // units/sec
const TABLE_RADIUS = 8.5; // must match the server's clamp radius
const MOVE_SEND_INTERVAL_MS = 80;
const MOVE_SEND_MIN_DELTA = 0.01;

interface LocalAvatarControllerProps {
  entry: RosterEntry;
  getInput: () => MovementVector;
  onMove: (x: number, z: number) => void;
  bubbleText?: string;
}

// Owns the local player's own movement: reads combined keyboard/joystick
// input every frame, moves the shared positionRef directly (so the Avatar's
// render loop picks it up with zero lag), and throttles outgoing "move"
// messages to the server instead of sending every frame.
export function LocalAvatarController({ entry, getInput, onMove, bubbleText }: LocalAvatarControllerProps) {
  const lastSent = useRef({ x: entry.positionRef.x, z: entry.positionRef.z, at: 0 });

  useFrame((_, delta) => {
    const input = getInput();
    if (input.x !== 0 || input.z !== 0) {
      let nx = entry.positionRef.x + input.x * MOVE_SPEED * delta;
      let nz = entry.positionRef.z + input.z * MOVE_SPEED * delta;
      const radius = Math.hypot(nx, nz);
      if (radius > TABLE_RADIUS) {
        const scale = TABLE_RADIUS / radius;
        nx *= scale;
        nz *= scale;
      }
      entry.positionRef.x = nx;
      entry.positionRef.z = nz;
    }

    const now = performance.now();
    if (now - lastSent.current.at >= MOVE_SEND_INTERVAL_MS) {
      const moved = Math.hypot(entry.positionRef.x - lastSent.current.x, entry.positionRef.z - lastSent.current.z);
      if (moved > MOVE_SEND_MIN_DELTA) {
        onMove(entry.positionRef.x, entry.positionRef.z);
        lastSent.current = { x: entry.positionRef.x, z: entry.positionRef.z, at: now };
      }
    }
  });

  return (
    <Avatar
      positionRef={entry.positionRef}
      color={entry.color}
      hat={entry.hat}
      name={entry.name}
      bubbleText={bubbleText}
      smoothing={1}
    />
  );
}
