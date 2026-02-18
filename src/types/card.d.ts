import { Rarities, Factions } from "@/contants/card";

export type Card = {
  id: string;
  reference: string;
  name: string;
  quantity: number;
  rarity: `${Rarities}`;
  faction: `${Factions}`;
  cardSet: string;
  cardType: string;
  imageURL: string;
  detailURL: string;
  mainCost: number;
  recallCost: number;
  lowerPrice?: number;
  price?: number;
  mainEffect: string;
  echoEffect: string;
};

export type CardOffer = {
  price: number;
  quantity: number;
  currency: string;
  card: string;
};

export type CardFilter = {
  cardSets: CardSets[];
  rarities: Rarities[];
  mainCosts: number[];
  recallCosts: number[];
  maxPrice: number;
  inSale: boolean;
  factions: Factions[];
};
