import { TransactionReceipt } from 'web3-core';

import Logger from '../../src/common/Logger';

export default class Utils {
  public static async getRandomNumber(min: number, max: number): Promise<number> {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static async sendTransaction(tx: any, txOption: any): Promise<TransactionReceipt> {
    const txOptions = Object.assign({}, txOption);

    if (txOptions.gas === undefined) {
      txOptions.gas = await tx.estimateGas(txOptions);
    }

    return new Promise(async (onResolve, onReject): Promise<void> => {
      tx.send(txOptions)
        .on('transactionHash', async (hash: string): Promise<any> => Logger.debug(`submitted txHash: ${hash}`))
        .on('receipt', (receipt: TransactionReceipt): void => onResolve(receipt))
        .on('error', (error: Error): void => onReject(error));
    });
  }
}
