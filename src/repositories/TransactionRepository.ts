import AlteredConnector from "@/connectors/AlteredConnector";
import logger from "@/logger";
import { Transaction, TransactionDetailCard } from "@/types/transaction";
import { TransactionTypes, TransactionStatuses } from "@/contants/transaction";

type RawTransaction = Omit<Transaction, "date"> & {
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
    type: rawTransaction.type,
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

type TransactionOptions = {
  transactionTypes?: `${TransactionTypes}`[];
  oldestDate?: Date | null;
};

export default class TransactionRepository {
  static async *getSucceededTransactions(options: TransactionOptions) {
    const transactionTypes =
      options.transactionTypes ?? Object.values(TransactionTypes);
    const oldestDate = options.oldestDate ?? new Date(86400000);
    const transactions =
      await AlteredConnector.getInstance().getItemsByPage<RawTransaction>(
        `payments/wallets/transactions`,
        {
          searchParams: {
            "order[date]": "desc",
          },
        },
        100
      );

    for await (const transaction of transactions) {
      if (transaction.status !== TransactionStatuses.SUCCEEDED) {
        continue;
      }
      if (!transactionTypes.includes(transaction.type)) {
        continue;
      }

      const formattedTransaction = formatTransaction(transaction);
      if (formattedTransaction.date < oldestDate) {
        return;
      }
      yield formattedTransaction;
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
