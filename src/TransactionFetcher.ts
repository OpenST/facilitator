import Facilitator from "./Facilitator";
import GraphClient from "./GraphClient";

/**
 * The class fetches the transactions based on uts.
 */
export default class TransactionFetcher {

  private readonly graphClient: GraphClient;

  /**
   * Constructor
   * @param graphClient Graph client object.
   */
  constructor(graphClient: GraphClient) {
    this.graphClient = graphClient;
  }

  /**
   * Queries graph node.
   *
   * @param data Data received from subscription.
   * @return {Promise<{data: object}>}
   */
  public async fetch(data: Record<string, object>): Promise<{data: object}> {
    const entity = Object.keys(data)[0];
    const query = Facilitator.getSubscriptionDetails().fetchQueries[entity];
    // Fetch entity based on uts from uts model and update the variables object
    // Current dummy value is 0
    const variables = {
      uts: 0,
    };
    const response = await this.graphClient.query(query, variables);
    return response;
  }
}