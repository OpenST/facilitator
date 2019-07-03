
import { assert } from 'chai';
import * as sinon from 'sinon';

import BigNumber from 'bignumber.js';
import { AuxiliaryChainRepository } from '../../../src/models/AuxiliaryChainRepository';

import SpyAssert from '../../utils/SpyAssert';
import AnchorHandler from '../../../src/handlers/AnchorHandler';
import StubData from '../../utils/StubData';

describe('AnchorHandler.persist()', () => {
  const auxiliaryChainId = 123;
  const anchorAddress = '0x0000000000000000000000000000000000000003';
  const someOtherAnchor = '0x0000000000000000000000000000000000000004';
  const blockHeight = new BigNumber(10);
  const transactions = [{
    contractAddress: someOtherAnchor,
    _blockHeight: blockHeight.toString(10),
  }];

  it('should update latest block height of interested anchor', async () => {
    const update = sinon.stub();
    const transactionsWithInterestedAnchor = [{
      contractAddress: anchorAddress,
      _blockHeight: blockHeight.toString(10),
    }];

    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      anchorAddress,
      blockHeight.sub(1),
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        update: update as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new AnchorHandler(sinonMock as any, auxiliaryChainId);

    const models = await handler.persist(transactionsWithInterestedAnchor);

    const expectedModel = auxiliaryChainRecord;
    expectedModel.lastOriginBlockHeight = blockHeight;
    assert.equal(models.length, transactionsWithInterestedAnchor.length, 'Number of models must be equal to transactions');
    assert.deepStrictEqual(models[0], expectedModel);
    SpyAssert.assert(update, 1, [[expectedModel]]);
  });

  it('should not update latest block height for non interested anchor', async () => {
    const update = sinon.stub();
    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      anchorAddress,
      blockHeight.sub(1),
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        update: update as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new AnchorHandler(sinonMock as any, auxiliaryChainId);

    const models = await handler.persist(transactions);

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    assert.deepStrictEqual(models[0], auxiliaryChainRecord);
    SpyAssert.assert(update, 0, [[]]);
  });

  it('should not update latest block height for interested anchor with lower block height', async () => {

    const update = sinon.stub();
    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      anchorAddress,
      blockHeight.plus(1),
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        update: update as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new AnchorHandler(sinonMock as any, auxiliaryChainId);

    const models = await handler.persist(transactions);

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    assert.deepStrictEqual(models[0], auxiliaryChainRecord);
    SpyAssert.assert(update, 0, [[]]);
  });

  it('should not update latest block height for interested anchor with equal block height', async () => {

    const update = sinon.stub();
    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      anchorAddress,
      blockHeight,
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        update: update as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new AnchorHandler(sinonMock as any, auxiliaryChainId);

    const models = await handler.persist(transactions);

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    assert.deepStrictEqual(models[0], auxiliaryChainRecord);
    SpyAssert.assert(update, 0, [[]]);
  });
});
