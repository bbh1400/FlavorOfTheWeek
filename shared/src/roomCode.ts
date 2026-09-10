// Letters chosen to avoid visually-confusable characters (no I/O/0/1).
const CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

// Generated client-side by whoever hosts a Table: Colyseus's room-listing
// filterBy() only matches fields present in the *create-time* options, so
// the code has to exist before the room does, not be assigned by the server
// after the fact.
export function generateRoomCode(): string {
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += CODE_LETTERS[Math.floor(Math.random() * CODE_LETTERS.length)];
  }
  return out;
}
