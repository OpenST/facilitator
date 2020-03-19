import * as fs from 'fs';
import Mosaic from 'Mosaic';
import Web3 from 'web3';

import Utils from './Utils';

export default class Deposit {
  public static async requestDeposit(
    originRpcEndpoint: string,
    valueTokenAddress: string,
    erc20GatewayAddress: string,
    gasPrice: string,
    depositorKeystore: string,
    password: string,
    depositRequestParams: {
      amountToDeposit: string;
      beneficiary: string;
      gasPrice: string;
      gasLimit: string;
    },
  ): Promise<void> {
    const web3 = new Web3(originRpcEndpoint);

    // To reduce wait time on testnet.
    web3.transactionConfirmationBlocks = 1;
    const keystore = JSON.parse(fs.readFileSync(depositorKeystore).toString());
    const depositorAccount = web3.eth.accounts.decrypt(keystore, password);
    web3.eth.accounts.wallet.add(depositorAccount);
    const depositorAddress = depositorAccount.address;
    console.log(`Requesting deposit from depositor ${depositorAddress}`);
    const tokenInstance = Mosaic.interacts.getERC20I(
      web3,
      valueTokenAddress,
    );
    console.log('Approving value tokens to ERC20Gateway.');
    const approveRawTx = tokenInstance.methods.approve(
      erc20GatewayAddress,
      depositRequestParams.amountToDeposit,
    );

    const approvalReceipt = await Utils.sendTransaction(approveRawTx, {
      from: depositorAddress,
      gasPrice,
    });

    console.log('Value token approval to ERC20Gateway done transaction hash: ', approvalReceipt.transactionHash);

    console.log('Requesting Deposit.');

    const erc20GatewayInstance = Mosaic.interacts.getERC20Gateway(web3, erc20GatewayAddress);

    const txObject = erc20GatewayInstance.methods.deposit(
      depositRequestParams.amountToDeposit,
      depositRequestParams.beneficiary,
      depositRequestParams.gasPrice,
      depositRequestParams.gasLimit,
      valueTokenAddress,
    );

    const receipt = await Utils.sendTransaction(txObject, {
      from: depositorAddress,
      gasPrice,
    });

    console.log('Request deposit done with transaction hash: ', receipt.transactionHash);
    console.log(`🤝 Facilitators are moving your tokens to metachain. Check beneficiary ${depositRequestParams.beneficiary} balance on metachain after few minutes.`);
    console.log(`Check beneficiary account on view https://view.mosaicdao.org/address/${depositRequestParams.beneficiary}/transactions`);
  }
}
