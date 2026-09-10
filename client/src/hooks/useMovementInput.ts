import { useEffect, useMemo, useRef } from "react";

export interface MovementVector {
  x: number;
  z: number;
}

const KEY_TO_AXIS: Record<string, MovementVector> = {
  KeyW: { x: 0, z: -1 },
  ArrowUp: { x: 0, z: -1 },
  KeyS: { x: 0, z: 1 },
  ArrowDown: { x: 0, z: 1 },
  KeyA: { x: -1, z: 0 },
  ArrowLeft: { x: -1, z: 0 },
  KeyD: { x: 1, z: 0 },
  ArrowRight: { x: 1, z: 0 },
};

// Combines WASD/arrow keys with an on-screen touch/mouse joystick into one
// normalized movement vector. Exposes plain refs (not React state) so the
// per-frame R3F movement controller can poll input without re-rendering.
export function useMovementInput() {
  const keysDown = useRef(new Set<string>());
  const joystick = useRef<MovementVector>({ x: 0, z: 0 });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (KEY_TO_AXIS[e.code]) keysDown.current.add(e.code);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.code);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const getInput = useMemo(
    () => (): MovementVector => {
      let x = joystick.current.x;
      let z = joystick.current.z;
      for (const code of keysDown.current) {
        const axis = KEY_TO_AXIS[code];
        x += axis.x;
        z += axis.z;
      }
      const length = Math.hypot(x, z);
      if (length > 1) {
        x /= length;
        z /= length;
      }
      return { x, z };
    },
    []
  );

  return { getInput, joystick };
}
