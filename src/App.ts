import AlteredConnector from "./connectors/AlteredConnector";

type AppParams = {
  auth: string;
};

export default class App {
  #params: AppParams;
  #altered: AlteredConnector;

  constructor(params: AppParams) {
    this.#params = params;
    this.#altered = AlteredConnector.getInstance();
    this.#altered.authenticate(this.#params.auth);
  }

  async connect() {
    await this.#altered.connect();
  }

  async close() {
    await AlteredConnector.getInstance().close();
  }
}
