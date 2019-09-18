import sinon from 'sinon';
import Web3 from 'web3';

import { interacts } from '@openst/mosaic-contracts';

import { AUXILIARY_GAS_PRICE, ORIGIN_GAS_PRICE } from '../../../../src/Constants';
import Message from '../../../../src/models/Message';
import GatewayRepository from '../../../../src/repositories/GatewayRepository';
import { MessageStatus, MessageType } from '../../../../src/repositories/MessageRepository';
import ProgressService from '../../../../src/services/stake_and_mint/ProgressService';
import Utils from '../../../../src/Utils';
import SpyAssert from '../../../test_utils/SpyAssert';
import StubData from '../../../test_utils/StubData';

describe('ProgressService.update()', () => {
  let coGatewaySpy: any;
  let gatewaySpy: any;
  let progressMintSpy: any;
  let progressStakeSpy: any;
  let utilsSpy: any;
  let gatewayRepository: any;
  let eip20GatewayMockObject: any;
  let progressService: ProgressService;
  let message: any;
  const originWeb3 = new Web3(null);
  const auxiliaryWeb3 = new Web3(null);
  const originWorkerAddress = '0xA1e801AbF4288a38FfFEa3084C826B810c5d5294';
  const auxiliaryWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const progressMintRawTx = 'progressMintRawTx';
  const progressStakeRawTx = 'progressStakeRawTx';
  const fakeTransactionHash = 'fakeHash';
  const coGatewayAddress = '0x0000000000000000000000000000000000000002';

  const gatewayInstance = StubData.gatewayRecord();

  beforeEach(async () => {
    gatewayRepository = sinon.createStubInstance(GatewayRepository, {
      get: Promise.resolve(gatewayInstance),
    });

    progressService = new ProgressService(
      gatewayRepository,
      originWeb3,
      auxiliaryWeb3,
      gatewayAddress,
      originWorkerAddress,
      auxiliaryWorkerAddress,
    );

    eip20GatewayMockObject = {
      methods: {
        progressStake: () => {},
      },
    };

    progressStakeSpy = sinon.replace(
      eip20GatewayMockObject.methods,
      'progressStake',
      sinon.fake.returns(progressStakeRawTx),
    );

    gatewaySpy = sinon.replace(
      interacts,
      'getEIP20Gateway',
      sinon.fake.returns(eip20GatewayMockObject),
    );

    const eip20CoGatewayMockObject = {
      methods: {
        progressMint: () => {},
      },
    };
    progressMintSpy = sinon.replace(
      eip20CoGatewayMockObject.methods,
      'progressMint',
      sinon.fake.returns(progressMintRawTx),
    );
    coGatewaySpy = sinon.replace(
      interacts,
      'getEIP20CoGateway',
      sinon.fake.returns(eip20CoGatewayMockObject as any),
    );

    utilsSpy = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );

    message = sinon.createStubInstance(Message);
    message.gatewayAddress = gatewayAddress;
    message.messageHash = '0x4223A868';
    message.type = MessageType.Stake;
    message.secret = '0x123AAF';
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
      [[gatewayAddress]],
    );

    SpyAssert.assert(
      utilsSpy,
      2,
      [
        [progressStakeRawTx, { gasPrice: ORIGIN_GAS_PRICE, from: originWorkerAddress }, originWeb3],
        [
          progressMintRawTx,
          { gasPrice: AUXILIARY_GAS_PRICE, from: auxiliaryWorkerAddress },
          auxiliaryWeb3,
        ],
      ],
    );

    SpyAssert.assert(
      progressMintSpy,
      1,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      progressStakeSpy,
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

  it('should not progress on origin and auxiliary when secret is inavlid', async () => {
      message.sourceStatus = MessageStatus.Declared;
      message.targetStatus = MessageStatus.Declared;

      message.isValidSecret.callsFake(() => false);

      await progressService.update([message]);

      SpyAssert.assert(
        gatewayRepository.get,
        0,
        [[gatewayAddress]],
      );

      SpyAssert.assert(
        utilsSpy,
        0,
        [
          [progressStakeRawTx, { gasPrice: ORIGIN_GAS_PRICE, from: originWorkerAddress }, originWeb3],
          [progressMintRawTx, { gasPrice: AUXILIARY_GAS_PRICE, from: auxiliaryWorkerAddress }, auxiliaryWeb3],
        ],
      );

      SpyAssert.assert(
        progressMintSpy,
        0,
        [[message.messageHash, message.secret]],
      );

      SpyAssert.assert(
        progressStakeSpy,
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

  it('should not progress on origin and auxiliary when message type is not stake ',
    async () => {
    message.sourceStatus = MessageStatus.Declared;
    message.targetStatus = MessageStatus.Declared;
    message.type = MessageType.Redeem;

    await progressService.update([message]);

    SpyAssert.assert(
      gatewayRepository.get,
      0,
      [[gatewayAddress]],
    );

    SpyAssert.assert(
      utilsSpy,
      0,
      [
        [progressStakeRawTx, { gasPrice: ORIGIN_GAS_PRICE, from: originWorkerAddress }, originWeb3],
        [progressMintRawTx, { gasPrice: AUXILIARY_GAS_PRICE, from: auxiliaryWorkerAddress }, auxiliaryWeb3],
      ],
    );

    SpyAssert.assert(
      progressMintSpy,
      0,
      [[message.messageHash, message.secret]],
    );

    SpyAssert.assert(
      progressStakeSpy,
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
