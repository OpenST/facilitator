import BigNumber from 'bignumber.js';

import {
  GatewayType,
} from '../../../src/repositories/GatewayRepository';

import Repositories from '../../../src/repositories/Repositories';
import Gateway from '../../../src/models/Gateway';
import Util from './util';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const { assert } = chai;

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('Gateway::get', (): void => {
  let gateway: Gateway;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    const gatewayAddress = '0x0000000000000000000000000000000000000001';
    const chainId = 1;
    const gatewayType = GatewayType.Auxiliary;
    const remoteGatewayAddress = '0x0000000000000000000000000000000000000002';
    const tokenAddress = '0x0000000000000000000000000000000000000003';
    const anchorAddress = '0x0000000000000000000000000000000000000004';
    const bounty = new BigNumber(100);
    const activation = true;
    const lastRemoteGatewayProvenBlockHeight = new BigNumber(1000);
    const createdAt = new Date();
    const updatedAt = new Date();

    gateway = new Gateway(
      gatewayAddress,
      chainId,
      gatewayType,
      remoteGatewayAddress,
      tokenAddress,
      anchorAddress,
      bounty,
      activation,
      lastRemoteGatewayProvenBlockHeight,
      createdAt,
      updatedAt,
    );
    await config.repos.gatewayRepository.save(
      gateway,
    );
  });

  it('should pass when retrieving Gateway model', async (): Promise<void> => {
    const getResponse = await config.repos.gatewayRepository.get(
      gateway.gatewayAddress,
    );

    Util.assertGatewayAttributes(getResponse as Gateway, gateway);
  });

  it('should return null when querying for non-existing '
    + 'message contract address', async (): Promise<void> => {
    const nonExistingGatewayAddress = '0x0000000000000000000000000000000000000033';

    const getResponse = await config.repos.gatewayRepository.get(
      nonExistingGatewayAddress,
    );

    assert.strictEqual(
      getResponse,
      null,
      'Non existing message address,',
    );
  });
});
