import {Account} from "./Account";
import {MosaicConfig} from "./MosaicConfig";
import * as path from "path";
import * as fs from 'fs-extra';

// Database password key to read from env.
const DB_PASSWORD: string = "MOSAIC_FACILITATOR_DB_PASSWORD";

/**
 * Holds mosaic config, database config and facilitator config.
 */
export class Config {
    public database: Database;
    public chains: Record<string, any>;
    public mosaic: MosaicConfig;

    /**
     * Constructor.
     * @param mosaicConfigPath Mosaic config path.
     * @param facilitatorConfigPath Facilitator config path.
     */
    public constructor(
        mosaicConfigPath: string,
        facilitatorConfigPath: string
    ) {
        this.mosaic = MosaicConfig.fromPath(mosaicConfigPath);

        const facilitatorConfig = this.getConfigJsonFromPath(
            facilitatorConfigPath
        );

        this.database = new Database(facilitatorConfig);
        this.chains = this.getChains(facilitatorConfig);
    }

    /**
     * Get chain objects from given facilitator config.
     * @param facilitatorConfig Facilitator config json data.
     * @returns Array containing chain object.
     */
    private getChains(facilitatorConfig: Record<string, any>): Chain[] {
        let chainsJson:Record<string, any> = facilitatorConfig.chains;
        let chains:Chain[] = [];
        for (let key in chainsJson) {
            chains.push(new Chain(key, facilitatorConfig));
        }
        return chains;
    }

    private getConfigJsonFromPath(filePath: string): Record<string,any> {
        if (fs.existsSync(filePath)) {
            const config = fs.readFileSync(filePath).toString();
            if (config && config.length > 0) {
                return JSON.parse(config);
            }
        }
        return null;
    }
}

/**
 * Holds database configurations.
 */
export class Database {

    /** Database path */
    public path: string;

    /** Database user name */
    public userName: string;

    /** Database password */
    private _password: string;

    /**
     * Constructor.
     * @param facilitatorConfig Facilitator config json data.
     */
    public constructor(facilitatorConfig: Record<string, any>) {
        let dbJson:Record<string, any> = facilitatorConfig.database;
        this.path = dbJson.path;
        this.userName = dbJson.user_name;
        this._password = dbJson.password;
    }

    /**
     * Get the password for the database.
     */
    get password(): string {
        return process.env.MOSAIC_FACILITATOR_DB_PASSWORD || this._password;
    }
}

/**
 * Holds chain data
 */
export class Chain {

    /** Chain RPC endpoint. */
    public rpc: string;

    /** Worker account object. */
    public worker: Account;

    /**
     * Constructor.
     * @param chainId Chain id.
     * @param facilitatorConfig Facilitator config json data.
     */
    public constructor(readonly chainId: string, facilitatorConfig: Record<string, any>) {
        let chainData = facilitatorConfig.chains[chainId];
        this.rpc = chainData.rpc;
        this.worker = new Account(
            chainData.worker,
            facilitatorConfig.encrypted_accounts[chainData.worker]
        );
    }
}

