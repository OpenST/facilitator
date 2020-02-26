import {
  DepositIntentDeclared,
  GatewayProven,
  WithdrawIntentConfirmed,
} from '../generated/MosaicFacilitator/ERC20Gateway';
import {
  DeclaredDepositIntent,
  ConfirmedWithdrawIntent,
  ProvenGateway,
} from '../generated/schema';

export function handleDepositIntentDeclared(
  event: DepositIntentDeclared,
): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = DeclaredDepositIntent.load(event.transaction.from.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new DeclaredDepositIntent(event.transaction.from.toHex());
  }

  // Entity fields can be set based on event parameters
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

  // Entities can be written to the store with `.save()`
  entity.save();
}

export function handleGatewayProven(
  event: GatewayProven,
): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ProvenGateway.load(event.transaction.from.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new ProvenGateway(event.transaction.from.toHex());
  }

  // Entity fields can be set based on event parameters
  entity.provenBlockNumber = event.params.blockNumber;
  entity.gatewayAddress = event.params.remoteGateway;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  // Entities can be written to the store with `.save()`
  entity.save();
}

export function handleWithdrawIntentConfirmed(
  event: WithdrawIntentConfirmed,
): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ConfirmedWithdrawIntent.load(event.transaction.from.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new ConfirmedWithdrawIntent(event.transaction.from.toHex());
  }

  // Entity fields can be set based on event parameters
  entity.messageHash = event.params.messageHash;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  // Entities can be written to the store with `.save()`
  entity.save();
}
