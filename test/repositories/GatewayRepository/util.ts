import Gateway from '../../../src/models/Gateway';
import assert from '../../test_utils/assert';

const Util = {
  assertGatewayAttributes(
    inputGateway: Gateway,
    expectedGateway: Gateway,
  ): void {
    assert.strictEqual(
      inputGateway.gatewayAddress,
      expectedGateway.gatewayAddress,
      'gatewayAddress should match',
    );

    assert.strictEqual(
      inputGateway.chainId,
      expectedGateway.chainId,
      'chainId should match',
    );

    assert.strictEqual(
      inputGateway.remoteGatewayAddress,
      expectedGateway.remoteGatewayAddress,
      'remoteGatewayAddress should match',
    );

    assert.strictEqual(
      inputGateway.gatewayType,
      expectedGateway.gatewayType,
      'gatewayType should match',
    );

    assert.strictEqual(
      inputGateway.tokenAddress,
      expectedGateway.tokenAddress,
      'tokenAddress should match',
    );

    assert.strictEqual(
      inputGateway.anchorAddress,
      expectedGateway.anchorAddress,
      'anchorAddress should match',
    );

    assert.notStrictEqual(
      inputGateway.bounty,
      expectedGateway.bounty,
      'bounty should match',
    );

    assert.strictEqual(
      inputGateway.activation,
      expectedGateway.activation,
      'activation should match',
    );

    if (inputGateway.lastRemoteGatewayProvenBlockHeight) {
      assert.notStrictEqual(
        inputGateway.lastRemoteGatewayProvenBlockHeight,
        expectedGateway.lastRemoteGatewayProvenBlockHeight,
        'lastRemoteGatewayProvenBlockHeight should match',
      );
    }

    if (inputGateway.createdAt && expectedGateway.createdAt) {
      assert.strictEqual(
        inputGateway.createdAt.getTime(),
        expectedGateway.createdAt.getTime(),
        'Expected created at time is different than the one received in response',
      );
    }

    assert.isNotNull(
      inputGateway.updatedAt,
      'Updated at should not be null',
    );
  },

};

export default Util;
