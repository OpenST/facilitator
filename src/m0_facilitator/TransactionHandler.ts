// Copyright 2019 OpenST Ltd.
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
//
// ----------------------------------------------------------------------------


import { HandlerNotFoundException } from './Exception';
import ContractEntityHandler from './handlers/ContractEntityHandler';
import Logger from '../common/Logger';
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
    Logger.debug(`BulkTransactions records: ${JSON.stringify(bulkTransactions)}`);
    const persistPromises = Object.keys(bulkTransactions).map(
      async (transactionKind): Promise<any> => {
        Logger.debug(`Handling records of kind ${transactionKind}`);
        const handler = this.handlers[transactionKind];
        if (typeof handler === 'undefined') {
          Logger.error(`Contract entity handler not found for ${transactionKind}`);
          throw new HandlerNotFoundException(
            `Handler implementation not found for ${transactionKind}`,
          );
        }
        const transactions = bulkTransactions[transactionKind];
        if (transactions.length > 0) {
          return handler.persist(transactions);
        }
        return Promise.resolve();
      },
    );

    await Promise.all(persistPromises);

    await this.repos.notify();
  }
}
