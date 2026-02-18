import AlteredConnector from "@/connectors/AlteredConnector";
import logger from "@/logger";
import { Transaction, TransactionDetailCard } from "@/types/transaction";
import { TransactionTypes, TransactionStatuses } from "@/contants/transaction";

type RawTransaction = Transaction & {
  type: TransactionTypes.SELL | string;
  date: string;
};

type RawTransactionDetail = {
  unitPrice: number;
  quantity: number;
  card: {
    imagePath: string;
    name: string;
  };
};

function formatTransaction(rawTransaction: RawTransaction): Transaction {
  return {
    id: rawTransaction.id,
    date: new Date(rawTransaction.date),
    status: rawTransaction.status,
    amount: rawTransaction.amount,
    currency: rawTransaction.currency,
    type:
      rawTransaction.type === TransactionTypes.SELL
        ? TransactionTypes.SELL
        : TransactionTypes.BUY,
  };
}

function formatTransactionDetailCard(
  rawTransactionDetail: RawTransactionDetail
): TransactionDetailCard {
  return {
    imageURL: rawTransactionDetail.card.imagePath,
    name: rawTransactionDetail.card.name,
    price: rawTransactionDetail.unitPrice,
    quantity: rawTransactionDetail.quantity,
  };
}

export default class TransactionRepository {
  static async *getSucceededTransactions() {
    const transactions =
      await AlteredConnector.getInstance().getItemsByPage<RawTransaction>(
        `payments/wallets/transactions`,
        {
          searchParams: {
            "order[date]": "desc",
          },
        }
      );

    for await (const transaction of transactions) {
      if (transaction.status !== TransactionStatuses.SUCCEEDED) {
        continue;
      }
      if (transaction.type === TransactionTypes.EQUINOX_FEES) {
        continue;
      }

      yield formatTransaction(transaction);
    }
  }

  static async getTransactionCard(transactionId: string) {
    try {
      const transaction = await AlteredConnector.getInstance()
        .client.get<RawTransactionDetail>(`payments/detail/${transactionId}`)
        .json();

      return formatTransactionDetailCard(transaction);
    } catch (error) {
      logger.error(
        `Error getting transaction card for transaction ${transactionId}: ${error}`
      );
      return null;
    }
  }
}
