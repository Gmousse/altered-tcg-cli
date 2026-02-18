import { TransactionStatuses, TransactionTypes } from "@/contants/transaction";
import { Card, CardOffer } from "./card";

export type Transaction = {
  id: string;
  date: Date;
  status: TransactionStatuses;
  amount: number;
  currency: string;
  type: TransactionTypes;
};
export type TransactionDetailCard = Pick<Card, "imageURL" | "name"> &
  Pick<CardOffer, "price" | "quantity">;
