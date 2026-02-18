export async function* batchify<T>(
  iterator: AsyncIterableIterator<T> | IterableIterator<T>,
  batchSize: number = 100
): AsyncGenerator<T[]> {
  const batch: T[] = [];
  for await (const item of iterator) {
    batch.push(item);
    if (batch.length === batchSize) {
      yield batch.splice(0);
    }
  }
  if (batch.length > 0) {
    yield batch.splice(0);
  }
}
