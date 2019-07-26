import sinon from 'sinon';

import BigNumber from 'bignumber.js';
import Account from '../../src/Account';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

describe('Account.getNonce', (): void => {
  let dummyInitialNonce: BigNumber;
  let web3MockObject: any;
  const accountObject: Account = new Account(
    '0x0000000000000000000000000000000000000001',
  );

  beforeEach((): void => {
    dummyInitialNonce = new BigNumber('1');
    web3MockObject = {
      eth: {
        getTransactionCount: sinon.fake.resolves(dummyInitialNonce),
      },
    };
  });

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('should return nonce by calling getTransactionCount on web3', async (): Promise<void> => {
    const nonce: BigNumber = await accountObject.getNonce(web3MockObject);
    assert.notStrictEqual(
      nonce,
      dummyInitialNonce,
      'nonce should match',
    );
    SpyAssert.assert(
      web3MockObject.eth.getTransactionCount,
      1,
      [[accountObject.address, 'pending']],
    );
  });

  it('should return incremented nonce from in-memory storage', async (): Promise<void> => {
    const nonce: BigNumber = await accountObject.getNonce(web3MockObject);
    assert.notStrictEqual(
      nonce,
      dummyInitialNonce.add(1),
      'nonce should match',
    );
    SpyAssert.assert(
      web3MockObject.eth.getTransactionCount,
      0,
      [[accountObject.address, 'pending']],
    );
  });
});
