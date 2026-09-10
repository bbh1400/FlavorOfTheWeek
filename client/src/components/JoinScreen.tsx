import { useState } from "react";
import { Room } from "colyseus.js";
import { palette } from "@potluck/shared";
import { hostRoom, joinRoomByCode, type JoinDetails, type LobbyRoomState } from "../net/colyseus";

interface JoinScreenProps {
  onConnected: (room: Room<LobbyRoomState>) => void;
}

const HAT_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "No hat" },
  { value: 1, label: "Chef's hat" },
  { value: 2, label: "Toque" },
];

export function JoinScreen({ onConnected }: JoinScreenProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(palette.avatarColors[0]);
  const [hat, setHat] = useState(1);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const details: JoinDetails = { name: name.trim() || "Chef", color, hat };

  async function handleHost() {
    setError(null);
    setBusy(true);
    try {
      const room = await hostRoom(details);
      onConnected(room);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (code.trim().length !== 4) {
      setError("Room codes are 4 letters.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const room = await joinRoomByCode(code, details);
      onConnected(room);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="join-screen">
      <div className="join-card">
        <h1>Potluck</h1>
        <p className="join-tagline">Pull up a seat at the Table.</p>

        <label className="join-field">
          <span>Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chef"
            maxLength={16}
            disabled={busy}
          />
        </label>

        <div className="join-field">
          <span>Color</span>
          <div className="color-swatches">
            {palette.avatarColors.map((swatch) => (
              <button
                key={swatch}
                type="button"
                className={`color-swatch${swatch === color ? " selected" : ""}`}
                style={{ background: swatch }}
                aria-label={`Choose color ${swatch}`}
                onClick={() => setColor(swatch)}
                disabled={busy}
              />
            ))}
          </div>
        </div>

        <div className="join-field">
          <span>Hat</span>
          <div className="hat-options">
            {HAT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`hat-option${option.value === hat ? " selected" : ""}`}
                onClick={() => setHat(option.value)}
                disabled={busy}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="join-error">{error}</div>}

        <button type="button" className="primary-button" onClick={handleHost} disabled={busy}>
          Host a Table
        </button>

        <div className="join-divider">or join with a code</div>

        <div className="join-code-row">
          <input
            className="join-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="ABCD"
            maxLength={4}
            disabled={busy}
          />
          <button type="button" className="secondary-button" onClick={handleJoin} disabled={busy}>
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

function describeError(err: unknown): string {
  const code = (err as { code?: number })?.code;
  if (code === 4211) return "No table found with that code.";
  if (code === 4212) return "That table is no longer available.";
  return "Couldn't connect to the server. Is it running?";
}
