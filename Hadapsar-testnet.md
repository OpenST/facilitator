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
  To get base token (OST prime) for the metachain 1405 in the `beneficiaryAddress` please use the following curl command
  ```sh
  curl -H "Content-Type: text/json" -d '{"beneficiary": "<beneficiaryAddress>@1405"}' https://faucet.mosaicdao.org
  ```
  **Please note:** Please return the token to the faucet address `0x73E4876C03412139751895879c203d1FE0A0E004` if it will not be used.

### Contract addresses
- **Göerli**
  - ERC20Gateway: `0x9B0fd9FB015d9311738ed5aECfF3A626e7A149C1`
- **Hadapsar-1405**
  - ERC20Cogateway: `0x2d986Be491664A5ad13DD5A06820f539d353bb12`

## Deposit any ERC20 token on the Göerli testnet to get equivalent ERC20 utility tokens on hadapsar testnet 1405

### Prerequisites
1. Initialize npm and install dependencies using
  ```sh
  npm init
  npm install --save web3
  ```
2. Unlock the accounts<br/>
  The ethereum accounts should be unlocked for any transactions<br>
  In the following example an encrypted keystore file and a password file is used<br/>
  **Keystore and password file**
    - An example to generate keystore is [here](#account-creation)
    - A complete file path for keystore and password files will be required in this example
3. The account should have sufficient ERC20 token [balance](#balance) to deposit on the origin chain(Göerli)
4. The account should have base token (gas) to do the deposit transactions.<br>
  Get the GöEth for the deposit transaction using [Faucet](https://goerli-faucet.slock.it/)
5. Ethereum account should approve `ERC20Gateway` for token transfer.<br/>
  Update these constants `APPROVE_AMOUNT`, `ACCOUNT_KEYSTORE_FILE_PATH`, `ACCOUNT_PASSWORD_FILE_PATH` and `ERC20_TOKEN_CONTRACT_ADDRESS` in the following code:
  
  Create `ApproveERC20Gateway.js` as,
  ```js
  const fs = require('fs');
  const Web3 = require('web3');

  const ERC20_GATEWAY_CONTRACT_ADDRESS = '0x9B0fd9FB015d9311738ed5aECfF3A626e7A149C1';
  const GOERLI_ENDPOINT = 'https://rpc.slock.it/goerli';

  // Please update the following constant values
  // The amount to be approved
  const APPROVE_AMOUNT = '<APPROVE_AMOUNT>';
  // The absolute file path of the keystore file
  const ACCOUNT_KEYSTORE_FILE_PATH = '<ACCOUNT_KEYSTORE_FILE_PATH>';
  // The absolute file path of the keystore password
  const ACCOUNT_PASSWORD_FILE_PATH = '<ACCOUNT_PASSWORD_FILE_PATH>';
  // The ERC20 contract address for the value token on origin chain(Göerli)
  const ERC20_TOKEN_CONTRACT_ADDRESS = '<TOKEN_ADDRESS>';
  

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
      const web3 = new Web3(GOERLI_ENDPOINT);
      const keyStore = fs.readFileSync(ACCOUNT_KEYSTORE_FILE_PATH);
      const password = fs.readFileSync(ACCOUNT_PASSWORD_FILE_PATH);
      const accountKeyStore = JSON.parse(keyStore.toString());
      const accountPassword = JSON.parse(password.toString());

      const accountAddress = `0x${accountKeyStore.address}`;

      const web3Account = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
      const { privateKey } = web3Account;
      web3.eth.accounts.wallet.add(web3Account);

      const erc20ValueTokenContract = new web3.eth.Contract(
        erc20TokenApproveABI,
        ERC20_TOKEN_CONTRACT_ADDRESS,
      );

      const approveData = erc20ValueTokenContract.methods
        .approve(ERC20_GATEWAY_CONTRACT_ADDRESS, APPROVE_AMOUNT)
        .encodeABI();
      const nonce = await web3.eth.getTransactionCount(accountAddress);
      const gasLimit = await web3.eth.estimateGas({
        from: accountAddress,
        to: ERC20_TOKEN_CONTRACT_ADDRESS,
        data: approveData,
      });

      const rawTxApprove = {
        from: accountAddress,
        nonce: `0x${nonce.toString(16)}`,
        data: approveData,
        to: ERC20_TOKEN_CONTRACT_ADDRESS,
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
  To execute `ApproveERC20Gateway.js`, run
  ```sh
  node ApproveERC20Gateway.js
  ```
6. Check the approved token [allowance](#allowance) on the origin chain(Göerli)

### Perform deposit transaction
  Update these constants `ACCOUNT_KEYSTORE_FILE_PATH`, `ACCOUNT_PASSWORD_FILE_PATH`, `DEPOSIT_AMOUNT`, `BENEFICIARY_ADDRESS`, `FEE_GAS_PRICE`, `FEE_GAS_LIMIT`, `ERC20_TOKEN_CONTRACT_ADDRESS` in the following code:
  
  Create `Deposit.js` as,
  ```js
  const Web3 = require('web3');
  const fs = require('fs');

  const ERC20_GATEWAY_CONTRACT_ADDRESS = '0x9B0fd9FB015d9311738ed5aECfF3A626e7A149C1';
  const GOERLI_ENDPOINT = 'https://rpc.slock.it/goerli';

  // Please update the following constant values
  // The absolute file path of the keystore file
  const ACCOUNT_KEYSTORE_FILE_PATH = '<ACCOUNT_KEYSTORE_FILE_PATH>';
  // The absolute file path of the keystore password
  const ACCOUNT_PASSWORD_FILE_PATH = '<ACCOUNT_PASSWORD_FILE_PATH>';
  // The amount to deposit
  const DEPOSIT_AMOUNT = '<DEPOSIT_AMOUNT>';
  // The beneficiary address which will get the equivalent ERC20 utility token on metachain(Hadapsar-1405)
  const BENEFICIARY_ADDRESS = '<BENEFICIARY_ADDRESS>';
  // The gas price at which the fee will be calculated
  const FEE_GAS_PRICE = '<FEE_GAS_PRICE>';
  // The gas limit at which the fee will be capped
  const FEE_GAS_LIMIT = '<FEE_GAS_LIMIT>';
  // The ERC20 contract address for the value token on origin chain(Göerli)
  const ERC20_TOKEN_CONTRACT_ADDRESS = '<TOKEN_ADDRESS>';

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
      const web3 = new Web3(GOERLI_ENDPOINT);
      const keyStore = fs.readFileSync(ACCOUNT_KEYSTORE_FILE_PATH);
      const password = fs.readFileSync(ACCOUNT_PASSWORD_FILE_PATH);
      const accountKeyStore = JSON.parse(keyStore.toString());
      const accountPassword = JSON.parse(password.toString());

      const accountAddress = `0x${accountKeyStore.address}`;

      const web3Account = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
      const { privateKey } = web3Account;
      web3.eth.accounts.wallet.add(web3Account);

      const erc20GatewayContract = new web3.eth.Contract(
        erc20GatewayContractDepositABI,
        ERC20_GATEWAY_CONTRACT_ADDRESS,
      );

      const depositData = erc20GatewayContract.methods
        .deposit(
          DEPOSIT_AMOUNT,
          BENEFICIARY_ADDRESS,
          FEE_GAS_PRICE,
          FEE_GAS_LIMIT,
          ERC20_TOKEN_CONTRACT_ADDRESS,
        )
        .encodeABI();
      const nonce = await web3.eth.getTransactionCount(accountAddress);
      const gasLimit = await web3.eth.estimateGas({
        from: accountAddress,
        to: ERC20_GATEWAY_CONTRACT_ADDRESS,
        data: depositData,
      });

      const rawTxDeposit = {
        from: accountAddress,
        nonce: `0x${nonce.toString(16)}`,
        data: depositData,
        to: ERC20_GATEWAY_CONTRACT_ADDRESS,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3.eth.accounts.signTransaction(rawTxDeposit, privateKey);
      web3.transactionConfirmationBlocks = 3;
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
  To execute `Deposit.js`, run
  ```sh
  node Deposit.js
  ```

## Withdraw ERC20 utility token from the hadapsar testnet 1405 to get equivalent ERC20 token on Göerli testnet

### Prerequisites
1. Initialize npm and install dependencies using
  ```sh
  npm init
  npm install --save web3
  ```
2. Unlock the accounts<br/>
  The ethereum accounts should be unlocked for any transactions<br>
  In the following example an encrypted keystore file and a password file is used<br/>
  **Keystore and password file**
    - An example to generate keystore is [here](#account-creation)
    - A complete file path for keystore and password files will be required in this example
3. The account should have sufficient ERC20 utility token [balance](#balance) to withdraw on the origin chain(Göerli) from the hadapsar metachain 1405.
4. The account should have base token (gas) to do the deposit transactions.<br>
  To get base token (OST prime) for the metachain 1405 in the `beneficiaryAddress` please use the following curl command
    ```sh
    curl -H "Content-Type: text/json" -d '{"beneficiary": "<beneficiaryAddress>@1405"}' https://faucet.mosaicdao.org
    ```
    **Please note:** Please return the token to the faucet address `0x73E4876C03412139751895879c203d1FE0A0E004` if it will not be used.

5. Ethereum account should approve `ERC20Cogateway` for token transfer.<br>
  Update these constants `APPROVE_AMOUNT`, `ACCOUNT_KEYSTORE_FILE_PATH`, `ACCOUNT_PASSWORD_FILE_PATH`, `ERC20_TOKEN_CONTRACT_ADDRESS` in the following code:
  
  Create `ApproveERC20Cogateway.js` as,
  ```js
  const Web3 = require('web3');
  const fs = require('fs');

  const ERC20_COGATEWAY_CONTRACT_ADDRESS = '0x2d986Be491664A5ad13DD5A06820f539d353bb12';
  const HADAPSAR_ENDPOINT = 'https://chain.mosaicdao.org/hadapsar';

  // Please update the following constant values
  // The amount to be approved
  const APPROVE_AMOUNT = '<APPROVE_AMOUNT>';
  // The absolute file path of the keystore file
  const ACCOUNT_KEYSTORE_FILE_PATH = '<ACCOUNT_KEYSTORE_FILE_PATH>';
  // The absolute file path of the keystore password
  const ACCOUNT_PASSWORD_FILE_PATH = '<ACCOUNT_PASSWORD_FILE_PATH>';
  // The ERC20 contract address for the utility token on metachain(Hadapsar-1405)
  const ERC20_TOKEN_CONTRACT_ADDRESS = '<TOKEN_ADDRESS>';

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
      const web3 = new Web3(HADAPSAR_ENDPOINT);
      const keyStore = fs.readFileSync(ACCOUNT_KEYSTORE_FILE_PATH);
      const password = fs.readFileSync(ACCOUNT_PASSWORD_FILE_PATH);
      const accountKeyStore = JSON.parse(keyStore.toString());
      const accountPassword = JSON.parse(password.toString());

      const accountAddress = `0x${accountKeyStore.address}`;

      const web3Account = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
      const { privateKey } = web3Account;
      web3.eth.accounts.wallet.add(web3Account);

      const erc20UtilityTokenContract = new web3.eth.Contract(
        erc20TokenApproveABI,
        ERC20_TOKEN_CONTRACT_ADDRESS,
      );

      const approveData = erc20UtilityTokenContract.methods
        .approve(ERC20_COGATEWAY_CONTRACT_ADDRESS, APPROVE_AMOUNT)
        .encodeABI();
      const nonce = await web3.eth.getTransactionCount(accountAddress);
      const gasLimit = await web3.eth.estimateGas({
        from: accountAddress,
        to: ERC20_TOKEN_CONTRACT_ADDRESS,
        data: approveData,
      });

      const rawTxApprove = {
        from: accountAddress,
        nonce: `0x${nonce.toString(16)}`,
        data: approveData,
        to: ERC20_TOKEN_CONTRACT_ADDRESS,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3.eth.accounts.signTransaction(rawTxApprove, privateKey);
      web3.transactionConfirmationBlocks = 3;
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
  To execute `ApproveERC20Cogateway.js`, run
  ```sh
  node ApproveERC20Cogateway.js
  ```
6. Check the approved token [allowance](#Allowance) on the metachain(Hadapsar-1405)

### Perform withdraw transaction
  Update these constants `ACCOUNT_KEYSTORE_FILE_PATH`, `ACCOUNT_PASSWORD_FILE_PATH`, `WITHDRAW_AMOUNT`, `BENEFICIARY_ADDRESS`, `FEE_GAS_PRICE`, `FEE_GAS_LIMIT`, `ERC20_TOKEN_CONTRACT_ADDRESS` in the following code:
  
  Create `Withdraw.js` as,
  ```js
  const Web3 = require('web3');
  const fs = require('fs');

  const ERC20_COGATEWAY_CONTRACT_ADDRESS = '0x2d986Be491664A5ad13DD5A06820f539d353bb12';
  const HADAPSAR_ENDPOINT = 'https://chain.mosaicdao.org/hadapsar';

  // Please update the following constant values
  // The absolute file path of the keystore file
  const ACCOUNT_KEYSTORE_FILE_PATH = '<ACCOUNT_KEYSTORE_FILE_PATH>';
  // The absolute file path of the keystore password
  const ACCOUNT_PASSWORD_FILE_PATH = '<ACCOUNT_PASSWORD_FILE_PATH>';
  // The amount to withdraw
  const WITHDRAW_AMOUNT = '<WITHDRAW_AMOUNT>';
  // The beneficiary address which will get the equivalent ERC20 token on origin chain(Göerli)
  const BENEFICIARY_ADDRESS = '<BENEFICIARY_ADDRESS>';
  // The gas price at which the fee will be calculated
  const FEE_GAS_PRICE = '<FEE_GAS_PRICE>';
  // The gas limit at which the fee will be capped
  const FEE_GAS_LIMIT = '<FEE_GAS_LIMIT>';
  // The ERC20 contract address for the utility token on metachain(Hadapsar-1405)
  const ERC20_TOKEN_CONTRACT_ADDRESS = '<TOKEN_ADDRESS>';

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
      const web3 = new Web3(HADAPSAR_ENDPOINT);
      const keyStore = fs.readFileSync(ACCOUNT_KEYSTORE_FILE_PATH);
      const password = fs.readFileSync(ACCOUNT_PASSWORD_FILE_PATH);
      const accountKeyStore = JSON.parse(keyStore.toString());
      const accountPassword = JSON.parse(password.toString());

      const accountAddress = `0x${accountKeyStore.address}`;

      const web3Account = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
      const { privateKey } = web3Account;
      web3.eth.accounts.wallet.add(web3Account);

      const erc20CogatewayContract = new web3.eth.Contract(
        erc20CogatewayContractWithdrawABI,
        ERC20_COGATEWAY_CONTRACT_ADDRESS,
      );

      const withdrawData = erc20CogatewayContract.methods
        .withdraw(
          WITHDRAW_AMOUNT,
          BENEFICIARY_ADDRESS,
          FEE_GAS_PRICE,
          FEE_GAS_LIMIT,
          ERC20_TOKEN_CONTRACT_ADDRESS,
        )
        .encodeABI();
      const nonce = await web3.eth.getTransactionCount(accountAddress);
      const gasLimit = await web3.eth.estimateGas({
        from: accountAddress,
        to: ERC20_COGATEWAY_CONTRACT_ADDRESS,
        data: withdrawData,
      });

      const rawTxWithdraw = {
        from: accountAddress,
        nonce: `0x${nonce.toString(16)}`,
        data: withdrawData,
        to: ERC20_COGATEWAY_CONTRACT_ADDRESS,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3.eth.accounts.signTransaction(rawTxWithdraw, privateKey);
      web3.transactionConfirmationBlocks = 3;
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
  To execute `Withdraw.js`, run
  ```sh
  node Withdraw.js
  ```

## Balance
To check the ERC20 token balance on the chains<br>
Update these constants `RPC_ENDPOINT`, `ACCOUNT_ADDRESS`, `TOKEN_ADDRESS` in the following code:

Create `TokenBalance.js` as,
```js
const Web3 = require('web3');

// Please update the following constant values
// The RPC endpoint of the chain
const RPC_ENDPOINT = '<RPC_ENDPOINT>';
// The ethereum account address
const ACCOUNT_ADDRESS = '<ACCOUNT_ADDRESS>';
// The ERC20 token contract address
const TOKEN_ADDRESS = '<TOKEN_ADDRESS>';
const web3 = new Web3(RPC_ENDPOINT);

const tokenBalanceABI = [{
  constant: true,
  inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
  name: 'balanceOf',
  outputs: [{ internalType: 'uint256', name: 'balance_', type: 'uint256' }],
  payable: false,
  stateMutability: 'view',
  type: 'function',
}];
const tokenContract = new web3.eth.Contract(tokenBalanceABI, TOKEN_ADDRESS);

tokenContract.methods.balanceOf(ACCOUNT_ADDRESS)
  .call()
  .then((balance) => {
    console.log(+balance);
  });
```
To execute `TokenBalance.js`, run
```sh
node TokenBalance.js
```

## Allowance
To check the ERC20 token allowance balances on the chains<br>
Update these constants `RPC_ENDPOINT`, `ACCOUNT_ADDRESS`, `TOKEN_ADDRESS`, `GATEWAY_CONTRACT_ADDRESS` in the following code:

Create `ApprovedBalance.js` as,
```js
const Web3 = require('web3');

// The RPC endpoint of the chain
const RPC_ENDPOINT = '<RPC_ENDPOINT>';
// The ethereum account address
const ACCOUNT_ADDRESS = '<ACCOUNT_ADDRESS>';
// The ERC20 token contract address
const TOKEN_ADDRESS = '<TOKEN_ADDRESS>';
// The Gateway or Cogateway contract address of origin chain(Göerli) or metachain(Hadapsar-1405) respectively
const GATEWAY_CONTRACT_ADDRESS = '<GATEWAY_CONTRACT_ADDRESS>';

const web3 = new Web3(RPC_ENDPOINT);

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
const tokenContract = new web3.eth.Contract(tokenBalanceABI, TOKEN_ADDRESS);

tokenContract.methods.allowance(ACCOUNT_ADDRESS, GATEWAY_CONTRACT_ADDRESS)
  .call()
  .then((balance) => {
    console.log(+balance);
  });
```
To execute `ApprovedBalance.js`, run
```sh
node ApprovedBalance.js
```

## Account Creation
To create a keystore and save it in the required format<br>
Update the following constant `PASSWORD` in the following code:

Create `CreateAccount.js` as,
```js
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

// Please update the following constant value
// The password for the keystore
const PASSWORD = '<PASSWORD>';

const keystoreFilePath = __dirname;
const web3 = new Web3(null);
const ethereumAccount = web3.eth.accounts.create(web3.utils.randomHex(32));
const encryptedAccount = ethereumAccount.encrypt(PASSWORD);

const filePath = path.join(keystoreFilePath, '/', `${ethereumAccount.address}.json`);
fs.writeFileSync(filePath, JSON.stringify(encryptedAccount, null, '    '));

const passwordFilePath = path.join(keystoreFilePath, '/', `${ethereumAccount.address}.password`);
fs.writeFileSync(passwordFilePath, JSON.stringify(PASSWORD, null, '    '));
console.log(`Generated account address: ${ethereumAccount.address}`);
console.log(`Encrypted keystore path: ${filePath}`);
console.log(`Encrypted keystore password path: ${passwordFilePath}`);
```
To execute `CreateAccount.js`, run
```sh
node CreateAccount.js
```
