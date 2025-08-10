export interface Character {
  id: string;
  name: string;
  vida?: number;
  mana?: number;
  sanidade?: number;
  [key: string]: number | string | undefined;
}

export interface Campaign {
  id: string;
  name: string;
  system: string;
  stats: string[];
  characters: Character[];
}
