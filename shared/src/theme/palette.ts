// Single source of truth for the "Potluck" low-poly palette.
// Every Special should reuse these instead of inventing new colors —
// see DESIGN.md > Art bible.

export const palette = {
  background: "#FFF3D6", // warm cream sky/fill
  tableWood: "#C9863B",
  tableWoodDark: "#A5691F",
  bench: "#8C5A2B",
  boardGreen: "#3E6B4F",
  outline: "#1B1410", // used for the inverted-hull outline shader

  // Avatar color options offered at the picker (kept small + high-contrast
  // so players are easy to tell apart at a glance from across the Table).
  avatarColors: [
    "#E4572E", // orange
    "#F3A712", // gold
    "#4C934C", // green
    "#2E86AB", // blue
    "#A23B72", // magenta
    "#F2E205", // yellow
    "#5C4B99", // purple
    "#EF798A", // pink
  ],
} as const;

export type AvatarColor = (typeof palette.avatarColors)[number];
