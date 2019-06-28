# Facilitator

## Facilitator init

Facilitator init command will create facilitator config for an auxiliary chain. 

A simple run would be the following:

```
./facilitator init --mosaic-config <mosaic-config> --chain-id <chain-id> --origin-password <origin-password> --auxiliary-password <auxiliary-password> --origin-rpc <origin-rpc> --auxiliary-rpc <auxiliary-rpc> --db-path <db-path> --force
```

* Replace `<mosaic-config>` with location where mosaic config is present.
* Replace `<chain-id>` with auxiliary chain id. 
* Replace `<origin-password>` with the password required to encrypt the worker account of origin chain created with this command. It will be required to unlock worker account while starting facilitator.
* Replace `<auxiliary-password>` with the password required to encrypt the worker account of auxiliary chain created with this command. It will be required to unlock worker account while starting facilitator.
* Replace `<origin-rpc>` with origin chain's rpc url.
* Replace `<auxiliary-rpc>` with auxiliary chain's rpc url.
* Replace `<db-path>` with the database path. It is the path for `sqlite` database. If not provided,it would create it.
* `--force` option is used to forcefully override facilitator config. It is optional parameter.
	
## Facilitator Start

Facilitator start command will start the facilitator. 

Facilitator can be started in below two ways :-

1. `./facilitator start --facilitator-config <facilitator-config>`
    * Replace `<facilitator-config>` with the path to facilitator-config.json using `facilitator init`.    

2. `./facilitator start <origin-chain> <aux-chain-id> --mosaic-config <mosaic-config> --facilitator-config <facilitator-config>`
	* Replace `<origin-chain>` with name of the origin chain.
	* Replace `<aux-chain-id>` with id of the auxiliary chain.
	* `--mosaic-config` and `--facilitator-config` refers to file path of mosaic config and facilitator config respectively. They are optional fields.

