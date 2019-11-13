import * as fs from 'fs';
import Web3 from 'web3';

const { interacts } = require('@openst/mosaic-contracts');

/**
 * Request stake params
 * @param originGethEndPoint Origin Geth EndPoint
 * @param valueTokenAddress value Token Address, It will be OST address for goerli and 1405.
 * @param stakePoolAddress Address of OST composer.
 * @param gatewayAddress Address of gateway contract.
 * @param gasPrice GasPrice at which transactions will be submitted.
 * @param stakerKeyStore Key store file path
 * @param password password to decrypt key store.
 * @param stakeRequestParams Stake request.
 */
async function requestStake(
  originGethEndPoint: string,
  valueTokenAddress: string,
  stakePoolAddress: string,
  gatewayAddress: string,
  gasPrice: string,
  stakerKeyStore: string,
  password: string,
  stakeRequestParams: {
    amountToStake: string;
    beneficiary: string;
    gasPrice: string;
    gasLimit: string;
  },
) {
  const originWeb3 = new Web3(originGethEndPoint);

  // To reduce wait time on testnet.
  originWeb3.transactionConfirmationBlocks = 1;
  const keystore = JSON.parse(fs.readFileSync(stakerKeyStore).toString());
  const stakerAccount = originWeb3.eth.accounts.decrypt(keystore, password);
  originWeb3.eth.accounts.wallet.add(stakerAccount);
  const stakerAddress = stakerAccount.address;
  console.log(`Requesting stake from staker ${stakerAddress}`);
  const eip20TokenInstance = interacts.getEIP20Token(
    originWeb3,
    valueTokenAddress,
  );
  console.log('Approving value tokens to staker pool.');
  const approveRawTx = eip20TokenInstance.methods.approve(
    stakePoolAddress,
    stakeRequestParams.amountToStake,
  );

  const approvalReceipt = await approveRawTx.send({
    from: stakerAddress,
    gasPrice,
    gas: (await approveRawTx.estimateGas({ from: stakerAddress })),
  });

  console.log('Value token approval to stake pool done transaction hash: ', approvalReceipt.transactionHash);

  console.log('Requesting stake.');
  const stakePoolInstance = interacts.getOSTComposer(originWeb3, stakePoolAddress);
  const stakerProxyAddress = await stakePoolInstance.methods.stakerProxies(stakerAddress).call();
  const gatewayInstance = interacts.getEIP20Gateway(originWeb3, gatewayAddress);
  const nonce = await gatewayInstance.methods.getNonce(stakerProxyAddress).call();

  const requestStakeRawTx = stakePoolInstance.methods.requestStake(
    stakeRequestParams.amountToStake,
    stakeRequestParams.beneficiary,
    stakeRequestParams.gasPrice,
    stakeRequestParams.gasLimit,
    nonce,
    gatewayAddress,
  );
  const receipt = await requestStakeRawTx.send({
    from: stakerAddress,
    gasPrice,
    gas: (await requestStakeRawTx.estimateGas({ from: stakerAddress })),
  });

  console.log('Request stake done with transaction hash: ', receipt.transactionHash);
  console.log(`🤝 Facilitators are moving your tokens to aux chain. Check beneficiary ${stakeRequestParams.beneficiary} balance on aux chain after few minutes.`);
}

export default requestStake;
