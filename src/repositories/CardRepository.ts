import AlteredConnector from "@/connectors/AlteredConnector";
import { Card, CardFilter, CardOffer } from "@/types/card";
import { Rarities, Factions } from "@/contants/card";
import { batchify } from "@/utils/iterator";

type RawCard = {
  id: string;
  reference: string;
  name: string;
  quantity: number;
  rarity: { reference: `${Rarities}` };
  mainFaction: { reference: `${Factions}` };
  cardSet: { reference: string };
  cardType: { reference: string };
  imagePath: string;
  qrUrlDetail: string;
  elements: { [key: string]: string };
  lowerPrice?: number;
};

type RawCardStat = {
  "@id": string;
  lowerPrice: number;
};

type RawCardOffer = CardOffer;

function formatCard(card: RawCard): Card {
  return {
    id: card.id,
    reference: card.reference,
    name: card.name,
    quantity: card.quantity,
    rarity: card.rarity.reference,
    faction: card.mainFaction.reference,
    cardSet: card.cardSet.reference,
    cardType: card.cardType.reference,
    imageURL: card.imagePath,
    detailURL: card.qrUrlDetail,
    mainCost: Number.parseInt(card.elements.MAIN_COST),
    recallCost: Number.parseInt(card.elements.RECALL_COST),
    mainEffect: card.elements.MAIN_EFFECT,
    echoEffect: card.elements.ECHO_EFFECT,
    lowerPrice: card?.lowerPrice,
  };
}

function formatOffer(offer: RawCardOffer): CardOffer {
  return {
    price: offer.price,
    quantity: offer.quantity,
    currency: offer.currency,
    card: offer.card,
  };
}

function convertCardFilterInSearchParams(cardFilter: CardFilter) {
  const filterForUniqueSearch = new URLSearchParams();

  for (const filterKey of Object.keys(cardFilter)) {
    switch (filterKey as keyof CardFilter) {
      case "cardSets":
        cardFilter.cardSets!.forEach((set) =>
          filterForUniqueSearch.append("cardSet[]", set)
        );
        break;
      case "inSale":
        filterForUniqueSearch.append(
          "inSale",
          cardFilter.inSale ? "true" : "false"
        );
        break;
      case "factions":
        cardFilter.factions!.forEach((faction) =>
          filterForUniqueSearch.append("factions[]", faction)
        );
        break;
      case "rarities":
        cardFilter.rarities!.forEach((rarity) =>
          filterForUniqueSearch.append("rarity[]", rarity)
        );
        break;
      case "mainCosts":
        cardFilter.mainCosts!.forEach((mainCost) =>
          filterForUniqueSearch.append("mainCost[]", mainCost.toString())
        );
        break;
      case "recallCosts":
        cardFilter.recallCosts!.forEach((recallCost) =>
          filterForUniqueSearch.append("recallCost[]", recallCost.toString())
        );
        break;
      case "maxPrice":
        filterForUniqueSearch.append(
          "priceMax",
          cardFilter.maxPrice!.toString()
        );
        break;
      default:
        break;
    }
  }

  return filterForUniqueSearch.toString();
}

export default class CardRepository {
  static async *getCards(filter: CardFilter) {
    const searchParams = convertCardFilterInSearchParams(filter);
    const stats = AlteredConnector.getInstance().getItemsByPage<RawCardStat>(
      `cards/stats`,
      {
        searchParams,
      }
    );

    for await (const statsBatch of batchify(stats, 4)) {
      const cards = await Promise.all(
        statsBatch.map(async (stat) => {
          const reference = stat["@id"].split("/").pop()!;
          const card = await this.getCardByReference(reference);
          card.lowerPrice = stat.lowerPrice;
          return card;
        })
      );
      yield* cards;
    }
  }

  static async getCardByReference(reference: string) {
    const card = await AlteredConnector.getInstance()
      .client.get<RawCard>(`cards/${reference}`)
      .json();
    return formatCard(card);
  }

  static async *getCardOffersByReference(reference: string, { limit = 1 }) {
    const offers = AlteredConnector.getInstance().getItemsByPage<RawCardOffer>(
      `cards/${reference}/offers`
    );

    let count = 0;

    for await (const offer of offers) {
      yield formatOffer(offer);
      count++;
      if (count >= limit) return;
    }
  }
}
