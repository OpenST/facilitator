# Basic scripts for moving OST from Goerli into Mosaic-testnet (and out)

In order to send transactions on Mosaic-testnet, you will need OST as base coin to pay for gas. Mosaic executes Ethereum smart contracts at layer-2 and can be accessed with existing web3 tooling.

## Scripts to move OST tokens from Goerli into Mosaic-testnet

Simple token (OST) on goerli can be moved to mosaic testnet (specifically auxiliary chainId 1405) to pay for transaction gas. Below commands will help to mint gas for mosaic 1405 testnet.

**Prerequisites:**

1. Basic dependencies:

   - Node version v11.0.0 installed and set as default.
   - Docker version 19.03 or above
   - GNU Make 3.81 or above

2. web3 RPC to `mosaic testnet` (auxiliary chainId 1405). You can run a full node by installing [mosaic chains](https://github.com/mosaicdao/mosaic-chains) npm package (in your dev dependencies):

   ```bash
    npm i @openst/mosaic-chains --save-dev
   ```

   and run

   ```bash
   ./node_modules/.bin/mosaic start goerli -g
   ```

   to start a full node of Goerli in the background in a docker container.
   basic instructions for `mosaic-chains` [below](##-Quick-how-to-on-using-Mosaic-chains).

3. Synced Mosaic `1405` RPC to fullnode. Use mosaic chains to start `1405` node.

   ```bash
      mosaic start 1405 --origin goerli -g
   ```

4. web3 RPC to `goerli` node.
   Optionally, you can use public goerli node **`https://rpc.slock.it/goerli`**

**Steps:**

1. Clone facilitator repository

   ```bash
   git clone https://github.com/mosaicdao/facilitator
   ```

2. Install dependencies

   ```bash
   cd facilitator
   npm ci
   ```

3. Create staker or redeemer accounts: If you wish to move token from `goerli` to `1405` then select `staker` as an actor or else select `redeemer` as an actor when running command below. This command will also fund accounts from the mosaic faucet. Faucet will fund OST to your address on `goerli`.

   ```bash
     npm run create_keys:testnet
   ```

   **Note**: You need to manually fund ETH to your staker address on goerli. You can use goerli [public faucet](https://goerli-faucet.slock.it/).

4. Run below command to initiate request stake.

   In this step you should specify a `beneficiary` address that you control, as it will be the final receiver of the OST tokens on layer-2.

   Your funds will be transferred to a `stakePool` contract. From this pool, a facilitator service will accept your request to move the tokens into Layer-2; a facilitator is required because you yourself do not yet have tokens in Layer-2 to present the Merkle proofs for minting the tokens and locking them on Goerli. All addresses on Goerli are provided as defaults.

   This process may take a few minutes to complete, because once the facilitator accepts your request, Goerli's block history needs to be finalised on the Layer-2 chain, after which the facilitator will continue and present the Merkle proof to complete your request.

   tl;dr This command will move OST from `goerli` to your `beneficiary` address on `1405` testnet (just enter the default values when available)

   ```bash
    npm run request_stake:testnet
   ```

5. To move back out of Mosaic into Goerli, run below command to initiate request redeem. This command will move OST from `1405` to `goerli`.

   ```bash
    npm run request_redeem:testnet
   ```

## Quick how-to on using Mosaic-chains

- List all running services (chains, TheGraph indexing, IPFS nodes)

  ```bash
  ./mosaic list
  ```

- start an auxiliary chain (layer-2) (eg. testnet aux 1405 against Goerli). Use `-g` to not run additional indexing services to save resources.

  ```bash
  ./mosaic start 1405 --origin goerli -g
  ```

- start a standard layer-1 chain, eg Goerli testnet

  ```bash
  ./mosaic start goerli -g
  ```

- stop a chain (and associated services);

  ```bash
  ./mosaic stop 1405
  ./mosaic stop goerli
  ```

- you can find more information at [github.com/mosaicdao/mosaic-chains/](https://github.com/mosaicdao/mosaic-chains/)
