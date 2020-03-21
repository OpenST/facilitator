import fs from 'fs';
import path from 'path';

import Withdraw from '../lib/Withdraw';

const inquirer = require('inquirer');
const Web3 = require('web3');

const { BN } = new Web3().utils;

interface WithdrawInputInfo {
  web3EndPoint: string;
  utilityTokenAddress: string;
  erc20CogatewayAddress: string;
  transactionGasPrice: string;
  withdrawerKeystore: string;
  password: string;
  amountToWithdraw: string;
  beneficiary: string;
  gasPrice: string;
  gasLimit: string;
}

async function readInput(): Promise<WithdrawInputInfo> {
  const filePath = path.join(__dirname, '/', 'withdrawer.json');
  const answer = await inquirer.prompt([
    {
      type: 'string',
      name: 'web3EndPoint',
      default: 'https://chain.mosaicdao.org/hadapsar',
      message: 'Enter metachain(Hadapsar-1405) end point:',
    },
    {
      type: 'string',
      name: 'utilityTokenAddress',
      default: '0x6b9011bde760e3c0db26fc1708f5942a6616ff4e',
      message: 'Enter utility token address:',
    },
    {
      type: 'string',
      name: 'erc20CogatewayAddress',
      default: '0x2d986Be491664A5ad13DD5A06820f539d353bb12',
      message: 'Enter ERC20 Cogateway address:',
    },
    {
      type: 'string',
      name: 'transactionGasPrice',
      default: '0x3B9ACA00',
      message: 'Enter transaction gas price:',
    },
    {
      type: 'string',
      name: 'withdrawerKeystore',
      message: 'Enter withdrawer keystore filepath:',
      default: filePath,
      validate(input: string): boolean {
        return fs.existsSync(input);
      },
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter withdrawer keystore password:',
    },
    {
      type: 'string',
      name: 'amountToWithdraw',
      message: 'Enter amount to deposit in (wei):',
      validate(input: string): number {
        return new BN(input).gtn(0);
      },
    },
    {
      type: 'string',
      name: 'beneficiary',
      message: 'Enter beneficiary address on the origin chain(Göerli):',
      validate(input: string): string {
        return new Web3().utils.isAddress(input);
      },
    },
    {
      type: 'string',
      name: 'gasPrice',
      default: '0',
      message: 'Enter gas price at which fee will be calculated:',
    },
    {
      type: 'string',
      name: 'gasLimit',
      default: '0',
      message: 'Enter gas limit at which fee will be calculated:',
    },

  ]);
  return answer;
}

readInput().then(async (answer): Promise<void> => {
  Withdraw.requestWithdraw(
    answer.web3EndPoint.trim(),
    answer.utilityTokenAddress.trim(),
    answer.erc20CogatewayAddress.trim(),
    answer.transactionGasPrice.trim(),
    answer.withdrawerKeystore.trim(),
    answer.password.trim(),
    {
      amountToWithdraw: answer.amountToWithdraw.trim(),
      beneficiary: answer.beneficiary.trim(),
      gasPrice: answer.gasPrice.trim(),
      gasLimit: answer.gasLimit.trim(),

    },
  ).then((): void => {
    console.log('Request withdraw done');
    process.exit(0);
  });
});
