import AuxiliaryChain from '../../../src/models/AuxiliaryChain';
import assert from '../../test_utils/assert';

const Util = {
  assertAuxiliaryChainAttributes(
    inputAuxiliaryChain: AuxiliaryChain,
    expectedAuxiliaryChain: AuxiliaryChain,
  ): void {
    assert.strictEqual(
      inputAuxiliaryChain.chainId,
      expectedAuxiliaryChain.chainId,
      'chainId should match',
    );

    assert.strictEqual(
      inputAuxiliaryChain.originChainName,
      expectedAuxiliaryChain.originChainName,
      'originChainName should match',
    );

    assert.strictEqual(
      inputAuxiliaryChain.ostGatewayAddress,
      expectedAuxiliaryChain.ostGatewayAddress,
      'ostGatewayAddress should match',
    );

    assert.strictEqual(
      inputAuxiliaryChain.ostCoGatewayAddress,
      expectedAuxiliaryChain.ostCoGatewayAddress,
      'ostCoGatewayAddress should match',
    );

    assert.strictEqual(
      inputAuxiliaryChain.anchorAddress,
      expectedAuxiliaryChain.anchorAddress,
      'anchorAddress should match',
    );

    assert.strictEqual(
      inputAuxiliaryChain.coAnchorAddress,
      expectedAuxiliaryChain.coAnchorAddress,
      'coAnchorAddress should match',
    );

    if (inputAuxiliaryChain.lastOriginBlockHeight) {
      assert.notStrictEqual(
        inputAuxiliaryChain.lastOriginBlockHeight,
        expectedAuxiliaryChain.lastOriginBlockHeight,
        'lastOriginBlockHeight should match',
      );
    }

    if (inputAuxiliaryChain.lastAuxiliaryBlockHeight) {
      assert.notStrictEqual(
        inputAuxiliaryChain.lastAuxiliaryBlockHeight,
        expectedAuxiliaryChain.lastAuxiliaryBlockHeight,
        'lastAuxiliaryBlockHeight should match',
      );
    }

    if (inputAuxiliaryChain.createdAt && expectedAuxiliaryChain.createdAt) {
      assert.strictEqual(
        inputAuxiliaryChain.createdAt.getTime(),
        expectedAuxiliaryChain.createdAt.getTime(),
        'Expected created at time is different than the one received in response',
      );
    }

    assert.isNotNull(
      inputAuxiliaryChain.updatedAt,
      'Updated at should not be null',
    );
  },

};

export default Util;
