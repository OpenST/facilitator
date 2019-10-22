
import * as path from 'path';
import BigNumber from 'bignumber.js';
import { UtilityToken } from '@openst/mosaic-contracts/dist/interacts/UtilityToken';
import { TransactionReceipt } from 'web3-core';

import { HelperInterface } from './HelperInterface';
import Utils from '../Utils';
import Logger from '../../src/Logger';

export default class Erc20TokenHelper implements HelperInterface {
  facilitatorInitScriptPath(): string {
    return path.join(__dirname, '../scripts/erc20_token/facilitator_init.sh');
  }

  facilitatorStartScriptPath(): string {
    return path.join(__dirname, '../scripts/erc20_token/facilitator_start.sh');
  }

  getMintedBalance(beneficiary: string): Promise<BigNumber> {
    const utils = new Utils();
    return utils.getUtilityTokenBalance(beneficiary);
  }

  getUtilityTokenInstance(): UtilityToken {
    const utils = new Utils();
    return utils.getUtilityTokenInstance();
  }

  wrapUtilityToken(txOption: any): Promise<void> {
    // Do nothing here
    Logger.debug('ignoring txOption for erc20Token', txOption);
    return new Promise(((resolve) => {
      resolve();
    }));
  }

  fundUtilityTokenToRedeemer(beneficiary: string, amount: BigNumber): Promise<TransactionReceipt> {
    const utils = new Utils();
    return utils.fundUtilityToken(beneficiary, amount);
  }

}
