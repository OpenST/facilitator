import axios from 'axios';
import fs from 'fs';
import path from 'path';

const inquirer = require('inquirer');
const Web3 = require('web3');

const FAUCET_URL = 'https://faucet.mosaicdao.org';

async function fundFromFaucet(beneficiary: string, chain: string): Promise<void> {
  console.log(`Funding ${beneficiary} for chain ${chain}`);
  const response = await axios.post(
    FAUCET_URL,
    {
      beneficiary: `${beneficiary}@${chain}`,
    },
  );
  console.log(`Transaction hash is ${response.data.txHash}`);
}

async function createActor(): Promise<void> {
  const answer = await inquirer.prompt([
    {
      type: 'string',
      name: 'actor',
      message: 'Select actor type i.e. depositor or withdrawer:',
      validate(input: string): boolean {
        return input === 'depositor' || input === 'withdrawer';
      },
    },
    {
      type: 'password',
      name: 'password',
      message: 'Select password for keystore file:',
      validate(input: string): boolean {
        return input.length > 0;
      },
    },
    {
      type: 'string',
      name: 'shouldFundDepositor',
      message: 'Should fund OST to depositor on origin chain with faucet (y/n)?:',
      validate(input: string): boolean {
        return input === 'y' || input === 'n';
      },
      when: (response: any): boolean => response.actor === 'depositor',
    },
    {
      type: 'string',
      name: 'shouldFundWithdrawer',
      message: 'Should fund base token to withdrawer on metachain with faucet (y/n)?:',
      validate(input: string): boolean {
        return input === 'y' || input === 'n';
      },
      when: (response: any): boolean => response.actor === 'withdrawer',
    },
  ]);

  const web3 = new Web3();
  const ethereumAccount = web3.eth.accounts.create(web3.utils.randomHex(8));

  if (answer.shouldFundDepositor === 'y') {
    await fundFromFaucet(ethereumAccount.address, '5');
    console.log(`✅ Funded ${100} OST to address ${ethereumAccount.address}`);
  }

  if (answer.shouldFundWithdrawer === 'y') {
    await fundFromFaucet(ethereumAccount.address, '1405');
    console.log(`✅ Funded ${20} Base token to address ${ethereumAccount.address}`);
  }

  const encryptedAccount = ethereumAccount.encrypt(answer.password);

  const filePath = path.join(__dirname, '/', `${answer.actor}.json`);
  fs.writeFileSync(filePath, JSON.stringify(encryptedAccount, null, '    '));
  console.log(`\n${answer.actor} address  ${ethereumAccount.address}`);
  console.log(`Encrypted key store path: ${filePath}`);
  console.log(`\n👉 ${answer.actor} must have fund perform transactions.`);
}

createActor().then((): void => {
  process.exit(0);
});
