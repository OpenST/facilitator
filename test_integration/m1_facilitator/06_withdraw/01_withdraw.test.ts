import Mosaic from 'Mosaic';
import BigNumber from 'bignumber.js';
import shared from '../shared';
import Utils from '../utils';
import assert from '../../../test/test_utils/assert';
import Repositories
  from '../../../src/m1_facilitator/repositories/Repositories';
import Directory from '../../../src/m1_facilitator/Directory';
import { ArchitectureLayout } from '../../../src/m1_facilitator/manifest/Manifest';
import {
  MessageStatus,
  MessageType,
} from '../../../src/m1_facilitator/models/Message';

describe('withdraw', async (): Promise<void> => {
  let declarationBlockNumber: string;
  let withdrawMessageHash: string;
  let anchorBlockNumber: BigNumber;
  let withdrawParams: {
    withdrawalAmount: BigNumber;
    beneficiary: string;
    feeGasPrice: BigNumber;
    feeGasLimit: BigNumber;
    sender: string;
    tokenAddress: string;
  };

  it('Should withdraw successfully', async (): Promise<void> => {
    const utilityTokenAddress = await shared.contracts.erc20Cogateway
      .methods.utilityTokens(
        shared.contracts.valueToken.address,
      ).call();

    withdrawParams = {
      withdrawalAmount: new BigNumber(80),
      beneficiary: shared.origin.web3.eth.accounts.create(
        'beneficiary',
      ).address,
      feeGasPrice: new BigNumber(1),
      feeGasLimit: new BigNumber(1),
      sender: shared.auxiliary.deployer,
      tokenAddress: utilityTokenAddress,
    };

    const utilityToken = Mosaic.interacts.getUtilityToken(
      shared.auxiliary.web3, utilityTokenAddress,
    );

    // Approve Utility Token
    await Utils.sendTransaction(utilityToken.methods.approve(
      shared.contracts.erc20Cogateway.address,
      withdrawParams.withdrawalAmount.toString(10),
    ),
    {
      from: withdrawParams.sender,
    });


    const receipt = await Utils.sendTransaction(
      shared.contracts.erc20Cogateway.methods.withdraw(
        withdrawParams.withdrawalAmount.toString(10),
        withdrawParams.beneficiary,
        withdrawParams.feeGasPrice.toString(10),
        withdrawParams.feeGasLimit.toString(10),
        utilityTokenAddress,
      ),
      { from: withdrawParams.sender },
    );

    withdrawMessageHash = receipt.events.WithdrawIntentDeclared.returnValues.messageHash;
    declarationBlockNumber = receipt.blockNumber;
  });

  it('should anchor state root', async (): Promise<void> => {
    // Note: Ensuring that facilitator starts before doing any transactions.
    await new Promise(done => setTimeout(done, 3000));

    const block = await shared.auxiliary.web3.eth.getBlock('latest');

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
        shared.contracts.erc20Gateway.address,
      ),
    );
    await Utils.waitForCondition(async (): Promise<boolean> => {
      const message = await repositories.messageRepository.get(
        withdrawMessageHash,
      );

      return message !== null && message.targetStatus === MessageStatus.Declared;
    });

    const valueToken = Mosaic.interacts.getUtilityToken(
      shared.origin.web3, shared.contracts.valueToken.address,
    );

    const balance = new BigNumber(
      await valueToken.methods.balanceOf(withdrawParams.beneficiary).call(),
    );

    const reward = withdrawParams.feeGasLimit.multipliedBy(withdrawParams.feeGasPrice);
    const finalWithdrawalAmount = withdrawParams.withdrawalAmount.minus(reward);
    assert.isOk(
      balance.eq(finalWithdrawalAmount),
      `Beneficiary should have balance ${finalWithdrawalAmount.toString(10)} but found ${balance.toString(10)}`,
    );
  });

  it('Assert database state', async (): Promise<void> => {
    const gatewayAddresses = shared.contracts.erc20Gateway.address;
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
      MessageType.Withdraw,
      'Message type should be withdraw',
    );
    assert.strictEqual(
      message && message.gatewayAddress,
      shared.contracts.erc20Cogateway.address,
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
      withdrawParams.beneficiary,
      'Beneficiary address must match',
    );

    assert.strictEqual(
      withdrawIntent && withdrawIntent.tokenAddress,
      withdrawParams.tokenAddress,
      'Token address must match',
    );

    const gatewayRecord = await gatewayRepository.get(
      shared.contracts.erc20Gateway.address,
    );

    assert.isOk(
      gatewayRecord && gatewayRecord.remoteGatewayLastProvenBlockNumber
      && gatewayRecord.remoteGatewayLastProvenBlockNumber.isEqualTo(anchorBlockNumber),
      'Remote gateway last broken block number should be same as anchor height',
    );

    const originAnchor = await anchorRepository.get(shared.contracts.originAnchor.address);

    assert.isOk(
      originAnchor && originAnchor.lastAnchoredBlockNumber
      && originAnchor.lastAnchoredBlockNumber.isEqualTo(anchorBlockNumber),
      'Anchor block height must be updated',
    );
  });
});
