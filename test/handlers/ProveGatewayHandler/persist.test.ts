import BigNumber from 'bignumber.js';
import assert from '../../test_utils/assert';

import ProveGatewayHandler from '../../../src/handlers/ProveGatewayHandler';
import Gateway from '../../../src/models/Gateway';

import Repositories from '../../../src/repositories/Repositories';
import StubData from "../../test_utils/StubData";

const Utils = require('web3-utils');

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;
let gatewayAddress: string;
let gateway: Gateway;

describe('ProveGatewayhandler.persist()', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    gatewayAddress = '0x0000000000000000000000000000000000000001';
    const chain = '1';
    gateway = StubData.gatewayRecord(chain, gatewayAddress);
    await config.repos.gatewayRepository.save(
      gateway,
    );
  });

  it('should persist successfully', async (): Promise<void> => {
    const updatedLastRemoteProvenBlockHeight = new BigNumber('10');
    const proveGatewayTransactions = [{
      id: '1',
      _gateway: gateway.gatewayAddress,
      _blockHeight: updatedLastRemoteProvenBlockHeight,
      _storageRoot: Utils.sha3('1'),
      _wasAlreadyProved: false,
      contractAddress: '0x00000000000000000000000000000000000000011',
      blockNumber: new BigNumber('100'),
      uts: new BigNumber('1111'),
    }];

    const handler = new ProveGatewayHandler(config.repos.gatewayRepository);
    const updatedGateways = await handler.persist(proveGatewayTransactions);
    const updatedGateway = updatedGateways[0];

    assert.deepEqual(
      updatedGateway && updatedGateway.lastRemoteGatewayProvenBlockHeight,
      updatedLastRemoteProvenBlockHeight,
      'Error updating GatewayProven block height in Gateway model.',
    );
  });

  it('It should throw error when Gateway doesn"t exist', async (): Promise<void> => {
    const updatedLastRemoteProvenBlockHeight = new BigNumber('10');
    const invalidGateway = 'invalidGateway';
    const proveGatewayTransactions = [{
      id: '1',
      _gateway: 'invalidGateway',
      _blockHeight: updatedLastRemoteProvenBlockHeight,
      _storageRoot: Utils.sha3('1'),
      _wasAlreadyProved: false,
      contractAddress: '0x00000000000000000000000000000000000000011',
      blockNumber: new BigNumber('100'),
      uts: new BigNumber('1111'),
    }];

    const handler = new ProveGatewayHandler(config.repos.gatewayRepository);

    assert.isRejected(
      handler.persist(proveGatewayTransactions),
      `Cannot find record for gateway: ${invalidGateway}`,
      'Invalid Gateway record.',
    );
  });

  it('should not update when received provenGatewayBlock height is less than already updated'
    + ' provenGatewayBlock height.', async (): Promise<void> => {
    const updatedLowerLastRemoteProvenBlockHeight = new BigNumber('1');
    const proveGatewayTransactions = [{
      id: '1',
      _gateway: gatewayAddress,
      _blockHeight: updatedLowerLastRemoteProvenBlockHeight,
      _storageRoot: Utils.sha3('1'),
      _wasAlreadyProved: false,
      contractAddress: '0x00000000000000000000000000000000000000011',
      blockNumber: new BigNumber('100'),
      uts: new BigNumber('1111'),
    }];

    const handler = new ProveGatewayHandler(config.repos.gatewayRepository);
    const updatedGateways = await handler.persist(proveGatewayTransactions);
    const updatedGateway = updatedGateways[0];

    assert.deepEqual(
      updatedGateway && updatedGateway.lastRemoteGatewayProvenBlockHeight,
      gateway.lastRemoteGatewayProvenBlockHeight,
      'It should not update lower GatewayProven block height.',
    );
  });

  it('should not update when received provenGatewayBlock height is equal to already updated'
    + ' provenGatewayBlock height.', async (): Promise<void> => {
    const updatedEqualLastRemoteProvenBlockHeight = new BigNumber('5');
    const proveGatewayTransactions = [{
      id: '1',
      _gateway: gatewayAddress,
      _blockHeight: updatedEqualLastRemoteProvenBlockHeight,
      _storageRoot: Utils.sha3('1'),
      _wasAlreadyProved: false,
      contractAddress: '0x00000000000000000000000000000000000000011',
      blockNumber: new BigNumber('100'),
      uts: new BigNumber('1111'),
    }];

    const handler = new ProveGatewayHandler(config.repos.gatewayRepository);
    const updatedGateways = await handler.persist(proveGatewayTransactions);
    const updatedGateway = updatedGateways[0];

    assert.deepEqual(
      updatedGateway && updatedGateway.lastRemoteGatewayProvenBlockHeight,
      gateway.lastRemoteGatewayProvenBlockHeight,
      'It should not update already updated equal GatewayProven block height.',
    );
  });
});
