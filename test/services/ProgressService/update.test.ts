import * as sinon from 'sinon';
import { interacts } from '@openst/mosaic-contracts';
import BigNumber from 'bignumber.js';
import Utils from '../../../src/Utils';
import ProgressService from '../../../src/services/ProgressService';
import {
  MessageStatus,
} from '../../../src/repositories/MessageRepository';
import { ORIGIN_GAS_PRICE, AUXILIARY_GAS_PRICE } from '../../../src/Constants';
import Message from '../../../src/models/Message';
import Gateway from '../../../src/models/Gateway';
import GatewayRepository, { GatewayType } from '../../../src/repositories/GatewayRepository';
import SpyAssert from '../../test_utils/SpyAssert';
import assert from '../../test_utils/assert';

const Web3 = require('web3');

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
  const originWeb3 = new Web3();
  const auxiliaryWeb3 = new Web3();
  const originWorkerAddress = '0xA1e801AbF4288a38FfFEa3084C826B810c5d5294';
  const auxiliaryWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const progressMintRawTx = 'progressMintRawTx';
  const progressStakeRawTx = 'progressStakeRawTx';
  const fakeTransactionHash = 'fakeHash';
  const coGatewayAddress = '0x0000000000000000000000000000000000000002';
  const chain = '2';
  const gatewayInstance = new Gateway(
    gatewayAddress,
    chain,
    GatewayType.Origin,
    coGatewayAddress,
    '0x0000000000000000000000000000000000000004',
    '0x0000000000000000000000000000000000000003',
    new BigNumber('1'),
    true,
    new BigNumber('1'),
    new Date(),
    new Date(),
  );

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
      sinon.fake.returns(fakeTransactionHash),
    );

    message = sinon.createStubInstance(Message);
    message.gatewayAddress = gatewayAddress;
    message.messageHash = '0x4223A868';
    message.hashLock = '0x123AAF';
    message.isValidSecret.callsFake(() => true);
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
        [progressStakeRawTx, { gasPrice: ORIGIN_GAS_PRICE, from: originWorkerAddress }],
        [progressMintRawTx, { gasPrice: AUXILIARY_GAS_PRICE, from: auxiliaryWorkerAddress }],
      ],
    );

    SpyAssert.assert(
      progressMintSpy,
      1,
      [[message.messageHash, message.hashLock]],
    );

    SpyAssert.assert(
      progressStakeSpy,
      1,
      [[message.messageHash, message.hashLock]],
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

  it('should progress on origin when source status is declared', async () => {
    message.sourceStatus = MessageStatus.Declared;

    await progressService.update([message]);

    SpyAssert.assert(
      utilsSpy,
      1,
      [[progressStakeRawTx, { gasPrice: ORIGIN_GAS_PRICE, from: originWorkerAddress }]],
    );

    SpyAssert.assert(
      progressStakeSpy,
      1,
      [[message.messageHash, message.hashLock]],
    );

    SpyAssert.assert(
      gatewaySpy,
      1,
      [[originWeb3, gatewayAddress]],
    );

    sinon.restore();
  });

  it('should progress on auxiliary when target status '
    + 'is declared', async () => {
    message.targetStatus = MessageStatus.Declared;

    await progressService.update([message]);

    SpyAssert.assert(
      gatewayRepository.get,
      1,
      [[gatewayAddress]],
    );

    SpyAssert.assert(
      utilsSpy,
      1,
      [
        [progressMintRawTx, { gasPrice: AUXILIARY_GAS_PRICE, from: auxiliaryWorkerAddress }],
      ],
    );

    SpyAssert.assert(
      progressMintSpy,
      1,
      [[message.messageHash, message.hashLock]],
    );

    SpyAssert.assert(
      coGatewaySpy,
      1,
      [[auxiliaryWeb3, coGatewayAddress]],
    );

    sinon.restore();
  });

  it('should fail to react if gateway details does not exists', async (): Promise<void> => {
    const gatewayRepositoryNull = sinon.createStubInstance(GatewayRepository, {
      get: Promise.resolve(null),
    });
    progressService = new ProgressService(
      gatewayRepositoryNull as any,
      originWeb3,
      auxiliaryWeb3,
      gatewayAddress,
      originWorkerAddress,
      auxiliaryWorkerAddress,
    );

    const messageStub = sinon.createStubInstance(Message);
    messageStub.targetStatus = MessageStatus.Declared;
    messageStub.messageHash = '0x4223A868';
    messageStub.hashLock = '0x123AAF';
    messageStub.isValidSecret.callsFake(() => true);

    await assert.isRejected(
      progressService.update(
        [messageStub],
      ),
      'Gateway record does not exist for given gateway',
      'It must fail if gateway record does not exists.',
    );

    sinon.restore();
  });
});
