# Facilitator

## Facilitator init

Facilitator init command will create facilitator config for an auxiliary chain. 

A simple run would be the following:

```
./facilitator init --gateway-config <gateway-config> --mosaic-config <mosaic-config> --aux-chain-id <aux-chain-id> --origin-password <origin-password> --auxiliary-password <auxiliary-password> --origin-rpc <origin-rpc> --auxiliary-rpc <auxiliary-rpc> --origin-graph-ws <origin-graph-ws> --origin-graph-rpc <origin-graph-rpc> --auxiliary-graph-ws <auxiliary-graph-ws> --auxiliary-graph-rpc <auxiliary-graph-rpc> --db-path <db-path> --force
```

* Replace `<gateway-config>` with location where gateway config is present.
* Replace `<mosaic-config>` with location where mosaic config is present.
* Replace `<aux-chain-id>` with auxiliary chain id. 
* Replace `<origin-password>` with the password required to encrypt the worker account of origin chain created with this command. It will be required to unlock worker account while starting facilitator.
* Replace `<auxiliary-password>` with the password required to encrypt the worker account of auxiliary chain created with this command. It will be required to unlock worker account while starting facilitator.
* Replace `<origin-rpc>` with origin chain's rpc url.
* Replace `<auxiliary-rpc>` with auxiliary chain's rpc url.
* Replace `<origin-graph-ws>` with origin ws subgraph endpoint.
* Replace `<origin-graph-rpc>` with origin rpc subgraph endpoint.
* Replace `<auxiliary-graph-ws>` with auxiliary ws subgraph endpoint.
* Replace `<auxiliary-graph-rpc>` with auxiliary rpc subgraph endpoint.
* Replace `<db-path>` with the database path. It is the path for `sqlite` database. If not provided,it would create it.
* `--force` option is used to forcefully override facilitator config. It is optional parameter.
	
## Facilitator Start

Facilitator start command will start the facilitator. 

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
