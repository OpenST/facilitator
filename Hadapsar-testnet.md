# Hadapsar Testnet - Move any ERC20 tokens

## Overview
A dApp developer can use the mosaic metachains to create any dApps. This can be done by moving any ERC20 tokens from the origin chain(Göerli) to the mosaic metachain(Hadapsar-1405) to get an equivalent amount of ERC20 tokens (utility tokens).
Following are the advantage.
- Lower transaction cost.
- Faster transactions.
- Value of ERC20 tokens(utility token) on the metachain is backed by the value of the deposited ERC20 token on the origin chain.


The following document will help to understand the steps required to move any ERC20 tokens between the Göerli testnet and hadapsar testnet 1405.
- **Deposit**<br/>
Any ERC20 token can be moved from origin chain(Göerli) to the metachain(Hadapsar-1405) by depositing the ERC20 token on the origin chain. An equivalent amount of ERC20 utility tokens (minus the fees) will be minted on the metachain.
- **Withdraw**<br/>
Any ERC20 utility token can be moved from metachain(Hadapsar-1405) to the origin chain(Göerli) by burning the ERC20 utility token on the metachain. An equivalent amount of ERC20 token (minus the fees) will be released to the beneficiary address on the origin chain.
- **Fee**<br/>
A small fee is deducted from the ERC20 token by the facilitator that moves the token between the chains. The user can define what fees he is willing to pay.

### Endpoints
- **Göerli endpoint**
  ```
  https://rpc.slock.it/goerli
  ```
- **Hadapsar-1405 endpoint**
  ```
  https://chain.mosaicdao.org/hadapsar
  ```

