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


import * as sinon from 'sinon';
import Web3 from 'web3';
import { interacts } from '@openst/mosaic-contracts';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';
import Utils from '../../src/Utils';
import { GatewayType } from '../../src/repositories/GatewayRepository';
import { CODE_HASH, MESSAGE_BOX_OFFSET } from '../../src/Constants';

describe('Utils.getMessageBoxOffset()', async () => {
  const web3 = new Web3('');
  const dummyMessageBoxOffset = '8';
  const address = '0xF9234855d1Fb05f06A09baFB827faD084516b21c';

  function getGatewayInstance(messageBoxOffset: string | null): object {
    return {
      methods: {
        MESSAGE_BOX_OFFSET() {
          return {
            async call() {
              return Promise.resolve(messageBoxOffset);
            },
          };
        },
      },
    };
  }

  it('should pass when gateway type is origin', async () => {
    const gatewayWayType = GatewayType.Origin;
    const gatewayInstance = getGatewayInstance(dummyMessageBoxOffset);

    const eip20GatewaySpy = sinon.replace(
      interacts,
      'getEIP20Gateway',
      sinon.fake.returns(gatewayInstance),
    );

    const messageBoxOffset = await Utils.getMessageBoxOffset(web3, gatewayWayType, address);

    assert.strictEqual(
      messageBoxOffset,
      dummyMessageBoxOffset,
      `Messagebox offset should be ${dummyMessageBoxOffset} but got ${messageBoxOffset}`,
    );

    SpyAssert.assert(eip20GatewaySpy, 1, [[web3, address]]);

    sinon.restore();
  });

  it('should pass when gateway type is auxiliary', async () => {
    const gatewayWayType = GatewayType.Auxiliary;
    const gatewayInstance = getGatewayInstance(dummyMessageBoxOffset);

    const eip20CoGatewaySpy = sinon.replace(
      interacts,
      'getEIP20CoGateway',
      sinon.fake.returns(gatewayInstance),
    );

    const messageBoxOffset = await Utils.getMessageBoxOffset(web3, gatewayWayType, address);

    assert.strictEqual(
      messageBoxOffset,
      dummyMessageBoxOffset,
      `Messagebox offset should be ${dummyMessageBoxOffset} but got ${messageBoxOffset}`,
    );

    SpyAssert.assert(eip20CoGatewaySpy, 1, [[web3, address]]);

    sinon.restore();
  });

  it('should pass when gateway type is origin and messagebox offset from contract is null', async () => {
    const gatewayInstance = getGatewayInstance(null);
    const gatewayWayType = GatewayType.Origin;

    const eip20GatewaySpy = sinon.replace(
      interacts,
      'getEIP20Gateway',
      sinon.fake.returns(gatewayInstance),
    );

    const getCodeHashSpy = sinon.replace(
      Utils,
      'getCodeHash',
      sinon.fake.returns(CODE_HASH.eip20Gateway),
    );

    const messageBoxOffset = await Utils.getMessageBoxOffset(web3, gatewayWayType, address);

    assert.strictEqual(
      messageBoxOffset,
      MESSAGE_BOX_OFFSET,
      `Messagebox offset should be ${MESSAGE_BOX_OFFSET} but got ${messageBoxOffset}`,
    );

    SpyAssert.assert(eip20GatewaySpy, 1, [[web3, address]]);

    SpyAssert.assert(getCodeHashSpy, 1, [[web3, address]]);

    sinon.restore();
  });

  it('should pass when gateway type is auxiliary and messagebox offset from contract is null', async () => {
    const gatewayInstance = getGatewayInstance(null);
    const gatewayWayType = GatewayType.Auxiliary;

    const eip20CoGatewaySpy = sinon.replace(
      interacts,
      'getEIP20CoGateway',
      sinon.fake.returns(gatewayInstance),
    );

    const getCodeHashSpy = sinon.replace(
      Utils,
      'getCodeHash',
      sinon.fake.returns(CODE_HASH.eip20CoGateway),
    );

    const messageBoxOffset = await Utils.getMessageBoxOffset(web3, gatewayWayType, address);

    assert.strictEqual(
      messageBoxOffset,
      MESSAGE_BOX_OFFSET,
      `Messagebox offset should be ${MESSAGE_BOX_OFFSET} but got ${messageBoxOffset}`,
    );

    SpyAssert.assert(eip20CoGatewaySpy, 1, [[web3, address]]);

    SpyAssert.assert(getCodeHashSpy, 1, [[web3, address]]);

    sinon.restore();
  });

  it('should fail when messagebox offset is not found in contract and using codehash', async () => {
    const gatewayInstance = getGatewayInstance(null);
    const gatewayWayType = GatewayType.Auxiliary;

    const eip20CoGatewaySpy = sinon.replace(
      interacts,
      'getEIP20CoGateway',
      sinon.fake.returns(gatewayInstance),
    );

    const getCodeHashSpy = sinon.replace(
      Utils,
      'getCodeHash',
      sinon.fake.returns('0x1234'),
    );

    await assert.isRejected(
      Utils.getMessageBoxOffset(web3, gatewayWayType, address),
      `Message box offset not found for contract address ${address}`,
    );

    SpyAssert.assert(eip20CoGatewaySpy, 1, [[web3, address]]);

    SpyAssert.assert(getCodeHashSpy, 1, [[web3, address]]);

    sinon.restore();
  });
});
