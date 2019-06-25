import ContractEntityHandler from './handlers/ContractEntityHandler';
import { HandlerNotFoundException } from './Exception';

export default class TransactionHandler {
  private readonly handlers: Record<string, ContractEntityHandler<any>>;

  public constructor(handlers: Record<string, ContractEntityHandler<any>>) {
    this.handlers = handlers;
    this.handle = this.handle.bind(this);
  }

  /**
   * This method accept bulkTransactions and handles them with specific handlers.
   *
   * New handler can be registered in HandlerFactory class.
   *
   * @param bulkTransactions List of bulkTransactions.
   */
  public handle(bulkTransactions: any): void {
    Object.keys(bulkTransactions).forEach((transactionKind) => {
      const handler = this.handlers[transactionKind];
      if (typeof handler === 'undefined') {
        throw new HandlerNotFoundException(
          `Handler implementation not found for ${transactionKind}`,
        );
      }
      const transactions = bulkTransactions[transactionKind];
      handler.process(transactions);
    });
  }
}
