import Mosaic from 'Mosaic';
import BigNumber from 'bignumber.js';
// import Web3 from 'web3';
import * as web3Utils from 'web3-utils';

// import { UtilityToken } from '@openst/mosaic-contracts/dist/interacts/UtilityToken';
// import Interacts from '@openst/mosaic-contracts/dist/interacts/Interacts';
// import { ERC20Cogateway } from 'Mosaic/dist/interacts/ERC20Cogateway';
import shared from '../shared';
import Utils from '../utils';
import assert from '../../../test/test_utils/assert';
// import Assert from '../Assert';
import Repositories from '../../../src/m1_facilitator/repositories/Repositories';
import Directory from '../../../src/m1_facilitator/Directory';
import { ArchitectureLayout } from '../../../src/m1_facilitator/manifest/Manifest';
import Logger from '../../../src/common/Logger';
import {
  MessageStatus,
  MessageType,
} from '../../../src/m1_facilitator/models/Message';

describe('withdraw and confirm withdraw facilitator process', async (): Promise<void> => {
  let declarationBlockNumber: string;
  let withdrawMessageHash: string;
  let withdrawerAddress: string;
  let anchorBlockNumber: BigNumber;
  let withdrawParams: {
    withdrawalAmount: BigNumber;
    withdrawerAddress: string;
    feeGasPrice: BigNumber;
    feeGasLimit: BigNumber;
    sender: string;
  };

  before(() => {
    withdrawerAddress = shared.origin.deployer;
  });

  it('Should withdraw successfully', async (): Promise<void> => {
    withdrawParams = {
      withdrawalAmount: new BigNumber(80),
      withdrawerAddress,
      feeGasPrice: new BigNumber(3),
      feeGasLimit: new BigNumber(15),
      sender: shared.origin.deployer,
    };

    //Approve Utility Token
    await Utils.sendTransaction(shared.contracts.valueToken.methods.approve(
      shared.contracts.erc20Cogateway.address,
      withdrawParams.withdrawalAmount.toString(10),
    ),
    {
      from: withdrawerAddress,
    });

    const tx = await Utils.sendTransaction(
      shared.contracts.erc20Cogateway.methods.withdraw(
        withdrawParams.withdrawalAmount.toString(10),
        withdrawerAddress,
        withdrawParams.feeGasPrice.toString(10),
        withdrawParams.feeGasLimit.toString(10),
        shared.contracts.valueToken.address,
      ),
      { from: withdrawParams.sender },
    );

    ({ withdrawMessageHash } = tx.events.WithdrawIntentDeclared.returnvalues);

    declarationBlockNumber = tx.blockNumber;
  });

  it('should anchor state root', async (): Promise<void> => {
    // Note: Ensuring that facilitator starts before doing any transactions.
    await new Promise(done => setTimeout(done, 3000));

    const block = await shared.origin.web3.eth.getBlock('latest');

    anchorBlockNumber = new BigNumber(block.number);
    await Utils.sendTransaction(
      shared.contracts.originAnchor.methods.anchorStateRoot(
        block.number,
        block.stateRoot,
      ),
      { from: shared.anchorConsensusAddress },
    );
  });

  it('Balance assertion of withdrawer', async (): Promise<void> => {
    const repositories = await Repositories.create(
      Directory.getFacilitatorDatabaseFile(
        ArchitectureLayout.MOSAIC1,
        shared.contracts.erc20Cogateway.address,
      ),
    );
    await Utils.waitForCondition(async (): Promise<boolean> => {
      const tokenPair = await repositories.erc20GatewayTokenPairRepository.get(
        shared.contracts.erc20Cogateway.address,
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

    const reward = withdrawParams.feeGasLimit.multipliedBy(withdrawParams.feeGasPrice);
    const finalWithdrawalAmount = withdrawParams.withdrawalAmount.minus(reward);
    Logger.debug('TO verify balance of withdrawer after withdrawal: ', finalWithdrawalAmount.toString(10));
    assert.isOk(
      balance.eq(finalWithdrawalAmount),
      `Beneficiary should have balance ${finalWithdrawalAmount.toString(10)}`,
    );
  });

  it('Assert entry made in database', async (): Promise<void> => {
    const gatewayAddresses = shared.contracts.erc20Cogateway.address;
    const repositories = await Repositories.create(
      Directory.getFacilitatorDatabaseFile(
        ArchitectureLayout.MOSAIC1,
        gatewayAddresses,
      ),
    );

    const {
      messageRepository,
      gatewayRepository,
      withdrawIntentRepository,
      erc20GatewayTokenPairRepository,
      anchorRepository,
    } = repositories;

    const message = await messageRepository.get(withdrawMessageHash);

    assert.isOk(message !== null, 'Message should exist');
    assert.strictEqual(
      message && message.sourceStatus,
      MessageStatus.Declared,
      'Source status for withdraw message must be declared',
    );
    assert.strictEqual(
      message && message.targetStatus,
      MessageStatus.Declared,
      'Target status for withdraw message must be declared',
    );
    assert.strictEqual(
      message && message.sender,
      withdrawParams.sender,
      'Sender of message must be same',
    );
    assert.isOk(
      message
      && message.sourceDeclarationBlockNumber
      && message.sourceDeclarationBlockNumber.isEqualTo(
        new BigNumber(declarationBlockNumber),
      ),
      'Message declaration block number must be same',
    );
    assert.strictEqual(
      message && message.type,
      MessageType.Deposit,
      'Block number at message declaration must be same',
    );
    assert.strictEqual(
      message && message.gatewayAddress,
      gatewayAddresses,
      'Gateway address must match',
    );
    assert.isOk(
      message && message.feeGasPrice
      && message.feeGasPrice.isEqualTo(withdrawParams.feeGasPrice),
      'Fee gas price must match',
    );
    assert.isOk(
      message && message.feeGasLimit
      && message.feeGasLimit.isEqualTo(withdrawParams.feeGasLimit),
      'Fee gas limit must match',
    );

    const withdrawIntent = await withdrawIntentRepository.get(withdrawMessageHash);

    assert.isOk(
      withdrawIntent && withdrawIntent.amount
      && withdrawIntent.amount.isEqualTo(withdrawIntent.amount),
      'Withdrawal amount must be same to requested withdrawing amount',
    );

    assert.strictEqual(
      withdrawIntent && withdrawIntent.beneficiary,
      withdrawParams.withdrawerAddress,
      'Withdrawer address must match',
    );

    const valueToken = shared.contracts.valueToken.address;
    assert.strictEqual(
      withdrawIntent && withdrawIntent.tokenAddress,
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
    const originAnchor = await anchorRepository.get(shared.contracts.originAnchor.address);

    assert.isOk(
      originAnchor && originAnchor.lastAnchoredBlockNumber
      && originAnchor.lastAnchoredBlockNumber.isEqualTo(anchorBlockNumber),
      'Anchor block height must be updated',
    );
  });
});
