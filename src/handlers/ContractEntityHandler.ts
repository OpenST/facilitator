/**
 * This class defines contract of all the transaction handlers. Each implementer
 * must implement parse method which returns a model and a handle method which
 * defines how to handle specific transaction.
 */
export default abstract class ContractEntityHandler<T> {
  /**
   * This method defines handler of a transaction.
   *
   * @param models Model object array.
   *
   * @return void
   */
  abstract handle(models: T[]): void;

  /**
   * This method parse a transaction and returns a model
   *
   * @param any Transaction from the subscriber.
   *
   * @return Array of model objects.
   */
  abstract parse(any: any[]): T[];

  /**
   * This is a template method, this method shouldn't be overridden by implementer.
   *
   * @param requests Transaction from the subscriber.
   *
   * @return void
   */
  public process(requests: any): void {
    this.handle(this.parse(requests));
  }
}
