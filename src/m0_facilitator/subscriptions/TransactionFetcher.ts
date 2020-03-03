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


import FetchQueries from '../GraphQueries/FetchQueries';
import Logger from '../../common/Logger';
import ContractEntityRepository from '../../common/repositories/ContractEntityRepository';
import GraphClient from './GraphClient';
import Utils from '../Utils';

/**
 * The class fetches the transactions based on contract address and uts.
 */
export default class TransactionFetcher {
  private readonly graphClient: GraphClient;

  private readonly queryLimit = 100;

  private contractEntityRepository: ContractEntityRepository;

  /**
   * Constructor
   * @param graphClient Graph client object.
   * @param contractEntityRepository ContractEntityRepository.
   */
  public constructor(
    graphClient: GraphClient,
    contractEntityRepository: ContractEntityRepository,
  ) {
    this.graphClient = graphClient;
    this.contractEntityRepository = contractEntityRepository;
  }

  /**
   * Queries graph node.
   *
   * @param data Data received from subscription.
   * @return Graph query response from graph node.
   */
  public async fetch(data: Record<string, any[]>): Promise<{[key: string]: object[]}> {
    const entity = (Object.keys(data)[0]);
    const entityRecord = data[entity][0];

    const checkSumContractAddress = Utils.toChecksumAddress(entityRecord.contractAddress);
    const contractEntityRecord = await this.contractEntityRepository.get(
      checkSumContractAddress,
      entity,
    );

    if (contractEntityRecord === null || contractEntityRecord.timestamp === null) {
      throw new Error(`Contract Entity record not found for entity ${entity} `
        + `and address ${checkSumContractAddress}`);
    }
    const uts = contractEntityRecord.timestamp;
    const fetchQuery = FetchQueries[entity];
    Logger.debug(`Querying records for ${entity} for UTS ${uts}`);
    let skip = 0;
    let transactions: object[] = [];
    const response: any = {};
    while (true) {
      const variables = {
        contractAddress: checkSumContractAddress,
        uts,
        skip,
        limit: this.queryLimit,
      };

      Logger.debug(`Query variables ${JSON.stringify(variables)}`);
      /* eslint-disable no-await-in-loop */
      // Note: await is needed here because GraphQL doesn't support aggregated count query.
      const graphQueryResult = await this.graphClient.query(fetchQuery, variables);
      Logger.debug(`Received ${graphQueryResult.data[entity].length} transactions on query response of entity ${entity} `);
      if (graphQueryResult.data[entity].length === 0) break;
      transactions = transactions.concat(graphQueryResult.data[entity]);
      skip += this.queryLimit;
    }

    response[entity] = transactions;
    return response;
  }
}
