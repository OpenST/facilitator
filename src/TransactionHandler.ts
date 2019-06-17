import StakeRequestedHandler from './handlers/StakeRequestedHandler';
import ContractEntityHandler from './handlers/ContractEntityHandler';
import { HandlerNotFoundException } from './Exception';

export default class TransactionHandler {
  private handlers: Record<string, ContractEntityHandler>;

  public constructor() {
    this.handlers = {
      StakeRequested: new StakeRequestedHandler(),
    };
    this.handle = this.handle.bind(this);
  }

  /**
   * This method accept transactions and handles them with specific handlers.
   * @param transactions List of transactions.
   */
  public handle(transactions: any[]): void{
    transactions.forEach((transaction) => {
      const handlerType = transaction.data.__type;
      const handler = this.handlers[handlerType];
      if (typeof handler === 'undefined') {
        throw new HandlerNotFoundException(`Handler implementation not found for ${handlerType}`);
      }
      const model = handler.parse(transaction.data);
      handler.handle(model);
    });
  }
}
