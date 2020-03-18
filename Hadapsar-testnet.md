# Hadapsar Testnet - Move any ERC20 tokens

## Overview
A dApp developer can use the mosaic metachains to create any dApps. This can be done by moving any ERC20 tokens from the origin chain (Goerli) to the mosaic metachain hadapsar 1405 to get an equivalent amount of ERC20 tokens (utility tokens).
Following are the advantage.
- Lower transaction cost.
- Faster transactions.
- Value of ERC20 tokens(utility token) on the metachain is backed by the value of the deposited ERC20 token on the origin chain.


The following document will help to understand the steps required to move any ERC20 tokens between the Goerli testnet and hadapsar testnet 1405.
- **Deposit**<br/>
Any ERC20 token can be moved from origin chain (Goerli) to the metachain(Hadapsar-1405) by depositing the ERC20 token on the origin chain. An equivalent amount of ERC20 utility tokens (minus the fees) will be minted on the metachain.
- **Withdraw**<br/>
Any ERC20 utility token can be moved from metachain(Hadapsar-1405) to the origin chain(Goerli) by burning the ERC20 utility token on the metachain. An equivalent amount of ERC20 token (minus the fees) will be released to the beneficiary address on the origin chain.
- **Fee**<br/>
A small fee is deducted from the ERC20 token by the facilitator that moves the token between the chains. The user can define what fees he is willing to pay.

### Endpoints
- **Goerli endpoint**
  ```
  https://rpc.slock.it/goerli
  ```
- **Hadapsar-1405 endpoint**
  ```
  https://chain.mosaicdao.org/hadapsar
  ```

### Faucets to get the base tokens for the transactions.
- **Göerli faucet**
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
- **Goerli**
  - ERC20Gateway: `0x26DdFbC848Ba67bB4329592021635a5bd8dcAe56`
- **Hadapsar-1405**
  - ERC20Cogateway: `0x25a1CE197371735D6EDccC178F90841a7CEc23bb`

## Deposit any ERC20 token on the Goerli testnet to get equivalent ERC20 utility tokens on hadapsar testnet 1405

### Prerequisite
1. Ethereum account should be unlocked.<br/>
  < Steps to unlock account >
