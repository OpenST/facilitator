# Basic scripts for moving ERC20 tokens from Göerli testnet into Hadapsar testnet 1405 (and out)
The following scripts will help you in moving the ERC20 tokens from the origin chain(Göerli) to the mosaic metachain(Hadapsar-1405) where you can get the equivalent amount of ERC20 tokens (utility tokens).

## Prerequisites
1. Web3 RPC for the origin chain (Göerli) and metachain(Hadapsar-1405)
    1. If you want to use public nodes RPC urls:
        - Göerli node<br>
        **RPC:** `https://rpc.slock.it/goerli`
        - Public hadapsar node<br>
        **RPC:** `https://chain.mosaicdao.org/hadapsar`
    2. If you want to run full node
        - Install [mosaic chains](https://github.com/mosaicdao/mosaic-chains) npm package (in your dev dependencies):
        ```sh
        npm i @openst/mosaic-chains --save-dev
        ```
        - To run Göerli full node, run
        ```sh
        ./node-modules/.bin/mosaic start goerli -g
        ```
        - To run Hadapsar-1405 full node, run
        ```sh
        ./node-modules/.bin/mosaic start 1405 --origin goerli -g
        ```
    **Note:** Once the chains are synced use the local RPC url for deposit and withdraw requests
2. Clone facilitator repository
  ```sh
  git clone https://github.com/mosaicdao/facilitator
  ```
3. Install dependencies
  ```sh
  cd facilitator
  npm ci
  ```

## Steps to create depositor and initiate deposit request
Make sure that the prerequisites are met
1. Create depositor
  - Run the below script to create depositor account
  ```sh
  npm run create_keys:testnet:m1
  ```
  - Enter `depositor` when asked `Select actor type i.e. depositor or withdrawer:`
  - Next, enter the password to the keystore file
  - Next, enter `y` if you want to fund OST to depositor on the origin chain or `n` if not

  Example request flow,
  ```text
  Select actor type i.e. depositor or withdrawer: depositor
  Select password for keystore file: [hidden]
  Should fund OST to depositor on origin chain with faucet (y/n)?: y
  ```

2. Initiate deposit request
  - The depositor account must have sufficient GöEth and Value token balance to perform the approve and deposit transaction<br>
    Get the GöEth for the deposit transaction using [Faucet](https://goerli-faucet.slock.it/)
  - Run the below script to initiate deposit request
  ```sh
  npm run request_deposit:testnet
  ```
  Example request flow,
  ```text
  Enter origin chain(goerli) end point: https://rpc.slock.it/goerli
  Enter ERC20 token address: 0xd426b22f3960d01189a3d548b45a7202489ff4de
  Enter ERC20 gateway address: 0x9B0fd9FB015d9311738ed5aECfF3A626e7A149C1
  Enter transaction gas price: 0x3B9ACA00
  Enter depositor keystore filepath: /Users/facilitator/demo/m1_facilitator/bin/depositor.json
  Enter depositor keystore password: [hidden]
  Enter amount to deposit in atto: 10000000000000000000
  Enter gas price at which fee will be calculated: 10
  Enter gas limit at which fee will be calculated: 10
  Enter beneficiary address on the metachain(Hadapsar-1405): 0xf85a8ab13694b9bb4a3c69804619dc5a976f39df
  ```

## Steps to create withdrawer and initiate withdraw request
Make sure that the prerequisites are met
1. Create withdrawer
  - Run the below script to create withdrawer account
  ```sh
  npm run create_keys:m1:testnet
  ```
  - Enter `withdrawer` when asked `Select actor type i.e. depositor or withdrawer:`
  - Next, enter the password to the keystore file
  - Next, enter `y` if you want to fund base token to the withdrawer on the metachain or `n` if not

  Example request flow,
  ```text
  Select actor type i.e. depositor or withdrawer: withdrawer
  Select password for keystore file: [hidden]
  Should fund base token to withdrawer on metachain with faucet (y/n)?: y
  ```

2. Initiate withdraw request
  - The withdrawer account must have sufficient base token and utility token balance to perform the approve and deposit transaction<br>
  - Run the below script to initiate withdraw request
  ```sh
  npm run request_withdraw:testnet
  ```
  Example request,
  ```text
  Enter metachain(Hadapsar-1405) end point: https://chain.mosaicdao.org/hadapsar
  Enter ERC20 utility token address: 0x98266c031529eed13955909050257950e3b0e2e0
  Enter ERC20 Cogateway address: 0x2d986Be491664A5ad13DD5A06820f539d353bb12
  Enter transaction gas price: 0x3B9ACA00
  Enter withdrawer keystore filepath: /Users/facilitator/demo/m1_facilitator/bin/withdrawer.json
  Enter withdrawer keystore password: [hidden]
  Enter amount to deposit in atto: 5000000000000000000
  Enter gas price at which fee will be calculated: 10
  Enter gas limit at which fee will be calculated: 10
  Enter beneficiary address on the origin chain(Göerli): 0xf85a8ab13694b9bb4a3c69804619dc5a976f39df
  ```
