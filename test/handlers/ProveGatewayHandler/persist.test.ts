import assert from '../../test_utils/assert';

import BigNumber from 'bignumber.js';
import ProveGatewayHandler from '../../../src/handlers/ProveGatewayHandler';
import Gateway from '../../../src/models/Gateway';
import {GatewayType} from '../../../src/repositories/GatewayRepository';

import Repositories from "../../../src/repositories/Repositories";

const Utils = require('web3-utils');

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;
let gatewayAddress: string;
let lastRemoteGatewayProvenBlockHeight: BigNumber;

describe('ProveGatewayhandler.persist()', (): void => {

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    gatewayAddress = '0x0000000000000000000000000000000000000001';
    const chain = '1';
    const gatewayType = GatewayType.Auxiliary;
    const remoteGatewayAddress = '0x0000000000000000000000000000000000000002';
    const tokenAddress = '0x0000000000000000000000000000000000000003';
    const anchorAddress = '0x0000000000000000000000000000000000000004';
    const bounty = new BigNumber(100);
    const activation = true;
    lastRemoteGatewayProvenBlockHeight = new BigNumber('5');
    const createdAt = new Date();
    const updatedAt = new Date();
    const gateway = new Gateway(
      gatewayAddress,
      chain,
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

  it('should persist successfully', async (): Promise<void> => {

    const updatedLastRemoteProvenBlockHeight = new BigNumber("10");
    const proveGatewayTransactions = [{
      id: '1',
      _gateway: gatewayAddress,
      _blockHeight: updatedLastRemoteProvenBlockHeight,
      _storageRoot: Utils.sha3('1'),
      _wasAlreadyProved: false,
      contractAddress: '0x00000000000000000000000000000000000000011',
      blockNumber: new BigNumber("100"),
      uts: new BigNumber('1111')
    }];

    const handler = new ProveGatewayHandler(config.repos.gatewayRepository);
    await handler.persist(proveGatewayTransactions);

    const updatedGateway = await config.repos.gatewayRepository.get(gatewayAddress);
    assert.deepEqual(
      updatedGateway!.lastRemoteGatewayProvenBlockHeight,
      updatedLastRemoteProvenBlockHeight,
      "Error updating GatewayProven block height in Gateway model."
    );
  });

  it('It should throw error when Gateway doesn"t exist', async (): Promise<void> => {

    const updatedLastRemoteProvenBlockHeight = new BigNumber("10");
    const invalidGateway = 'invalidGateway';
    const proveGatewayTransactions = [{
      id: '1',
      _gateway: 'invalidGateway',
      _blockHeight: updatedLastRemoteProvenBlockHeight,
      _storageRoot: Utils.sha3('1'),
      _wasAlreadyProved: false,
      contractAddress: '0x00000000000000000000000000000000000000011',
      blockNumber: new BigNumber("100"),
      uts: new BigNumber('1111')
    }];

    const handler = new ProveGatewayHandler(config.repos.gatewayRepository);

    assert.isRejected(
      handler.persist(proveGatewayTransactions),
      `Cannot find record for gateway: ${invalidGateway}`,
      'Invalid Gateway record.',
    );
  });

  it('should not update when received provenGatewayBlock height is less than already updated' +
    ' provenGatewayBlock height.', async (): Promise<void> => {

    const updatedLowerLastRemoteProvenBlockHeight = new BigNumber("1");
    const proveGatewayTransactions = [{
      id: '1',
      _gateway: gatewayAddress,
      _blockHeight: updatedLowerLastRemoteProvenBlockHeight,
      _storageRoot: Utils.sha3('1'),
      _wasAlreadyProved: false,
      contractAddress: '0x00000000000000000000000000000000000000011',
      blockNumber: new BigNumber("100"),
      uts: new BigNumber('1111')
    }];

    const handler = new ProveGatewayHandler(config.repos.gatewayRepository);
    await handler.persist(proveGatewayTransactions);

    const updatedGateway = await config.repos.gatewayRepository.get(gatewayAddress);
    assert.deepEqual(
      updatedGateway!.lastRemoteGatewayProvenBlockHeight,
      lastRemoteGatewayProvenBlockHeight,
      "It should not update lower GatewayProven block height."
    );
  });
});
