import {
  DepositIntentDeclared,
  GatewayProven,
  WithdrawIntentConfirmed,
} from '../generated/ERC20Gateway/ERC20Gateway';
import {
  DeclaredDepositIntent,
  ConfirmedWithdrawIntent,
  ProvenGateway,
} from '../generated/ERC20GatewaySchema';

/* eslint-disable prefer-const */
/* eslint-disable prefer-template */
export function handleDepositIntentDeclared(
  event: DepositIntentDeclared,
): void {
  let entity = new DeclaredDepositIntent(
    event.transaction.hash.toHex() + '_' + event.logIndex.toString(),
  );

  entity.amount = event.params.amount;
  entity.nonce = event.params.nonce;
  entity.beneficiary = event.params.beneficiary;
  entity.feeGasPrice = event.params.feeGasPrice;
  entity.feeGasLimit = event.params.feeGasLimit;
  entity.depositor = event.params.depositor;
  entity.valueToken = event.params.valueToken;
  entity.messageHash = event.params.messageHash;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  entity.save();
}

export function handleGatewayProven(
  event: GatewayProven,
): void {
  let entity = new ProvenGateway(
    event.transaction.hash.toHex() + '_' + event.logIndex.toString(),
  );

  entity.provenBlockNumber = event.params.blockNumber;
  entity.remoteGatewayAddress = event.params.remoteGateway;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  entity.save();
}

export function handleWithdrawIntentConfirmed(
  event: WithdrawIntentConfirmed,
): void {
  let entity = new ConfirmedWithdrawIntent(
    event.transaction.hash.toHex() + '_' + event.logIndex.toString(),
  );

  entity.messageHash = event.params.messageHash;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  entity.save();
}
