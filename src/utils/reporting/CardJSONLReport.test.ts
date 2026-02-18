import { describe, it, expect } from "vitest";
import { readFile, access } from "node:fs/promises";
import CardJSONLReport from "./CardJSONLReport";
import { Card } from "@/types/card";

type TestCard = Partial<Card>;

describe("CardJSONLReport", () => {
  describe("constructor", () => {
    it("should create report with default name when no name provided", () => {
      const defaultReport = new CardJSONLReport<TestCard>();
      expect(defaultReport.reportName).toMatch(/report-\d+-[\w-]+/);
      expect(defaultReport.reportPath).toContain("test-reports");
      expect(defaultReport.reportPath).toMatch(/\.jsonl$/);
    });

    it("should create report with custom name when provided", () => {
      const report = new CardJSONLReport<TestCard>("test-22");
      expect(report.reportName).toMatch(/test-\d+/);
      expect(report.reportPath).toContain("test-");
      expect(report.reportPath).toMatch(/\.jsonl$/);
    });
  });

  describe("itemsCount", () => {
    it("should initialize with 0 items", () => {
      const report = new CardJSONLReport<TestCard>();

      expect(report.itemsCount).toBe(0);
    });
  });

  describe("writeReport", () => {
    it("should generate JSONL report with card data", async () => {
      const testCards: TestCard[] = [
        {
          id: "card-1",
          name: "Test Card 1",
          price: 10.99,
          quantity: 5,
          reference: "REF-001",
        },
        {
          id: "card-2",
          name: "Test Card 2",
          price: 8.5,
          quantity: 3,
          reference: "REF-002",
        },
      ];
      const report = new CardJSONLReport<TestCard>();

      await report.writeReport(testCards);

      // Verify report was created
      await expect(access(report.reportPath)).resolves.not.toThrow();
      expect(report.itemsCount).toBe(2);

      // Read and verify content
      const content = await readFile(report.reportPath, "utf-8");
      const lines = content.trim().split("\n");

      expect(lines.length).toBe(2);

      // Parse and verify first card
      const firstCard = JSON.parse(lines[0]);
      expect(firstCard).toEqual({
        id: "card-1",
        name: "Test Card 1",
        price: 10.99,
        quantity: 5,
        reference: "REF-001",
      });

      // Parse and verify second card
      const secondCard = JSON.parse(lines[1]);
      expect(secondCard).toEqual({
        id: "card-2",
        name: "Test Card 2",
        price: 8.5,
        quantity: 3,
        reference: "REF-002",
      });
    });

    it("should handle async iterables", async () => {
      const testCards: TestCard[] = [
        {
          id: "card-1",
          name: "Test Card 1",
          price: 10.99,
          quantity: 5,
          reference: "REF-001",
        },
        {
          id: "card-2",
          name: "Test Card 2",
          price: 8.5,
          quantity: 3,
          reference: "REF-002",
        },
      ];

      // Create async iterable
      async function* asyncCardGenerator() {
        for (const card of testCards) {
          yield card;
        }
      }

      const report = new CardJSONLReport<TestCard>();

      await report.writeReport(asyncCardGenerator());

      const content = await readFile(report.reportPath, "utf-8");
      const lines = content.trim().split("\n");

      expect(lines.length).toBe(2);
      expect(report.itemsCount).toBe(2);
    });

    it("should handle empty item collection", async () => {
      const emptyCards: TestCard[] = [];
      const report = new CardJSONLReport<TestCard>();

      await report.writeReport(emptyCards);

      const content = await readFile(report.reportPath, "utf-8");
      expect(content).toBe("");
      expect(report.itemsCount).toBe(0);
    });

    it("should handle special characters in JSON", async () => {
      const testCards: TestCard[] = [
        {
          id: "card-special",
          name: 'Test "Card" with\nnewlines',
          price: 9.99,
          quantity: 1,
          reference: "REF\tTAB",
        },
      ];
      const report = new CardJSONLReport<TestCard>();

      await report.writeReport(testCards);

      const content = await readFile(report.reportPath, "utf-8");
      const lines = content.trim().split("\n");

      expect(lines.length).toBe(1);

      const card = JSON.parse(lines[0]);
      expect(card.name).toBe('Test "Card" with\nnewlines');
      expect(card.reference).toBe("REF\tTAB");
    });
  });

  describe("loadReport", () => {
    it("should load previously written report", async () => {
      const testCards: TestCard[] = [
        {
          id: "card-1",
          name: "Test Card 1",
          price: 10.99,
          quantity: 5,
          reference: "REF-001",
        },
        {
          id: "card-2",
          name: "Test Card 2",
          price: 8.5,
          quantity: 3,
          reference: "REF-002",
        },
      ];

      const report = new CardJSONLReport<TestCard>();

      // Write report first
      await report.writeReport(testCards);

      // Load report
      const loadedCards: TestCard[] = [];
      for await (const card of report.loadReport()) {
        loadedCards.push(card);
      }

      expect(loadedCards.length).toBe(2);
      expect(loadedCards[0]).toEqual(testCards[0]);
      expect(loadedCards[1]).toEqual(testCards[1]);
    });

    it("should handle empty report", async () => {
      const report = new CardJSONLReport<TestCard>();

      // Write empty report
      await report.writeReport([]);

      // Try to load
      const loadedCards: TestCard[] = [];
      for await (const card of report.loadReport()) {
        loadedCards.push(card);
      }

      expect(loadedCards.length).toBe(0);
    });
  });

  describe("remove", () => {
    it("should remove the report file and directory", async () => {
      const testCards: TestCard[] = [
        {
          id: "card-1",
          name: "Test Card",
          price: 10.99,
          quantity: 1,
          reference: "REF-001",
        },
      ];
      const report = new CardJSONLReport<TestCard>();

      await report.writeReport(testCards);

      // Verify file exists
      await expect(access(report.reportPath)).resolves.not.toThrow();

      // Remove the report
      await report.remove();

      // Verify file and directory are gone
      await expect(access(report.reportPath)).rejects.toThrow();
    });

    it("should not throw error if file does not exist", async () => {
      const nonExistentReport = new CardJSONLReport<TestCard>("non-existent");
      await expect(nonExistentReport.remove()).resolves.not.toThrow();
    });
  });
});
