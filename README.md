# Facilitator 

Mosaic facilitator is an executable which enables atomic token transfers across two blockchains. Facilitator executable facilitates stake & mint and Redeem & unstake of any EIP20 token using mosaic gateways. Facilitator earns reward for facilitating token transfers across two blockchains.

## Prerequisite
1. Docker version `18.09.1` or above.
2. Docker compose version `1.23.2` or above.
3. Node version `11` or above.
4. Mosaic chains. 
   ```
   npm i @openst/mosaic-chains -g
   ```
5. Facilitator. 
   ```
   npm i @openst/facilitator -g
   ```   
6. Funds on origin chain and auxiliary chain are needed to perform transactions. For testnet, mosaic faucet can be used to get OST on origin chain and gas on auxiliary chain. Documentation about faucet is available [here](https://github.com/mosaicdao/faucet)   
7. Simple token balance on origin chain is required to stake bounty in the gateway or to mint gas for auxiliary chain. OST balance on auxiliary chain is required to stake bounty for redeem and unstake request.


## Setup facilitator: 
 
 **1. Start pair of chains**:
   
   You can skip this step, if there is existing chain pair and graph node already running. 
   
   *Start origin chain*: 

            mosaic start <origin-chain>
            
   *Start auxiliary chain*:
 
            mosaic start <auxiliary chain> --origin <origin-chain>
      
   *Example*:

      mosaic start ropsten
      mosaic start 1405 --origin ropsten

      
 Once chains have been successfully started, it will display web3 endpoint, graph admin rpc, graph ws end point and ipfs url. These URLs will be used in further steps. 
 
Documentation of supported mosaic chains can be found [here](https://github.com/mosaicdao/mosaic-chains).      


**2. Deploy stake pool and redeem pool**:  

Skip this step if stake and redeem pool already exists and you own the owner / admin keys used while deployment.

*Deploy stake pool*: Use below command to deploy stake pool contract for facilitation of stake and mint requests. Organization owner and admin keys will be needed to whitelist worker keys in next step.
       
  ```
  mosaic setup-stake-pool <originChain> <originWeb3EndPoint> <deployer> <organizationOwner> <organizationAdmin>
  ```
  Example
  ```
 mosaic setup-stake-pool 12346  http://localhost:8545 0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb 0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb 0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb
 ```
*Deploy redeem pool*: Use below command to deploy redeem pool contract for facilitation of redeem and unstake requests. Organization owner and admin keys will be needed to whitelist worker keys in next step.

```
mosaic setup-redeem-pool <originChain> <auxiliaryChain> <auxChainWeb3EndPoint> <deployer> <organizationOwner> <organizationAdmin>
```
Example
```
mosaic setup-redeem-pool 12346 500 http://localhost:40500 0x0000000000000000000000000000000000000001 0x0000000000000000000000000000000000000001 0x0000000000000000000000000000000000000001

```
 
 Documentation of deployment of stake and redeem pool can be found [here](https://github.com/mosaicdao/mosaic-chains#stake-pool).
 
 **3. Deploy subgraphs**: Origin and auxiliary subgraphs are needed for facilitator executable. Below commands will deploy origin and auxiliary subgraph. 

*Origin subgraph*: Below command will deploy origin subgraph. 
```
mosaic subgraph <origin-chain-identifier> <auxiliary-chain-identifier> origin <origin-graph-rpc-admin-url> <origin-graph-ipfs-url> 

```

*Auxiliary subgraph*: Below command will deploy auxiliary sugraph.

```
mosaic subgraph <origin-chain-identifier> <auxiliary-chain-identifier> auxiliary <aux-graph-rpc-admin-url> <aux-graph-ipfs-url> 

```

`<graph-rpc-admin-url>` and `<graph-ipfs-url>` was displayed while starting origin and auxiliary chain.

By default subgraph command deploys subgraph for OST gateways, optionally it also accepts `--mosaic-config`, `--gateway-config` and `--gateway-address` option to deploy subgraph for other gateways. 

Mosaic config i.e `mosaic.json` can be found [here](https://github.com/mosaicdao/mosaic-chains/tree/develop/chains) inside `<origin-chain>` folder.

Gateway config i.e. `<gatewayaddress>.json` can be found [here](https://github.com/mosaicdao/mosaic-chains/tree/develop/chains) inside `<origin-chain>/<auxiliary-chain>/<gateway-address.json`.

More documentation about `subgraph` command can be found [here](https://github.com/mosaicdao/mosaic-chains#subgraph-deployment).

**4. Facilitator init**: Facilitator init command initializes & populates seed data in database, generated worker addresses & encrypted keys for them and creates facilitator config file (is needed to start facilitator).  

```
facilitator init --mosaic-config <mosaic-config> --aux-chain-id <aux-chain-id> --origin-password <origin-password> --auxiliary-password <auxiliary-password> --origin-rpc <origin-rpc> --auxiliary-rpc <auxiliary-rpc> --origin-graph-ws <origin-graph-ws> --origin-graph-rpc <origin-graph-rpc> --auxiliary-graph-ws <auxiliary-graph-ws> --auxiliary-graph-rpc <auxiliary-graph-rpc> --db-path <db-path> --force

```

* Replace `<mosaic-config>` with file location where mosaic config is present.
* `<mosaic-config>` config can be found at `~/.mosaic/<origin-chain>/mosaic.json` where `<origin-chain>` is origin chain identifier e.g. `ropsten`, `goerli`, `ethereum` and `dev-origin`.

* Replace `<aux-chain-id>` with auxiliary chain id. 
* Replace `<origin-password>` with the password required to encrypt the worker account of origin chain created with this command. It will be required to unlock worker account while starting facilitator.
* Replace `<auxiliary-password>` with the password required to encrypt the worker account of auxiliary chain created with this command. It will be required to unlock worker account while starting facilitator.
* Replace `<origin-rpc>` with origin chain's rpc url.
* Replace `<auxiliary-rpc>` with auxiliary chain's rpc url.
* Replace `<origin-graph-ws>` with origin ws graph endpoint.
* Replace `<origin-graph-rpc>` with origin rpc graph admin rpc endpoint.
* Replace `<auxiliary-graph-ws>` with auxiliary ws graph endpoint.
* Replace `<auxiliary-graph-rpc>` with auxiliary rpc graph admin endpoint.
* Replace `<db-path>` with the database path. It is the path for `sqlite` database. If not provided,it would create it.
* `--force` option is used to forcefully override facilitator config. It is optional parameter.


Facilitator init can be also be done with `--gateway-config <gateway-config>` option. Gateway config i.e. `<gatewayaddress>.json` can be found in [here](https://github.com/mosaicdao/mosaic-chains/tree/develop/chains) inside `<origin-chain>/<auxiliary-chain>/<gateway-address.json`.

Replace <gateway-config> with file location where gateway config is present.


This command will generate facilitator config file which is needed to start facilitator. 


**5. Set ENV variables**: Facilitator init commands create worker keys which are encrypted with password. Enviornment variables need to be set to unlock the encrypted keystore file. 

Set below env variables after replacing address and password.
```
export MOSAIC_ADDRESS_PASSW_<Address>=<origin-password>
export MOSAIC_ADDRESS_PASSW_<Address>=<auxiliary-password>
```
Above variables will also be produced with the output of `facilitator init` command.

**6. Fund facilitator workers for gas and bounty**: Workers created in facilitator init step needs to be funded for gas and bounty on both chains.

   *Gas on origin*: Facilitator needs to pay for gas on origin chain. Origin worker address created in `facilitator init` step must be funded to pay for transaction fee. 
   
   There are various ways to fund worker on origin chain. For testnet any public faucet can be used. Below web3 transaction can also be done, if there is fund in an existing key.
   
      
      web3.eth.sendTransaction(
      {
         from:<funder_address>, 
          to: <origin_worker>,
          value:<Fund_in_wei
      })
      
   *Gas on auxiliary*: Facilitator also needs to pay for transaction fee on auxiliary chain. For testnet [mosaic faucet](https://github.com/mosaicdao/faucet) can be used to get fund. Alternatively, OST on value chain can also be converted to base token on auxiliary chain in order to pay for gas.
   
   *Value token for bounty*: Facilitator needs to stake bounty to gateway/co-gateway in order to perform stake & mint and redeem & unstake. Bounty token on the origin chain for existing mosaic chain is simple token and on the auxiliary chain bounty is base token. 
   
   On testnet, bounty can be funded to workers using [mosaic faucet](https://github.com/mosaicdao/faucet).
   
**7. White list workers**: origin and auxiliary workers should be whitelisted in stakepool and redeem pool contracts respectively. Below commands will whitelist the workers. 

   1. Clone git repository:
   ```
       git clone https://github.com/mosaicdao/mosaic-chains.git
   ```
   2. Set below enviornment variables
    
    export ORIGIN_WEB3_ENDPOINT='replace_with_origin_web3_endpoint';
    export AUXILIARY_WEB3_ENDPOINT='replace_with_auxiliary_web3_endpoint';
    export AUXILIARY_CHAIN_ID='replace_with_auxiliary_chain_id';
    export MOSAIC_CONFIG_PATH='replace_with_mosaic_config_path';
    export ORIGIN_WORKER_ADDRESS='replace_with_origin_worker_address';
    export AUXILIARY_WORKER_ADDRESS='replace_with_auxiliary_worker_address';
    export ORIGIN_WORKER_EXPIRATION_HEIGHT='replace_with_origin_expiration_height';
    export AUXILIARY_WORKER_EXPIRATION_HEIGHT='replace_with_auxiliary_expiration_height';

origin and auxiliary worker addresses are generated with `facilitator init` step. 
Mosaic config path for supported chain should be available on `~/.mosaic/<origin-chain>/mosaic.json` where `<origin-chain>` is origin chain identifier e.g. `ropsten`.  

origin and auxiliary worker expiration height is block height from current block for which worker keys are whitelisted. If current block is 1000 and expiration height is set to 100 then worker keys will be whitelisted for 1100 block.

   3. run command:
     
     npm run whitelist-workers
         

   Note: This command expects owner addresses of stake pool and redeem pool organization to be unlocked on the node. 
    

**8. Facilitator start**: Facilitator start command starts the facilitator process. 
- If facilitator-init is done using `<mosaic-config>` option, then use below command
```
facilitator start <origin-chain> <aux-chain-id> --facilitator-config <facilitator-config> --mosaic-config <mosaic-config>

```

- If facilitator-init is done using `<gateway-config>` option, then use below command
```
facilitator start <origin-chain> <aux-chain-id> --facilitator-config <facilitator-config> --gateway-config <gateway-config>

```

* Replace `<origin-chain>` with name of the origin chain identifier.
* Replace `<aux-chain-id>` with id of the auxiliary chain identifier. E.g. 1405, 1406, 1407 .
* Replace `<facilitator-config>` with the path to facilitator-config.json generated using `facilitator init`. Path will be at location `~/.mosaic/<aux-chain-id>/facilitator-config.json`.   
* Replace `<gateway-config>` with the path to gateway-config.json.
* Replace `<mosaic-config>` with the path to mosaic-config.json.


Details about facilitator start command can be found in [facilitator start options section](#Facilitator-start-options).


# Facilitator start options: 

Facilitator can be started in below two ways :-

#### Facilitator start for EIP20 gateways:	
1. `./facilitator start --facilitator-config <facilitator-config> --mosaic-config <mosaic-config>`
    * Replace `<facilitator-config>` with the path to facilitator-config.json generated using `facilitator init`.   
    * Replace `<mosaic-config>` with the path to mosaic-config.json.
	* When `--mosaic-config` and `--facilitator-config` is given then it will read gateway and facilitator configs from `<gateway-config>` and `<facilitator-config>` paths respectively and validates origin and aux chain id's.

2. `./facilitator start <origin-chain> <aux-chain-id> --facilitator-config <facilitator-config> --mosaic-config <mosaic-config>`
	* Replace `<origin-chain>` with name of the origin chain.
	* Replace `<aux-chain-id>` with id of the auxiliary chain.
	* Replace `<facilitator-config>` with the path to facilitator-config.json generated using `facilitator init`.   
    * Replace `<mosaic-config>` with the path to gateway-config.json.
    * It validates `<origin-chain>` and `<auxiliary-chain>` id's in faciltiator and mosaic configs.
    
3.  `./facilitator start <origin-chain> <aux-chain-id>`
	* It loads mosaic config and facilitator config from default paths.    

4.  `./facilitator start --facilitator-config <facilitator-config>`
	* It loads facilitator from `<facilitator-config>` path.
		
#### Facilitator start for mosaic gateways:

1. `./facilitator start --facilitator-config <facilitator-config> --gateway-config <gateway-config>`
    * Replace `<facilitator-config>` with the path to facilitator-config.json generated using `facilitator init`.   
    * Replace `<gateway-config>` with the path to gateway-config.json.
	* When `--gateway-config` and `--facilitator-config` is given then it will read gateway and facilitator configs from `<gateway-config>` and `<facilitator-config>` paths respectively and validates origin and aux chain id's.

2. `./facilitator start <origin-chain> <aux-chain-id> --facilitator-config <facilitator-config> --gateway-config <gateway-config>`
	* Replace `<origin-chain>` with name of the origin chain.
	* Replace `<aux-chain-id>` with id of the auxiliary chain.
	* Replace `<facilitator-config>` with the path to facilitator-config.json generated using `facilitator init`.   
    * Replace `<gateway-config>` with the path to gateway-config.json.	    
    
  * **Note** : Both `--mosaic-config` and `--gateway-config` are together not allowed in command.


    

