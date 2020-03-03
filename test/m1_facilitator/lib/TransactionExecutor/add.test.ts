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

import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import Mosaic from 'Mosaic';

import { ERC20Cogateway } from 'Mosaic/dist/interacts/ERC20Cogateway';
import assert from '../../../test_utils/assert';
import TransactionExecutor from '../../../../src/m1_facilitator/lib/TransactionExecutor';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';
import AvatarAccount from '../../../../src/m1_facilitator/manifest/AvatarAccount';

interface ConfirmDepositParams {
  valueToken: string;
  amount: string;
  beneficiary: string;
  feeGasPrice: string;
  feeGasLimit: string;
  depositor: string;
  blockNumber: string;
  rlpParentNodes: string;
}

function getEncodedFunctionAbi(web3: Web3, confirmDepositParams: ConfirmDepositParams): string {
  const encodedFunctionAbi = web3.eth.abi.encodeFunctionCall({
    name: 'confirmDeposit',
    type: 'function',
    inputs: [
      {
        type: 'address',
        name: '_valueToken',
      },
      {
        type: 'uint256',
        name: '_amount',
      },
      {
        type: 'address',
        name: '_beneficiary',
      },
      {
        type: 'uint256',
        name: '_feeGasPrice',
      },
      {
        type: 'uint256',
        name: '_feeGasLimit',
      },
      {
        type: 'address',
        name: '_depositor',
      },
      {
        type: 'uint256',
        name: '_blockNumber',
      },
      {
        type: 'bytes',
        name: '_rlpParentNodes',
      },
    ],
  }, [
    confirmDepositParams.valueToken,
    confirmDepositParams.amount,
    confirmDepositParams.beneficiary,
    confirmDepositParams.feeGasLimit,
    confirmDepositParams.feeGasLimit,
    confirmDepositParams.depositor,
    confirmDepositParams.blockNumber,
    confirmDepositParams.rlpParentNodes,
  ]);
  return encodedFunctionAbi;
}

describe('TransactionExecutor::add', (): void => {
  let avatarAccount: AvatarAccount;
  let transactionExecutor: TransactionExecutor;
  let rawTx: any;
  let repositories: Repositories;
  let erc20Cogateway: ERC20Cogateway;
  let cogatewayAddress: string;
  let web3: Web3;
  let confirmDepositParams: ConfirmDepositParams;

  const gasPrice = new BigNumber('1000000000');
  beforeEach(async (): Promise<void> => {
    repositories = await Repositories.create();
    web3 = new Web3('');
    const web3Account = web3.eth.accounts.create();
    const password = 'password';
    avatarAccount = AvatarAccount.load(
      web3,
      web3Account.encrypt(password),
      password,
    );
    transactionExecutor = new TransactionExecutor(
      repositories.transactionRepository,
      web3,
      gasPrice,
      avatarAccount,
    );
    confirmDepositParams = {
      valueToken: '0xbb9bc244d798123fde783fcc1c72d3bb8c189413',
      amount: '10',
      beneficiary: '0xbb9bc244d798123fde783fcc1c72d3bb8c189413',
      feeGasPrice: '10',
      feeGasLimit: '10',
      depositor: '0xbb9bc244d798123fde783fcc1c72d3bb8c189413',
      blockNumber: '10',
      rlpParentNodes: '0xbb9bc244d798123fde783fcc1c72d3bb8c189413',
    };
  });

  it('should enqueue transaction successfully ', async (): Promise<void> => {
    cogatewayAddress = '0xbb9bc244d798123fde783fcc1c72d3bb8c189413';
    erc20Cogateway = Mosaic.interacts.getERC20Cogateway(web3, cogatewayAddress);
    // It's important here to replicate actual rawtx behaviour here
    rawTx = erc20Cogateway.methods.confirmDeposit(
      confirmDepositParams.valueToken,
      confirmDepositParams.amount,
      confirmDepositParams.beneficiary,
      confirmDepositParams.feeGasPrice,
      confirmDepositParams.feeGasLimit,
      confirmDepositParams.depositor,
      confirmDepositParams.blockNumber,
      confirmDepositParams.rlpParentNodes as any,
    );

    await transactionExecutor.add(cogatewayAddress, rawTx);
    const transaction = await repositories.transactionRepository.dequeue();
    assert.isNotNull(
      transaction,
      'transaction object should not be null.',
    );

    const actualRawTx = getEncodedFunctionAbi(web3, confirmDepositParams);
    assert.strictEqual(
      actualRawTx,
      rawTx.encodeABI(),
      `Expected raw tx is: ${actualRawTx} but found to be: ${rawTx.encodeABI()}.`,
    );

    if (transaction) {
      assert.strictEqual(
        transaction.fromAddress,
        avatarAccount.address,
        `Expected from address is ${avatarAccount.address} but found ${transaction.fromAddress}.`,
      );

      assert.strictEqual(
        transaction.toAddress,
        cogatewayAddress,
        `Expected to address is ${cogatewayAddress} but found ${transaction.toAddress}.`,
      );

      assert.strictEqual(
        transaction.encodedData,
        rawTx.encodeABI(),
        `Expected raw tx is: ${rawTx.encodeABI()} but found to be: ${transaction.encodedData} in database.`,
      );

      assert.deepStrictEqual(
        transaction.gasPrice,
        gasPrice,
        `Expected gasPrice is ${gasPrice.toString()} but found ${transaction.gasPrice.toString()}`,
      );

      assert.isOk(
        transaction.id && transaction.id.gt(0),
        `Transaction id: ${transaction.id && transaction.id.toString()} is not greater than 0.`,
      );

      assert.isNotNull(
        transaction.createdAt,
        'Created value should not be null.',
      );

      assert.isNotNull(
        transaction.updatedAt,
        'Updated value should not be null.',
      );
    }
  });
});
