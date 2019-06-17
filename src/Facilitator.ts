import { Config } from './Config';
import GraphNodeClient from './GraphNodeClient';

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
   * Starts the facilitator and subscribes to subgraphs.
   */
  public async start() {
    // Replace it with subgraph endpoint from config.
    const subGraphEndPoint = 'http://localhost:8000/subgraphs/name/openst/ost-composer';
    const graphNodeClient = new GraphNodeClient(subGraphEndPoint);

    // Loops through all subscription queries and subscribe to them
    for (var i = 0; i < this.getSubscriptionQueries.length; i++) {
      const subscriptionQry = this.getSubscriptionQueries[i];
      await graphNodeClient.subscribe(subscriptionQry);
    }
  }

  /**
   * Stops the facilitator and unsubscribe to graph node.
   * This function should be called on signint or control-c.
   */
  public async stop() {

  }

  /**
   * List of all subscription queries to subscribe.
   * Update the list of all subscription queries.
   * @return {string[]} List of subscription queries
   */
  private getSubscriptionQueries() {
    return ["subscription{stakeRequesteds{id}}"];
  }
}
