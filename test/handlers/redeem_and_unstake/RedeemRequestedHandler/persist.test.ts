import BigNumber from 'bignumber.js';
import sinon from 'sinon';
import * as Web3Utils from 'web3-utils';

import RedeemRequestedHandler from '../../../../src/handlers/redeem_and_unstake/RedeemRequestedHandler';
import MessageTransferRequest from '../../../../src/models/MessageTransferRequest';
import MessageTransferRequestRepository, { RequestType } from '../../../../src/repositories/MessageTransferRequestRepository';
import assert from '../../../test_utils/assert';
import SpyAssert from '../../../test_utils/SpyAssert';

describe('RedeemRequestedHandler.persist()', (): void => {
  it('should persist successfully when redeemRequesteds is received first time for'
    + ' redeemRequestHash', async (): Promise<void> => {
    const cogatewayAddress = '0x0000000000000000000000000000000000000002';
    const transactions = [{
      id: '1',
      redeemRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      cogateway: cogatewayAddress,
      redeemer: '0x0000000000000000000000000000000000000003',
      redeemerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '10',
    }];

    const saveStub = sinon.stub();
    const sinonMock = sinon.createStubInstance(MessageTransferRequestRepository, {
      save: Promise.resolve(saveStub as any),
    });
    const handler = new RedeemRequestedHandler(
      sinonMock as any,
      cogatewayAddress,
    );

    const models = await handler.persist(transactions);

    const redeemRequest = new MessageTransferRequest(
      transactions[0].redeemRequestHash,
      RequestType.Redeem,
      new BigNumber(transactions[0].amount),
      new BigNumber(transactions[0].blockNumber),
      Web3Utils.toChecksumAddress(transactions[0].beneficiary),
      new BigNumber(transactions[0].gasPrice),
      new BigNumber(transactions[0].gasLimit),
      new BigNumber(transactions[0].nonce),
      Web3Utils.toChecksumAddress(transactions[0].cogateway),
      Web3Utils.toChecksumAddress(transactions[0].redeemer),
      Web3Utils.toChecksumAddress(transactions[0].redeemerProxy),
    );

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );
    assert.deepStrictEqual(models[0], redeemRequest);
    SpyAssert.assert(sinonMock.save, 1, [[redeemRequest]]);
    sinon.restore();
  });

  it('should update blockNumber and messageHash with blank when redeemRequest '
    + 'is already present', async (): Promise<void> => {
    const cogatewayAddress = '0x0000000000000000000000000000000000000002';
    const transactions1 = [{
      id: '1',
      redeemRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      cogateway: cogatewayAddress,
      redeemer: '0x0000000000000000000000000000000000000003',
      redeemerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '10',
    }];
    const redeemRequest = new MessageTransferRequest(
      transactions1[0].redeemRequestHash,
      RequestType.Redeem,
      new BigNumber(transactions1[0].blockNumber),
      new BigNumber(transactions1[0].amount),
      Web3Utils.toChecksumAddress(transactions1[0].beneficiary),
      new BigNumber(transactions1[0].gasPrice),
      new BigNumber(transactions1[0].gasLimit),
      new BigNumber(transactions1[0].nonce),
      Web3Utils.toChecksumAddress(transactions1[0].cogateway),
      Web3Utils.toChecksumAddress(transactions1[0].redeemer),
      Web3Utils.toChecksumAddress(transactions1[0].redeemerProxy),
    );

    // Transaction with higher block number.
    const transactions2 = [{
      id: '1',
      redeemRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      cogateway: cogatewayAddress,
      redeemer: '0x0000000000000000000000000000000000000003',
      redeemerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '11',
    }];

    const redeemRequestWithNullMessageHash = new MessageTransferRequest(
      transactions2[0].redeemRequestHash,
      RequestType.Redeem,
      new BigNumber(transactions2[0].blockNumber),
      new BigNumber(transactions2[0].amount),
      Web3Utils.toChecksumAddress(transactions2[0].beneficiary),
      new BigNumber(transactions2[0].gasPrice),
      new BigNumber(transactions2[0].gasLimit),
      new BigNumber(transactions2[0].nonce),
      Web3Utils.toChecksumAddress(transactions2[0].cogateway),
      Web3Utils.toChecksumAddress(transactions2[0].redeemer),
      Web3Utils.toChecksumAddress(transactions2[0].redeemerProxy),
      '', // Message hash should be blank.
    );

    const sinonMock = sinon.createStubInstance(MessageTransferRequestRepository, {});
    const handler = new RedeemRequestedHandler(sinonMock as any, cogatewayAddress);

    sinonMock.get.returns(Promise.resolve(null));
    sinonMock.save.returns(Promise.resolve(redeemRequest));
    const models1 = await handler.persist(transactions1);

    const redeemRequestWithMessageHash = Object.assign({}, redeemRequest);
    redeemRequestWithMessageHash.messageHash = 'messageHash';

    sinonMock.get.returns(Promise.resolve(redeemRequestWithMessageHash));
    sinonMock.save.returns(Promise.resolve(redeemRequestWithNullMessageHash));
    const models2 = await handler.persist(transactions2);

    assert.equal(
      models1.length,
      transactions1.length,
      'Number of models must be equal to transactions',
    );

    assert.equal(
      models2.length,
      transactions2.length,
      'Number of models must be equal to transactions',
    );

    assert.deepStrictEqual(models1[0], redeemRequest);

    assert.deepStrictEqual(models2[0], redeemRequestWithNullMessageHash);

    SpyAssert.assert(sinonMock.get, 2, [
      [transactions1[0].redeemRequestHash], [transactions2[0].redeemRequestHash],
    ]);

    SpyAssert.assert(sinonMock.save, 2, [
      [redeemRequest], [redeemRequestWithNullMessageHash],
    ]);
    sinon.restore();
  });
});
