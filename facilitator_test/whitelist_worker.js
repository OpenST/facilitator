const Web3 = require('web3');

async function whiteListOriginWorker() {
  const web3 = new Web3('http://34.244.36.178:40005');
  const composerOrganizationAddress = '0x64a3394F4b321E7F9930603dA2094af44c1E7500';
  const composerOrganizationOwnerPrivateKey = '0x082DF97BCD7B9AE1D0EF586D38EF744822A128EFB31C6DBC47E485049B7D12EA';
  const composerOrganizationOwnerAccount = web3.eth.accounts.privateKeyToAccount(
    composerOrganizationOwnerPrivateKey,
  );
  console.log(`composerOrganizationOwnerAccount address: ${composerOrganizationOwnerAccount.address}`);
  web3.eth.accounts.wallet.add(composerOrganizationOwnerAccount);
  const workerToWhitelist = '0xFa41c19b901849f439153baE98ad6D44a3a04403';
  const abi = [
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      name: 'workers',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'owner',
      outputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'proposedOwner',
      outputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'admin',
      outputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          name: '_owner',
          type: 'address',
        },
        {
          name: '_admin',
          type: 'address',
        },
        {
          name: '_workers',
          type: 'address[]',
        },
        {
          name: '_expirationHeight',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'proposedOwner',
          type: 'address',
        },
        {
          indexed: false,
          name: 'currentOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferInitiated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'newOwner',
          type: 'address',
        },
        {
          indexed: false,
          name: 'previousOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferCompleted',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'newAdmin',
          type: 'address',
        },
        {
          indexed: false,
          name: 'previousAdmin',
          type: 'address',
        },
      ],
      name: 'AdminAddressChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'worker',
          type: 'address',
        },
        {
          indexed: false,
          name: 'expirationHeight',
          type: 'uint256',
        },
      ],
      name: 'WorkerSet',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'worker',
          type: 'address',
        },
      ],
      name: 'WorkerUnset',
      type: 'event',
    },
    {
      constant: false,
      inputs: [
        {
          name: '_proposedOwner',
          type: 'address',
        },
      ],
      name: 'initiateOwnershipTransfer',
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
      inputs: [],
      name: 'completeOwnershipTransfer',
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
          name: '_admin',
          type: 'address',
        },
      ],
      name: 'setAdmin',
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
          name: '_worker',
          type: 'address',
        },
        {
          name: '_expirationHeight',
          type: 'uint256',
        },
      ],
      name: 'setWorker',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          name: '_worker',
          type: 'address',
        },
      ],
      name: 'unsetWorker',
      outputs: [
        {
          name: 'isUnset_',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          name: '_organization',
          type: 'address',
        },
      ],
      name: 'isOrganization',
      outputs: [
        {
          name: 'isOrganization_',
          type: 'bool',
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
          name: '_worker',
          type: 'address',
        },
      ],
      name: 'isWorker',
      outputs: [
        {
          name: 'isWorker_',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const contract = new web3.eth.Contract(abi, composerOrganizationAddress);
  const isWorkerResponse = await contract.methods.isWorker(workerToWhitelist).call();
  console.log(`isWorker response: ${isWorkerResponse}`);

  contract.methods.setWorker(
    workerToWhitelist,
    '10000000000000',
  )
    .send({
      from: composerOrganizationOwnerAccount.address,
      gasPrice: '0x2540BE400',
      gas: '3700724',
    }).on('error', (error) => {
      console.log('Error on deployment ', error);
    })
    .on('transactionHash', (transactionHash) => {
      console.log('Transaction hash ', transactionHash);
    })
    .on('receipt', (receipt) => {
      console.log('Receipt  ', receipt);
      console.log(receipt.contractAddress);
    });
}


whiteListOriginWorker().catch((error) => {
  console.log('Big error ', error);
});
