import * as Utils from 'web3-utils';
import { assert } from 'chai';
import StakeRequest from '../../../src/models/StakeRequest';

describe('Constructor', () => {
  it('should construct successfully', () => {
    const params = {
      id: '1',
      amount: '10',
      beneficiary: '0x7f14BcAFdF55a45Fd64384e3496b62Ca8A1B099D',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      staker: '0xd328C7bE0D524aa33b8118163C431dCd0d46EE82',
      gateway: '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294',
      stakeRequestHash: Utils.sha3('1'),
    };

    const stakeRequest = new StakeRequest(
      params.id,
      params.amount,
      params.beneficiary,
      params.gasPrice,
      params.gasLimit,
      params.nonce,
      params.staker,
      params.gateway,
      params.stakeRequestHash,
    );

    assert.strictEqual(
      stakeRequest.id,
      params.id,
      'ID should match on construction',
    );
    assert.strictEqual(
      stakeRequest.amount,
      params.amount,
      'Amount should match on construction',
    );
    assert.strictEqual(
      stakeRequest.beneficiary,
      params.beneficiary,
      'Beneficiary should match on construction',
    );
    assert.strictEqual(
      stakeRequest.gasPrice,
      params.gasPrice,
      'GasPrice should match on construction',
    );
    assert.strictEqual(
      stakeRequest.gasLimit,
      params.gasLimit,
      'GasLimit should match on construction',
    );
    assert.strictEqual(
      stakeRequest.nonce,
      params.nonce,
      'Nonce should match on construction',
    );
    assert.strictEqual(
      stakeRequest.staker,
      params.staker,
      'Staker should match on construction',
    );
    assert.strictEqual(
      stakeRequest.gateway,
      params.gateway,
      'Gateway should match on construction',
    );
    assert.strictEqual(
      stakeRequest.stakeRequestHash,
      params.stakeRequestHash,
      'StakeRequestHash should match on construction',
    );
  });
});
