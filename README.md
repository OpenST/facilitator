# Facilitator

## Facilitator init

Facilitator init command will create facilitator config for an auxiliary chain. 

A simple run would be the following:

```
./facilitator init --mosaic-config <mosaic-config> --aux-chain-id <aux-chain-id> --origin-password <origin-password> --auxiliary-password <auxiliary-password> --origin-rpc <origin-rpc> --auxiliary-rpc <auxiliary-rpc> --origin-graph-ws <origin-graph-ws> --origin-graph-rpc <origin-graph-rpc> --auxiliary-graph-ws <auxiliary-graph-ws> --auxiliary-graph-rpc <auxiliary-graph-rpc> --db-path <db-path> --force
```

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

1. `./facilitator start --facilitator-config <facilitator-config> --mosaic-config <mosaic-config>`
    * Replace `<facilitator-config>` with the path to facilitator-config.json using `facilitator init`.   
    * `--mosaic-config` is optional argument.
    * If both `--mosaic-config` is given it will read mosaic and facilitator configs from `<mosaic-config>` and `<facilitator-config>` paths respectively. 

2. `./facilitator start <origin-chain> <aux-chain-id> `
	* Replace `<origin-chain>` with name of the origin chain.
	* Replace `<aux-chain-id>` with id of the auxiliary chain.
	
	##### Options
	* `--mosaic-config` and `--facilitator-config` refers to file path of mosaic config and facilitator config respectively. They are optional fields.
	* If `--mosaic-config` is given then it will read the facilitator config from default path for `<aux-chain-id>` and mosaic-config from `<mosaic-config>` path. Argument `<origin-chain>` and `<aux-chain-id>` should be present in mosaic-config.  
	* If `--facilitator-config` is given then it will read the mosaic config from default path for `<origin-chain>` and facilitator-config from `<facilitator-config>` path. Argument`<origin-chain>` and `<aux-chain-id>` should be present in it. 

## Setup Log Viewer

Command:
`
npm run log:viewer LOG_FILE_PATH=<log_file_path_to_view> USERNAME=<username> PASSWORD=<password>
`

You can see your logs at: http://127.0.0.1:9001/