import { Config } from './Config';

/**
 * The class defines properties and behaviour of a facilitator.
 */
export default class Facilitator {
  private config: Config;

  private dbConnection: any;

  /**
   * Facilitator class constructor.
   *
   * @param {string} config Config class object.
   * @param {object} dbConnection DB connection object.
   */
  public constructor(config: Config, dbConnection: any) {
    this.config = config;
    this.dbConnection = dbConnection;
  }

  /**
   * Starts the facilitator and subscribes to graph node.
   */
  public async start() {

  }

  /**
   * Stops the facilitator and unsubscribe to graph node.
   * This function should be called on signint or control-c.
   */
  public async stop() {

  }
}
