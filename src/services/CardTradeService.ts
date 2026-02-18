import logger from "@/logger";
import TransactionRepository from "@/repositories/TransactionRepository";
import { ReportType } from "@/contants/reporting";
import { TransactionTypes } from "@/contants/transaction";
import { getReport } from "@/utils/reporting";
import open from "open";

export default class CardTradeService {
  static async *getBoughtCard() {
    const transactions = await TransactionRepository.getSucceededTransactions();
    for await (const transaction of transactions) {
      if (transaction.type !== TransactionTypes.BUY) {
        continue;
      }

      const transactionDetailCard =
        await TransactionRepository.getTransactionCard(transaction.id);

      if (transactionDetailCard === null) {
        continue;
      }

      yield transactionDetailCard;
    }
  }

  static async *getSoldCard() {
    const transactions = await TransactionRepository.getSucceededTransactions();
    for await (const transaction of transactions) {
      if (transaction.type !== TransactionTypes.SELL) {
        continue;
      }

      const transactionDetailCard =
        await TransactionRepository.getTransactionCard(transaction.id);

      if (transactionDetailCard === null) {
        continue;
      }

      yield transactionDetailCard;
    }
  }

  static async buildCardTradeReport({
    reportType,
  }: {
    reportType: `${ReportType}`;
  }) {
    logger.info("Building bought cards report...");
    const buyReport = getReport(reportType, "bought-cards");
    await buyReport.writeReport(await this.getBoughtCard());
    logger.info(
      `Bought cards report is available at ${buyReport.reportPath}. Opening it in your browser...`
    );
    await open(buyReport.reportPath);

    logger.info("Building sold cards report...");
    const sellReport = getReport(reportType, "sold-cards");
    await sellReport.writeReport(await this.getSoldCard());
    logger.info(
      `Sold cards report is available at ${sellReport.reportPath}. Opening it in your browser...`
    );
    await open(sellReport.reportPath);
  }
}
