export interface Connector {
  connect(): Promise<void>;
  close(): Promise<void>;
}
