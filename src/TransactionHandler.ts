import StakeRequestedHandler from './handlers/StakeRequestedHandler';

export default class TransactionHandler {
  private handlers: Record<string, any>;

  public constructor() {
    this.handlers = {
      StakeRequested: StakeRequestedHandler,
    };
    this.handle = this.handle.bind(this);
  }

  public handle(events: any[]): void{
    events.map(event => this.handlers[event.data.__type].parse(event.data).handle());
  }
}
