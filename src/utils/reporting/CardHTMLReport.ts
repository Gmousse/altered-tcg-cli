import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Report } from "../../types/reporting";
import { randomUUID } from "node:crypto";
import Mustache from "mustache";
import { Card } from "@/types/card";

const reportTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <title>Altered TCG Report</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 18px;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 20px;
        box-sizing: border-box;
      }

      #app {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 20px;
      }

      .card {
        width: 300px;
        background-color: #f0f0f0;
        border-radius: 10px;
        border: 1px solid #000;
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .card img {
        max-width: 100%;
        height: auto;
        border-radius: 5px;
        margin-bottom: 10px;
      }

      .card div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        text-align: center;
      }

      .card p {
        margin: 5px 0;
        padding: 0;
      }

      .card a {
        color: #0066cc;
        text-decoration: none;
      }

      .card a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div id="app">
      {{#items}}
      <div class="card" id="{{id}}">
          <a href="{{detailURL}}" target="_blank">
            <img src="{{imageURL}}" alt="{{reference}}" />
          </a>
        <div>
          <p>(Click on the image to open the card details)</p>
          <p>Price: {{price}}</p>
          <p>Reference: {{reference}}</p>
          <p>Quantity: {{quantity}}</p>
        </div>
      </div>
      {{/items}}
    </div>
  </body>
</html>
`;

type TemplateCard = {
  id: string;
  detailURL: string;
  imageURL: string;
  reference: string;
  price: string | number;
  quantity: string | number;
};

export default class HTMLReport<U extends Partial<Card>> implements Report<U> {
  readonly reportPath: string;
  readonly reportName: string;
  #itemsCount: number = 0;

  constructor(reportName?: string) {
    this.reportName = reportName ?? `report-${Date.now()}-${randomUUID()}`;
    const baseDir =
      process.env.NODE_ENV === "test"
        ? path.join(process.cwd(), "test-reports")
        : tmpdir();
    this.reportPath = path.join(baseDir, `${this.reportName}.html`);
  }

  get itemsCount() {
    return this.#itemsCount;
  }

  async remove(): Promise<void> {
    await rm(this.reportPath, { force: true });
  }

  async writeReport(items: AsyncIterable<U> | Iterable<U>) {
    const reportDir = path.dirname(this.reportPath);
    await mkdir(reportDir, { recursive: true });

    const itemsAsArray = await Array.fromAsync(items);

    const view = {
      items: itemsAsArray.map(
        (item: U): TemplateCard => ({
          id: item.id ?? "",
          detailURL: item.detailURL ?? "#",
          imageURL: item.imageURL ?? "",
          reference: item.reference ?? "Unknown",
          price: item.price ?? item.lowerPrice ?? "N/A",
          quantity: item.quantity ?? "0",
        })
      ),
    };

    const htmlContent = Mustache.render(reportTemplate, view);

    await writeFile(this.reportPath, htmlContent, "utf-8");
    this.#itemsCount = itemsAsArray.length;
  }
}
