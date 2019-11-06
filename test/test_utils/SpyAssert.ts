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


import assert from './assert';

/**
 * This class includes the utility functions to assert spy data.
 */
export default class SpyAssert {
  /**
   * @function assertSpy
   *
   * Asserts the spy data.
   *
   * @param {Object} spy Spy object.
   * @param {number} callCount of times the spy was called.
   * @param {Array} inputArgs Input arguments
   *
   */
  public static assert(spy: any, callCount: number, inputArgs: any[]): void {
    assert.strictEqual(
      spy.callCount,
      callCount,
      'Call count must match with the expected value.',
    );
    if (inputArgs) {
      for (let i = 0; i < callCount; i += 1) {
        const expectedArguments = inputArgs[i];
        const actualArguments = spy.args[i];
        assert.strictEqual(
          actualArguments.length,
          expectedArguments.length,
          'Expected and actual argument counts should be same',
        );
        for (let params = 0; params < actualArguments.length; params += 1) {
          assert.deepStrictEqual(
            actualArguments[params],
            expectedArguments[params],
            `Input param value ${
              actualArguments[params]
            } must match with the expected param value ${
              expectedArguments[params]
            }.`,
          );
        }
      }
    }
  }

  /**
   * @function assertSpy
   *
   * Asserts the spy data.
   *
   * @param {Object} spy Spy object.
   * @param {number} callCount of times the spy was called.
   */
  public static assertCall(spy: any, callCount: number) {
    assert.strictEqual(
      spy.callCount,
      callCount,
      'Call count must match with the expected value.',
    );
  }
}
