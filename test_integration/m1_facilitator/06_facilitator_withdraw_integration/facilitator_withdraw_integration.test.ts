import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { UtilityToken } from '@openst/mosaic-contracts/dist/interacts/UtilityToken';
import Interacts from '@openst/mosaic-contracts/dist/interacts/Interacts';
import { ERC20Cogateway } from 'Mosaic/dist/interacts/ERC20Cogateway';
import shared from '../shared';
import Utils from '../utils';
import assert from '../../../test/test_utils/assert';
import Assert from '../Assert';

describe('withdraw and confirm withdraw facilitator process', async (): Promise<void> => {
  const testDuration = 3;
  const interval = 3000;
  let utils: Utils;
  let utilityToken: string;
  let blockNumber: BigNumber;
  let originWeb3: Web3;
  let auxiliaryWeb3: Web3;
  let erc20Gateway;
  let erc20Cogateway;
  let withdrawerAddress;
  let withdrawMessageHash: string;
  let withdrawParams: {
    withdrawalAmount: any;
    feeGasPrice: BigNumber;
    feeGasLimit: BigNumber;
    utilityToken: string;
  };

  before(() => {
    erc20Gateway = shared.origin;
    erc20Cogateway = shared.auxiliary;
    withdrawerAddress = shared.origin.deployer;
  });

  it('Should withdraw successfully', async (): Promise<void> => {
    // Approve Utility Token
    utilityToken = await erc20Gateway.instance.methods.utilityTokens(
      shared.contracts.valueToken.address,
    ).call();
    const utilityTokenInstance = Interacts.getUtilityToken(shared.origin.web3, utilityToken);
    const approveRawTx = utilityTokenInstance.methods.approve(
      erc20Cogateway.address,
      '80',
    );

    await Utils.sendTransaction(
      approveRawTx,
      {
        from: withdrawerAddress,
      },
    );

    withdrawParams = {
      withdrawalAmount: new BigNumber(80),
      feeGasPrice: new BigNumber(3),
      feeGasLimit: new BigNumber(15),
      utilityToken,
    };

    const withdrawerBalanceBeforeWithdraw = await utilityTokenInstance.methods.balanceOf(
      withdrawerAddress,
    ).call();

    const withdrawRawTx = erc20Cogateway.instance.methods.withdraw(
      withdrawParams.withdrawalAmount.toString(10),
      withdrawerAddress,
      withdrawParams.feeGasPrice.toString(10),
      withdrawParams.feeGasLimit.toString(10),
      withdrawParams.utilityToken,
    );

    const tx = await Utils.sendTransaction(
      withdrawRawTx,
      {
        from: withdrawerAddress,
      },
    );

    withdrawMessageHash = tx.events.WithdrawIntentDeclared.returnValues.messageHash;

    const withdrawerBalanceAfterWithdraw = await utilityTokenInstance.methods.balanceOf(
      withdrawerAddress,
    ).call();

    await Assert.assertWithdrawIntentDeclared(
      tx.events.WithdrawIntentDeclared,
      withdrawerAddress,
      withdrawParams,
    );
 
    Assert.assertWithdraw(
      new BigNumber(withdrawerBalanceBeforeWithdraw),
      new BigNumber(withdrawerBalanceAfterWithdraw),
      withdrawParams.withdrawalAmount,
    );
  });

  it('Should anchor auxiliary stateroot on origin', async (): Promise<void> => {
    const anchor = await Utils.performAnchor(
      shared.contracts.originAnchor,
      shared.anchorConsensusAddress,
      originWeb3,
    );

    Assert.assertAnchor(
      anchor.tx.events.StateRootAvailable,
      anchor.blockNumber,
      anchor.stateroot,
    );

    blockNumber = anchor.blockNumber;
  });

  it('Should prove gateway')
});
