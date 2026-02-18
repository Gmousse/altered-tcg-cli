import logger from "@/logger";
import { Connector } from "@/types/connector";
import { createSingleton } from "@/utils/singleton";
import ky, { HTTPError, KyInstance } from "ky";
import { Options } from "ky/distribution/types/options";

const GENERIC_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0",
  Origin: "https://www.altered.gg",
  Accept: "*/*",
  Pragma: "no-cache",
  "Cache-Control": "no-cache",
  "Content-Type": "application/json",
};

class AlteredConnector extends createSingleton() implements Connector {
  #client: KyInstance;

  static formatToken(authToken: string = "") {
    return `Bearer ${authToken.replace("Bearer ", "")}`;
  }

  constructor() {
    super();
    this.#client = ky.create({
      prefixUrl: "https://api.altered.gg",
      credentials: "include",
      hooks: {
        beforeRetry: [
          async ({ request, error }) => {
            logger.debug(
              `Retrying request: ${request.url} because of error: ${error}`
            );
            if (error instanceof HTTPError && error.response.status === 429) {
              request.headers.set(
                "User-Agent",
                `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 ${Math.random().toString(36).substring(2, 15)}`
              );
            }
          },
        ],
      },
      mode: "cors",
      timeout: 260_000,
      headers: {
        ...GENERIC_HEADERS,
      },
      referrer: "https://www.altered.gg/",
      retry: {
        limit: 10,
        methods: ["get", "post", "put", "delete"],
      },
    });
  }

  get client() {
    return this.#client;
  }

  async authenticate(auth: string) {
    this.#setAccessToken(auth);
  }

  #setAccessToken(accessToken: string) {
    this.#client = this.#client.extend((options) => ({
      ...options,
      headers: {
        ...options.headers,
        Authorization: AlteredConnector.formatToken(accessToken),
      },
    }));
  }

  async connect() {}

  async close() {}

  async *getItemsByPage<T>(
    url: string,
    options: Options = {},
    pageSize: number = 108
  ) {
    let shouldStop = false;
    let page = 1;
    while (!shouldStop) {
      const searchParams = new URLSearchParams(options.searchParams as string);
      searchParams.set("page", page.toString());
      searchParams.set("itemsPerPage", pageSize.toString());
      const response: { "hydra:member": T[] } = await this.#client
        .get(url, {
          ...options,
          searchParams,
        })
        .json();
      yield* response["hydra:member"];

      if (response["hydra:member"].length === 0) {
        shouldStop = true;
      }

      page++;
    }
  }
}

export default AlteredConnector;
