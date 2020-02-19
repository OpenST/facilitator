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

import Anchor from '../../../../src/m1_facilitator/models/Anchor';
import assert from '../../../test_utils/assert';

describe('Anchor::compareTo', (): void => {
  it('checks comparison while anchorGA -s are different', async (): Promise<void> => {
    {
      const anchorA = new Anchor(
        '0xAbac9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(1), // lastAnchoredBlockNumber
      );

      const anchorB = new Anchor(
        '0xaBbc9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(1), // lastAnchoredBlockNumber
      );

      assert.isOk(
        anchorA.compareTo(anchorB) < 0, // anchorA < anchorB
      );
    }

    {
      const anchorA = new Anchor(
        '0xAbbc9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(1), // lastAnchoredBlockNumber
      );

      const anchorB = new Anchor(
        '0xaBac9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(1), // lastAnchoredBlockNumber
      );

      assert.isOk(
        anchorA.compareTo(anchorB) > 0, // anchorA > anchorB
      );
    }

    {
      const anchorA = new Anchor(
        '0xAbBc9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(1), // lastAnchoredBlockNumber
      );

      const anchorB = new Anchor(
        '0xabbC9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(1), // lastAnchoredBlockNumber
      );

      assert.isOk(
        anchorA.compareTo(anchorB) === 0, // anchorA = anchorB
      );
    }
  });

  it('checks comparison while anchorGA -s are equal', async (): Promise<void> => {
    {
      const anchorA = new Anchor(
        '0xAbBc9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(1), // lastAnchoredBlockNumber
      );

      const anchorB = new Anchor(
        '0xabbC9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(2), // lastAnchoredBlockNumber
      );

      assert.isOk(
        anchorA.compareTo(anchorB) < 0, // anchorA < anchorB
      );
    }

    {
      const anchorA = new Anchor(
        '0xAbBc9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(2), // lastAnchoredBlockNumber
      );

      const anchorB = new Anchor(
        '0xabbC9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(1), // lastAnchoredBlockNumber
      );

      assert.isOk(
        anchorA.compareTo(anchorB) > 0, // anchorA < anchorB
      );
    }

    {
      const anchorA = new Anchor(
        '0xAbBc9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(2), // lastAnchoredBlockNumber
      );

      const anchorB = new Anchor(
        '0xabbC9244d798123fde783fcc1c72d3bb8c189413', // anchorGA
        new BigNumber(2), // lastAnchoredBlockNumber
      );

      assert.isOk(
        anchorA.compareTo(anchorB) === 0, // anchorA = anchorB
      );
    }
  });
});
