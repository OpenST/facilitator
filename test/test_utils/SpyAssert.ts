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
          expectedArguments.length,
          actualArguments.length,
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
