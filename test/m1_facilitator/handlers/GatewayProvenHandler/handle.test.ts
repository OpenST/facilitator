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

import 'mocha';
import { InitOptions, Sequelize } from 'sequelize';
import BigNumber from 'bignumber.js';

import assert from '../../../test_utils/assert';
import GatewayProvenHandler, { GatewayProvenEntityInterface } from '../../../../src/m1_facilitator/handlers/GatewayProvenHandler';
import GatewayRepository from '../../../../src/m1_facilitator/repositories/GatewayRepository';
import Gateway, { GatewayType } from '../../../../src/m1_facilitator/models/Gateway';
import Utils from '../../../test_utils/Utils';


interface TestConfiguration {
  gatewayRepository: GatewayRepository;
  gatewayProvenHandler: GatewayProvenHandler;
}
let config: TestConfiguration;

describe('GatewayProvenHandler::handle', (): void => {
  beforeEach(async (): Promise<void> => {
    const sequelize = new Sequelize('sqlite::memory:', { logging: false, typeValidation: true });

    const initOptions: InitOptions = {
      sequelize,
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    };

    const gatewayRepository = new GatewayRepository(initOptions);
    const gatewayProvenHandler = new GatewayProvenHandler(gatewayRepository);
    config = {
      gatewayRepository,
      gatewayProvenHandler,
    };

    await sequelize.sync();
  });

  it('skips saving an entry which '
    + 'misses a record in gateway repository', async (): Promise<void> => {
    const entity: GatewayProvenEntityInterface = {
      contractAddress: Utils.generateRundomAddress(),
      remoteGateway: Utils.generateRundomAddress(),
      blockNumber: '2',
    };

    return assert.isFulfilled(
      config.gatewayProvenHandler.handle([entity]),
    );
  });

  it('skips saving an entry with a block number '
    + 'equal to the current one', async (): Promise<void> => {
    const gatewayGA = Utils.generateRundomAddress();
    const remoteGA = Utils.generateRundomAddress();
    const anchorGA = Utils.generateRundomAddress();
    const remoteGatewayLastProvenBlockNumber = new BigNumber(1);
    const gatewayModel = new Gateway(
      gatewayGA,
      remoteGA,
      GatewayType.CONSENSUS,
      anchorGA,
      remoteGatewayLastProvenBlockNumber,
    );
    await config.gatewayRepository.save(gatewayModel);

    return assert.isFulfilled(
      config.gatewayProvenHandler.handle([{
        contractAddress: gatewayGA,
        remoteGateway: remoteGA,
        blockNumber: remoteGatewayLastProvenBlockNumber.toString(),
      }]),
    );
  });

  it('skips saving an entry with a block number '
    + 'less than the current one', async (): Promise<void> => {
    const gatewayGA = Utils.generateRundomAddress();
    const remoteGA = Utils.generateRundomAddress();
    const anchorGA = Utils.generateRundomAddress();
    const remoteGatewayLastProvenBlockNumber = new BigNumber(1);
    const gatewayModel = new Gateway(
      gatewayGA,
      remoteGA,
      GatewayType.CONSENSUS,
      anchorGA,
      remoteGatewayLastProvenBlockNumber,
    );
    await config.gatewayRepository.save(gatewayModel);

    return assert.isFulfilled(
      config.gatewayProvenHandler.handle([{
        contractAddress: gatewayGA,
        remoteGateway: remoteGA,
        blockNumber: remoteGatewayLastProvenBlockNumber.minus(1).toString(),
      }]),
    );
  });

  it('successfully updates proven gateway block number', async (): Promise<void> => {
    const gatewayGA = Utils.generateRundomAddress();
    const remoteGA = Utils.generateRundomAddress();
    const anchorGA = Utils.generateRundomAddress();
    const remoteGatewayLastProvenBlockNumber = new BigNumber(1);
    const gatewayModel = new Gateway(
      gatewayGA,
      remoteGA,
      GatewayType.CONSENSUS,
      anchorGA,
      remoteGatewayLastProvenBlockNumber,
    );

    await config.gatewayRepository.save(gatewayModel);

    const newRemoteGatewayLastProvenBlockNumber = remoteGatewayLastProvenBlockNumber.plus(1);

    await config.gatewayProvenHandler.handle([{
      contractAddress: gatewayGA,
      remoteGateway: remoteGA,
      blockNumber: newRemoteGatewayLastProvenBlockNumber.toString(),
    }]);

    const storedGatewayModel = await config.gatewayRepository.get(gatewayGA);
    assert(storedGatewayModel !== null);

    assert.isOk(
      newRemoteGatewayLastProvenBlockNumber.isEqualTo(
        (storedGatewayModel as Gateway).remoteGatewayLastProvenBlockNumber,
      ),
    );
  });
});
