'use strict';

import { assert } from 'chai';

/**
 * This class includes the utitity assert function
 */
export default class AssertAsync {
  public static async reject(promise: Promise<any>, message: string) {
    try {
      await promise;
      throw new Error('Promise must reject');
    } catch (exception) {
      assert.strictEqual(
        exception.message,
        message,
        `Exception reason must be "${message}" but found "${
          exception.message
        }"`,
      );
    }
  }
}
