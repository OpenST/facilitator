/* eslint-disable prefer-template */
import { BigInt } from "@graphprotocol/graph-ts"
import {
  Contract,
  DepositIntentConfirmed,
  GatewayProven,
  UtilityTokenCreated,
  WithdrawIntentDeclared
} from "../generated/ERC20Cogateway/ERC20Cogateway"
import {
  ConfirmedDepositIntent,
  ProvenGateway,
  CreatedUtilityToken,
  DeclaredWithdrawIntent
} from "../generated/ERC20CogatewaySchema"

export function handleDepositIntentConfirmed(
  event: DepositIntentConfirmed
): void {
  let entity = new ConfirmedDepositIntent(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.messageHash = event.params.messageHash;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;
  entity.save();
}

export function handleGatewayProven(event: GatewayProven): void {
  let entity = new ProvenGateway(
    // eslint-disable-next-line prefer-template
    event.transaction.hash.toHex() + '_' + event.logIndex.toString(),
  );
  entity.remoteGateway = event.params.remoteGateway;
  entity.gatewayProvenBlockNumber = event.params.blockNumber;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;
  entity.save();
}

export function handleUtilityTokenCreated(event: UtilityTokenCreated): void {
  let entity = new CreatedUtilityToken(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.valueToken = event.params.valueToken;
  entity.utilityToken = event.params.utilityToken;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;
  entity.save();
}

export function handleWithdrawIntentDeclared(
  event: WithdrawIntentDeclared
): void {
  let entity = new DeclaredWithdrawIntent(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.amount = event.params.amount;
  entity.nonce = event.params.nonce;
  entity.beneficiary = event.params.beneficiary;
  entity.feeGasPrice = event.params.feeGasPrice;
  entity.feeGasLimit = event.params.feeGasLimit;
  entity.withdrawer = event.params.withdrawer;
  entity.utilityToken = event.params.utilityToken;
  entity.messageHash = event.params.messageHash;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;
  entity.save();
}
