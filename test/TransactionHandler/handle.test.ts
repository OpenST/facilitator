import sinon from 'sinon';

import StakeRequestHandler from '../../src/handlers/StakeRequestHandler';
import Repositories from '../../src/repositories/Repositories';
import TransactionHandler from '../../src/TransactionHandler';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';
import StubData from '../test_utils/StubData';

describe('TransactionHandler.handle()', (): void => {
  const bulkTransactions = {
    stakeRequesteds: [
      {
        __typename: 'StakeRequested',
        amount: '0',
        beneficiary: '0x79376dc1925ba1e0276473244802287394216a39',
        gasLimit: '2',
        gasPrice: '1',
        gateway: '0x4e4ea3140f3d4a07e2f054cbabfd1f8038b3b4b0',
        id: '0xa80c3db5089412e553b3b4defc3b3759f56b3a77257be6940251a7a05b5c4fec-0',
        nonce: '1',
        stakeRequestHash: '0xdc67e167a7dd111e4f2c27796ceb89955bb68b995eef3a84aa86b38a5f7cd22c',
        staker: '0x79376dc1925ba1e0276473244802287394216a39',
      },
    ],
  };

  it('should handle stake request transactions if '
  + 'handler is available', async (): Promise<void> => {
    const aStakeRequest = StubData.getAStakeRequest('123');
    const stakeRequestedHandler = new StakeRequestHandler(sinon.fake() as any);

    const persistSpy = sinon.replace(
      stakeRequestedHandler,
      'persist',
      sinon.fake.resolves([aStakeRequest]),
    );
    const handlers = {
      stakeRequesteds: stakeRequestedHandler,
    };

    const repos = await Repositories.create();
    const reposNotifySpy = sinon.stub(
      repos,
      'notify',
    ).callsFake(async (): Promise<void[][]> => []);

    const transactionHandler = new TransactionHandler(
      handlers as any,
      repos,
    );

    await transactionHandler.handle(bulkTransactions);

    SpyAssert.assert(persistSpy, 1, [[bulkTransactions.stakeRequesteds]]);
    SpyAssert.assert(reposNotifySpy, 1, [[]]);
  });

  it('should fail if handler is not available', async (): Promise<void> => {
    const repos = await Repositories.create();

    const transactionHandler = new TransactionHandler({}, repos);

    assert.isRejected(
      transactionHandler.handle(bulkTransactions),
      'Handler implementation not found for stakeRequesteds',
      'Handler implementation must exists',
    );
  });
});
