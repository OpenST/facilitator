import BigNumber from 'bignumber.js';

import AuxiliaryChain from '../../../src/models/AuxiliaryChain';
import Repositories from '../../../src/repositories/Repositories';
import Util from './util';

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
    lastOriginBlockHeight = new BigNumber('200');
    lastAuxiliaryBlockHeight = new BigNumber('50');
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
      lastOriginBlockHeight,
      lastAuxiliaryBlockHeight,
      createdAt,
      updatedAt,
    );

    await config.repos.auxiliaryChainRepository.save(
      auxiliaryChain,
    );

    const updatedAuxiliaryChain = await config.repos.auxiliaryChainRepository.save(
      auxiliaryChain,
    );

    Util.assertAuxiliaryChainAttributes(updatedAuxiliaryChain, auxiliaryChain);
  });
});
