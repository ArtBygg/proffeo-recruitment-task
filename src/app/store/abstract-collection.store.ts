export abstract class AbstractCollectionStore<T> {
  public readonly store: Map<string, T> = new Map<string, T>();
}
