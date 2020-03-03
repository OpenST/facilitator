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

import BigNumber from 'bignumber.js';
import Repositories
  from '../../../../src/m1_facilitator/repositories/Repositories';
import AvailableStateRootsHandler
  from '../../../../src/m1_facilitator/handlers/AvailableStateRootsHandler';
import AnchorRepository
  from '../../../../src/m1_facilitator/repositories/AnchorRepository';
import Anchor from '../../../../src/m1_facilitator/models/Anchor';
import assert from '../../../test_utils/assert';

describe('AvailableStateRootsHandler::handle', (): void => {
  let anchorRepository: AnchorRepository;
  let handler: AvailableStateRootsHandler;

  beforeEach(async (): Promise<void> => {
    const repositories = await Repositories.create();
    ({ anchorRepository } = repositories);
    handler = new AvailableStateRootsHandler(anchorRepository);
  });

  it('should save higher block height ', async (): Promise<void> => {
    const existingRecord = {
      contractAddress: '0x0000000000000000000000000000000000000001',
      blockNumber: '1',
    };

    const newRecord = {
      contractAddress: '0x0000000000000000000000000000000000000001',
      blockNumber: '2',
    };

    await anchorRepository.save(
      new Anchor(
        Anchor.getGlobalAddress(existingRecord.contractAddress),
        new BigNumber(existingRecord.blockNumber),
      ),
    );
    await handler.handle([newRecord]);

    const anchorRecord = await anchorRepository.get(newRecord.contractAddress);

    assert.isOk(
      anchorRecord
      && anchorRecord.lastAnchoredBlockNumber
      && anchorRecord.lastAnchoredBlockNumber.isEqualTo(new BigNumber(newRecord.blockNumber)),
      `It must update latest anchor block number to ${newRecord.blockNumber} for contract ${newRecord.contractAddress}`,
    );
  });

  it('should not save lower block height', async (): Promise<void> => {
    const existingRecord = {
      contractAddress: '0x0000000000000000000000000000000000000001',
      blockNumber: '2',
    };

    const newRecord = {
      contractAddress: '0x0000000000000000000000000000000000000001',
      blockNumber: '1',
    };

    await anchorRepository.save(
      new Anchor(
        Anchor.getGlobalAddress(existingRecord.contractAddress),
        new BigNumber(existingRecord.blockNumber),
      ),
    );

    await handler.handle([newRecord]);

    const anchorRecord = await anchorRepository.get(newRecord.contractAddress);

    assert.isOk(
      anchorRecord
      && anchorRecord.lastAnchoredBlockNumber
      && anchorRecord.lastAnchoredBlockNumber.isEqualTo(new BigNumber(existingRecord.blockNumber)),
      'It must not update latest anchor block number.',
    );
  });

  it('should only save higher blockHeight for multiple records of same anchor', async (): Promise<void> => {
    const existingRecord = {
      contractAddress: '0x0000000000000000000000000000000000000001',
      blockNumber: '2',
    };

    await anchorRepository.save(
      new Anchor(
        Anchor.getGlobalAddress(existingRecord.contractAddress),
        new BigNumber(existingRecord.blockNumber),
      ),
    );

    const newRecords = [
      {
        contractAddress: '0x0000000000000000000000000000000000000001',
        blockNumber: '1',
      },
      {
        contractAddress: '0x0000000000000000000000000000000000000001',
        blockNumber: '3',
      },
    ];

    await handler.handle(newRecords);

    const anchorRecord = await anchorRepository.get(existingRecord.contractAddress);

    assert.isOk(
      anchorRecord
      && anchorRecord.lastAnchoredBlockNumber
      && anchorRecord.lastAnchoredBlockNumber.isEqualTo(new BigNumber(newRecords[1].blockNumber)),
      'It must update highest latest anchor block number'
      + ` to ${newRecords[1].contractAddress} for address ${newRecords[1].contractAddress}`,
    );
  });

  it('should not save for non tracked anchors', async (): Promise<void> => {
    const untrackedRecord = {
      contractAddress: '0x0000000000000000000000000000000000000002',
      blockNumber: '2',
    };

    await handler.handle([untrackedRecord]);

    const anchorRecord = await anchorRepository.get(untrackedRecord.contractAddress);

    assert.isOk(
      anchorRecord === null,
      'It must not update latest anchor block number',
    );
  });

  it('should save higher block height for multiple anchors', async (): Promise<void> => {
    const existingRecord = [{
      contractAddress: '0x0000000000000000000000000000000000000001',
      blockNumber: '1',
    },
    {
      contractAddress: '0x0000000000000000000000000000000000000002',
      blockNumber: '1',
    },
    ];

    const newRecords = [{
      contractAddress: '0x0000000000000000000000000000000000000001',
      blockNumber: '2',
    },
    {
      contractAddress: '0x0000000000000000000000000000000000000002',
      blockNumber: '2',
    },
    ];

    await anchorRepository.save(
      new Anchor(
        Anchor.getGlobalAddress(existingRecord[0].contractAddress),
        new BigNumber(existingRecord[0].blockNumber),
      ),
    );

    await anchorRepository.save(
      new Anchor(
        Anchor.getGlobalAddress(existingRecord[1].contractAddress),
        new BigNumber(existingRecord[1].blockNumber),
      ),
    );
    await handler.handle(newRecords);

    const anchorRecord1 = await anchorRepository.get(newRecords[0].contractAddress);
    const anchorRecord2 = await anchorRepository.get(newRecords[1].contractAddress);

    assert.isOk(
      anchorRecord1
      && anchorRecord1.lastAnchoredBlockNumber
      && anchorRecord1.lastAnchoredBlockNumber.isEqualTo(new BigNumber(newRecords[0].blockNumber)),
      'It must update highest latest anchor block number'
      + ` to ${newRecords[0].blockNumber} for contract ${newRecords[0].contractAddress}`,
    );

    assert.isOk(
      anchorRecord2
      && anchorRecord2.lastAnchoredBlockNumber
      && anchorRecord2.lastAnchoredBlockNumber.isEqualTo(new BigNumber(newRecords[1].blockNumber)),
      'It must update highest latest anchor block number'
      + ` to ${newRecords[1].blockNumber} for contract ${newRecords[1].contractAddress}`,
    );
  });
});
