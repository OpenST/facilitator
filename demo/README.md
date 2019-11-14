# Basic scripts for moving OST from Goerli into Mosaic-testnet (and out)

In order to send transactions on Mosaic-testnet, you will need OST as base coin to pay for gas. Mosaic executes Ethereum smart contracts at layer-2 and can be accessed with existing web3 tooling.


## scripts to move OST tokens from Goerli into Mosaic-testnet
  
  Simple token (OST) on goerli can be moved to mosaic  testnet (specifically auxiliary chainId 1405) to pay for transaction gas. Below commands will help to mint gas for mosaic 1405 testnet. 
  
  **Prerequisites:**

1. web3 RPC to `mosaic testnet` (auxiliary chainId 1405). You can run a full node by installing [mosaic chains](https://github.com/mosaicdao/mosaic-chains) npm package (in your dev dependencies):

   ```
    npm i @openst/mosaic-chains --save-dev
   ```
    and run
    ```
    ./node-modules/.bin/mosaic start goerli -g 
    ```
    to start a full node of Goerli in the background (see more instructions) 
  
 2. Synced Mosaic `1405` RPC to fullnode. Use mosaic chains to start `1405` node. 
    ```
       mosaic start 1405 --origin goerli -g
    ```
3. web3 RPC to `goerli` node.
   Optionally, you can use public goerli node **`https://rpc.slock.it/goerli`**
   
  **Steps:** 
  1. Clone facilitator repository

        ```
        git clone https://github.com/mosaicdao/facilitator
        ```
  2. Install dependencies
        ```
        cd facilitator
        npm ci
        ```
     
  3. Create staker and redeemer accounts:  If you wish to move token from `goerli` to `1405` then select `staker` as an actor or else select `redeemer` as an actor after running command. This command will also fund accounts from mosaic faucet. Faucet will fund simple token on `goerli` and gas on `1405`
  
      ```bash
        npm run create_keys:testnet
      ```  
      
     **Note**: You need to fund gas to staker address on goerli. You can use goerli [public faucet](https://goerli-faucet.slock.it/).
   
  4. Run below command to initiate request stake. This command will move simple token from `goerli` to `1405` testnet chain which can be used to pay for transaction gas. 
     
     ```bash
         npm run request_stake:testnet
     ``` 
     
  5. Run below command to initiate request redeem. This command will move gas token from `1405` to `goerli`. 
    
     ```bash
         npm run request_redeem:testnet

