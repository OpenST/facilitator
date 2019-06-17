import StakeRequestedHandler from './handlers/StakeRequestedHandler';

export default class TransactionHandler {
  private handlers: Record<string, any>;

  public constructor() {
    this.handlers = {
      StakeRequested: StakeRequestedHandler,
    };
    this.handle = this.handle.bind(this);
  }

  public handle(transactions: any[]): void{
    transactions.map(transaction => this.handlers[transaction.data.__type].parse(transaction.data).handle());
  }
}
