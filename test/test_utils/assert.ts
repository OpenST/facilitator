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

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ValidationErrorItem } from 'sequelize/types/lib/errors';
chai.use(chaiAsPromised);
const { assert } = chai;

/**
 * It asserts the error message received from sequelize with the expected message.
 * @param errorObject Error object by sequelize.
 * @param messages Expected error messages.
 */
export function assertErrorMessages(errorObject: ValidationErrorItem[], messages: string[]): void {
    assert.strictEqual(
      errorObject.length,
      messages.length,
      `Error object has ${errorObject.length} errors but number of messages to be` +
      `asserted is ${messages.length}`,
    );

    errorObject.forEach(function (value: ValidationErrorItem, index: number) {

      assert.strictEqual(
        value.message,
        messages[index],
      );

    });
  }

export default assert;
