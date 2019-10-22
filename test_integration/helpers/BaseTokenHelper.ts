
import * as path from 'path';
import BigNumber from 'bignumber.js';
import { HelperInterface } from './HelperInterface';
import Utils from '../Utils';
import { OSTPrime } from '@openst/mosaic-contracts/dist/interacts/OSTPrime';
import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { TransactionReceipt } from 'web3-core';
import Logger from '../../src/Logger';

export default class BaseTokenHelper implements HelperInterface {
  facilitatorInitScriptPath(): string {
    return path.join(__dirname, '../scripts/base_token/facilitator_init.sh');
  }

  facilitatorStartScriptPath(): string {
    return path.join(__dirname, '../scripts/base_token/facilitator_start.sh');
  }

  getMintedBalance(beneficiary: string): Promise<BigNumber> {
    const utils = new Utils();
    return utils.getOSTPrimeBalance(beneficiary);
  }

  getUtilityTokenInstance(): OSTPrime {
    const utils = new Utils();
    return utils.getSimpleTokenPrimeInstance();
  }

  async wrapUtilityToken(txOption: any): Promise<void> {
    Logger.debug('submitting wrapping OSTPrime tx.');
    const wrapRawTx: TransactionObject<boolean> = this.getUtilityTokenInstance().methods.wrap();
    await Utils.sendTransaction(
      wrapRawTx,
      txOption,
    );
  }

  fundUtilityTokenToRedeemer(beneficiary: string, amount: BigNumber): Promise<TransactionReceipt> {
    const utils = new Utils();
    return utils.fundOSTPrimeOnAuxiliary(beneficiary, amount);
  }

}
