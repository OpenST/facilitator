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
// See the License for the specific

import ERC20GatewayTokenPairRepository from '../repositories/ERC20GatewayTokenPairRepository';
import ERC20GatewayTokenPair from '../models/ERC20GatewayTokenPair';
import Utils from '../../common/Utils';
import GatewayRepository from '../repositories/GatewayRepository';

/**
 *
 */
export interface CreatedUtilityTokenHandlerInterface {
  valueTokenAddress: string;
  utilityTokenAddress: string;
  contractAddress: string;
}

/**
 *
 */
export default class CreatedUtilityTokenHandler {
  /** Instance of ERC20GatewayRepository. */
  public erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository;

  /** Instance of GatewayRepository. */
  public gatewayRepository: GatewayRepository;

  public constructor(
    erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository,
    gatewayRepository: GatewayRepository,
  ) {
    this.erc20GatewayTokenPairRepository = erc20GatewayTokenPairRepository;
    this.gatewayRepository = gatewayRepository;
  }

  /**
   *
   * @param records
   */
  public async handle(records: CreatedUtilityTokenHandlerInterface[]): Promise<void> {
    const promiseCollection = records.map(async (record): Promise<void> => {
      const gatewayRecord = await this.gatewayRepository.get(
        Utils.toChecksumAddress(record.contractAddress),
      );
      if (gatewayRecord !== null) {
        const erc20GatewayTokenPairRecord = this.erc20GatewayTokenPairRepository.get(
          Utils.toChecksumAddress(record.contractAddress),
          Utils.toChecksumAddress(record.valueTokenAddress),
        );
        if (erc20GatewayTokenPairRecord === null) {
          await this.erc20GatewayTokenPairRepository.save(
            new ERC20GatewayTokenPair(
              Utils.toChecksumAddress(gatewayRecord.remoteGA),
              Utils.toChecksumAddress(record.valueTokenAddress),
              Utils.toChecksumAddress(record.utilityTokenAddress),
            ),
          );
        }
      }
    });

    await Promise.all(promiseCollection);
  }
}
