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
import * as utils from 'web3-utils';

import assert from '../../test_utils/assert';
import SpyAssert from '../../test_utils/SpyAssert';
import Utils from '../../../src/m0-facilitator/Utils';

describe('Utils.toChecksumAddress()', () => {
  it('should be successfully', () => {
    const address = '0x123Ad';

    const web3Spy = sinon.stub(utils, 'toChecksumAddress').returns(address);

    const actualAddress = Utils.toChecksumAddress(address);

    assert.strictEqual(
      actualAddress,
      address,
      'Addresses are different',
    );

    SpyAssert.assert(web3Spy, 1, [[address]]);

    sinon.restore();
  });
});
