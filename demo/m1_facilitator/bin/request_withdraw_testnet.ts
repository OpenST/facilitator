import fs from 'fs';
import path from 'path';
import Withdraw from '../lib/Withdraw';
import Utils from '../lib/Utils';

const inquirer = require('inquirer');
const Web3 = require('web3');

const web3 = new Web3();
const { BN, isAddress } = web3.utils;

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

async function getBeneficiaryAddress(filePath: string): Promise<string> {
  try {
    const address = `0x${JSON.parse(fs.readFileSync(filePath).toString()).address}`;
    return address;
  } catch (error) {
    return '';
  }
}

async function readInput(): Promise<WithdrawInputInfo> {
  const filePath = path.join(__dirname, '/', 'withdrawer.json');
  const answer = await inquirer.prompt([
    {
      type: 'string',
      name: 'web3EndPoint',
      default: 'https://chain.mosaicdao.org/hadapsar',
      message: 'Enter metachain(Hadapsar-1405) end point:',
      validate(input: string): boolean {
        const regex = new RegExp(Utils.ENDPOINT_REGEX);
        return regex.test(input);
      },
    },
    {
      type: 'string',
      name: 'utilityTokenAddress',
      default: '0x98266c031529eed13955909050257950e3b0e2e0',
      message: 'Enter ERC20 utility token address:',
      validate(input: string): string {
        return isAddress(input);
      },
    },
    {
      type: 'string',
      name: 'erc20CogatewayAddress',
      default: '0x2d986Be491664A5ad13DD5A06820f539d353bb12',
      message: 'Enter ERC20 Cogateway address:',
      validate(input: string): string {
        return isAddress(input);
      },
    },
    {
      type: 'string',
      name: 'transactionGasPrice',
      default: '1000000000',
      message: 'Enter transaction gas price:',
      validate(input: string): number {
        return new BN(input).gtn(0);
      },
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
      message: 'Enter amount to withdraw in atto:',
      validate(input: string): number {
        return new BN(input).gtn(0);
      },
    },
    {
      type: 'string',
      name: 'gasPrice',
      default: '0',
      message: 'Enter gas price at which fee will be calculated:',
      validate(input: string): number {
        return new BN(input).gte(0);
      },
    },
    {
      type: 'string',
      name: 'gasLimit',
      default: '0',
      message: 'Enter gas limit at which fee will be calculated:',
      validate(input: string): number {
        return new BN(input).gte(0);
      },
    },
  ]);
  return answer;
}

async function readBeneficiaryAddress(filePath: string): Promise<{ beneficiary: string }> {
  const answer = await inquirer.prompt([
    {
      type: 'string',
      name: 'beneficiary',
      message: 'Enter beneficiary address on the origin chain(Göerli):',
      default: await getBeneficiaryAddress(filePath),
      validate(input: string): string {
        return isAddress(input);
      },
    },
  ]);
  return answer;
}

readInput()
  .then(async (result): Promise<WithdrawInputInfo> => {
    const answer = await readBeneficiaryAddress(result.withdrawerKeystore.trim());
    return { ...result, beneficiary: answer.beneficiary };
  })
  .then(async (answer): Promise<void> => {
    return Withdraw.requestWithdraw(
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
    );
  })
  .then((): void => {
    console.log('Withdraw request competed');
    process.exit(0);
  })
  .catch((error): void => {
    console.log(error.message);
  });
