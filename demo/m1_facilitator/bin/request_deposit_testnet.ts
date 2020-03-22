import fs from 'fs';
import path from 'path';

import Deposit from '../lib/Deposit';

const inquirer = require('inquirer');
const Web3 = require('web3');

const { BN } = new Web3().utils;

interface DepositInputInfo {
  web3EndPoint: string;
  erc20TokenAddress: string;
  erc20GatewayAddress: string;
  transactionGasPrice: string;
  depositorKeystore: string;
  password: string;
  amountToDeposit: string;
  beneficiary: string;
  gasPrice: string;
  gasLimit: string;
}

async function getBeneficiaryAddress(filePath: string): Promise<string> {
  try {
    const address = `0x${JSON.parse(fs.readFileSync(filePath).toString()).address}`;
    return address;
  } catch (error) {
    return '';
  }
}

async function readInput(): Promise<DepositInputInfo> {
  const filePath = path.join(__dirname, '/', 'depositor.json');
  const answer = await inquirer.prompt([
    {
      type: 'string',
      name: 'web3EndPoint',
      default: 'https://rpc.slock.it/goerli',
      message: 'Enter origin chain(goerli) end point:',
    },
    {
      type: 'string',
      name: 'erc20TokenAddress',
      default: '0xd426b22f3960d01189a3d548b45a7202489ff4de',
      message: 'Enter ERC20 token address:',
    },
    {
      type: 'string',
      name: 'erc20GatewayAddress',
      default: '0x9B0fd9FB015d9311738ed5aECfF3A626e7A149C1',
      message: 'Enter ERC20 gateway address:',
    },
    {
      type: 'string',
      name: 'transactionGasPrice',
      default: '0x3B9ACA00',
      message: 'Enter transaction gas price:',
    },
    {
      type: 'string',
      name: 'depositorKeystore',
      message: 'Enter depositor keystore filepath:',
      default: filePath,
      validate(input: string): boolean {
        return fs.existsSync(input);
      },
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter depositor keystore password:',
    },
    {
      type: 'string',
      name: 'amountToDeposit',
      message: 'Enter amount to deposit in atto:',
      validate(input: string): number {
        return new BN(input).gtn(0);
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

async function readBeneficiaryAddress(filePath: string): Promise<{ beneficiary: string }> {
  const answer = await inquirer.prompt([
    {
      type: 'string',
      name: 'beneficiary',
      message: 'Enter beneficiary address on the metachain(Hadapsar-1405):',
      default: await getBeneficiaryAddress(filePath),
      validate(input: string): string {
        return new Web3().utils.isAddress(input);
      },
    },
  ]);
  return answer;
}

readInput()
  .then(async (result): Promise<DepositInputInfo> => {
    const answer = await readBeneficiaryAddress(result.depositorKeystore.trim());
    return { ...result, beneficiary: answer.beneficiary };
  })
  .then(async (answer): Promise<void> => {
    return Deposit.requestDeposit(
      answer.web3EndPoint.trim(),
      answer.erc20TokenAddress.trim(),
      answer.erc20GatewayAddress.trim(),
      answer.transactionGasPrice.trim(),
      answer.depositorKeystore.trim(),
      answer.password.trim(),
      {
        amountToDeposit: answer.amountToDeposit.trim(),
        beneficiary: answer.beneficiary.trim(),
        gasPrice: answer.gasPrice.trim(),
        gasLimit: answer.gasLimit.trim(),

      },
    );
  })
  .then((): void => {
    console.log('Deposit request completed');
    process.exit(0);
  })
  .catch((error): void => {
    console.log(error.message);
  });
