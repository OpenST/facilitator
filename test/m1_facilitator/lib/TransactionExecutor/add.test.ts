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

import sinon from 'sinon';
import Web3 from 'web3';
import { TransactionObject } from 'web3/eth/types';
import BigNumber from 'bignumber.js';
// import Mosaic from 'Mosaic';
import TransactionExecutor from '../../../../src/m1_facilitator/lib/TransactionExecutor';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';
import AvatarAccount from '../../../../src/m1_facilitator/manifest/AvatarAccount';
import Transaction from '../../../../src/m1_facilitator/models/Transaction';

describe('TransactionExecutor::add', async (): Promise<void> => {
  const repositories = await Repositories.create();
  const gasPrice = new BigNumber('1000000000');
  const gas = new BigNumber('9999');
  const web3 = new Web3('');
  const web3Account = web3.eth.accounts.create();
  const password = 'password';
  const avatarAccount = AvatarAccount.load(
    web3,
    web3Account.encrypt(password),
    password,
  );
  const transactionExecutor = new TransactionExecutor(
    repositories.transactionRepository,
    web3,
    gasPrice,
    avatarAccount,
  );
  beforeEach(async (): Promise<void> => {
    // const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(this.web3, cogatewayAddress);

    // return erc20Cogateway.methods.confirmDeposit(
    //   (depositIntent.tokenAddress as string),
    //   (depositIntent.amount as BigNumber).toString(10),
    //   depositIntent.beneficiary as string,
    //   (message.feeGasPrice as BigNumber).toString(10),
    //   (message.feeGasLimit as BigNumber).toString(10),
    //   message.sender as string,
    //   blockNumber.toString(10),
    //   // @ts-ignore
    //   proof.storageProof[0].serializedProof,
    // );
  });

  it('should enqueue transaction successfully ', async (): Promise<void> => {
    await transactionExecutor.add(
      rawTx,
    );
    const transaction = new Transaction(
      web3Account.address,
      rawTx,
      gasPrice,
      gas,
    );
  });
});
