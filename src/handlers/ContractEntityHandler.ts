/**
 * This class defines contract of all the transaction handlers. Each implementer
 * must implement parse method which returns a model and a handle method which
 * defines how to handle specific transaction.
 */
export default abstract class ContractEntityHandler<T> {
  /**
   * This method defines handler of a transaction.
   * @param T Model object.
   */
  abstract handle(T): void;

  /**
   * This method parse a transaction and returns a model
   * @param any Transaction from the subscriber.
   */
  abstract parse(any): T;

  /**
   * This is a template method, this method shouldn't be override by implementer.
   * @param any Transaction from the subscriber.
   */
  public process(any): void {
    this.handle(this.parse(any));
  }
}
