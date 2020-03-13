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
import { assert } from 'chai';
import shared from '../shared';
import Utils from '../utils';
import Repositories
  from '../../../src/m1_facilitator/repositories/Repositories';
import { ArchitectureLayout } from '../../../src/m1_facilitator/manifest/Manifest';
import Directory from '../../../src/m1_facilitator/Directory';

describe('Deposit token ', () => {
  let depositParams: {
    amount: BigNumber;
    beneficiary: string;
    feeGasPrice: BigNumber;
    feeGasLimit: BigNumber;
  };
  it('should deposit token', async (): Promise<void> => {
    depositParams = {
      amount: new BigNumber(100),
      beneficiary: shared.auxiliary.deployer,
      feeGasPrice: new BigNumber(0),
      feeGasLimit: new BigNumber(0),
    };
    await Utils.sendTransaction(shared.contracts.valueToken.methods.approve(
      shared.contracts.erc20Gateway.address,
      depositParams.amount.toString(10),
    ),
    { from: shared.origin.deployer });

    await Utils.sendTransaction(shared.contracts.erc20Gateway.methods.deposit(
      depositParams.amount.toString(10),
      depositParams.beneficiary,
      depositParams.feeGasPrice.toString(10),
      depositParams.feeGasLimit.toString(10),
      shared.contracts.valueToken.address,
    ),
    { from: shared.origin.deployer });
  });

  it('should anchor state root', async (): Promise<void> => {
    const gatewayAddress = await shared.contracts.erc20Cogateway
      .methods.genesisERC20Gateway().call();

    console.log('gateway address ', gatewayAddress);

    // Note: Ensuring that facilitator starts before doing any transactions.
    await new Promise(done => setTimeout(done, 3000));

    const block = await shared.origin.web3.eth.getBlock('latest');

    await Utils.sendTransaction(
      shared.contracts.auxiliaryAnchor.methods.anchorStateRoot(
        block.number,
        block.stateRoot,
      ),
      { from: shared.anchorCoconsensusAddress },
    );
  });

  it('should assert balances', async (): Promise<void> => {
    const repositories = await Repositories.create(
      Directory.getFacilitatorDatabaseFile(
        ArchitectureLayout.MOSAIC1,
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
    assert.isOk(
      balance.eq(depositParams.amount),
      `Beneficiary should have balance ${depositParams.amount.toString(10)}`,
    );
  });
});
