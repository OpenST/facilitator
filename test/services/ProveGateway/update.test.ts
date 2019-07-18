/* eslint-disable import/no-unresolved */

import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { ProofData, ProofGenerator } from '@openst/mosaic-proof';

import EIP20CoGateway from '../../../src/interacts/EIP20CoGateway';
import InteractsFactory from '../../../src/interacts/InteractsFactory';
import AuxiliaryChain from '../../../src/models/AuxiliaryChain';
import Gateway from '../../../src/models/Gateway';
import GatewayRepository, { GatewayType } from '../../../src/repositories/GatewayRepository';
import { MessageRepository } from '../../../src/repositories/MessageRepository';
import ProveGatewayService from '../../../src/services/ProveGatewayService';

describe('ProveGatewayService::update', (): void => {
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const auxiliaryChainId = 123;
  const coGatewayAddress = '0x0000000000000000000000000000000000000002';
  const lastRemoteGatewayProvenBlockHeight = new BigNumber(2);
  const lastOriginBlockHeight = new BigNumber(3);
  const transactionHash = 'transactionHash';

  const auxiliaryChain = new AuxiliaryChain(auxiliaryChainId);
  auxiliaryChain.lastOriginBlockHeight = lastOriginBlockHeight;

  const gatewayRecord = new Gateway(
    gatewayAddress,
    auxiliaryChainId.toString(),
    GatewayType.Origin,
    coGatewayAddress,
    '0x0000000000000000000000000000000000000003',
    '0x0000000000000000000000000000000000000004',
    new BigNumber('1'),
    true,
    lastRemoteGatewayProvenBlockHeight,
    new Date(),
    new Date(),
  );

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('should react to block height of new anchor state root', async (): Promise<void> => {
    const gatewayRepository = sinon.createStubInstance(GatewayRepository);
    gatewayRepository.get.withArgs(gatewayRecord.gatewayAddress).resolves(gatewayRecord);

    const messageRepository = sinon.createStubInstance(MessageRepository);
    messageRepository.hasPendingOriginMessages
      .withArgs(
        auxiliaryChain.lastOriginBlockHeight as BigNumber,
        gatewayRecord.gatewayAddress,
      )
      .resolves(true);

    const proof: ProofData = {
      address: '0x0000000000000000000000000000000000000005',
      accountProof: [],
      balance: '0x1',
      codeHash: 'codeHash',
      nonce: '0x2',
      storageHash: 'storageHash',
      storageProof: [],
      serializedAccountProof: 'serializedAccountProof',
      encodedAccountValue: 'encodedAccountValue',
      block_number: (auxiliaryChain.lastOriginBlockHeight as BigNumber).toString(16),
    };

    const proofGenerator = sinon.createStubInstance(ProofGenerator);
    proofGenerator.getOutboxProof
      .withArgs(
        gatewayRecord.gatewayAddress,
        [],
        (auxiliaryChain.lastOriginBlockHeight as BigNumber).toString(16),
      )
      .resolves(proof);

    const eip20CoGateway = sinon.createStubInstance(EIP20CoGateway, {
      proveGateway: Promise.resolve(transactionHash),
    });

    const interactsFactory = sinon.createStubInstance(InteractsFactory);
    interactsFactory.getEIP20CoGateway
      .withArgs(
        gatewayRecord.remoteGatewayAddress as string,
      )
      .returns(eip20CoGateway as any as EIP20CoGateway);

    const proveGatewayService = new ProveGatewayService(
      gatewayAddress,
      auxiliaryChainId,
      gatewayRepository as any,
      messageRepository as any,
      proofGenerator as any,
      interactsFactory as any,
    );

    await proveGatewayService.update([auxiliaryChain]);

    sinon.assert.calledOnce(eip20CoGateway.proveGateway);
    sinon.assert.calledWithExactly(
      eip20CoGateway.proveGateway,
      lastOriginBlockHeight,
      proof.encodedAccountValue as string,
      proof.serializedAccountProof as string,
    );
  });
});
