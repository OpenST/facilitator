import {
  DepositIntentDeclared,
  GatewayProven,
  WithdrawIntentConfirmed,
} from '../generated/ERC20Gateway/ERC20Gateway';
import {
  DeclaredDepositIntent,
  ConfirmedWithdrawIntent,
  ProvenGateway,
} from '../generated/schema';

export function handleDepositIntentDeclared(
  event: DepositIntentDeclared,
): void {
  // eslint-disable-next-line prefer-const
  let entity = new DeclaredDepositIntent(
    // eslint-disable-next-line prefer-template
    event.transaction.hash.toHex() + '_' + event.logIndex.toString(),
  );

  entity.tokenAddress = event.params.valueToken;
  entity.amount = event.params.amount;
  entity.nonce = event.params.nonce;
  entity.beneficiary = event.params.beneficiary;
  entity.feeGasPrice = event.params.feeGasPrice;
  entity.feeGasLimit = event.params.feeGasLimit;
  entity.depositor = event.params.depositor;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  entity.save();
}

export function handleGatewayProven(
  event: GatewayProven,
): void {
  // eslint-disable-next-line prefer-const
  let entity = new ProvenGateway(
    // eslint-disable-next-line prefer-template
    event.transaction.hash.toHex() + '_' + event.logIndex.toString(),
  );

  entity.provenBlockNumber = event.params.blockNumber;
  entity.gatewayAddress = event.params.remoteGateway;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  entity.save();
}

export function handleWithdrawIntentConfirmed(
  event: WithdrawIntentConfirmed,
): void {
  // eslint-disable-next-line prefer-const
  let entity = new ConfirmedWithdrawIntent(
    // eslint-disable-next-line prefer-template
    event.transaction.hash.toHex() + '_' + event.logIndex.toString(),
  );

  entity.messageHash = event.params.messageHash;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  entity.save();
}
