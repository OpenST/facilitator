import { HandlerNotFoundException } from './Exception';
import ContractEntityHandler from './handlers/ContractEntityHandler';
import Logger from './Logger';
import Repositories from './repositories/Repositories';

/**
 * This class knows about different kinds of handlers and it makes decision
 * on which handler to invoke when bulk transactions arrive.
 */
export default class TransactionHandler {
  private readonly handlers: Record<string, ContractEntityHandler<any>>;

  private readonly repos: Repositories;

  /**
   * Constructor
   *
   * @param handlers This is mapping of handler kind with specific handler instance.
   * @param repos Container holding all repositories
   */
  public constructor(
    handlers: Record<string, ContractEntityHandler<any>>,
    repos: Repositories,
  ) {
    this.handlers = handlers;
    this.repos = repos;
  }

  /**
   * This method accept bulkTransactions and handles them with specific handlers.
   *
   * New handler can be registered in HandlerFactory class.
   *
   * @param bulkTransactions List of bulkTransactions.
   */
  public async handle(bulkTransactions: any): Promise<void> {
    const models: Record<string, any> = {};

    const persistPromises = Object.keys(bulkTransactions).map(
      async (transactionKind): Promise<void> => {
        Logger.info(`Handling records of kind ${transactionKind}`);
        Logger.info(`Records: ${JSON.stringify(bulkTransactions)}`);
        const handler = this.handlers[transactionKind];
        Logger.info("handler:", handler);
        if (typeof handler === 'undefined') {
          throw new HandlerNotFoundException(
            `Handler implementation not found for ${transactionKind}`,
          );
        }
        const transactions = bulkTransactions[transactionKind];
        models[transactionKind] = await handler.persist(transactions);
      },
    );

    await Promise.all(persistPromises);

    await this.repos.notify();
  }
}
