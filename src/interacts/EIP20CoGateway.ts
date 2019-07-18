/* eslint-disable import/no-unresolved */

import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { CustomOptions } from 'web3/eth/contract';

import { interacts } from '@openst/mosaic-contracts';
import {
  EIP20CoGateway as EIP20CoGatewayInteract,
} from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';

import { AUXILIARY_GAS_PRICE } from '../Constants';
import Utils from '../Utils';

export default class EIP20CoGateway {
  /* Storage */

  private readonly coGatewayAddress: string;

  private readonly auxiliaryWeb3: Web3;

  private readonly txOptions: CustomOptions;


  /* Public Functions */

  public constructor(
    coGatewayAddress: string,
    auxiliaryWeb3: Web3,
    auxiliaryWorkerAddress: string,
  ) {
    this.coGatewayAddress = coGatewayAddress;

    this.auxiliaryWeb3 = auxiliaryWeb3;

    this.txOptions = {
      from: auxiliaryWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };
  }

  public async proveGateway(
    lastOriginBlockHeight: BigNumber,
    encodedAccountValue: string,
    serializedAccountProof: string,
  ): Promise<string> {
    const eip20CoGatewayInteract: EIP20CoGatewayInteract = interacts.getEIP20CoGateway(
      this.auxiliaryWeb3,
      this.coGatewayAddress,
    );

    const rawTx = eip20CoGatewayInteract.methods.proveGateway(
      lastOriginBlockHeight.toString(10),
      encodedAccountValue as any,
      serializedAccountProof as any,
    );

    return Utils.sendTransaction(
      rawTx,
      this.txOptions,
    );
  }
}
