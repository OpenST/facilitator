import sinon from 'sinon';
import Web3 from 'web3';

import { interacts } from '@openst/mosaic-contracts';

import { AUXILIARY_GAS_PRICE, ORIGIN_GAS_PRICE } from '../../../../src/Constants';
import Message from '../../../../src/models/Message';
import GatewayRepository from '../../../../src/repositories/GatewayRepository';
import { MessageStatus, MessageType } from '../../../../src/repositories/MessageRepository';
import ProgressService from '../../../../src/services/redeem_and_unstake/ProgressService';
import Utils from '../../../../src/Utils';
import SpyAssert from '../../../test_utils/SpyAssert';
import StubData from '../../../test_utils/StubData';

describe('ProgressService.update()', () => {
  let coGatewaySpy: any;
  let gatewaySpy: any;
  let progressRedeemSpy: any;
  let progressUnstakeSpy: any;
  let utilsSendTxSpy: any;
  let gatewayRepository: any;
  let eip20CoGatewayMockObject: any;
  let progressService: ProgressService;
  let message: any;
  const originWeb3 = new Web3(null);
  const auxiliaryWeb3 = new Web3(null);
  const originWorkerAddress = '0x0000000000000000000000000000000000000010';
  const auxiliaryWorkerAddress = '0x0000000000000000000000000000000000000011';
  const gatewayAddress = '0x0000000000000000000000000000000000000002';
  const progressRedeemRawTx = 'progressRedeemRawTx';
  const progressUnstakeRawTx = 'progressUnstakeRawTx';
  const fakeTransactionHash = 'fakeHash';
  const coGatewayAddress = '0x0000000000000000000000000000000000000003';

  const gatewayInstance = StubData.gatewayRecord('1234', coGatewayAddress);

  beforeEach(async () => {
    gatewayRepository = sinon.createStubInstance(GatewayRepository, {
      get: Promise.resolve(gatewayInstance),
    });

    progressService = new ProgressService(
      gatewayRepository,
      originWeb3,
      auxiliaryWeb3,
      coGatewayAddress,
      originWorkerAddress,
      auxiliaryWorkerAddress,
    );

    eip20CoGatewayMockObject = {
      methods: {
        progressRedeem: () => {},
      },
    };

    progressRedeemSpy = sinon.replace(
      eip20CoGatewayMockObject.methods,
      'progressRedeem',
      sinon.fake.returns(progressRedeemRawTx),
    );

    coGatewaySpy = sinon.replace(
      interacts,
      'getEIP20CoGateway',
      sinon.fake.returns(eip20CoGatewayMockObject),
    );

    const eip20GatewayMockObject = {
      methods: {
        progressUnstake: () => {},
      },
    };
    progressUnstakeSpy = sinon.replace(
      eip20GatewayMockObject.methods,
      'progressUnstake',
      sinon.fake.returns(progressUnstakeRawTx),
    );
    gatewaySpy = sinon.replace(
      interacts,
      'getEIP20Gateway',
      sinon.fake.returns(eip20GatewayMockObject as any),
    );

    utilsSendTxSpy = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );

    message = sinon.createStubInstance(Message);
    message.gatewayAddress = coGatewayAddress;
    message.messageHash = '0x4223A868';
    message.secret = '0x123AAF';
    message.type = MessageType.Redeem;
    message.isValidSecret.callsFake(() => true);
  });

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('should progress on origin and auxiliary when source and target status '
    + 'is declared', async () => {
    message.sourceStatus = MessageStatus.Declared;
    message.targetStatus = MessageStatus.Declared;

    await progressService.update([message]);

    SpyAssert.assert(
      gatewayRepository.get,
      1,
      [[coGatewayAddress]],
    );

    SpyAssert.assert(
      utilsSendTxSpy,
      2,
      [
        [
          progressRedeemRawTx,
          { gasPrice: AUXILIARY_GAS_PRICE, from: auxiliaryWorkerAddress },
          auxiliaryWeb3,
        ],
        [
          progressUnstakeRawTx,
          { gasPrice: ORIGIN_GAS_PRICE, from: originWorkerAddress },
          originWeb3,
        ],
      ],
    );

    SpyAssert.assert(
      progressRedeemSpy,
      1,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      progressUnstakeSpy,
      1,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      coGatewaySpy,
      1,
      [[auxiliaryWeb3, coGatewayAddress]],
    );

    SpyAssert.assert(
      gatewaySpy,
      1,
      [[originWeb3, gatewayAddress]],
    );

    sinon.restore();
  });

  it('should not progress on origin and auxiliary when source status '
    + 'is not declared', async () => {
    message.sourceStatus = MessageStatus.Undeclared;
    message.targetStatus = MessageStatus.Declared;

    await progressService.update([message]);

    SpyAssert.assert(
      gatewayRepository.get,
      0,
      [[coGatewayAddress]],
    );

    SpyAssert.assert(
      utilsSendTxSpy,
      0,
      [
        [
          progressRedeemRawTx,
          { gasPrice: AUXILIARY_GAS_PRICE, from: auxiliaryWorkerAddress },
          auxiliaryWeb3,
        ],
        [
          progressUnstakeRawTx,
          { gasPrice: ORIGIN_GAS_PRICE, from: originWorkerAddress },
          originWeb3,
        ],
      ],
    );

    SpyAssert.assert(
      progressRedeemSpy,
      0,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      progressUnstakeSpy,
      0,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      coGatewaySpy,
      0,
      [[auxiliaryWeb3, coGatewayAddress]],
    );

    SpyAssert.assert(
      gatewaySpy,
      0,
      [[originWeb3, gatewayAddress]],
    );

    sinon.restore();
  });

  it('should not progress on origin and auxiliary when target status '
    + 'is not declared', async () => {
    message.sourceStatus = MessageStatus.Declared;
    message.targetStatus = MessageStatus.Undeclared;

    await progressService.update([message]);

    SpyAssert.assert(
      gatewayRepository.get,
      0,
      [[coGatewayAddress]],
    );

    SpyAssert.assert(
      utilsSendTxSpy,
      0,
      [
        [
          progressRedeemRawTx,
          { gasPrice: AUXILIARY_GAS_PRICE, from: auxiliaryWorkerAddress },
          auxiliaryWeb3,
        ],
        [
          progressUnstakeRawTx,
          { gasPrice: ORIGIN_GAS_PRICE, from: originWorkerAddress },
          originWeb3,
        ],
      ],
    );

    SpyAssert.assert(
      progressRedeemSpy,
      0,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      progressUnstakeSpy,
      0,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      coGatewaySpy,
      0,
      [[auxiliaryWeb3, coGatewayAddress]],
    );

    SpyAssert.assert(
      gatewaySpy,
      0,
      [[originWeb3, gatewayAddress]],
    );

    sinon.restore();
  });

  it('should not progress on origin and auxiliary when secret is invalid', async () => {
    message.sourceStatus = MessageStatus.Declared;
    message.targetStatus = MessageStatus.Declared;

    message.isValidSecret.callsFake(() => false);
    await progressService.update([message]);

    SpyAssert.assert(
      gatewayRepository.get,
      0,
      [[coGatewayAddress]],
    );

    SpyAssert.assert(
      utilsSendTxSpy,
      0,
      [
        [
          progressRedeemRawTx,
          { gasPrice: AUXILIARY_GAS_PRICE, from: auxiliaryWorkerAddress },
          auxiliaryWeb3,
        ],
        [
          progressUnstakeRawTx,
          { gasPrice: ORIGIN_GAS_PRICE, from: originWorkerAddress },
          originWeb3,
        ],
      ],
    );

    SpyAssert.assert(
      progressRedeemSpy,
      0,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      progressUnstakeSpy,
      0,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      coGatewaySpy,
      0,
      [[auxiliaryWeb3, coGatewayAddress]],
    );

    SpyAssert.assert(
      gatewaySpy,
      0,
      [[originWeb3, gatewayAddress]],
    );

    sinon.restore();
  });

  it('should not progress on origin and auxiliary when message type is not redeem', async () => {
    message.sourceStatus = MessageStatus.Declared;
    message.targetStatus = MessageStatus.Declared;
    message.type = MessageType.Stake;

    await progressService.update([message]);

    SpyAssert.assert(
      gatewayRepository.get,
      0,
      [[coGatewayAddress]],
    );

    SpyAssert.assert(
      utilsSendTxSpy,
      0,
      [
        [
          progressRedeemRawTx,
          { gasPrice: AUXILIARY_GAS_PRICE, from: auxiliaryWorkerAddress },
          auxiliaryWeb3,
        ],
        [
          progressUnstakeRawTx,
          { gasPrice: ORIGIN_GAS_PRICE, from: originWorkerAddress },
          originWeb3,
        ],
      ],
    );

    SpyAssert.assert(
      progressRedeemSpy,
      0,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      progressUnstakeSpy,
      0,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      coGatewaySpy,
      0,
      [[auxiliaryWeb3, coGatewayAddress]],
    );

    SpyAssert.assert(
      gatewaySpy,
      0,
      [[originWeb3, gatewayAddress]],
    );

    sinon.restore();
  });
});
