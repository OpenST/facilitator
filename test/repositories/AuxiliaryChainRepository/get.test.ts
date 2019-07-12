import BigNumber from 'bignumber.js';

import Repositories from '../../../src/repositories/Repositories';
import AuxiliaryChain from '../../../src/models/AuxiliaryChain';
import Util from './util';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const { assert } = chai;

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('AuxiliaryChain::get', (): void => {
  let auxiliaryChain: AuxiliaryChain;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    const chainId = 2;
    const originChainName = 'ropsten';
    const ostGatewayAddress = '0x0000000000000000000000000000000000000001';
    const ostCoGatewayAddress = '0x0000000000000000000000000000000000000002';
    const anchorAddress = '0x0000000000000000000000000000000000000003';
    const coAnchorAddress = '0x0000000000000000000000000000000000000004';
    const lastOriginBlockHeight = new BigNumber('200');
    const lastAuxiliaryBlockHeight = new BigNumber('50');
    const createdAt = new Date();
    const updatedAt = new Date();

    auxiliaryChain = new AuxiliaryChain(
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
  });

  it('should pass when retrieving AuxiliaryChain model', async (): Promise<void> => {
    const getResponse = await config.repos.auxiliaryChainRepository.get(
      auxiliaryChain.chainId,
    );

    Util.assertAuxiliaryChainAttributes(getResponse as AuxiliaryChain, auxiliaryChain);
  });

  it('should return null when querying for non-existing '
    + 'chainId', async (): Promise<void> => {
    const nonExistingChainId = 22;

    const getResponse = await config.repos.auxiliaryChainRepository.get(
      nonExistingChainId,
    );

    assert.strictEqual(
      getResponse,
      null,
      'Non existing AuxiliaryChain object.',
    );
  });
});
