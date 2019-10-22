import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-core';
import { OSTPrime } from '@openst/mosaic-contracts/dist/interacts/OSTPrime';
import { UtilityToken } from '@openst/mosaic-contracts/dist/interacts/UtilityToken';

export interface HelperInterface {

  facilitatorInitScriptPath(): string;

  facilitatorStartScriptPath(): string;

  getMintedBalance(beneficiary: string): Promise<BigNumber>;

  getUtilityTokenInstance(): OSTPrime | UtilityToken;

  wrapUtilityToken(txOption: any): Promise<void>;

  fundUtilityTokenToRedeemer(beneficiary: string, amount: BigNumber): Promise<TransactionReceipt>;

}
