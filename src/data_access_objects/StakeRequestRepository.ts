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

import DatabaseWrapper from './DatabaseWrapper';

export interface StakeRequest {
  stakeRequestHash: string;
  messageHash: string;
  amount: number;
  beneficiary: string;
  gasPrice: number;
  gasLimit: number;
  nonce: number;
  gateway: string;
  stakerProxy: string;
}

export default class StakeRequestRepository {
  private db: DatabaseWrapper;

  public static readonly tableName: string = 'stake_request';

  public static readonly stakeRequestHashColumnName: string = 'stake_request_hash';

  public static readonly messageHashColumnName: string = 'message_hash';

  public static readonly amountColumnName: string = 'amount';

  public static readonly beneficiaryColumnName: string = 'beneficiary';

  public static readonly gasPriceColumnName: string = 'gas_price';

  public static readonly gasLimitColumnName: string = 'gas_limit';

  public static readonly nonceColumnName: string = 'nonce';

  public static readonly gatewayColumnName: string = 'gateway';

  public static readonly stakerProxyColumnName: string = 'staker_proxy';


  /* Public Functions */

  public constructor(dbWrapper: DatabaseWrapper) {
    this.db = dbWrapper;
  }

  public async createTable(): Promise<void> {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${StakeRequestRepository.tableName} `
      + '( '
      + `${StakeRequestRepository.stakeRequestHashColumnName} TEXT PRIMARY KEY, `
      + `${StakeRequestRepository.messageHashColumnName} TEXT, `
      + `${StakeRequestRepository.amountColumnName} INTEGER, `
      + `${StakeRequestRepository.beneficiaryColumnName} TEXT, `
      + `${StakeRequestRepository.gasPriceColumnName} INTEGER, `
      + `${StakeRequestRepository.gasLimitColumnName} INTEGER, `
      + `${StakeRequestRepository.nonceColumnName} INTEGER, `
      + `${StakeRequestRepository.gatewayColumnName} TEXT, `
      + `${StakeRequestRepository.stakerProxyColumnName} TEXT `
      + '); ';

    return this.db.run(createTableQuery);
  }

  public async create(stakeRequest: StakeRequest): Promise<void> {
    const insertQuery = `INSERT INTO ${StakeRequestRepository.tableName} `
      + '( '
      + `${StakeRequestRepository.stakeRequestHashColumnName}, `
      + `${StakeRequestRepository.messageHashColumnName}, `
      + `${StakeRequestRepository.amountColumnName}, `
      + `${StakeRequestRepository.beneficiaryColumnName}, `
      + `${StakeRequestRepository.gasPriceColumnName}, `
      + `${StakeRequestRepository.gasLimitColumnName}, `
      + `${StakeRequestRepository.nonceColumnName}, `
      + `${StakeRequestRepository.gatewayColumnName}, `
      + `${StakeRequestRepository.stakerProxyColumnName} `
      + ') '
      + 'VALUES '
      + '( '
      + `'${stakeRequest.stakeRequestHash}', `
      + `'${stakeRequest.messageHash}', `
      + `${stakeRequest.amount}, `
      + `'${stakeRequest.beneficiary}', `
      + `${stakeRequest.gasPrice}, `
      + `${stakeRequest.gasLimit}, `
      + `${stakeRequest.nonce}, `
      + `'${stakeRequest.gateway}', `
      + `'${stakeRequest.stakerProxy}' `
      + '); ';

    return this.db.run(insertQuery);
  }

  public async get(stakeRequestHash: string): Promise<StakeRequest | undefined> {
    const getQuery = 'SELECT '
      + `${StakeRequestRepository.stakeRequestHashColumnName}, `
      + `${StakeRequestRepository.messageHashColumnName}, `
      + `${StakeRequestRepository.amountColumnName}, `
      + `${StakeRequestRepository.beneficiaryColumnName}, `
      + `${StakeRequestRepository.gasPriceColumnName}, `
      + `${StakeRequestRepository.gasLimitColumnName}, `
      + `${StakeRequestRepository.nonceColumnName}, `
      + `${StakeRequestRepository.gatewayColumnName}, `
      + `${StakeRequestRepository.stakerProxyColumnName} `
      + `FROM ${StakeRequestRepository.tableName} `
      + `WHERE ${StakeRequestRepository.stakeRequestHashColumnName} = '${stakeRequestHash}'; `;

    const raw = await this.db.get(getQuery);
    if (raw === undefined) {
      return raw;
    }

    return {
      stakeRequestHash: raw[StakeRequestRepository.stakeRequestHashColumnName],
      messageHash: raw[StakeRequestRepository.messageHashColumnName],
      amount: raw[StakeRequestRepository.amountColumnName],
      beneficiary: raw[StakeRequestRepository.beneficiaryColumnName],
      gasPrice: raw[StakeRequestRepository.gasPriceColumnName],
      gasLimit: raw[StakeRequestRepository.gasLimitColumnName],
      nonce: raw[StakeRequestRepository.nonceColumnName],
      gateway: raw[StakeRequestRepository.gatewayColumnName],
      stakerProxy: raw[StakeRequestRepository.stakerProxyColumnName],
    };
  }
}
