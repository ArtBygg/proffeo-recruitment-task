export abstract class AbstractFactory<T, R> {
  public abstract produce(item: T): R;
}
