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
import { MESSAGE_BOX_OFFSET } from '../../src/Constants';

describe('Utils.getMessageBoxOffset()', async () => {
  const web3 = new Web3('');
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

  it('should pass when messagebox offset is null', async () => {
    const gatewayInstance = getGatewayInstance(MESSAGE_BOX_OFFSET);

    const eip20GatewaySpy = sinon.replace(
      interacts,
      'getEIP20Gateway',
      sinon.fake.returns(gatewayInstance),
    );

    const messageBoxOffset = await Utils.getMessageBoxOffset(web3, address);

    assert.strictEqual(
      messageBoxOffset,
      MESSAGE_BOX_OFFSET,
      `Messagebox offset should be ${MESSAGE_BOX_OFFSET} but got ${messageBoxOffset}`,
    );

    SpyAssert.assert(eip20GatewaySpy, 1, [[web3, address]]);

    sinon.restore();
  });

  it('should pass when messagebox offset is not null ', async () => {
    const gatewayInstance = getGatewayInstance(null);

    const eip20CoGatewaySpy = sinon.replace(
      interacts,
      'getEIP20Gateway',
      sinon.fake.returns(gatewayInstance),
    );

    const messageBoxOffset = await Utils.getMessageBoxOffset(web3, address);

    assert.strictEqual(
      messageBoxOffset,
      undefined,
      `Messagebox offset should be undefined but got ${messageBoxOffset}`,
    );

    SpyAssert.assert(eip20CoGatewaySpy, 1, [[web3, address]]);

    sinon.restore();
  });
});
