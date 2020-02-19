import * as fs from 'fs';
import * as path from 'path';
import requestRedeem from '../lib/RequestRedeem';

const Web3 = require('web3');
const inquirer = require('inquirer');

const { BN } = new Web3().utils;


async function readInput() {
  const filePath = path.join(__dirname, '..', '..', '..', 'redeemer.json');
  const answer = await inquirer.prompt([
    {
      type: 'string',
      name: 'web3EndPoint',
      message: 'Enter auxiliary chain end point:',
    },
    {
      type: 'string',
      name: 'utilityTokenAddress',
      default: '0x3b588816D166A7aac3A68B0769B0E0168A6797a3',
      message: 'Enter utility token address:',
    },
    {
      type: 'string',
      name: 'redeemPoolAddress',
      default: '0x7426333aBAEE2Fbc2fFF102ad581EbfA3182709b',
      message: 'Enter redeem pool address:',
    },
    {
      type: 'string',
      name: 'cogatewayAddress',
      default: '0x5efaE177C9f37E6DA82e807530EA550AA5F0AFdd',
      message: 'Enter co-gateway address:',
    },
    {
      type: 'string',
      name: 'transactionGasPrice',
      default: '0x3B9ACA00',
      message: 'Enter transaction gas price:',
    },
    {
      type: 'string',
      name: 'redeemerKeyStore',
      message: 'Enter redeemer keystore filepath:',
      default: filePath,
      validate(input: string) {
        return fs.existsSync(input);
      },
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter redeemer keystore password:',
    },
    {
      type: 'string',
      name: 'amountToRedeem',
      message: 'Enter amount to redeem in (wei):',
      validate(input: string) {
        return new BN(input).gtn(0);
      },
    },
    {
      type: 'string',
      name: 'beneficiary',
      message: 'Enter beneficiary address where token will be unstaked:',
      validate(input: string) {
        return new Web3().utils.isAddress(input);
      },
    },
    {
      type: 'string',
      name: 'gasPrice',
      default: '0',
      message: 'Enter gasPrice value used to calculate reward for facilitator:',
    },
    {
      type: 'string',
      name: 'gasLimit',
      default: '0',
      message: 'Enter gasLimit value used to calculate reward for facilitator:',
    },

  ]);
  return answer;
}

readInput().then(async (answer) => {
  requestRedeem(
    answer.web3EndPoint.trim(),
    answer.utilityTokenAddress.trim(),
    answer.redeemPoolAddress.trim(),
    answer.cogatewayAddress.trim(),
    answer.transactionGasPrice.trim(),
    answer.redeemerKeyStore.trim(),
    answer.password.trim(),
    {
      amountToRedeem: answer.amountToRedeem.trim(),
      beneficiary: answer.beneficiary.trim(),
      gasPrice: answer.gasPrice.trim(),
      gasLimit: answer.gasLimit.trim(),

    },
  ).then(() => {
    console.log('Request redeem done');
    process.exit(0);
  });
});
