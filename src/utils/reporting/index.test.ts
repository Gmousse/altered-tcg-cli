import { describe, it, expect } from "vitest";
import { getReport } from "./index";
import { ReportType } from "../../contants/reporting";
import { Card } from "@/types/card";

type TestCard = Partial<Card>;

describe("getReport function", () => {
  describe("ReportType.HTML", () => {
    it("should return CardHTMLReport instance", () => {
      const report = getReport<TestCard>(ReportType.HTML, "test-html");
      expect(report).toBeDefined();
      expect(report.reportName).toBe("test-html");
      expect(report.reportPath).toContain("test-html.html");
    });

    it("should return CardHTMLReport with default name when no name provided", () => {
      const report = getReport<TestCard>(ReportType.HTML);
      expect(report).toBeDefined();
      expect(report.reportName).toMatch(/report-\d+-[\w-]+/);
      expect(report.reportPath).toContain(".html");
    });
  });

  describe("ReportType.JSONL", () => {
    it("should return CardJSONLReport instance", () => {
      const report = getReport<TestCard>(ReportType.JSONL, "test-jsonl");
      expect(report).toBeDefined();
      expect(report.reportName).toBe("test-jsonl");
      expect(report.reportPath).toContain("test-jsonl.jsonl");
    });

    it("should return CardJSONLReport with default name when no name provided", () => {
      const report = getReport<TestCard>(ReportType.JSONL);
      expect(report).toBeDefined();
      expect(report.reportName).toMatch(/report-\d+-[\w-]+/);
      expect(report.reportPath).toContain(".jsonl");
    });
  });

  describe("error handling", () => {
    it("should throw error for unsupported report type", () => {
      // @ts-expect-error - Testing invalid type
      expect(() => getReport<TestCard>("invalid-type")).toThrow(
        "Unsupported report type: invalid-type"
      );
    });
  });

  describe("type compatibility", () => {
    it("should maintain type safety with generic types", () => {
      const htmlReport = getReport<TestCard>(ReportType.HTML);
      const jsonlReport = getReport<TestCard>(ReportType.JSONL);

      // Both should accept TestCard type
      expect(htmlReport).toBeDefined();
      expect(jsonlReport).toBeDefined();
    });
  });
});
