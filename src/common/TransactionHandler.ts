// Copyright 2020 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


import { HandlerNotFoundException } from './Exception';
import ContractEntityHandler from './handlers/ContractEntityHandler';
import Logger from './Logger';
import RepositoriesInterface from './repositories/RepositoriesInterface';
import TransactionHandlerInterface from './TransactionHandlerInterface';

/**
 * The class enables a bulk handling of different transaction kinds.
 * During a instantiation, the class receives handlers mapped to different
 * transaction kinds.
 * TransactionHandler::handle() function handles bulk transactions of different
 * kinds by calling corresponding handler's handle() function. Afterwards,
 * Repositories.notify() function is called as handlers might persist
 * transactions into different repositories.
 */
export default class TransactionHandler implements TransactionHandlerInterface {
  /** Storage */
  private readonly handlers: Record<string, ContractEntityHandler>;

  private readonly repos: RepositoriesInterface;


  /* Special Functions */

  /**
   * Constructs a transaction handler object from the given parameters.
   *
   * @param handlers Transaction handlers mapped to different kinds of transactions.
   * @param repos Repositories container.
   */
  public constructor(
    handlers: Record<string, ContractEntityHandler>,
    repos: RepositoriesInterface,
  ) {
    this.handlers = handlers;
    this.repos = repos;
  }

  /**
   * This method accept bulkTransactions and handles them with specific handlers.
   *
   * The function receives bulk transactions of different kinds and
   * calls corresponding (mapped) handler if any. Transactions are handled
   * in parallel (no specific order).
   *
   * @throws HandlerNotFoundException if there is no handler mapped to a
   *         transaction.
   *
   * @param bulkTransactions Bulk transactions of different kinds.
   */
  public async handle(bulkTransactions: any): Promise<void> {
    Logger.debug(`bulkTransactions records: ${JSON.stringify(bulkTransactions)}`);

    const handlePromises = Object.keys(bulkTransactions).map(
      async (transactionKind): Promise<void> => {
        Logger.debug(`Handling records of kind ${transactionKind}`);

        const handler = this.handlers[transactionKind];
        if (handler === undefined) {
          throw new HandlerNotFoundException(transactionKind);
        }

        const transactions = bulkTransactions[transactionKind];
        if (transactions.length > 0) {
          return Promise.resolve(handler.handle(transactions));
        }

        return Promise.resolve();
      },
    );

    await Promise.all(handlePromises);

    await this.repos.notify();
  }
}
