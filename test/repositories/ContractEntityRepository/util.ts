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


import ContractEntity from '../../../src/models/ContractEntity';
import assert from '../../test_utils/assert';

/**
 * It contains common methods used for testing purpose of ContractEntityRepository.
 */
export default class Util {
  /**
   * It asserts fields of contract entity repository.
   * @param responseContractEntity Contract entity object received as response.
   * @param expectedContractEntity Expected contract entity object.
   */
  public static assertion(
    responseContractEntity: ContractEntity,
    expectedContractEntity: ContractEntity,
  ): void {
    if (expectedContractEntity.timestamp !== undefined) {
      assert.isOk(
        expectedContractEntity.timestamp.comparedTo(
          responseContractEntity.timestamp!,
        ) === 0,
      );
    }

    assert.strictEqual(
      expectedContractEntity.entityType,
      responseContractEntity.entityType,
      'Expected entity type is different than the one received in response',
    );

    assert.strictEqual(
      expectedContractEntity.contractAddress,
      responseContractEntity.contractAddress,
      'Expected contract address is different than the one received in response',
    );

    if (expectedContractEntity.createdAt && responseContractEntity.createdAt) {
      assert.strictEqual(
        expectedContractEntity.createdAt.getTime(),
        responseContractEntity.createdAt.getTime(),
        'Expected created at time is different than the one received in response',
      );
    }
    assert.isNotNull(
      responseContractEntity.updatedAt,
      'Updated at should not be null',
    );
  }
}
