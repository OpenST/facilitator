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

import BigNumber from 'bignumber.js';

import Anchor from '../../../src/models/Anchor';

import assert from '../../test_utils/assert';

export interface AnchorAttributes {
  anchorGA?: string;
  lastAnchoredBlockNumber?: BigNumber;
  createdAt?: Date;
  updatedAt?: Date;
}

export function assertAnchorAttributes(
  anchor: Anchor,
  attributes: AnchorAttributes,
): void {
  if (Object.prototype.hasOwnProperty.call(attributes, 'anchorGA')) {
    assert.strictEqual(
      anchor.anchorGA,
      attributes.anchorGA,
    );
  }

  if (Object.prototype.hasOwnProperty.call(attributes, 'lastAnchoredBlockNumber')) {
    assert.isOk(
      anchor.lastAnchoredBlockNumber.isEqualTo(
        attributes.lastAnchoredBlockNumber as BigNumber,
      ),
    );
  }

  if (Object.prototype.hasOwnProperty.call(attributes, 'createdAt')) {
    assert.strictEqual(
      anchor.createdAt,
      attributes.createdAt,
    );
  }

  if (Object.prototype.hasOwnProperty.call(attributes, 'updatedAt')) {
    assert.strictEqual(
      anchor.updatedAt,
      attributes.updatedAt,
    );
  }
}
