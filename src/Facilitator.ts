import Config from './Config';

/**
 * The class defines properties and behaviour of facilitator.
 */
export default class Facilitator {

  private config: Config;

  private chainId: string;

  /**
   * Facilitator class constructor.
   *
   * @param {string} mosaicConfigPath MosaicConfig path.
   * @param {string} facilitatorConfigPath Facilitator config path.
   * @param {string} chainId Chain identifier to subscribe.
   */
  public constructor(mosaicConfigPath, facilitatorConfigPath, chainId) {
    this.config = new Config(mosaicConfigPath, facilitatorConfigPath);
    this.chainId = chainId;
  }

  /**
   * Starts the facilitator and subscribes to graph node.
   */
  public async start() {

  }

  /**
   * Stops the facilitator and unsubscribe to graph node.
   * This function should be called on signint or control-C
   */
  public async stop() {

  }

}
