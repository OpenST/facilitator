import { assert } from 'chai';
import * as sinon from 'sinon';

import BigNumber from 'bignumber.js';
import StakeRequestHandler from '../../../src/handlers/StakeRequestHandler';
import StakeRequest from '../../../src/models/StakeRequest';
import StakeRequestRepository from '../../../src/repositories/StakeRequestRepository';

import SpyAssert from '../../test_utils/SpyAssert';

const Utils = require('web3-utils');

describe('StakeRequestedHandler.persist()', (): void => {
  it('should persist successfully', async (): Promise<void> => {
    const transactions = [{
      id: '1',
      stakeRequestHash: Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x7f14BcAFdF55a45Fd64384e3496b62Ca8A1B099D',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      gateway: '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294',
      staker: '0xE1e701FbE4288a38FfFEa3084C826B810c5d5294',
    }];

    const saveStub = sinon.stub();
    const sinonMock = sinon.createStubInstance(StakeRequestRepository, {
      save: saveStub as any,
    });
    const handler = new StakeRequestHandler(sinonMock as any);

    const models = await handler.persist(transactions);

    const stakeRequest = new StakeRequest(
      transactions[0].stakeRequestHash,
      new BigNumber(transactions[0].amount),
      transactions[0].beneficiary,
      new BigNumber(transactions[0].gasPrice),
      new BigNumber(transactions[0].gasLimit),
      new BigNumber(transactions[0].nonce),
      transactions[0].gateway,
      transactions[0].staker,
    );

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );
    assert.deepStrictEqual(models[0], stakeRequest);
    SpyAssert.assert(saveStub, 1, [[stakeRequest]]);
  });
});
