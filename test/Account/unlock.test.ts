import * as sinon from 'sinon';
import { assert } from 'chai';

import Account from '../../src/Account';
import SpyAssert from '../utils/SpyAssert';

const Web3 = require('web3');

describe('Unlock', () => {
  let web3: any;
  let validPassword: string;
  let accountCreationResponse: Account;
  let accountObject: Account;

  beforeEach(() => {
    web3 = new Web3();
    validPassword = 'validPassword';
    accountCreationResponse = Account.create(web3, validPassword);
    accountObject = new Account(
      accountCreationResponse.address,
      accountCreationResponse.encryptedKeyStore
    );
  });

  it('should unlock successfully with valid password', () => {
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

  it('should not unlock with invalid password', () => {
    const inValidPassword = 'inValidPassword';

    assert.strictEqual(
      accountObject.unlock(web3, inValidPassword),
      false,
      'should return false for unsuccessful unlock',
    );
  });
});
