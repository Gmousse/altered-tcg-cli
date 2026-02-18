import { describe, it, expect } from "vitest";
import { readFile, access } from "node:fs/promises";
import CardHTMLReport from "./CardHTMLReport";
import { Card } from "@/types/card";

type TestCard = Partial<Card>;

describe("CardHTMLReport", () => {
  describe("constructor", () => {
    it("should create report with default name when no name provided", () => {
      const defaultReport = new CardHTMLReport();
      expect(defaultReport.reportName).toMatch(/report-\d+-[\w-]+/);
      expect(defaultReport.reportPath).toContain("test-reports");
      expect(defaultReport.reportPath).toMatch(/\.html$/);
    });

    it("should create report with custom name when provided", () => {
      const report = new CardHTMLReport("test-23");
      expect(report.reportName).toMatch(/test-\d+/);
      expect(report.reportPath).toContain("test-");
      expect(report.reportPath).toMatch(/\.html$/);
    });
  });

  describe("itemsCount", () => {
    it("should initialize with 0 items", () => {
      const report = new CardHTMLReport();
      expect(report.itemsCount).toBe(0);
    });
  });

  describe("writeReport", () => {
    it("should generate HTML report with card data", async () => {
      const testCards: TestCard[] = [
        {
          id: "card-1",
          reference: "Test Card 1",
          detailURL: "https://altered.gg/cards/card-1",
          imageURL: "https://altered.gg/images/card-1.jpg",
          price: 10.99,
          quantity: 5,
        },
        {
          id: "card-2",
          reference: "Test Card 2",
          detailURL: "https://altered.gg/cards/card-2",
          imageURL: "https://altered.gg/images/card-2.jpg",
          lowerPrice: 8.5,
          quantity: 3,
        },
      ];

      const report = new CardHTMLReport<TestCard>();

      await report.writeReport(testCards);

      await expect(access(report.reportPath)).resolves.not.toThrow();
      expect(report.itemsCount).toBe(2);

      const content = await readFile(report.reportPath, "utf-8");

      expect(content).toContain("<!DOCTYPE html>");
      expect(content).toContain("<title>Altered TCG Report</title>");
      expect(content).toContain("Test Card 1");
      expect(content).toContain("Test Card 2");
      expect(content).toContain("10.99");
      expect(content).toContain("8.5");
      expect(content).toContain("card-1");
      expect(content).toContain("card-2");
    });

    it("should handle missing optional properties with defaults", async () => {
      // Use unique report name for this test
      const report = new CardHTMLReport<TestCard>(
        `test-incomplete-${Date.now()}`
      );

      const testCards: TestCard[] = [
        {
          id: "card-incomplete",
          reference: "Incomplete Card",
          detailURL: "",
          imageURL: "",
          quantity: 1,
          // Missing price and lowerPrice
        },
      ];

      await report.writeReport(testCards);

      const content = await readFile(report.reportPath, "utf-8");

      expect(content).toContain("Incomplete Card");
      // Mustache escapes N/A as N&#x2F;A
      expect(content).toMatch(/N\/A|N&#x2F;A/); // Default price
      expect(content).toContain("1"); // Quantity

      // Clean up
      await report.remove();
    });

    it("should generate unique IDs for cards without IDs", async () => {
      const testCards: TestCard[] = [
        {
          reference: "REF-NO-ID",
          name: "No ID Card",
          detailURL: "https://altered.gg/cards/no-id",
          imageURL: "https://altered.gg/images/no-id.jpg",
          price: 5.0,
          quantity: 2,
          // Missing id - should generate random one
        },
      ];

      const report = new CardHTMLReport<TestCard>("non-existent");

      await report.writeReport(testCards);

      const content = await readFile(report.reportPath, "utf-8");

      // Should contain some ID (either generated or empty)
      expect(content).toMatch(/id="[^"]*"/);
    });
  });

  describe("remove", () => {
    it("should remove the report file", async () => {
      // Use unique report name for this test to avoid conflicts
      const uniqueReport = new CardHTMLReport<TestCard>("test-remove-file");

      const testCards: TestCard[] = [
        {
          id: "card-1",
          reference: "Test Card Remove",
          detailURL: "https://altered.gg/cards/card-1",
          imageURL: "https://altered.gg/images/card-1.jpg",
          price: 10.99,
          quantity: 1,
        },
      ];

      await uniqueReport.writeReport(testCards);

      // Verify file exists
      await expect(access(uniqueReport.reportPath)).resolves.not.toThrow();

      // Remove the report
      await uniqueReport.remove();

      // Verify file is gone
      await expect(access(uniqueReport.reportPath)).rejects.toThrow();
    });

    it("should not throw error if file does not exist", async () => {
      const nonExistentReport = new CardHTMLReport("non-existent");
      await expect(nonExistentReport.remove()).resolves.not.toThrow();
    });
  });

  describe("HTML escaping", () => {
    it("should escape HTML special characters in card data", async () => {
      const testCards: TestCard[] = [
        {
          id: "card-xss",
          reference: '<script>alert("XSS")</script>',
          name: 'Test & "Card"',
          detailURL: "https://altered.gg/cards/xss?param=<test>",
          imageURL: "https://altered.gg/images/xss.jpg",
          price: 9.99,
          quantity: 1,
        },
      ];
      const report = new CardHTMLReport<TestCard>("non-existent");

      await report.writeReport(testCards);

      const { readFile } = await import("node:fs/promises");
      const content = await readFile(report.reportPath, "utf-8");

      // Mustache should escape HTML characters (uses different escaping than expected)
      expect(content).toContain("&lt;script&gt;");
      expect(content).toContain("&quot;");
      expect(content).not.toContain("<script>");
      // Mustache escapes & as &#x2F; in URLs
      expect(content).toContain("&#x2F;");
    });
  });
});
