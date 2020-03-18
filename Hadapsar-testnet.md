# User documentation - Hadapsar Testnet

The following documentation will help you in understanding the steps required to move the ERC20 tokens between the Goerli testnet and hadapsar testnet 1405

## Move any ERC20 token from Goerli testnet to hadapsar testnet 1405

1. To connect to the Goerli testnet(origin chain):
  RPC endpoint: https://rpc.slock.it/goerli
1. Get the GöEth for the deposit transaction using [Faucet](https://goerli-faucet.slock.it/)
1. Ensure that the account has sufficient value token [balance](#balance)
  - If using OST as value token then, fund the account using
  ```sh
  curl -H "Content-Type: text/json" -d '{"beneficiary": "<beneficiaryAddress>@5"}' https://faucet.mosaicdao.org
  ```
1. Perform deposit transaction
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

      const web3Origin = new Web3('https://rpc.mosaicdao.org/goerli');

      const valueTokenAddress = '0xd426b22f3960d01189a3d548b45a7202489ff4de';
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
        data: depositData
      });

      const rawTxDeposit = {
        from: account,
        nonce: `0x${nonce.toString(16)}`,
        data: depositData,
        to: erc20GatewayContractAddress,
        gasLimit: gasLimit,
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
  - Add the values for `account`, `privateKey`, `amount`, `beneficiary`, `feeGasPrice`, `feeGasLimit` and run using
  ```sh
  node deposit.js
  ```
  - Install dependencies using
  ```sh
  npm install --save web3 ethereumjs-tx
  ```

## Move the ERC20 tokens back to Goerli testnet from hadapsar testnet 1405

1. To connect to the hadapsar testnet(metachain):

  RPC endpoint: https://chain.mosaicdao.org/hadapsar

  WS endpoint: wss://chain.mosaicdao.org/hadapsar/wss
1. Get the gas for the hadapsar testnet(metachain)(TODO: check if this is valid for the new chain or not)
  ```sh
  curl -H "Content-Type: text/json" -d '{"beneficiary": "<beneficiaryAddress>@1405"}' https://faucet.mosaicdao.org
  ```
1. Ensure that the account has sufficient Utility Token [balance](#balance)
1. Perform withdraw transaction
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
        data: withdrawData
      });

      const rawTxWithdraw = {
        from: account,
        nonce: `0x${nonce.toString(16)}`,
        data: withdrawData,
        to: erc20CogatewayContractAddress,
        gasLimit: gasLimit,
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
  npm install --save web3 ethereumjs-tx
  ```

## Balance
1. Check the ERC20 token balance on the Göerli testnet(origin)
  Create `originTokenBalance.js` as,
  ```js
  const Web3 = require('web3');

  const web3Origin = new Web3('https://chain.mosaicdao.org/hadapsar');

  const account = '<ACCOUNT_ADDRESS>';
  const valueTokenAddress = '0xd426b22f3960d01189a3d548b45a7202489ff4de';
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
  - Add the value for `account` and run using
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
