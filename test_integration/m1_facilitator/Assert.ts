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

import BN from 'bn.js';
import assert from 'assert';
import shared from './shared';
import BigNumber from 'bignumber.js';

export default class Assert {

  /**
   * It asserts ERC20Gateway storage with the params provided during setup of it.
   *
   * @param params ERC20Gateway setup params.
   * @param messageInbox Message inbox contract address in ERC20Gateway contract.
   * @param stateRootProvider State root provider address in ERC20Gateway contract.
   * @param outboxStorageIndex Outbox storage index value in ERC20Gateway contract.
   */
  public static assertERC20GatewaySetup(
    params: any,
    messageInbox: string,
    stateRootProvider: string,
    outboxStorageIndex: BN,
  ) {
    assert.strictEqual(
      messageInbox,
      params.erc20Cogateway,
      'Incorrect message inbox contract address',
    );

    assert.strictEqual(
      stateRootProvider,
      params.stateRootProvider,
      'Incorrect state root provider contract address',
    );

    assert.strictEqual(
      outboxStorageIndex.eq(new BN(params.gatewayOutboxIndex)),
      true,
      `Expected outbox storage index is ${params.gatewayOutboxIndex} `
      + `but got ${outboxStorageIndex.toString(10)}`,
    );
  }

  /**
   * It asserts `WithdrawIntentDeclared` event for withdraw request on ERC20Cogateway contract.
   * @param event `WithdrawIntentDeclared` event.
   * @param expectedWithdrawerAddress Withdrawer address.
   * @param params Withdrawal parameter.
   */
  public static async assertWithdrawIntentDeclared(
    event: { returnValues: { } },
    expectedWithdrawerAddress: string,
    params: any,
  ) {
    const withdrawIntentHash = message.hashWithdrawIntent(
      shared.contracts.valueToken.address,
      params.utilityToken,
      parseInt(params.withdrawalAmount),
      params.beneficiary,
    );

    const expectedMessageHash = message.hashMessage(
      withdrawIntentHash,
      new BN(
        await shared.contracts.ERC20Cogateway.instance.methods.nonces(expectedWithdrawerAddress).call(),
      ).subn(1),
      params.feeGasPrice,
      params.feeGasLimit,
      expectedWithdrawerAddress,
      await shared.contracts.erc20Cogateway.instance.methods.outboundChannelIdentifier().call(),
    );

    assert.strictEqual(
      expectedMessageHash,
      event.returnValues['messageHash'],
      'Incorrect withdraw intent message hash',
    );

    assert.strictEqual(
      params.withdrawalAmount.eq(new BN(event.returnValues['amount'])),
      true,
      `Expected withdrawal amount is ${params.withdrawalAmount.toString(10)} `
      + `but got ${event.returnValues['amount']}`,
    );

    assert.strictEqual(
      params.beneficiary,
      event.returnValues['beneficiary'],
      'Incorrect beneficiary address',
    );

    assert.strictEqual(
      params.feeGasPrice.eq(new BN(event.returnValues['feeGasPrice'])),
      true,
      `Expected gas price fee is ${params.feeGasPrice.toString(10)} `
      + `but got ${event.returnValues['feeGasPrice']},`
    );

    assert.strictEqual(
      params.feeGasLimit.eq(new BN(event.returnValues['feeGasLimit'])),
      true,
      `Expected gas price fee is ${params.feeGasLimit.toString(10)} `
      + `but got ${event.returnValues['feeGasLimit']},`
    );

    assert.strictEqual(
      params.utilityToken,
      event.returnValues['utilityToken'],
      'Incorrect utility token address',
    );

    assert.strictEqual(
      expectedWithdrawerAddress,
      event.returnValues['withdrawer'],
      'Incorrect withdrawer address',
    );
  }

  /**
   * It asserts withdrawer account balance.
   *
   * @param withdrawerBalanceBeforeWithdraw Withdrawer balance before withdraw transaction.
   * @param withdrawerBalanceAfterWithdraw Withdrawer balance after withdraw transaction.
   * @param withdrawalAmount Amount to be withdrawn by withdrawer.
   */
  public static assertWithdraw(
    withdrawerBalanceBeforeWithdraw: BigNumber,
    withdrawerBalanceAfterWithdraw: BigNumber,
    withdrawalAmount: BigNumber,
  ) {
    assert.strictEqual(
      withdrawerBalanceBeforeWithdraw.sub(withdrawalAmount).eq(withdrawerBalanceAfterWithdraw),
      true,
      'Expected withdrawer balance after withdraw is '
      + `${(withdrawerBalanceBeforeWithdraw.sub(withdrawalAmount)).toString(10)} but got`
      + `${withdrawerBalanceAfterWithdraw.toString(10)}`,
    );
  }

  /** State root anchoring assertion
   * 
   * @param event StateRootAvailable event.
   * @param blockNumber Block number at which anchoring is to be done.
   * @param stateRoot State root for the block. 
   */
  public static assertAnchor(
    event: { returnValues: {} },
    blockNumber: BigNumber,
    stateRoot: string,
  ): void {
    assert.strictEqual(
      blockNumber.eq(new BigNumber(event.returnValues["_blockNumber"])),
      true,
      `Expected blocknumber at which anchoring is done ${blockNumber.toString(10)} but got`
      + `${event.returnValues['_blockNumber']}`,
    );

    assert.strictEqual(
      event.returnValues['_stateRoot'],
      stateRoot,
      'Incorrect state root',
    );
  }
}
