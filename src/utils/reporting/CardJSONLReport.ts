import { mkdir, rm, writeFile } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Report } from "../../types/reporting";
import { randomUUID } from "node:crypto";
import readline from "node:readline";
import { Card } from "@/types/card";

export default class CardJSONLReport<U extends Partial<Card>>
  implements Report<U>
{
  readonly reportPath: string;
  readonly reportName: string;
  #itemsCount: number = 0;

  constructor(reportName?: string) {
    this.reportName = reportName ?? `report-${Date.now()}-${randomUUID()}`;
    const baseDir =
      process.env.NODE_ENV === "test"
        ? path.join(process.cwd(), "test-reports")
        : tmpdir();
    this.reportPath = path.join(baseDir, `${this.reportName}.jsonl`);
  }

  get itemsCount() {
    return this.#itemsCount;
  }

  async *loadReport() {
    const stream = createReadStream(this.reportPath);
    const reader = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });
    for await (const line of reader) {
      yield JSON.parse(line) as U;
    }
    reader.close();
    stream.close();
  }

  async remove(): Promise<void> {
    await rm(path.dirname(this.reportPath), { force: true, recursive: true });
  }

  async writeReport(items: AsyncIterable<U> | Iterable<U>) {
    await mkdir(path.dirname(this.reportPath), { recursive: true });
    await writeFile(this.reportPath, "");
    this.#itemsCount = 0;

    const readable = ReadableStream.from(
      async function* (this: CardJSONLReport<U>) {
        for await (const item of items) {
          yield `${JSON.stringify(item)}\n`;
          this.#itemsCount++;
        }
      }.call(this)
    );

    const writable = createWriteStream(this.reportPath, { flags: "a" });
    await pipeline(readable, writable);
  }
}
