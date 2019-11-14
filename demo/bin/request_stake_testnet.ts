import * as fs from 'fs';
import * as path from 'path';
import requestStake from '../lib/RequestStake';

const Web3 = require('web3');
const inquirer = require('inquirer');

const { BN } = new Web3().utils;


async function readInput() {
  const filePath = path.join(__dirname, '..', '..', 'staker.json');
  const answer = await inquirer.prompt([
    {
      type: 'string',
      name: 'web3EndPoint',
      default: 'https://rpc.slock.it/goerli',
      message: 'Enter origin chain(goerli) end point:',
    },
    {
      type: 'string',
      name: 'valueTokenAddress',
      default: '0xd426b22f3960d01189a3d548b45a7202489ff4de',
      message: 'Enter value token address:',
    },
    {
      type: 'string',
      name: 'stakePoolAddress',
      default: '0x8fa1e540ef528d9c1c264778a774db482266850f',
      message: 'Enter stake pool address:',
    },
    {
      type: 'string',
      name: 'gatewayAddress',
      default: '0xe11e76C1ecA13Ae4ABA871EabDf37C24b8e1928B',
      message: 'Enter gateway address:',
    },
    {
      type: 'string',
      name: 'transactionGasPrice',
      default: '0x3B9ACA00',
      message: 'Enter transaction gas price:',
    },
    {
      type: 'string',
      name: 'stakerKeyStore',
      message: 'Enter staker keystore filepath:',
      default: filePath,
      validate(input: string) {
        return fs.existsSync(input);
      },
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter staker keystore password:',
    },
    {
      type: 'string',
      name: 'amountToStake',
      message: 'Enter amount to stake in (wei):',
      validate(input: string) {
        return new BN(input).gtn(0);
      },
    },
    {
      type: 'string',
      name: 'beneficiary',
      message: 'Enter beneficiary address where token will be minted:',
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
  requestStake(
    answer.web3EndPoint.trim(),
    answer.valueTokenAddress.trim(),
    answer.stakePoolAddress.trim(),
    answer.gatewayAddress.trim(),
    answer.transactionGasPrice.trim(),
    answer.stakerKeyStore.trim(),
    answer.password.trim(),
    {
      amountToStake: answer.amountToStake.trim(),
      beneficiary: answer.beneficiary.trim(),
      gasPrice: answer.gasPrice.trim(),
      gasLimit: answer.gasLimit.trim(),

    },
  ).then(() => {
    console.log('Request stake done');
    process.exit(0);
  });
});
