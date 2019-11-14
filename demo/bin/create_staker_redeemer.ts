import * as path from 'path';
import * as fs from 'fs';

const axios = require('axios');
const Web3 = require('web3');
const inquirer = require('inquirer');

const FAUCET_URL = 'https://faucet.mosaicdao.org';

async function fundFromFaucet(beneficiary: string, chain: string) {
  console.log(`Funding ${beneficiary} for chain ${chain}`);
  const response = await axios.post(
    FAUCET_URL,
    {
      beneficiary: `${beneficiary}@${chain}`,
    },
  );
  console.log(`Transaction hash is ${response.data.txHash}`);
}

async function createActor() {
  const answer = await inquirer.prompt([
    {
      type: 'string',
      name: 'actor',
      message: 'select actor type i.e. staker or redeemer',
      validate(input: string) {
        return input === 'staker' || input === 'redeemer';
      },
    },
    {
      type: 'password',
      name: 'password',
      message: 'select password for keystore file',
      validate(input: string) {
        return input.length > 0;
      },
    },
    {
      type: 'string',
      name: 'shouldFund',
      message: 'Should fund staker with faucet (y/n)?',
      validate(input: string) {
        return input === 'y' || input === 'n';
      },
      when: (response: any) => response.actor === 'staker',
    },
  ]);

  const web3 = new Web3();
  const stakerAccount = web3.eth.accounts.create(web3.utils.randomHex(8));

  if (answer.shouldFund === 'y') {
    await fundFromFaucet(stakerAccount.address, '5');
    // await fundFromFaucet(stakerAccount.address, '1405');
  }

  const encrypedAccount = stakerAccount.encrypt(answer.password);

  const filePath = path.join(__dirname, '..', '..', `${answer.actor}.json`);
  fs.writeFileSync(filePath, JSON.stringify(encrypedAccount, null, '    '));
  console.log(`${answer.actor} address  ${stakerAccount.address}`);
  console.log(`Encrypted key store path: ${filePath}`);
  console.log(`👉 ${answer.actor} must have fund to perform transactions. Use public faucet ${'https://goerli-faucet.slock.it/'} for funding on value chain(goerli). Redeemer account is already funded with mosaic faucet.`);
}


createActor().then(() => {
  console.log('Actor Created  !!!');
  process.exit(0);
});
