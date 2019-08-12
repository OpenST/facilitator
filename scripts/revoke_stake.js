

const Web3 = require('web3');

async function requestStake() {
  const web3 = new Web3('ws://34.244.36.178:50005');
  const privateKey = '0x0093660eefe7b3a80fd78ab81fbc14fab1251f1e20e08c5b0d49f382354f1cdb';
  const gatewayAddress = '0xe11e76C1ecA13Ae4ABA871EabDf37C24b8e1928B';
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  console.log('address ', account.address);
  web3.eth.accounts.wallet.add(account);
  const amountToStake = '4';
  const nonce = '4';
  const abi = [
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "stakeRequests",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "organization",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "name": "stakerProxies",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        },
        {
          "name": "",
          "type": "address"
        }
      ],
      "name": "stakeRequestHashes",
      "outputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "STAKEREQUEST_INTENT_TYPEHASH",
      "outputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "name": "_organization",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "beneficiary",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "gasPrice",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "gasLimit",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "nonce",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "staker",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "stakerProxy",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "gateway",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "stakeRequestHash",
          "type": "bytes32"
        }
      ],
      "name": "StakeRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "staker",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "stakeRequestHash",
          "type": "bytes32"
        }
      ],
      "name": "StakeRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "staker",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "stakeRequestHash",
          "type": "bytes32"
        }
      ],
      "name": "StakeRejected",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_amount",
          "type": "uint256"
        },
        {
          "name": "_beneficiary",
          "type": "address"
        },
        {
          "name": "_gasPrice",
          "type": "uint256"
        },
        {
          "name": "_gasLimit",
          "type": "uint256"
        },
        {
          "name": "_nonce",
          "type": "uint256"
        },
        {
          "name": "_gateway",
          "type": "address"
        }
      ],
      "name": "requestStake",
      "outputs": [
        {
          "name": "stakeRequestHash_",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_amount",
          "type": "uint256"
        },
        {
          "name": "_beneficiary",
          "type": "address"
        },
        {
          "name": "_gasPrice",
          "type": "uint256"
        },
        {
          "name": "_gasLimit",
          "type": "uint256"
        },
        {
          "name": "_nonce",
          "type": "uint256"
        },
        {
          "name": "_staker",
          "type": "address"
        },
        {
          "name": "_gateway",
          "type": "address"
        },
        {
          "name": "_hashLock",
          "type": "bytes32"
        }
      ],
      "name": "acceptStakeRequest",
      "outputs": [
        {
          "name": "messageHash_",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_amount",
          "type": "uint256"
        },
        {
          "name": "_beneficiary",
          "type": "address"
        },
        {
          "name": "_gasPrice",
          "type": "uint256"
        },
        {
          "name": "_gasLimit",
          "type": "uint256"
        },
        {
          "name": "_nonce",
          "type": "uint256"
        },
        {
          "name": "_gateway",
          "type": "address"
        }
      ],
      "name": "revokeStakeRequest",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_amount",
          "type": "uint256"
        },
        {
          "name": "_beneficiary",
          "type": "address"
        },
        {
          "name": "_gasPrice",
          "type": "uint256"
        },
        {
          "name": "_gasLimit",
          "type": "uint256"
        },
        {
          "name": "_nonce",
          "type": "uint256"
        },
        {
          "name": "_staker",
          "type": "address"
        },
        {
          "name": "_gateway",
          "type": "address"
        }
      ],
      "name": "rejectStakeRequest",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "destructStakerProxy",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  const ostComposerAddress = '0xEAA192D486ac5243886a28001E27A68caE5FDE4B';

  const contract = new web3.eth.Contract(abi, ostComposerAddress);
  contract.methods.revokeStakeRequest(
    amountToStake,
    account.address,
    '0',
    '0',
    nonce,
    gatewayAddress,
  )
    .send({
      from: account.address,
      gasPrice: '0x3B9ACA00',
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


requestStake().catch((error) => {
  console.log('Big error ', error);
});
