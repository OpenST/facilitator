import * as fs from 'fs';
import Mosaic from 'Mosaic';
import Web3 from 'web3';

import Utils from './Utils';

export default class Deposit {
  public static async requestDeposit(
    originRpcEndpoint: string,
    erc20TokenAddress: string,
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
    try {
      const web3 = new Web3(originRpcEndpoint);

      web3.transactionConfirmationBlocks = 1;
      const keystore = JSON.parse(fs.readFileSync(depositorKeystore).toString());
      const depositorAccount = web3.eth.accounts.decrypt(keystore, password);
      web3.eth.accounts.wallet.add(depositorAccount);
      const depositorAddress = depositorAccount.address;
      console.log(`\nRequesting deposit from depositor ${depositorAddress}`);
      const tokenInstance = Mosaic.interacts.getERC20I(
        web3,
        erc20TokenAddress,
      );
      console.log('\nApproving value tokens to ERC20Gateway.');
      const approveRawTx = tokenInstance.methods.approve(
        erc20GatewayAddress,
        depositRequestParams.amountToDeposit,
      );

      const approvalReceipt = await Utils.sendTransaction(approveRawTx, {
        from: depositorAddress,
        gasPrice,
      });

      console.log('Value token approval to ERC20Gateway done transaction hash: ', approvalReceipt.transactionHash);

      console.log('\nRequesting Deposit');

      const erc20GatewayInstance = Mosaic.interacts.getERC20Gateway(web3, erc20GatewayAddress);

      const txObject = erc20GatewayInstance.methods.deposit(
        depositRequestParams.amountToDeposit,
        depositRequestParams.beneficiary,
        depositRequestParams.gasPrice,
        depositRequestParams.gasLimit,
        erc20TokenAddress,
      );

      const receipt = await Utils.sendTransaction(txObject, {
        from: depositorAddress,
        gasPrice,
      });

      console.log('\nDeposit amount \t\t:', depositRequestParams.amountToDeposit);
      console.log('Beneficiary Address \t:', depositRequestParams.beneficiary);
      console.log('Deposit GasPrice \t:', depositRequestParams.gasPrice);
      console.log('Deposit GasLimit \t:', depositRequestParams.gasLimit);
      console.log('Transaction hash \t:', receipt.transactionHash);
      console.log('Message hash \t\t:', receipt.events.DepositIntentDeclared.returnValues.messageHash);
      console.log(`\n🤝 Facilitators are moving your tokens to metachain. Check beneficiary ${depositRequestParams.beneficiary} balance on metachain after few minutes.`);
      console.log(`Check beneficiary account on view https://view.mosaicdao.org/address/${depositRequestParams.beneficiary}/transactions`);
    } catch (error) {
      throw error;
    }
  }
}
