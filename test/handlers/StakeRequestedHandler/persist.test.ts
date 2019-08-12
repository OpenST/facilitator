import BigNumber from 'bignumber.js';
import sinon from 'sinon';
import * as Web3Utils from 'web3-utils';

import StakeRequestHandler from '../../../src/handlers/StakeRequestHandler';
import StakeRequest from '../../../src/models/StakeRequest';
import StakeRequestRepository from '../../../src/repositories/StakeRequestRepository';
import assert from '../../test_utils/assert';
import SpyAssert from '../../test_utils/SpyAssert';

describe('StakeRequestedHandler.persist()', (): void => {
  it('should persist successfully when stakeRequesteds is received first time for' +
    ' stakeRequestHash', async (): Promise<void> => {
    const gatewayAddress = '0x0000000000000000000000000000000000000002';
    const transactions = [{
      id: '1',
      stakeRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      gateway: gatewayAddress,
      staker: '0x0000000000000000000000000000000000000003',
      stakerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '10',
    }];

    const saveStub = sinon.stub();
    const sinonMock = sinon.createStubInstance(StakeRequestRepository, {
      save: saveStub as any,
    });
    const handler = new StakeRequestHandler(
      sinonMock as any,
      gatewayAddress,
    );

    const models = await handler.persist(transactions);

    const stakeRequest = new StakeRequest(
      transactions[0].stakeRequestHash,
      new BigNumber(transactions[0].amount),
      Web3Utils.toChecksumAddress(transactions[0].beneficiary),
      new BigNumber(transactions[0].gasPrice),
      new BigNumber(transactions[0].gasLimit),
      new BigNumber(transactions[0].nonce),
      Web3Utils.toChecksumAddress(transactions[0].gateway),
      Web3Utils.toChecksumAddress(transactions[0].staker),
      Web3Utils.toChecksumAddress(transactions[0].stakerProxy),
      new BigNumber(transactions[0].blockNumber),
    );

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );
    assert.deepStrictEqual(models[0], stakeRequest);
    SpyAssert.assert(saveStub, 1, [[stakeRequest]]);
    sinon.restore();
  });

  it('should update messageHash as undefined and blockNumber when stakeRequest ' +
    'is already present', async (): Promise<void> => {
    const transactions1 = [{
      id: '1',
      stakeRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      gateway: '0x0000000000000000000000000000000000000002',
      staker: '0x0000000000000000000000000000000000000003',
      stakerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '10',
    }];
    const stakeRequest1 = new StakeRequest(
      transactions1[0].stakeRequestHash,
      new BigNumber(transactions1[0].amount),
      Web3Utils.toChecksumAddress(transactions1[0].beneficiary),
      new BigNumber(transactions1[0].gasPrice),
      new BigNumber(transactions1[0].gasLimit),
      new BigNumber(transactions1[0].nonce),
      Web3Utils.toChecksumAddress(transactions1[0].gateway),
      Web3Utils.toChecksumAddress(transactions1[0].staker),
      Web3Utils.toChecksumAddress(transactions1[0].stakerProxy),
      new BigNumber(transactions1[0].blockNumber),
    );

    // Transaction with higher block number.
    const transactions2 = [{
      id: '1',
      stakeRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      gateway: '0x0000000000000000000000000000000000000002',
      staker: '0x0000000000000000000000000000000000000003',
      stakerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '11',
    }];
    const stakeRequest2 = new StakeRequest(
      transactions2[0].stakeRequestHash,
      new BigNumber(transactions2[0].amount),
      Web3Utils.toChecksumAddress(transactions2[0].beneficiary),
      new BigNumber(transactions2[0].gasPrice),
      new BigNumber(transactions2[0].gasLimit),
      new BigNumber(transactions2[0].nonce),
      Web3Utils.toChecksumAddress(transactions2[0].gateway),
      Web3Utils.toChecksumAddress(transactions2[0].staker),
      Web3Utils.toChecksumAddress(transactions2[0].stakerProxy),
      new BigNumber(transactions2[0].blockNumber),
      undefined, // Message hash should be undefined.
    );

    const saveStub = sinon.stub();
    const sinonMock = sinon.createStubInstance(StakeRequestRepository, {});
    const handler = new StakeRequestHandler(sinonMock as any);

    sinonMock.save.onFirstCall().returns(Promise.resolve(saveStub as any));
    sinonMock.save.onSecondCall().returns(Promise.resolve(saveStub as any));

    sinonMock.get.onFirstCall().returns(Promise.resolve(null));
    sinonMock.get.onSecondCall().returns(Promise.resolve(stakeRequest1));

    const models1 = await handler.persist(transactions1);
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

    assert.deepStrictEqual(models2[0], stakeRequest2);

    SpyAssert.assert(sinonMock.get, 2, [
      [transactions1[0].stakeRequestHash], [transactions2[0].stakeRequestHash]
    ]);
    sinon.restore();
  });
});
