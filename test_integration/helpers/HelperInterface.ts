import BigNumber from 'bignumber.js';

export interface HelperInterface {

  facilitatorInitScriptPath(): string;

  facilitatorStartScriptPath(): string;

  getMintedBalance(beneficiary: string): Promise<BigNumber>;

}
