/**
 * This class defines contract of all the transaction handlers. Each implementer
 * must implement parse method which returns a model and a handle method which
 * defines how to handle specific transaction.
 */
export default abstract class ContractEntityHandler<T> {
  /**
   * This method parse a transaction and persist models.
   *
   * @param any Transaction from the subscriber.
   *
   * @return Array of model objects.
   */
  abstract async persist(any: any[]): Promise<T[]>;

  /**
   * This method defines handler of a transaction.
   *
   * @param models Model object array.
   */
  abstract async handle(models: T[]): Promise<void>;
}
