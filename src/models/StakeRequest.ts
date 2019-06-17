import { Address, Bytes32 } from '../types';

export default class StakeRequest {
  private id: string;

  private amount: string;

  private beneficiary: Address;

  private gasPrice: string;

  private gasLimit: string;

  private nonce: string;

  private staker: Address;

  private gateway: Address;

  private stakeRequestHash: Bytes32;

  public constructor(
    id: string,
    amount: string,
    beneficiary: string,
    gasPrice: string,
    gasLimit: string,
    nonce: string,
    staker: string,
    gateway: string,
    stakeRequestHash: Bytes32,
  ) {
    this.id = id;
    this.amount = amount;
    this.beneficiary = beneficiary;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.nonce = nonce;
    this.staker = staker;
    this.gateway = gateway;
    this.stakeRequestHash = stakeRequestHash;
  }
}
