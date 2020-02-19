import * as fs from 'fs';
import Web3 from 'web3';

const { interacts } = require('@openst/mosaic-contracts');

/**
 * Request redeem params
 * @param auxiliaryGethEndPoint auxiliary Geth EndPoint
 * @param utilityTokenAddress utility Token Address on auxiliary chain.
 * @param redeemPoolAddress Address of redeem pool.
 * @param coGatewayAddress Address of cogateway contract.
 * @param gasPrice GasPrice at which transactions will be submitted.
 * @param redeemerKeyStore Key store file path
 * @param password password to decrypt key store.
 * @param requestRequestParams Redeem request param.
 */
async function requestRedeem(
  auxiliaryGethEndPoint: string,
  utilityTokenAddress: string,
  redeemPoolAddress: string,
  coGatewayAddress: string,
  gasPrice: string,
  redeemerKeyStore: string,
  password: string,
  requestRequestParams: {
    amountToRedeem: string;
    beneficiary: string;
    gasPrice: string;
    gasLimit: string;
  },
) {
  const auxiliaryWeb3 = new Web3(auxiliaryGethEndPoint);
  // To reduce wait time on testnet.
  auxiliaryWeb3.transactionConfirmationBlocks = 2;
  const keystore = JSON.parse(fs.readFileSync(redeemerKeyStore).toString());
  const redeemerAccount = auxiliaryWeb3.eth.accounts.decrypt(keystore, password);
  auxiliaryWeb3.eth.accounts.wallet.add(redeemerAccount);
  const redeemerAddress = redeemerAccount.address;
  console.log(`Requesting redeem from redeemer ${redeemerAddress}`);

  const eip20TokenInstance = interacts.getEIP20Token(
    auxiliaryWeb3,
    utilityTokenAddress,
  );
  const approveRawTx = eip20TokenInstance.methods.approve(
    redeemPoolAddress,
    requestRequestParams.amountToRedeem,
  );
  console.log('Approving utility token to redeem pool.');
  const approvalReceipt = await approveRawTx.send({
    from: redeemerAddress,
    gasPrice,
    gas: (await approveRawTx.estimateGas({ from: redeemerAddress })),
  });

  console.log('Utility token approval to redeem pool done transaction hash: ', approvalReceipt.transactionHash);

  const utilityTokenContractInstance = interacts.getOSTPrime(
    auxiliaryWeb3,
    utilityTokenAddress,
  );

  const wrapRawTx = utilityTokenContractInstance.methods.wrap();
  console.log('Wrapping utility tokens');
  const wrapReceipt = await wrapRawTx.send({
    from: redeemerAddress,
    gasPrice,
    gas: (await wrapRawTx.estimateGas({
      from: redeemerAddress,
      value: requestRequestParams.amountToRedeem,
    })),
    value: requestRequestParams.amountToRedeem,
  });
  console.log('Wrapping utility token done with hash:', wrapReceipt.transactionHash);

  const redeemPoolInstance = interacts.getRedeemPool(auxiliaryWeb3, redeemPoolAddress);
  const redeemerProxyAddress = await redeemPoolInstance.methods
    .redeemerProxies(redeemerAddress).call();
  const coGatewayInstance = interacts.getEIP20CoGateway(auxiliaryWeb3, coGatewayAddress);
  const nonce = await coGatewayInstance.methods.getNonce(redeemerProxyAddress).call();
  const requestRedeemRawTx = redeemPoolInstance.methods.requestRedeem(
    requestRequestParams.amountToRedeem,
    requestRequestParams.beneficiary,
    requestRequestParams.gasPrice,
    requestRequestParams.gasLimit,
    nonce,
    coGatewayAddress,
  );

  const requestRedeemReceipt = await requestRedeemRawTx.send({
    from: redeemerAddress,
    gasPrice,
    gas: (await requestRedeemRawTx.estimateGas({ from: redeemerAddress })),
  });

  console.log('Request redeem done with transaction hash: ', requestRedeemReceipt.transactionHash);
  console.log(`🤝 Facilitators are moving your tokens to origin chain. Check beneficiary ${requestRequestParams.beneficiary} balance on origin chain after few minutes.`);
  console.log(`Check beneficiary account on etherscan https://goerli.etherscan.io/address/${requestRequestParams.beneficiary}`);
}

export default requestRedeem;
