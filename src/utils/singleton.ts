export function createSingleton() {
  class Singleton {
    static instance: unknown | undefined;

    constructor() {}

    public static getInstance<T>(this: new () => T): T {
      if (Singleton.instance == null) {
        Singleton.instance = new this();
      }
      return Singleton.instance as T;
    }
  }

  return Singleton;
}