### Faucets to get the base tokens for the transactions.
- **Göerli faucet**<br>
  Get the GöEth for the deposit transaction using [Faucet](https://goerli-faucet.slock.it/)
- **OST Prime faucet**
  ```
  https://faucet.mosaicdao.org
  ```
  To get OST prime in the `beneficiaryAddress` please use the following curl command
  ```sh
  curl -H "Content-Type: text/json" -d '{"beneficiary": "<beneficiaryAddress>@1405"}' https://faucet.mosaicdao.org
  ```

### Contract addresses
- **Göerli**
  - ERC20Gateway: `0x26DdFbC848Ba67bB4329592021635a5bd8dcAe56`
- **Hadapsar-1405**
  - ERC20Cogateway: `0x25a1CE197371735D6EDccC178F90841a7CEc23bb`

## Deposit any ERC20 token on the Göerli testnet to get equivalent ERC20 utility tokens on hadapsar testnet 1405

### Prerequisites
1. Initialize npm and install dependencies using
  ```sh
  npm init
  npm install --save web3
  ```
2. Keystore
    - If keystore exists with the account address `0xabc`
      - Then save the keystore as `0xabc.json` and the password as `0xabc.password` in the same directory
    - Else, to generate keystore and save it in the required format follow [this](#account-creation)
3. The account should have sufficient token [balance](#balance) on the origin chain(Göerli)
4. The account should have base token (gas) to do the deposit transactions.<br>
  Get the GöEth for the deposit transaction using [Faucet](https://goerli-faucet.slock.it/)
5. Ethereum account should approve `ERC20Gateway` for token transfer.<br/>
  Create `approveERC20Gateway.js` as,
  ```js
  const fs = require('fs');
  const path = require('path');
  const Web3 = require('web3');

  const performApproveERC20GatewayTransaction = async () => {
    try {
      const erc20TokenApproveABI = [{
        constant: false,
        inputs: [{ internalType: 'address', name: '_spender', type: 'address' },
          { internalType: 'uint256', name: '_value', type: 'uint256' }],
        name: 'approve',
        outputs: [{ internalType: 'bool', name: 'success_', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      }];
      const erc20GatewayContractAddress = '0x26DdFbC848Ba67bB4329592021635a5bd8dcAe56';
      const web3 = new Web3('https://rpc.slock.it/goerli');

      const accountAddress = '<ACCOUNT_ADDRESS>';
      const amount = '<AMOUNT_TO_APPROVE>';
      const valueTokenAddress = '<VALUE_TOKEN_ADDRESS>';

      const keyStore = fs.readFileSync(path.join(__dirname, '/', `${accountAddress}.json`));
      const password = fs.readFileSync(path.join(__dirname, '/', `${accountAddress}.password`));
      const accountKeyStore = JSON.parse(keyStore.toString());
      const accountPassword = JSON.parse(password.toString());

      const web3Account = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
      const { privateKey } = web3Account;
      web3.eth.accounts.wallet.add(web3Account);

      const erc20ValueTokenContract = new web3.eth.Contract(
        erc20TokenApproveABI,
        valueTokenAddress,
      );

      const approveData = erc20ValueTokenContract.methods
        .approve(erc20GatewayContractAddress, amount)
        .encodeABI();
      const nonce = await web3.eth.getTransactionCount(accountAddress);
      const gasLimit = await web3.eth.estimateGas({
        from: accountAddress,
        to: valueTokenAddress,
        data: approveData,
      });

      const rawTxApprove = {
        from: accountAddress,
        nonce: `0x${nonce.toString(16)}`,
        data: approveData,
        to: valueTokenAddress,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3.eth.accounts.signTransaction(rawTxApprove, privateKey);
      web3.transactionConfirmationBlocks = 1;
      const transactionReceipt = await web3.eth.sendSignedTransaction(
        signedTx.raw || signedTx.rawTransaction,
      );

      console.log(transactionReceipt);
    } catch (error) {
      console.log(error.message);
    }
  };

  performApproveERC20GatewayTransaction();
  ```
  **Note:**
  - Add the values for `accountAddress`, `amount`, `valueTokenAddress` and run
  ```sh
  node approveERC20Gateway.js
  ```
6. Check the approved token [allowance](#allowance) on the origin chain(Göerli)

### Perform deposit transaction
  Create `deposit.js` as,
  ```js
  const fs = require('fs');
  const path = require('path');
  const Web3 = require('web3');

  const performDepositTransaction = async () => {
    try {
      const erc20GatewayContractDepositABI = [{
        constant: false,
        inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' },
          { internalType: 'address', name: '_beneficiary', type: 'address' },
          { internalType: 'uint256', name: '_feeGasPrice', type: 'uint256' },
          { internalType: 'uint256', name: '_feeGasLimit', type: 'uint256' },
          { internalType: 'address', name: '_valueToken', type: 'address' }],
        name: 'deposit',
        outputs: [{ internalType: 'bytes32', name: 'messageHash_', type: 'bytes32' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      }];
      const erc20GatewayContractAddress = '0x26DdFbC848Ba67bB4329592021635a5bd8dcAe56';
      const web3 = new Web3('https://rpc.slock.it/goerli');

      const accountAddress = '<ACCOUNT_ADDRESS>';
      const amount = '<AMOUNT_TO_DEPOSIT>';
      const beneficiary = '<BENEFICIARY_ADDRESS>';
      const feeGasPrice = '<FEE_GAS_PRICE>';
      const feeGasLimit = '<FEE_GAS_LIMIT>';
      const valueTokenAddress = '<VALUE_TOKEN_ADDRESS>';

      const keyStore = fs.readFileSync(path.join(__dirname, '/', `${accountAddress}.json`));
      const password = fs.readFileSync(path.join(__dirname, '/', `${accountAddress}.password`));
      const accountKeyStore = JSON.parse(keyStore.toString());
      const accountPassword = JSON.parse(password.toString());

      const web3Account = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
      const { privateKey } = web3Account;
      web3.eth.accounts.wallet.add(web3Account);

      const erc20GatewayContract = new web3.eth.Contract(
        erc20GatewayContractDepositABI,
        erc20GatewayContractAddress,
      );

      const depositData = erc20GatewayContract.methods
        .deposit(amount, beneficiary, feeGasPrice, feeGasLimit, valueTokenAddress)
        .encodeABI();
      const nonce = await web3.eth.getTransactionCount(accountAddress);
      const gasLimit = await web3.eth.estimateGas({
        from: accountAddress,
        to: erc20GatewayContractAddress,
        data: depositData,
      });

      const rawTxDeposit = {
        from: accountAddress,
        nonce: `0x${nonce.toString(16)}`,
        data: depositData,
        to: erc20GatewayContractAddress,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3.eth.accounts.signTransaction(rawTxDeposit, privateKey);
      web3.transactionConfirmationBlocks = 1;
      const transactionReceipt = await web3.eth.sendSignedTransaction(
        signedTx.raw || signedTx.rawTransaction,
      );

      console.log(transactionReceipt);
    } catch (error) {
      console.log(error.message);
    }
  };

  performDepositTransaction();
  ```
  **Note:**
  - Add the values for `accountAddress`, `amount`, `beneficiary`, `feeGasPrice`, `feeGasLimit`, `valueTokenAddress` and run
  ```sh
  node deposit.js
  ```

## Withdraw ERC20 utility token from the hadapsar testnet 1405 to get equivalent ERC20 token on Göerli testnet

### Prerequisites
1. Initialize npm and install dependencies using
  ```sh
  npm init
  npm install --save web3
  ```
2. Keystore
  - If keystore exists with the account address `0xabc`
    - Then save the keystore as `0xabc.json` and the password as `0xabc.password` in the same directory
  - Else, to generate keystore and save it in the required format follow [this](#account-creation)
3. The account should have sufficient Utility Token [balance](#balance) on the metachain(Hadapsar-1405)
4. The account should have base token (gas) to do the withdraw transactions.<br>
  Get the gas for the metachain(Hadapsar-1405)
  ```sh
  curl -H "Content-Type: text/json" -d '{"beneficiary": "<beneficiaryAddress>@1405"}' https://faucet.mosaicdao.org
  ```
5. Ethereum account should approve `ERC20Cogateway` for token transfer.<br>
  Create `approveERC20Cogateway.js` as,
  ```js
  const fs = require('fs');
  const path = require('path');
  const Web3 = require('web3');

  const performApproveERC20CogatewayTransaction = async () => {
    try {
      const erc20TokenApproveABI = [{
        constant: false,
        inputs: [{ internalType: 'address', name: '_spender', type: 'address' },
          { internalType: 'uint256', name: '_value', type: 'uint256' }],
        name: 'approve',
        outputs: [{ internalType: 'bool', name: 'success_', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      }];
      const erc20CogatewayContractAddress = '0x25a1CE197371735D6EDccC178F90841a7CEc23bb';
      const web3 = new Web3('https://chain.mosaicdao.org/hadapsar');

      const accountAddress = '<ACCOUNT_ADDRESS>';
      const amount = '<AMOUNT_TO_APPROVE>';
      const utilityTokenTokenAddress = '<UTILITY_TOKEN_ADDRESS>';

      const keyStore = fs.readFileSync(path.join(__dirname, '/', `${accountAddress}.json`));
      const password = fs.readFileSync(path.join(__dirname, '/', `${accountAddress}.password`));
      const accountKeyStore = JSON.parse(keyStore.toString());
      const accountPassword = JSON.parse(password.toString());

      const web3Account = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
      const { privateKey } = web3Account;
      web3.eth.accounts.wallet.add(web3Account);

      const erc20UtilityTokenContract = new web3.eth.Contract(
        erc20TokenApproveABI,
        utilityTokenTokenAddress,
      );

      const approveData = erc20UtilityTokenContract.methods
        .approve(erc20CogatewayContractAddress, amount)
        .encodeABI();
      const nonce = await web3.eth.getTransactionCount(accountAddress);
      const gasLimit = await web3.eth.estimateGas({
        from: accountAddress,
        to: utilityTokenTokenAddress,
        data: approveData,
      });

      const rawTxApprove = {
        from: accountAddress,
        nonce: `0x${nonce.toString(16)}`,
        data: approveData,
        to: utilityTokenTokenAddress,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3.eth.accounts.signTransaction(rawTxApprove, privateKey);
      web3.transactionConfirmationBlocks = 1;
      const transactionReceipt = await web3.eth.sendSignedTransaction(
        signedTx.raw || signedTx.rawTransaction,
      );

      console.log(transactionReceipt);
    } catch (error) {
      console.log(error.message);
    }
  };

  performApproveERC20CogatewayTransaction();
  ```
  **Note:**
  - Add the values for `accountAddress`, `amount`, `utilityTokenTokenAddress` and run
  ```sh
  node approveERC20Cogateway.js
  ```
6. Check the approved token [allowance](#Allowance) on the metachain(Hadapsar-1405)

### Perform withdraw transaction
  Create `withdraw.js` as,
  ```js
  const fs = require('fs');
  const path = require('path');
  const Web3 = require('web3');

  const performWithdrawTransaction = async () => {
    try {
      const erc20CogatewayContractWithdrawABI = [{
        constant: false,
        inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' },
          { internalType: 'address', name: '_beneficiary', type: 'address' },
          { internalType: 'uint256', name: '_feeGasPrice', type: 'uint256' },
          { internalType: 'uint256', name: '_feeGasLimit', type: 'uint256' },
          { internalType: 'address', name: '_utilityToken', type: 'address' }],
        name: 'withdraw',
        outputs: [{ internalType: 'bytes32', name: 'messageHash_', type: 'bytes32' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      }];
      const erc20CogatewayContractAddress = '0x25a1CE197371735D6EDccC178F90841a7CEc23bb';
      const web3 = new Web3('https://chain.mosaicdao.org/hadapsar');

      const accountAddress = '<ACCOUNT_ADDRESS>';
      const utilityTokenAddress = '<UTILITY_TOKEN_ADDRESS>';
      const amount = '<AMOUNT_TO_WITHDRAW>';
      const beneficiary = '<BENEFICIARY_ADDRESS>';
      const feeGasPrice = '<FEE_GAS_PRICE>';
      const feeGasLimit = '<FEE_GAS_LIMIT>';

      const keyStore = fs.readFileSync(path.join(__dirname, '/', `${accountAddress}.json`));
      const password = fs.readFileSync(path.join(__dirname, '/', `${accountAddress}.password`));
      const accountKeyStore = JSON.parse(keyStore.toString());
      const accountPassword = JSON.parse(password.toString());

      const web3Account = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
      const { privateKey } = web3Account;
      web3.eth.accounts.wallet.add(web3Account);

      const erc20CogatewayContract = new web3.eth.Contract(
        erc20CogatewayContractWithdrawABI,
        erc20CogatewayContractAddress,
      );

      const withdrawData = erc20CogatewayContract.methods
        .withdraw(amount, beneficiary, feeGasPrice, feeGasLimit, utilityTokenAddress)
        .encodeABI();
      const nonce = await web3.eth.getTransactionCount(accountAddress);
      const gasLimit = await web3.eth.estimateGas({
        from: accountAddress,
        to: erc20CogatewayContractAddress,
        data: withdrawData,
      });

      const rawTxWithdraw = {
        from: accountAddress,
        nonce: `0x${nonce.toString(16)}`,
        data: withdrawData,
        to: erc20CogatewayContractAddress,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3.eth.accounts.signTransaction(rawTxWithdraw, privateKey);
      web3.transactionConfirmationBlocks = 1;
      const transactionReceipt = await web3.eth.sendSignedTransaction(
        signedTx.raw || signedTx.rawTransaction,
      );

      console.log(transactionReceipt);
    } catch (error) {
      console.log(error.message);
    }
  };

  performWithdrawTransaction();
  ```
  **Note:**
  - Add the values for `accountAddress`, `utilityTokenAddress`, `amount`, `beneficiary`, `feeGasPrice`, `feeGasLimit` and run
  ```sh
  node withdraw.js
  ```

## Balance
To check the ERC20 token balance on the chains<br>
Create `tokenBalance.js` as,
```js
const Web3 = require('web3');

const rpcEndpoint = '<RPC_ENDPOINT>';
const account = '<ACCOUNT_ADDRESS>';
const tokenAddress = '<VALUE_TOKEN_ADDRESS>';

const web3 = new Web3(rpcEndpoint);

const tokenBalanceABI = [{
  constant: true,
  inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
  name: 'balanceOf',
  outputs: [{ internalType: 'uint256', name: 'balance_', type: 'uint256' }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
}];
const tokenContract = new web3.eth.Contract(tokenBalanceABI, tokenAddress);

tokenContract.methods.balanceOf(account)
  .call()
  .then((balance) => {
    console.log(+balance);
  });
```
**Note:**
- Add the value for `rpcEndpoint`, `account`, `tokenAddress` and run
```sh
node tokenBalance.js
  ```

## Allowance
To check the ERC20 token allowance balances on the chains<br>
Create `approvedBalance.js` as,
```js
const Web3 = require('web3');

const rpcEndpoint = '<RPC_ENDPOINT>';
const account = '<ACCOUNT_ADDRESS>';
const tokenAddress = '<VALUE_TOKEN_ADDRESS>';
const gatewayContractAddress = '<GATEWAY_CONTRACT_ADDRESS>';

const web3 = new Web3(rpcEndpoint);

const tokenBalanceABI = [{
  constant: true,
  inputs: [{ internalType: 'address', name: '_owner', type: 'address' },
    { internalType: 'address', name: '_spender', type: 'address' }],
  name: 'allowance',
  outputs: [{ internalType: 'uint256', name: 'allowance_', type: 'uint256' }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
}];
const tokenContract = new web3.eth.Contract(tokenBalanceABI, tokenAddress);

tokenContract.methods.allowance(account, gatewayContractAddress)
  .call()
  .then((balance) => {
    console.log(+balance);
  });
```
**Note:**
- Add the value for `rpcEndpoint`, `account`, `tokenAddress`, `gatewayContractAddress` and run
```sh
node approvedBalance.js
```

## Account Creation
To create a keystore and save it in the required format
Create `createAccount.js` as,
```js
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

async function createAccount() {
  const password = '<PASSWORD>';

  const keystoreFilePath = __dirname;
  const web3 = new Web3(null);
  const ethereumAccount = web3.eth.accounts.create(web3.utils.randomHex(32));
  const encryptedAccount = ethereumAccount.encrypt(password);

  const filePath = path.join(keystoreFilePath, '/', `${ethereumAccount.address}.json`);
  fs.writeFileSync(filePath, JSON.stringify(encryptedAccount, null, '    '));

  const passwordFilePath = path.join(keystoreFilePath, '/', `${ethereumAccount.address}.password`);
  fs.writeFileSync(passwordFilePath, JSON.stringify(password, null, '    '));
}

createAccount();
```
**Note:**
- Install dependencies using
```sh
npm install --save web3 inquirer
```
- Add the value for `password` and run
```sh
node createAccount.js
```
