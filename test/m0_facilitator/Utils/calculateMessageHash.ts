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

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import 'mocha';

import BigNumber from 'bignumber.js';
import sinon from 'sinon';
import Web3 from 'web3';

import * as assert from 'assert';
import MessageTransferRequest from '../../../src/m0_facilitator/models/MessageTransferRequest';
import { RequestType } from '../../../src/m0_facilitator/repositories/MessageTransferRequestRepository';
import Utils from '../../../src/m0_facilitator/Utils';

interface TestConfigInterface {
  web3: Web3;
  fakeData: {
    secret: string;
    hashLock: string;
    intentHash: string;
    messageHash: string;
  };
}
let config: TestConfigInterface;

describe('Utils::calculateMessageHash', (): void => {
  const web3 = new Web3(null);
  beforeEach(async (): Promise<void> => {
    config = {
      web3,
      fakeData: {
        secret: '0x1d5b16860e7306df9e2d3ee077d6f3e3c4a4b5b22d2ae6d5adfee6a2147f529c',
        hashLock: '0xa36e17d0a9b4240af1deff571017e108d2c1a40de02d84f419113b1e1f7ad40f',
        intentHash: '0x36deaf17137e7edc5e5581abe632fe6ff510f87733947ca93c229b8a495f48b8',
        messageHash: '0x502d73bc54d1e58336aab7603ed77234f85d3fcb0f0954ab74cba50449333e22',
      },
    };
  });

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('Checks correct message Hash',
    async (): Promise<void> => {
      const messageTransferRequest = new MessageTransferRequest(
        'requestHashC',
        RequestType.Stake,
        new BigNumber('10'),
        new BigNumber('21'),
        '0x0000000000000000000000000000000000000011',
        new BigNumber('22'),
        new BigNumber('23'),
        new BigNumber('24'),
        '0x0000000000000000000000000000000000000012',
        '0x0000000000000000000000000000000000000013',
        '0x0000000000000000000000000000000000000014',
        null,
      );

      const messageHash = Utils.calculateMessageHash(
        web3,
        messageTransferRequest,
        config.fakeData.hashLock,
        config.fakeData.intentHash,
      );

      assert.strictEqual(
        messageHash,
        config.fakeData.messageHash,
        'Invalid message hash.',
      );
    });

  it('Should fail when hashLock is incorrect',
    async (): Promise<void> => {
      const messageTransferRequest = new MessageTransferRequest(
        'requestHashC',
        RequestType.Stake,
        new BigNumber('10'),
        new BigNumber('21'),
        '0x0000000000000000000000000000000000000011',
        new BigNumber('22'),
        new BigNumber('23'),
        new BigNumber('24'),
        '0x0000000000000000000000000000000000000012',
        '0x0000000000000000000000000000000000000013',
        '0x0000000000000000000000000000000000000014',
        null,
      );

      const wrongHashLock = '0xa00017d0a9b4240af1deff571017e108d2c1a40de02d84f419113b1e1f7ad111';
      const messageHash = Utils.calculateMessageHash(
        web3,
        messageTransferRequest,
        wrongHashLock,
        config.fakeData.intentHash,
      );

      assert.notStrictEqual(
        messageHash,
        config.fakeData.messageHash,
        'Invalid message hash.',
      );
    });
});
