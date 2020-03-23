export default class Utils {
  public static ENDPOINT_REGEX = '^(http|https)://(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])(:[0-9]+)?/?(.*)$';

  public static async sendTransaction(
    rawTx: any,
    txOptions: {
      gas?: string;
      gasPrice?: string;
      from: string;
    },
  ): Promise<any> {
    const calculatedTransactionOptions = {
      ...txOptions,
      gas: (await rawTx.estimateGas({ from: txOptions.from })).toString(),
      gasPrice: txOptions.gasPrice ? txOptions.gasPrice : '0x01',
    };
    return rawTx.send(calculatedTransactionOptions);
  }
}
