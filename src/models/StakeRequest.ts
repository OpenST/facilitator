import { Address, Bytes32 } from '../types';

export default class StakeRequest {
  private _id: string;

  private _amount: string;

  private _beneficiary: Address;

  private _gasPrice: string;

  private _gasLimit: string;

  private _nonce: string;

  private _staker: Address;

  private _gateway: Address;

  private _stakeRequestHash: Bytes32;

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
    this._id = id;
    this._amount = amount;
    this._beneficiary = beneficiary;
    this._gasPrice = gasPrice;
    this._gasLimit = gasLimit;
    this._nonce = nonce;
    this._staker = staker;
    this._gateway = gateway;
    this._stakeRequestHash = stakeRequestHash;
  }

  public get id(): string {
    return this._id;
  }

  public get amount(): string {
    return this._amount;
  }

  public get beneficiary(): string {
    return this._beneficiary;
  }

  public get gasPrice(): string {
    return this._gasPrice;
  }

  public get gasLimit(): string {
    return this._gasLimit;
  }

  public get nonce(): string {
    return this._nonce;
  }

  public get staker(): string {
    return this._staker;
  }

  public get gateway(): string {
    return this._gateway;
  }

  public get stakeRequestHash(): string {
    return this._stakeRequestHash;
  }
}
