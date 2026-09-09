// The Specials registry — see DESIGN.md > "The Special (rotating minigame
// slot)". Empty for now; Phase 3 onward adds real entries as each Special
// is built. The Specials Board prop at the Table renders whatever is here.

export interface SpecialMeta {
  id: string;
  name: string;
  pitch: string;
  minPlayers: number;
  maxPlayers: number;
  estMinutes: number;
  accentColor: string;
}

export const SPECIALS: SpecialMeta[] = [];
