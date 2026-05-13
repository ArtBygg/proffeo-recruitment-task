export abstract class AbstractStore<T> {
  public readonly store: Map<string, T> = new Map<string, T>();
}
