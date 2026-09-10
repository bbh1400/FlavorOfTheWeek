import { useRef, type MutableRefObject } from "react";
import type { MovementVector } from "../hooks/useMovementInput";

interface TouchJoystickProps {
  vector: MutableRefObject<MovementVector>;
}

const MAX_RADIUS = 40; // px

// A simple drag-anywhere-in-the-pad virtual joystick. Uses pointer events so
// it works with touch AND mouse (handy for desktop testing), and mutates the
// shared input ref directly rather than React state — this needs to feel
// instant, not wait for a render.
export function TouchJoystick({ vector }: TouchJoystickProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  function updateFromEvent(clientX: number, clientY: number) {
    const pad = padRef.current;
    const knob = knobRef.current;
    if (!pad || !knob) return;

    const rect = pad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_RADIUS) {
      dx = (dx / dist) * MAX_RADIUS;
      dy = (dy / dist) * MAX_RADIUS;
    }

    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    // Screen-space down (+y) should move the avatar forward (-z, "up" the table).
    vector.current.x = dx / MAX_RADIUS;
    vector.current.z = dy / MAX_RADIUS;
  }

  function reset() {
    vector.current.x = 0;
    vector.current.z = 0;
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
  }

  return (
    <div
      ref={padRef}
      className="touch-joystick"
      onPointerDown={(e) => {
        draggingRef.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        updateFromEvent(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!draggingRef.current) return;
        updateFromEvent(e.clientX, e.clientY);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
        reset();
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
        reset();
      }}
    >
      <div ref={knobRef} className="touch-joystick-knob" />
    </div>
  );
}
