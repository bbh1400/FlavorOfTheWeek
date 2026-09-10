import { Html, Outlines } from "@react-three/drei";
import { palette, SPECIALS } from "@potluck/shared";

// The literal "specials board" chalkboard prop from DESIGN.md — renders
// whatever's in the shared SPECIALS registry. Empty today (no Special has
// shipped yet); Phase 3 onward adds real entries here with no client-side
// changes needed beyond this list rendering them.
export function SpecialsBoard() {
  return (
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

      <Html position={[0, 0, 0.07]} center distanceFactor={6} zIndexRange={[5, 0]} occlude={false}>
        <div className="specials-board-content">
          <div className="specials-board-title">This Week's Specials</div>
          {SPECIALS.length === 0 ? (
            <div className="specials-board-empty">Coming soon...</div>
          ) : (
            <ul className="specials-board-list">
              {SPECIALS.map((special) => (
                <li key={special.id} style={{ color: special.accentColor }}>
                  {special.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Html>
    </group>
  );
}
