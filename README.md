# Facilitator

## Facilitator init

Facilitator init command will create facilitator config for an auxiliary chain. It would fail if the facilitator config is already generated for an auxiliary chain. 

A simple run would be the following:

```
./facilitator init --mosaic-config <mosaic-config> --chain-id <chain-id> --origin-password <origin-password> --auxiliary-password <auxiliary-password> --origin-rpc <origin-rpc> --auxiliary-rpc <auxiliary-rpc> --db-host <db-host>
```

* Replace `<mosaic-config>` with location where mosaic config is present.
* Replace `<chain-id>` with auxiliary chain id. 
* Replace `<origin-password>` with the password required for origin chain account.
* Replace `<auxiliary-password>` with the password required for auxiliary chain account.
* Replace `<origin-rpc>` with origin chain's rpc url.
* Replace `<auxiliary-rpc>` with auxiliary chain's rpc url.
* Replace `<db-host>` with the database path. It is the path for `sqlite` database. If not provided,it would create it.
	