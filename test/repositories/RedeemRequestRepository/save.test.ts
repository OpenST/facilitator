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

import 'mocha';

import BigNumber from 'bignumber.js';

import RedeemRequest from '../../../src/models/RedeemRequest';
import Repositories from '../../../src/repositories/Repositories';
import assert from '../../test_utils/assert';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('RedeemRequestRepository::save', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks creation.', async (): Promise<void> => {
    const redeemRequestInput = new RedeemRequest(
      'redeemRequestHash',
      new BigNumber('10'),
      new BigNumber('1'),
      'beneficiary',
      new BigNumber('2'),
      new BigNumber('3'),
      new BigNumber('4'),
      'cogateway',
      'redeemer',
      'redeemerProxy',
    );

    const redeemRequestResponse = await config.repos.redeemRequestRepository.save(
      redeemRequestInput,
    );

    Util.checkInputAgainstOutput(
      redeemRequestInput,
      redeemRequestResponse,
    );

    const redeemRequestOutput = await config.repos.redeemRequestRepository.get(
      redeemRequestInput.redeemRequestHash,
    );

    assert.notStrictEqual(
      redeemRequestOutput,
      null,
      'Newly created redeem request does not exist.',
    );

    Util.checkInputAgainstOutput(
      redeemRequestInput,
      redeemRequestOutput as RedeemRequest,
    );
  });

  it('Checks update.', async (): Promise<void> => {
    const redeemRequestInput = new RedeemRequest(
      'redeemRequestHash',
      new BigNumber('10'),
      new BigNumber('1'),
      'beneficiary',
      new BigNumber('2'),
      new BigNumber('3'),
      new BigNumber('4'),
      'cogateway',
      'redeemer',
      'redeemerProxy',
    );

    await config.repos.redeemRequestRepository.save(
      redeemRequestInput,
    );

    const redeemRequestUpdateInput = new RedeemRequest(
      'redeemRequestHash',
      redeemRequestInput.blockNumber,
    );
    redeemRequestUpdateInput.amount = new BigNumber('11');
    redeemRequestUpdateInput.cogateway = 'cogatewayUpdated';

    const redeemRequestResponse = await config.repos.redeemRequestRepository.save(
      redeemRequestUpdateInput,
    );

    Util.checkInputAgainstOutput(
      new RedeemRequest(
        redeemRequestInput.redeemRequestHash,
        redeemRequestInput.blockNumber,
        redeemRequestUpdateInput.amount,
        redeemRequestInput.beneficiary,
        redeemRequestInput.gasPrice,
        redeemRequestInput.gasLimit,
        redeemRequestInput.nonce,
        redeemRequestUpdateInput.cogateway,
        redeemRequestUpdateInput.redeemer,
        redeemRequestUpdateInput.redeemerProxy,
        redeemRequestInput.messageHash,
      ),
      redeemRequestResponse,
    );

    const redeemRequestOutput = await config.repos.redeemRequestRepository.get(
      redeemRequestInput.redeemRequestHash,
    );

    assert.notStrictEqual(
      redeemRequestOutput,
      null,
      'Newly updated redeem request exists.',
    );

    Util.checkInputAgainstOutput(
      new RedeemRequest(
        redeemRequestInput.redeemRequestHash,
        redeemRequestInput.blockNumber,
        redeemRequestUpdateInput.amount,
        redeemRequestInput.beneficiary,
        redeemRequestInput.gasPrice,
        redeemRequestInput.gasLimit,
        redeemRequestInput.nonce,
        redeemRequestUpdateInput.cogateway,
        redeemRequestUpdateInput.redeemer,
        redeemRequestUpdateInput.redeemerProxy,
        redeemRequestInput.messageHash,
      ),
      redeemRequestOutput as RedeemRequest,
    );
  });
});
