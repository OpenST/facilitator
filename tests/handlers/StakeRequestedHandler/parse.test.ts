import * as Utils from 'web3-utils';
import { assert } from 'chai';
import StakeRequest from '../../../src/models/StakeRequest';
import StakeRequestedHandler
  from '../../../src/handlers/StakeRequestedHandler';

describe('StakeRequestedHandler.parse()', () => {
  it('should parse successfully', () => {
    const transactions = [{
      id: '1',
      amount: '10',
      beneficiary: '0x7f14BcAFdF55a45Fd64384e3496b62Ca8A1B099D',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      staker: '0xd328C7bE0D524aa33b8118163C431dCd0d46EE82',
      gateway: '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294',
      stakeRequestHash: Utils.sha3('1'),
    }];

    const handler = new StakeRequestedHandler();
    const models = handler.parse(transactions);
    const stakeRequest = new StakeRequest(
      transactions[0].id,
      transactions[0].amount,
      transactions[0].beneficiary,
      transactions[0].gasPrice,
      transactions[0].gasLimit,
      transactions[0].nonce,
      transactions[0].staker,
      transactions[0].gateway,
      transactions[0].stakeRequestHash,
    );
    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    assert.deepStrictEqual(models[0], stakeRequest);
  });
});
