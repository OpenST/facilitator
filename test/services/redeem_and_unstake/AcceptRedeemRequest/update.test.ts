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

import { interacts } from '@openst/mosaic-contracts';

import { AUXILIARY_GAS_PRICE } from '../../../../src/Constants';
import Message from '../../../../src/models/Message';
import MessageTransferRequest from '../../../../src/models/MessageTransferRequest';
import {
  MessageDirection, MessageStatus, MessageType,
} from '../../../../src/repositories/MessageRepository';
import Repositories from '../../../../src/repositories/Repositories';
import AcceptRedeemRequestService from '../../../../src/services/redeem_and_unstake/AcceptRedeemRequestService';
import Utils from '../../../../src/Utils';
import assert from '../../../test_utils/assert';
import SpyAssert from '../../../test_utils/SpyAssert';
import { RequestType } from '../../../../src/repositories/MessageTransferRequestRepository';

interface TestConfigInterface {
  web3: Web3;
  repos: Repositories;
  redeemRequestWithMessageHashB: MessageTransferRequest;
  redeemRequestWithNullMessageHashC: MessageTransferRequest;
  service: AcceptRedeemRequestService;
  fakeData: {
    secret: string;
    hashLock: string;
    messageHash: string;
  };
}
let config: TestConfigInterface;

