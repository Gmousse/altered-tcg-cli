import logger from "@/logger";
import TransactionRepository from "@/repositories/TransactionRepository";
import { ReportType } from "@/contants/reporting";
import { TransactionTypes } from "@/contants/transaction";
import { getReport } from "@/utils/reporting";
import open from "open";

type CardTradeReportOptions = {
  reportType: `${ReportType}`;
  oldestDate?: Date | null;
  transactionTypes?: (`${TransactionTypes.BUY}` | `${TransactionTypes.SELL}`)[];
};

export default class CardTradeService {
  static async *getTradedCards({
    oldestDate,
    transactionTypes,
  }: Omit<CardTradeReportOptions, "reportType">) {
    const transactions = await TransactionRepository.getSucceededTransactions({
      transactionTypes,
      oldestDate,
    });
    for await (const transaction of transactions) {
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
    oldestDate,
  }: CardTradeReportOptions) {
    logger.info("Building bought cards report...");
    const buyReport = getReport(reportType, "bought-cards");
    await buyReport.writeReport(
      await this.getTradedCards({
        oldestDate,
        transactionTypes: [TransactionTypes.BUY],
      })
    );
    logger.info(
      `Bought cards report is available at ${buyReport.reportPath}. Opening it in your browser...`
    );
    await open(buyReport.reportPath);

    logger.info("Building sold cards report...");
    const sellReport = getReport(reportType, "sold-cards");
    await sellReport.writeReport(
      await this.getTradedCards({
        oldestDate,
        transactionTypes: [TransactionTypes.SELL],
      })
    );
    logger.info(
      `Sold cards report is available at ${sellReport.reportPath}. Opening it in your browser...`
    );
    await open(sellReport.reportPath);
  }
}
