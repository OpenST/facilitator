import Config from './Config';

/**
 * The class defines properties and behaviour of facilitator.
 */
export default class Facilitator {
  private config: Config;

  private chainId: string;

  private dbConnection;

  /**
   * Facilitator class constructor.
   *
   * @param {string} config Config class object.
   * @param {object} dbConnection DB connection object.
   * @param {string} chainId Chain identifier to subscribe.
   */
  public constructor(config, dbConnection, chainId) {
    this.config = config;
    this.dbConnection = dbConnection;
    this.chainId = chainId;
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
