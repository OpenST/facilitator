import sinon from 'sinon';
import Web3 from 'web3';

import Account from '../../src/Account';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

describe('Unlock', (): void => {
  let web3: Web3;
  let validPassword: string;
  let accountCreationResponse: Account;
  let accountObject: Account;

  beforeEach((): void => {
    web3 = new Web3(null);
    validPassword = 'validPassword';
    accountCreationResponse = Account.create(web3, validPassword);
    accountObject = new Account(
      accountCreationResponse.address,
      accountCreationResponse.encryptedKeyStore,
    );
  });

  it('should unlock successfully with valid password', (): void => {
    const dummyAccount = web3.eth.accounts.create();
    sinon.replace(
      web3.eth.accounts,
      'decrypt',
      sinon.fake.returns(dummyAccount),
    );
    sinon.replace(
      web3.eth.accounts.wallet,
      'add',
      sinon.fake.returns(dummyAccount),
    );
    assert.strictEqual(
      accountObject.unlock(web3, validPassword),
      true,
      'should return true for successful unlock',
    );
    SpyAssert.assert(
      web3.eth.accounts.decrypt,
      1,
      [[accountObject.encryptedKeyStore, validPassword]],
    );
    SpyAssert.assert(
      web3.eth.accounts.wallet.add,
      1,
      [[dummyAccount]],
    );
  });

  it('should not unlock with invalid password', (): void => {
    const inValidPassword = 'inValidPassword';

    assert.strictEqual(
      accountObject.unlock(web3, inValidPassword),
      false,
      'should return false for unsuccessful unlock',
    );
  });
});
