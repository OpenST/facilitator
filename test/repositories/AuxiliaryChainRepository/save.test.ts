import BigNumber from 'bignumber.js';

import Repositories from '../../../src/repositories/Repositories';

import AuxiliaryChain from '../../../src/models/AuxiliaryChain';
import Util from './util';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('AuxiliaryChainRepository::save', (): void => {

  let chainId: number;
  let originChainName: string;
  let ostGatewayAddress: string;
  let ostCoGatewayAddress: string;
  let anchorAddress: string;
  let coAnchorAddress: string;
  let lastProcessedBlockNumber: BigNumber;
  let lastOriginBlockHeight: BigNumber;
  let lastAuxiliaryBlockHeight: BigNumber;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    chainId = 2;
    originChainName = 'ropsten';
    ostGatewayAddress = '0x0000000000000000000000000000000000000001';
    ostCoGatewayAddress = '0x0000000000000000000000000000000000000002';
    anchorAddress = '0x0000000000000000000000000000000000000003';
    coAnchorAddress = '0x0000000000000000000000000000000000000004';
    lastProcessedBlockNumber = new BigNumber("100");
    lastOriginBlockHeight = new BigNumber("200");
    lastAuxiliaryBlockHeight = new BigNumber("50");
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('should pass when creating AuxiliaryChain model.', async (): Promise<void> => {
    const auxiliaryChain = new AuxiliaryChain(
      chainId,
      originChainName,
      ostGatewayAddress,
      ostCoGatewayAddress,
      anchorAddress,
      coAnchorAddress,
      lastProcessedBlockNumber,
      lastOriginBlockHeight,
      lastAuxiliaryBlockHeight,
      createdAt,
      updatedAt,
    );
    const createdAuxiliaryChain = await config.repos.auxiliaryChainRepository.save(
      auxiliaryChain,
    );

    Util.assertAuxiliaryChainAttributes(createdAuxiliaryChain, auxiliaryChain);
  });

  it('should pass when updating AuxiliaryChain model', async (): Promise<void> => {
    const auxiliaryChain = new AuxiliaryChain(
      chainId,
      originChainName,
      ostGatewayAddress,
      ostCoGatewayAddress,
      anchorAddress,
      coAnchorAddress,
      lastProcessedBlockNumber,
      lastOriginBlockHeight,
      lastAuxiliaryBlockHeight,
      createdAt,
      updatedAt,
    );

    await config.repos.auxiliaryChainRepository.save(
      auxiliaryChain,
    );

    auxiliaryChain.lastProcessedBlockNumber = new BigNumber('101');

    const updatedAuxiliaryChain = await config.repos.auxiliaryChainRepository.save(
      auxiliaryChain,
    );

    Util.assertAuxiliaryChainAttributes(updatedAuxiliaryChain, auxiliaryChain);
  });

});
