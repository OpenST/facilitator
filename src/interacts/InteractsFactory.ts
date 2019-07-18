import Web3 from 'web3';

import EIP20CoGateway from './EIP20CoGateway';

export default class InteractsFactory {
  /* Storage */

  private readonly auxiliaryWeb3: Web3;

  private readonly auxiliaryWorkerAddress: string;


  /* Public Functions */

  public constructor(
    auxiliaryWeb3: Web3,
    auxiliaryWorkerAddress: string,
  ) {
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.auxiliaryWorkerAddress = auxiliaryWorkerAddress;
  }

  public getEIP20CoGateway(coGatewayAddress: string): EIP20CoGateway {
    return new EIP20CoGateway(
      coGatewayAddress,
      this.auxiliaryWeb3,
      this.auxiliaryWorkerAddress,
    );
  }
}
