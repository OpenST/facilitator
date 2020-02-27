import {
  DepositIntentConfirmed as DepositIntentConfirmedEvent,
  GatewayProven as GatewayProvenEvent,
  ProxyCreation as ProxyCreationEvent,
  UtilityTokenCreated as UtilityTokenCreatedEvent,
  WithdrawIntentDeclared as WithdrawIntentDeclaredEvent
} from "../generated/Contract/ERC20Cogateway";
import {
  DepositIntentConfirmed,
  GatewayProven,
  ProxyCreation,
  UtilityTokenCreated,
  WithdrawIntentDeclared
} from "../generated/ERC20CogatewaySchema";

export function handleDepositIntentConfirmed(
  event: DepositIntentConfirmedEvent
): void {
  let entity = new DepositIntentConfirmed(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.messageHash = event.params.messageHash;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;
  entity.save();
}

export function handleGatewayProven(event: GatewayProvenEvent): void {
  let entity = new GatewayProven(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.remoteGateway = event.params.remoteGateway;
  entity.gatewayProveBlockNumber = event.params.blockNumber;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;
  entity.save();
}

export function handleProxyCreation(event: ProxyCreationEvent): void {
  let entity = new ProxyCreation(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.proxy = event.params.proxy;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;
  entity.save();
}

export function handleUtilityTokenCreated(
  event: UtilityTokenCreatedEvent
): void {
  let entity = new UtilityTokenCreated(
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
  event: WithdrawIntentDeclaredEvent
): void {
  let entity = new WithdrawIntentDeclared(
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
