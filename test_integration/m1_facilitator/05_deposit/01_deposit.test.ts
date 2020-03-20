// Copyright 2020 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Mosaic from 'Mosaic';
import BigNumber from 'bignumber.js';
import * as web3Utils from 'web3-utils';
import { assert } from 'chai';
import shared from '../shared';
import Utils from '../utils';
import Repositories
  from '../../../src/m1_facilitator/repositories/Repositories';
import { ArchitectureLayout } from '../../../src/m1_facilitator/manifest/Manifest';
import Directory from '../../../src/m1_facilitator/Directory';
import {
  MessageStatus,
  MessageType,
} from '../../../src/m1_facilitator/models/Message';

describe('Deposit token ', () => {
  let depositParams: {
    amount: BigNumber;
    beneficiary: string;
    feeGasPrice: BigNumber;
    feeGasLimit: BigNumber;
    sender: string;
  };

  let messageHash: string;
  let declarationBlockNumber: string;
  let anchorBlockNumber: BigNumber;

  it('should deposit token', async (): Promise<void> => {
    depositParams = {
      amount: new BigNumber(100),
      beneficiary: shared.auxiliary.deployer,
      feeGasPrice: new BigNumber(1),
      feeGasLimit: new BigNumber(1),
      sender: shared.origin.deployer,
    };
    await Utils.sendTransaction(shared.contracts.valueToken.methods.approve(
      shared.contracts.erc20Gateway.address,
      depositParams.amount.toString(10),
    ),
    { from: shared.origin.deployer });

    const receipt = await Utils.sendTransaction(
      shared.contracts.erc20Gateway.methods.deposit(
        depositParams.amount.toString(10),
        depositParams.beneficiary,
        depositParams.feeGasPrice.toString(10),
        depositParams.feeGasLimit.toString(10),
        shared.contracts.valueToken.address,
      ),
      { from: depositParams.sender },
    );

    // @ts-ignore
    ({ messageHash } = receipt.events.DepositIntentDeclared.returnValues);
    // @ts-ignore
    declarationBlockNumber = receipt.blockNumber;
  });

  it('should anchor state root', async (): Promise<void> => {
    // Note: Ensuring that facilitator starts before doing any transactions.
    await new Promise(done => setTimeout(done, 3000));

    const block = await shared.origin.web3.eth.getBlock('latest');

    anchorBlockNumber = new BigNumber(block.number);
    await Utils.sendTransaction(
      shared.contracts.auxiliaryAnchor.methods.anchorStateRoot(
        block.number,
        block.stateRoot,
      ),
      { from: shared.anchorCoconsensusAddress },
    );
  });

  it('Assert balances', async (): Promise<void> => {
    const repositories = await Repositories.create(
      Directory.getFacilitatorDatabaseFile(
        ArchitectureLayout.MOSAIC_0_14_GEN_1,
        shared.contracts.erc20Gateway.address,
      ),
    );
    await Utils.waitForCondition(async (): Promise<boolean> => {
      const tokenPair = await repositories.erc20GatewayTokenPairRepository.get(
        shared.contracts.erc20Gateway.address,
        shared.contracts.valueToken.address,
      );

      return tokenPair !== null;
    });

    const utilityTokenAddress = await shared.contracts.erc20Cogateway
      .methods.utilityTokens(
        shared.contracts.valueToken.address,
      ).call();

    const utilityToken = Mosaic.interacts.getUtilityToken(
      shared.auxiliary.web3, utilityTokenAddress,
    );

    const balance = new BigNumber(
      await utilityToken.methods.balanceOf(shared.auxiliary.deployer).call(),
    );

    const reward = depositParams.feeGasLimit.multipliedBy(depositParams.feeGasPrice);
    const mintBalance = depositParams.amount.minus(reward);
    assert.isOk(
      balance.eq(mintBalance),
      `Beneficiary should have balance ${mintBalance.toString(10)}`,
    );
  });

  it('Assert database state', async (): Promise<void> => {
    const gatewayAddresses = shared.contracts.erc20Gateway.address;
    const repositories = await Repositories.create(
      Directory.getFacilitatorDatabaseFile(
        ArchitectureLayout.MOSAIC_0_14_GEN_1,
        gatewayAddresses,
      ),
    );

    const {
      messageRepository,
      gatewayRepository,
      depositIntentRepository,
      erc20GatewayTokenPairRepository,
      anchorRepository,
    } = repositories;

    const message = await messageRepository.get(messageHash);

    assert.isOk(message !== null, 'Message should exist');
    assert.strictEqual(
      message && message.sourceStatus,
      MessageStatus.Declared,
      'Source message status must be declared',
    );
    assert.strictEqual(
      message && message.targetStatus,
      MessageStatus.Declared,
      'Target message status must be declared',
    );
    assert.strictEqual(
      message && message.sender,
      depositParams.sender,
      'Message sender must match',
    );
    assert.isOk(
      message
      && message.sourceDeclarationBlockNumber
      && message.sourceDeclarationBlockNumber.isEqualTo(
        new BigNumber(declarationBlockNumber),
      ),
      'Message declaration block number must match',
    );
    assert.strictEqual(
      message && message.type,
      MessageType.Deposit,
      'Message declaration block number must match',
    );
    assert.strictEqual(
      message && message.gatewayAddress,
      gatewayAddresses,
      'Gateway address must match',
    );
    assert.isOk(
      message && message.feeGasPrice
      && message.feeGasPrice.isEqualTo(depositParams.feeGasPrice),
      'Fee gas price must match',
    );
    assert.isOk(
      message && message.feeGasLimit
      && message.feeGasLimit.isEqualTo(depositParams.feeGasLimit),
      'Fee gas limit must match',
    );

    const depositIntent = await depositIntentRepository.get(messageHash);

    assert.isOk(
      depositIntent && depositIntent.amount
      && depositIntent.amount.isEqualTo(depositParams.amount),
      'Deposit amount must match',
    );

    assert.strictEqual(
      depositIntent && depositIntent.beneficiary,
      depositParams.beneficiary,
      'Beneficiary address must match',
    );

    const valueToken = shared.contracts.valueToken.address;
    assert.strictEqual(
      depositIntent && depositIntent.tokenAddress,
      valueToken,
      'Value token address must match',
    );

    const gatewayRecord = await gatewayRepository.get(
      shared.contracts.erc20Cogateway.address,
    );

    assert.isOk(
      gatewayRecord && gatewayRecord.remoteGatewayLastProvenBlockNumber
      && gatewayRecord.remoteGatewayLastProvenBlockNumber.isEqualTo(anchorBlockNumber),
      'Remote gateway last broken block number should be same as anchor height',
    );

    const tokenPairRecord = await erc20GatewayTokenPairRepository.get(
      gatewayAddresses,
      valueToken,
    );

    assert.isOk(tokenPairRecord !== null, 'Token pair repository record must exists');

    assert.isOk(
      tokenPairRecord && web3Utils.isAddress(tokenPairRecord.utilityToken),
      'Utility token address must exists in token pair record',
    );
    const auxAnchor = await anchorRepository.get(shared.contracts.auxiliaryAnchor.address);

    assert.isOk(
      auxAnchor && auxAnchor.lastAnchoredBlockNumber
      && auxAnchor.lastAnchoredBlockNumber.isEqualTo(anchorBlockNumber),
      'Anchor block height must be updated',
    );
  });
});