2. Ethereum account should approve `ERC20Gateway` for token transfer.<br/>
  Create `approveERC20Gateway.js` as,
  ```js
  const Web3 = require('web3');

  const performApproveERC20GatewayTransaction = async () => {
    try {
      const erc20TokenApproveABI = [{
        'constant': false,
        'inputs': [{ 'internalType': 'address', 'name': '_spender', 'type': 'address' },
          { 'internalType': 'uint256', 'name': '_value', 'type': 'uint256' }],
        'name': 'approve',
        'outputs': [{ 'internalType': 'bool', 'name': 'success_', 'type': 'bool' }],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function',
      }];
      const erc20GatewayContractAddress = '0x26DdFbC848Ba67bB4329592021635a5bd8dcAe56';
      const web3Origin = new Web3('https://rpc.slock.it/goerli');

      const account = '<ACCOUNT_ADDRESS>';
      const privateKey = '<YOUR_PRIVATE_KEY>';
      const amount = '<AMOUNT_TO_APPROVE>';
      const valueTokenAddress = '<VALUE_TOKEN_ADDRESS>';

      const erc20ValueTokenContract = new web3Origin.eth.Contract(
        erc20TokenApproveABI,
        valueTokenAddress,
      );

      const approveData = erc20ValueTokenContract.methods
        .approve(erc20GatewayContractAddress, amount)
        .encodeABI();
      const nonce = await web3Origin.eth.getTransactionCount(account);
      const gasLimit = await web3Origin.eth.estimateGas({
        from: account,
        to: valueTokenAddress,
        data: approveData,
      });

      const rawTxApprove = {
        from: account,
        nonce: `0x${nonce.toString(16)}`,
        data: approveData,
        to: valueTokenAddress,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3Origin.eth.accounts.signTransaction(rawTxApprove, privateKey);
      const transactionReceipt = await web3Origin.eth.sendSignedTransaction(
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
  - Add the values for `account`, `privateKey`, `amount`, `valueTokenAddress` and run using
  ```sh
  node approveERC20Gateway.js
  ```
  - Install dependencies using
  ```sh
  npm install --save web3
  ```
3. Ethereum account should have base token (gas) to do the deposit transactions.

  Get the GöEth for the deposit transaction using [Faucet](https://goerli-faucet.slock.it/)

4. Ensure that the account has sufficient token [balance](#balance) on the origin chain
### Perform deposit transaction
  Create `deposit.js` as,
  ```js
  const Web3 = require('web3');

  const performDepositTransaction = async () => {
    try {
      const erc20GatewayContractDepositABI = [{
        'constant': false,
        'inputs': [{ 'internalType': 'uint256', 'name': '_amount', 'type': 'uint256' },
          { 'internalType': 'address', 'name': '_beneficiary', 'type': 'address' },
          { 'internalType': 'uint256', 'name': '_feeGasPrice', 'type': 'uint256' },
          { 'internalType': 'uint256', 'name': '_feeGasLimit', 'type': 'uint256' },
          { 'internalType': 'address', 'name': '_valueToken', 'type': 'address' }],
        'name': 'deposit',
        'outputs': [{ 'internalType': 'bytes32', 'name': 'messageHash_', 'type': 'bytes32' }],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function',
      }];
      const erc20GatewayContractAddress = '0x26DdFbC848Ba67bB4329592021635a5bd8dcAe56';

      const account = '<ACCOUNT_ADDRESS>';
      const privateKey = '<YOUR_PRIVATE_KEY>';
      const amount = '<AMOUNT_TO_DEPOSIT>';
      const beneficiary = '<BENEFICIARY_ADDRESS>';
      const feeGasPrice = '<FEE_GAS_PRICE>';
      const feeGasLimit = '<FEE_GAS_LIMIT>';
      const valueTokenAddress = '<VALUE_TOKEN_ADDRESS>';

      const web3Origin = new Web3('https://rpc.slock.it/goerli');

      const erc20GatewayContract = new web3Origin.eth.Contract(
        erc20GatewayContractDepositABI,
        erc20GatewayContractAddress,
      );

      const depositData = erc20GatewayContract.methods
        .deposit(amount, beneficiary, feeGasPrice, feeGasLimit, valueTokenAddress)
        .encodeABI();
      const nonce = await web3Origin.eth.getTransactionCount(account);
      const gasLimit = await web3Origin.eth.estimateGas({
        from: account,
        to: erc20GatewayContractAddress,
        data: depositData,
      });

      const rawTxDeposit = {
        from: account,
        nonce: `0x${nonce.toString(16)}`,
        data: depositData,
        to: erc20GatewayContractAddress,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3Origin.eth.accounts.signTransaction(rawTxDeposit, privateKey);
      const transactionReceipt = await web3Origin.eth.sendSignedTransaction(
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
  - Add the values for `account`, `privateKey`, `amount`, `beneficiary`, `feeGasPrice`, `feeGasLimit`, `valueTokenAddress` and run using
  ```sh
  node deposit.js
  ```
  - Install dependencies using
  ```sh
  npm install --save web3
  ```

## Withdraw ERC20 utility token from the hadapsar testnet 1405 to get equivalent ERC20 token on Göerli testnet

### Prerequisite
1. Ethereum account should be unlocked.
  < Steps to unlock account >
2. Ethereum account should approve ERC20Gateway for token transfer.
  Create approveERC20Cogateway.js as,
  ```js
  const Web3 = require('web3');

  const performApproveERC20CogatewayTransaction = async () => {
    try {
      const erc20TokenApproveABI = [{
        'constant': false,
        'inputs': [{ 'internalType': 'address', 'name': '_spender', 'type': 'address' },
          { 'internalType': 'uint256', 'name': '_value', 'type': 'uint256' }],
        'name': 'approve',
        'outputs': [{ 'internalType': 'bool', 'name': 'success_', 'type': 'bool' }],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function',
      }];
      const erc20CogatewayContractAddress = '0x25a1CE197371735D6EDccC178F90841a7CEc23bb';
      const web3Metachain = new Web3('https://chain.mosaicdao.org/hadapsar');

      const account = '<ACCOUNT_ADDRESS>';
      const privateKey = '<YOUR_PRIVATE_KEY>';
      const amount = '<AMOUNT_TO_APPROVE>';
      const utilityTokenTokenAddress = '<UTILITY_TOKEN_ADDRESS>';

      const erc20UtilityTokenContract = new web3Metachain.eth.Contract(
        erc20TokenApproveABI,
        utilityTokenTokenAddress,
      );

      const approveData = erc20UtilityTokenContract.methods
        .approve(erc20CogatewayContractAddress, amount)
        .encodeABI();
      const nonce = await web3Metachain.eth.getTransactionCount(account);
      const gasLimit = await web3Metachain.eth.estimateGas({
        from: account,
        to: utilityTokenTokenAddress,
        data: approveData,
      });

      const rawTxApprove = {
        from: account,
        nonce: `0x${nonce.toString(16)}`,
        data: approveData,
        to: utilityTokenTokenAddress,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3Metachain.eth.accounts.signTransaction(rawTxApprove, privateKey);
      const transactionReceipt = await web3Metachain.eth.sendSignedTransaction(
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
  - Add the values for `account`, `privateKey`, `amount`, `utilityTokenTokenAddress` and run using
  ```sh
  node approveERC20Cogateway.js
  ```
  - Install dependencies using
  ```sh
  npm install --save web3
  ```
3. Ethereum account should have base token (gas) to do the withdraw transactions.

  Get the gas for the hadapsar testnet(metachain)
  ```sh
  curl -H "Content-Type: text/json" -d '{"beneficiary": "<beneficiaryAddress>@1405"}' https://faucet.mosaicdao.org
  ```
4. Ensure that the account has sufficient Utility Token [balance](#balance) on the metachain

### Perform withdraw transaction
  Create `withdraw.js` as,
  ```js
  const Web3 = require('web3');

  const performWithdrawTransaction = async () => {
    try {
      const erc20CogatewayContractWithdrawABI = [{
        'constant': false,
        'inputs': [{ 'internalType': 'uint256', 'name': '_amount', 'type': 'uint256' },
          { 'internalType': 'address', 'name': '_beneficiary', 'type': 'address' },
          { 'internalType': 'uint256', 'name': '_feeGasPrice', 'type': 'uint256' },
          { 'internalType': 'uint256', 'name': '_feeGasLimit', 'type': 'uint256' },
          { 'internalType': 'address', 'name': '_utilityToken', 'type': 'address' }],
        'name': 'withdraw',
        'outputs': [{ 'internalType': 'bytes32', 'name': 'messageHash_', 'type': 'bytes32' }],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function',
      }];
      const erc20CogatewayContractAddress = '0x25a1CE197371735D6EDccC178F90841a7CEc23bb';

      const account = '<ACCOUNT_ADDRESS>';
      const privateKey = '<YOUR_PRIVATE_KEY>';
      const utilityTokenAddress = '<UTILITY_TOKEN_ADDRESS>';
      const amount = '<AMOUNT_TO_WITHDRAW>';
      const beneficiary = '<BENEFICIARY_ADDRESS>';
      const feeGasPrice = '<FEE_GAS_PRICE>';
      const feeGasLimit = '<FEE_GAS_LIMIT>';

      const web3Metachain = new Web3('https://chain.mosaicdao.org/hadapsar');

      const erc20CogatewayContract = new web3Metachain.eth.Contract(
        erc20CogatewayContractWithdrawABI,
        erc20CogatewayContractAddress,
      );

      const withdrawData = erc20CogatewayContract.methods
        .withdraw(amount, beneficiary, feeGasPrice, feeGasLimit, utilityTokenAddress)
        .encodeABI();
      const nonce = await web3Metachain.eth.getTransactionCount(account);
      const gasLimit = await web3Metachain.eth.estimateGas({
        from: account,
        to: erc20CogatewayContractAddress,
        data: withdrawData,
      });

      const rawTxWithdraw = {
        from: account,
        nonce: `0x${nonce.toString(16)}`,
        data: withdrawData,
        to: erc20CogatewayContractAddress,
        gasLimit,
        gasPrice: 10000000000,
      };

      const signedTx = await web3Metachain.eth.accounts.signTransaction(rawTxWithdraw, privateKey);
      const transactionReceipt = await web3Metachain.eth.sendSignedTransaction(
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
  - Add the values for `account`, `privateKey`, `utilityTokenAddress`, `amount`, `beneficiary`, `feeGasPrice`, `feeGasLimit` and run using
  ```sh
  node withdraw.js
  ```
  - Install dependencies using
  ```sh
  npm install --save web3
  ```

## Balance
1. Check the ERC20 token balance on the Göerli testnet(origin)
  Create `originTokenBalance.js` as,
  ```js
  const Web3 = require('web3');

  const web3Origin = new Web3('https://chain.mosaicdao.org/hadapsar');

  const account = '<ACCOUNT_ADDRESS>';
  const valueTokenAddress = '<VALUE_TOKEN_ADDRESS>';

  const tokenBalanceABI = [{
    "constant": true,
    "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "balance_", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }];
  const valueTokenContract = web3Origin.eth.contract(tokenBalanceABI).at(valueTokenAddress);
  valueTokenContract.balanceOf
    .call(account)
    .then((balance) => {
      console.log(+balance);
    });
  ```
  **Note:**
  - Add the value for `account`, `valueTokenAddress` and run using
  ```sh
  node originTokenBalance.js
  ```
  - Install dependencies using
  ```sh
  npm install --save web3
  ```
1. Check the ERC20 token balance on the Hadapsar testnet(metachain)
  Create `metachainTokenBalance.js` as,
  ```js
  const Web3 = require('web3');

  const web3Metachain = new Web3('https://rpc.mosaicdao.org/goerli');

  const account = '<ACCOUNT_ADDRESS>';
  const utilityTokenAddress = '<UTILITY_TOKEN_ADDRESS>';
  const tokenBalanceABI = [{
    "constant": true,
    "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "balance_", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }];
  const utilityTokenContract = web3Metachain.eth.contract(tokenBalanceABI).at(utilityTokenAddress);
  utilityTokenContract.balanceOf
    .call(account)
    .then((balance) => {
      console.log(balance);
    });
  ```
  **Note:**
  - Add the values for `account` and `utilityTokenAddress` and run using
  ```sh
  node metachainTokenBalance.js
  ```
  - Install dependencies using
  ```sh
  npm install --save web3
  ```
