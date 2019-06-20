import Web3 from 'web3';
import { assert } from 'chai';

import Account from '../../src/Account';

describe('Unlock', () => {

  let web3;
  let validPassword;
  let accountCreationResponse;
  let accountObject;

  beforeEach(function () {
    web3 = new Web3('');
    validPassword = 'validPassword';
    accountCreationResponse = Account.create(web3, validPassword);
    accountObject = new Account(accountCreationResponse.account.address, accountCreationResponse.encryptedAccount);
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
      'should return true for successful unlock',
    );

  });

});
