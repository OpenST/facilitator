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
import assert from '../../test_utils/assert';
import ContractEntity from '../../../src/models/ContractEntity';

/**
 * It contains common methods used for testing purpose of ContractEntityRepository.
 */
export default class Util {
  /**
   * It asserts fields of contract entity repository.
   * @param {ContractEntity} responseContractEntity Contract entity object received as response.
   * @param {ContractEntity} expectedContractEntity Expected contract entity object.
   */
  public static assertion(
    responseContractEntity: ContractEntity,
    expectedContractEntity: ContractEntity,
  ): void {
    if (expectedContractEntity.timestamp !== undefined) {
      assert.isOk(
        expectedContractEntity.timestamp.comparedTo(
          responseContractEntity.timestamp as BigNumber,
        ) === 0,
      );
    }

    assert.strictEqual(
      expectedContractEntity.entityType,
      responseContractEntity.entityType,
    );

    assert.strictEqual(
      expectedContractEntity.contractAddress,
      responseContractEntity.contractAddress,
    );
  }
}
