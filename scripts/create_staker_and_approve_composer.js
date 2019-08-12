const Web3 = require('web3');

const gethEndpoint = 'ws://34.244.36.178:50005';
const eip20Abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_from',
        type: 'address',
      },
      {
        indexed: true,
        name: '_to',
        type: 'address',
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_owner',
        type: 'address',
      },
      {
        indexed: true,
        name: '_spender',
        type: 'address',
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: 'tokenName_',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: 'tokenSymbol_',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: 'tokenDecimals_',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: 'totalTokenSupply_',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance_',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: 'allowance_',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: 'success_',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: 'success_',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: 'success_',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
const simpleTokenAddress = '0xd426b22f3960d01189a3d548b45a7202489ff4de';
const ostComposerAddress = '0xEAA192D486ac5243886a28001E27A68caE5FDE4B';
const ostToTransfer = '1000000000000000';
const ethTOTransfer = '1000000000000000';
const approveAmount = '1000000000000000';
const web3 = new Web3(gethEndpoint);

const reservePrivateKey = '0x9D966E0021308793DDEB9F997710DFCAC0141C8C26BF733996D532EF30631463';
const reserveAccount = web3.eth.accounts.privateKeyToAccount(reservePrivateKey);
console.log(`Reserve address: ${reserveAccount.address}`);
web3.eth.accounts.wallet.add(reserveAccount);

async function approveOSTToComposer(stakerAccount) {
  return new Promise((async (onResolve) => {
    const contract = new web3.eth.Contract(eip20Abi, simpleTokenAddress);
    return contract.methods.approve(
      ostComposerAddress,
      approveAmount,
    ).send({
      from: stakerAccount.address,
      gasPrice: '0x3B9ACA00',
      gas: '600000',
    }).on('error', (error) => {
      console.log('approveOSTToComposer: Error on approval ', error);
    }).on('transactionHash', (transactionHash) => {
      console.log('approveOSTToComposer: Transaction hash ', transactionHash);
    })
      .on('receipt', (receipt) => {
        console.log('approveOSTToComposer: Receipt  ', receipt);
        onResolve();
      });
  }));
}

async function transferEth(stakerAccount) {
  return new Promise((async (onResolve) => {
    return web3.eth.sendTransaction({
      from: reserveAccount.address,
      to: stakerAccount.address,
      value: ethTOTransfer,
      gasPrice: '0x3B9ACA00',
      gas: '21000',
    }).on('error', (error) => {
      console.log('transferEth: Error on transfer ', error);
    }).on('transactionHash', (transactionHash) => {
      console.log('transferEth: Transaction hash ', transactionHash);
    }).on('receipt', (receipt) => {
      console.log('transferEth: Receipt  ', receipt);
      onResolve();
    });
  }));
}

async function transferOst(stakerAccount) {
  return new Promise((async (onResolve) => {
    const contract = new web3.eth.Contract(eip20Abi, simpleTokenAddress);
    return contract.methods.transfer(
      stakerAccount.address,
      ostToTransfer,
    ).send({
      from: reserveAccount.address,
      gasPrice: '0x3B9ACA00',
      gas: '500000',
    }).on('error', (error) => {
      console.log('transferOst: Error on transfer ', error);
    }).on('transactionHash', (transactionHash) => {
      console.log('transferOst: Transaction hash ', transactionHash);
    })
      .on('receipt', (receipt) => {
        console.log('transferOst: Receipt  ', receipt);
        onResolve();
      });
  }));
}

async function execute() {
  const stakerAccount = web3.eth.accounts.create();
  // const privateKey = '0x06e2a04871e2f6c4c33e4f12ea994687f9dbcfc7fa4dea991b198865636ed5f4';
  // const stakerAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(stakerAccount);
  console.log(`Staker address: ${stakerAccount.address}\n Staker private key: ${stakerAccount.privateKey}`);

  await transferOst(stakerAccount);
  await transferEth(stakerAccount);
  await approveOSTToComposer(stakerAccount);
}


execute().then(console.log('DONE'));
