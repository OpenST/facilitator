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
//
// ----------------------------------------------------------------------------

import 'mocha';
import BigNumber from 'bignumber.js';
import { InitOptions, Sequelize } from 'sequelize';

import Anchor from '../../../src/models/Anchor';
import AnchorRepository from '../../../src/repositories/AnchorRepository';
import { assertAnchorAttributes } from '../../models/Anchor/util';

import assert from '../../test_utils/assert';

interface TestConfiguration {
  anchorRepository: AnchorRepository;
}
let config: TestConfiguration;

describe('AnchorRepository::save', (): void => {
  beforeEach(async (): Promise<void> => {
    const sequelize = new Sequelize('sqlite::memory:', { logging: false });

    const initOptions: InitOptions = {
      sequelize,
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    };

    config = {
      anchorRepository: new AnchorRepository(initOptions),
    };

    await sequelize.sync();
  });

  it('checks "insert" of an anchor', async (): Promise<void> => {
    const anchorGA = '0xbb9bc244d798123fde783fcc1c72d3bb8c189413';
    const lastAnchoredBlockNumber = new BigNumber(1);

    const anchor = new Anchor(
      anchorGA,
      lastAnchoredBlockNumber,
    );

    const returnedAnchor = await config.anchorRepository.save(
      anchor,
    );

    assertAnchorAttributes(
      returnedAnchor,
      { anchorGA, lastAnchoredBlockNumber },
    );

    const storedAnchor: Anchor | null = await config.anchorRepository.get(
      anchorGA,
    );
    assert(storedAnchor !== null);

    assertAnchorAttributes(
      storedAnchor as Anchor,
      { anchorGA, lastAnchoredBlockNumber },
    );
  });

  it('checks "update" of an anchor', async (): Promise<void> => {
    const anchorGA = '0xbb9bc244d798123fde783fcc1c72d3bb8c189413';
    const lastAnchoredBlockNumber = new BigNumber(1);

    const anchor = new Anchor(
      anchorGA,
      lastAnchoredBlockNumber,
    );

    await config.anchorRepository.save(anchor);

    const updatedLastAnchoredBlockNumber = new BigNumber(2);
    const updatedAnchor = new Anchor(
      anchorGA,
      updatedLastAnchoredBlockNumber,
    );

    const returnedAnchor = await config.anchorRepository.save(updatedAnchor);

    assertAnchorAttributes(
      returnedAnchor,
      { anchorGA, lastAnchoredBlockNumber: updatedLastAnchoredBlockNumber },
    );

    const storedAnchor: Anchor | null = await config.anchorRepository.get(
      anchorGA,
    );
    assert(storedAnchor !== null);

    assertAnchorAttributes(
      storedAnchor as Anchor,
      { anchorGA, lastAnchoredBlockNumber: updatedLastAnchoredBlockNumber },
    );
  });

  it('fails to update an anchor with "less or equal" block number', async (): Promise<void> => {
    const anchorGA = '0xbb9bc244d798123fde783fcc1c72d3bb8c189413';
    const lastAnchoredBlockNumber = new BigNumber(2);

    const anchor = new Anchor(
      anchorGA,
      lastAnchoredBlockNumber,
    );

    await config.anchorRepository.save(anchor);

    const updatedLastAnchoredBlockNumber = new BigNumber(1);
    const updatedAnchor = new Anchor(
      anchorGA,
      updatedLastAnchoredBlockNumber,
    );

    return assert.isRejected(
      config.anchorRepository.save(updatedAnchor),
    );
  });
});
