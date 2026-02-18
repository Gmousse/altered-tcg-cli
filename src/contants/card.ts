export enum Rarities {
  UNIQUE = "UNIQUE",
}
export enum Factions {
  MUNA = "MU",
  ORDIS = "OR",
  AXIOM = "AX",
  LYRA = "LY",
  YZMI = "YZ",
  BRAVOS = "BR",
}

export enum CardSets {
  COREKS = "COREKS",
  CORE = "CORE",
  ALIZE = "ALIZE",
  BISE = "BISE",
  CYCLONE = "CYCLONE",
}

export const COSTS = Array.from(Array(10), (_, i) => i + 1);

export const MAX_PRICE = 250;
