
import * as path from 'path';
import BigNumber from 'bignumber.js';
import { HelperInterface } from './HelperInterface';
import Utils from '../Utils';

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
}
