const Web3 = require('web3');

const gethEndpoint = 'ws://3.214.143.1:50003';
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
const simpleTokenAddress = '0xae96d2acd01ab795e5942591100f9f23adbe2a2e';
const ostComposerAddress = '0x4a633b3375a5b9eaa6ddc226ebe2ac832b557746';
const ostToTransfer = '11111111111';
const ethTOTransfer = '100000000000000000';
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
      ostToTransfer,
    ).send({
      from: stakerAccount.address,
      gasPrice: '0x174876E800',
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
      gasPrice: '0x174876E800',
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
      gasPrice: '0x174876E800',
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
  web3.eth.accounts.wallet.add(stakerAccount);
  console.log(`Staker address: ${stakerAccount.address}\n Staker private key: ${stakerAccount.privateKey}`);

  await transferOst(stakerAccount);
  await transferEth(stakerAccount);
  await approveOSTToComposer(stakerAccount);
}


execute().then(console.log('DONE'));
