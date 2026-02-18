export interface Report<T> {
  readonly reportPath: string;
  readonly reportName: string;
  itemsCount: number;

  writeReport(items: AsyncIterable<T> | Iterable<T>): Promise<void>;
  remove(): Promise<void>;
}
export type JSONStringifyable =
  | string
  | number
  | boolean
  | null
  | JSONStringifyable[]
  | { [key: string]: JSONStringifyable };
