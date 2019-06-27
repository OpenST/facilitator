
import { assert } from 'chai';

import Account from '../../src/Account';

const Web3 = require('web3');


describe('Unlock', () => {

  let web3: any;
  let validPassword: string;
  let accountCreationResponse: Account;
  let accountObject: Account;

  beforeEach(function () {
    web3 = new Web3();
    validPassword = 'validPassword';
    accountCreationResponse = Account.create(web3, validPassword);
    accountObject = new Account(accountCreationResponse.address, accountCreationResponse.encryptedKeyStore);
  });

  it("should unlock successfully with valid password", () => {

    assert.strictEqual(
      accountObject.unlock(web3, validPassword),
      true,
      'should return true for successful unlock',
    );

  });

  it("should not unlock with invalid password", () => {

    const inValidPassword = 'inValidPassword';

    assert.strictEqual(
      accountObject.unlock(web3, inValidPassword),
      false,
      'should return false for unsuccessful unlock',
    );

  });

});
