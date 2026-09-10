import { useEffect, useState } from "react";
import { Room } from "colyseus.js";
import type { LobbyRoomState } from "./colyseus";

const BUBBLE_DURATION_MS = 4500;

interface ChatEvent {
  sessionId: string;
  text: string;
}

// Chat bubbles are ephemeral (rendered above the sender's avatar for a few
// seconds) so they're plain room messages, not part of the synced state.
export function useChatBubbles(room: Room<LobbyRoomState> | null) {
  const [bubbles, setBubbles] = useState<Record<string, string>>({});

  useEffect(() => {
    setBubbles({});
    if (!room) return;

    const timers = new Map<string, ReturnType<typeof setTimeout>>();

    const unbind = room.onMessage<ChatEvent>("chat", ({ sessionId, text }) => {
      setBubbles((prev) => ({ ...prev, [sessionId]: text }));

      const existingTimer = timers.get(sessionId);
      if (existingTimer) clearTimeout(existingTimer);

      timers.set(
        sessionId,
        setTimeout(() => {
          setBubbles((prev) => {
            const next = { ...prev };
            delete next[sessionId];
            return next;
          });
          timers.delete(sessionId);
        }, BUBBLE_DURATION_MS)
      );
    });

    return () => {
      unbind();
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, [room]);

  function sendChat(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !room) return;
    room.send("chat", { text: trimmed });
  }

  return { bubbles, sendChat };
}