describe('AcceptRedeemRequestService::update', (): void => {
  const web3 = new Web3(null);
  let acceptRedeemRequestSpy: any;
  let interactsSpy: any;
  const redeemPoolAddress = '0x0000000000000000000000000000000000000001';
  const auxiliaryWorkerAddress = '0x0000000000000000000000000000000000000002';
  let sendTransactionSpy: any;
  const fakeTransactionHash = 'fakeTransactionHash';
  let bountyAmount: string;
  let someFakeCoGatewayInstance: any;

  beforeEach(async (): Promise<void> => {
    const repos = await Repositories.create();
    const service = new AcceptRedeemRequestService(
      repos,
      web3,
      redeemPoolAddress,
      auxiliaryWorkerAddress,
    );
    config = {
      web3,
      repos,
      redeemRequestWithMessageHashB: new MessageTransferRequest(
        'redeemRequestHashB',
        RequestType.Redeem,
        new BigNumber('10'),
        new BigNumber('11'),
        '0x0000000000000000000000000000000000000001',
        new BigNumber('12'),
        new BigNumber('13'),
        new BigNumber('14'),
        '0x0000000000000000000000000000000000000002',
        '0x0000000000000000000000000000000000000003',
        '0x0000000000000000000000000000000000000004',
        'messageHashB',
      ),
      redeemRequestWithNullMessageHashC: new MessageTransferRequest(
        'redeemRequestHashC',
        RequestType.Redeem,
        new BigNumber('10'),
        new BigNumber('21'),
        '0x0000000000000000000000000000000000000011',
        new BigNumber('22'),
        new BigNumber('23'),
        new BigNumber('24'),
        '0x0000000000000000000000000000000000000012',
        '0x0000000000000000000000000000000000000013',
        '0x0000000000000000000000000000000000000014',
      ),
      service,
      fakeData: {
        secret: '0x1d5b16860e7306df9e2d3ee077d6f3e3c4a4b5b22d2ae6d5adfee6a2147f529c',
        hashLock: '0xa36e17d0a9b4240af1deff571017e108d2c1a40de02d84f419113b1e1f7ad40f',
        messageHash: '0x36deaf17137e7edc5e5581abe632fe6ff510f87733947ca93c229b8a495f48b8',
      },
    };

    sinon.stub(Utils, 'generateSecret').returns({
      secret: config.fakeData.secret,
      hashLock: config.fakeData.hashLock,
    });

    const message = new Message(
      config.redeemRequestWithMessageHashB.messageHash as string,
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
      '0x0000000000000000000000000000000000000001',
      MessageStatus.Declared,
      MessageStatus.Undeclared,
      new BigNumber('1'),
      new BigNumber('1'),
      new BigNumber('1'),
      '0x0000000000000000000000000000000000000002',
      new BigNumber('1'),
      '0x00000000000000000000000000000000000000000000000000000000000000001',
      '0x00000000000000000000000000000000000000000000000000000000000000002',
      new Date(),
      new Date(),
    );

    await config.repos.messageRepository.save(
      message,
    );

    await config.repos.messageTransferRequestRepository.save(
      config.redeemRequestWithMessageHashB,
    );

    await config.repos.messageTransferRequestRepository.save(
      config.redeemRequestWithNullMessageHashC,
    );

    const someFakeRedeemPoolInstance = {
      methods: {
        acceptRedeemRequest: () => {},
      },
    };

    bountyAmount = '1';
    someFakeCoGatewayInstance = {
      methods: {
        bounty: () => ({
          call: () => bountyAmount,
        }),
      },
    };

    acceptRedeemRequestSpy = sinon.replace(
      someFakeRedeemPoolInstance.methods,
      'acceptRedeemRequest',
      sinon.fake.returns(fakeTransactionHash),
    );

    interactsSpy = sinon.replace(
      interacts,
      'getRedeemPool',
      sinon.fake.returns(someFakeRedeemPoolInstance),
    );

    sinon.replace(
      interacts,
      'getEIP20CoGateway',
      sinon.fake.returns(someFakeCoGatewayInstance),
    );

    sendTransactionSpy = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );
  });

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('Checks that the redeem message transfer request repository properly updated.',
    async (): Promise<void> => {
      const redeemRequests = [
        config.redeemRequestWithMessageHashB,
        config.redeemRequestWithNullMessageHashC,
      ];

      await config.service.update(redeemRequests);

      const redeemRequestC = await config.repos.messageTransferRequestRepository.get(
        config.redeemRequestWithNullMessageHashC.requestHash,
      ) as MessageTransferRequest;

      const messageC = await config.repos.messageRepository.get(
        config.fakeData.messageHash,
      ) as Message;

      assert.notStrictEqual(
        redeemRequestC,
        null,
        'Redeem request exists in repository.',
      );

      // Here we check against pre-calculated message hash (using fake data).
      // This is a sanity check. It would fail if there is a semantic change
      // in hash calculation. This should not happen in general. However,
      // if it's intended, the message hash calculation in corresponding contract
      // should be updated also. This catch (sync between message hash calculations
      // in js and contract layer) is going to be taken care by integration test.
      assert.strictEqual(
        redeemRequestC.messageHash,
        config.fakeData.messageHash,
      );
      SpyAssert.assert(
        interactsSpy,
        1,
        [[web3, redeemPoolAddress]],
      );
      SpyAssert.assert(
        acceptRedeemRequestSpy,
        1,
        [[
          redeemRequestC.amount.toString(10),
          redeemRequestC.beneficiary,
          redeemRequestC.gasPrice.toString(10),
          redeemRequestC.gasLimit.toString(10),
          redeemRequestC.nonce.toString(10),
          redeemRequestC.sender,
          redeemRequestC.gateway,
          messageC.hashLock,
        ]],
      );
      SpyAssert.assert(
        sendTransactionSpy,
        1,
        [
          [
            fakeTransactionHash,
            {
              from: auxiliaryWorkerAddress,
              gasPrice: AUXILIARY_GAS_PRICE,
              value: bountyAmount,
            },
            web3,
          ],
        ],
      );
    });

  it('Checks that the message repository is properly updated.', async (): Promise<void> => {
    const redeemRequests = [
      config.redeemRequestWithMessageHashB,
      config.redeemRequestWithNullMessageHashC,
    ];

    await config.service.update(redeemRequests);

    const messageC = await config.repos.messageRepository.get(
      config.fakeData.messageHash,
    ) as Message;

    const redeemRequestC = await config.repos.messageTransferRequestRepository.get(
      config.redeemRequestWithNullMessageHashC.requestHash,
    ) as MessageTransferRequest;

    assert.notStrictEqual(
      messageC,
      null,
      'Message exists in the repository.',
    );

    assert.strictEqual(
      messageC.type,
      MessageType.Redeem,
    );

    assert.strictEqual(
      messageC.gatewayAddress,
      config.redeemRequestWithNullMessageHashC.gateway,
    );

    assert.strictEqual(
      messageC.sourceStatus,
      MessageStatus.Undeclared,
    );

    assert.strictEqual(
      messageC.targetStatus,
      MessageStatus.Undeclared,
    );

    assert.strictEqual(
      messageC.gasPrice!.comparedTo(config.redeemRequestWithNullMessageHashC.gasPrice),
      0,
    );

    assert.strictEqual(
      messageC.gasLimit!.comparedTo(config.redeemRequestWithNullMessageHashC.gasLimit),
      0,
    );

    assert.strictEqual(
      messageC.nonce!.comparedTo(config.redeemRequestWithNullMessageHashC.nonce),
      0,
    );

    assert.strictEqual(
      messageC.sender,
      config.redeemRequestWithNullMessageHashC.senderProxy,
    );

    assert.strictEqual(
      messageC.direction,
      MessageDirection.AuxiliaryToOrigin,
    );

    assert.strictEqual(
      messageC.sourceDeclarationBlockHeight!.comparedTo(0),
      0,
    );

    assert.strictEqual(
      messageC.secret,
      config.fakeData.secret,
    );

    assert.strictEqual(
      messageC.hashLock,
      config.fakeData.hashLock,
    );
    SpyAssert.assert(
      interactsSpy,
      1,
      [[web3, redeemPoolAddress]],
    );
    SpyAssert.assert(
      acceptRedeemRequestSpy,
      1,
      [[
        redeemRequestC.amount.toString(10),
        redeemRequestC.beneficiary,
        redeemRequestC.gasPrice.toString(10),
        redeemRequestC.gasLimit.toString(10),
        redeemRequestC.nonce.toString(10),
        redeemRequestC.sender,
        redeemRequestC.gateway,
        messageC.hashLock,
      ]],
    );
    SpyAssert.assert(
      sendTransactionSpy,
      1,
      [
        [
          fakeTransactionHash,
          {
            from: auxiliaryWorkerAddress,
            gasPrice: AUXILIARY_GAS_PRICE,
            value: bountyAmount,
          },
          web3,
        ],
      ],
    );
  });

  it('should not react if request type is not redeem.', async (): Promise<void> => {
    config.redeemRequestWithNullMessageHashC.requestType = RequestType.Stake;
    const redeemRequests = [
      config.redeemRequestWithNullMessageHashC,
    ];

    await config.service.update(redeemRequests);

    SpyAssert.assert(
      interactsSpy,
      0,
      [[web3, redeemPoolAddress]],
    );
    SpyAssert.assert(
      acceptRedeemRequestSpy,
      0,
      [[]],
    );
    SpyAssert.assert(
      sendTransactionSpy,
      0,
      [[]],
    );
  });
});
