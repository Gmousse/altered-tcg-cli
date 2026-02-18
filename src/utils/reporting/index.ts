import { ReportType } from "@/contants/reporting";
import CardHTMLReport from "./CardHTMLReport";
import CardJSONLReport from "./CardJSONLReport";
import { Card } from "@/types/card";

export function getReport<U extends Partial<Card>>(
  type: `${ReportType}`,
  reportName?: string
): CardJSONLReport<U> | CardHTMLReport<U> {
  switch (type) {
    case ReportType.JSONL:
      return new CardJSONLReport<U>(reportName);
    case ReportType.HTML:
      return new CardHTMLReport<U>(reportName);
    default:
      throw new Error(`Unsupported report type: ${type}`);
  }
}
