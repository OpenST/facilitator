import GraphClient from './GraphClient';
import { ENTITY_GRAPH_QUERY } from "./EntityGraphQueries";

/**
 * The class fetches the transactions based on contract address and uts.
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
   * @return Graph query response from graph node.
   */
  public async fetch(data: Record<string, any[]>): Promise<{data: object}> {
    const entity = Object.keys(data)[0];
    const entityRecord = data[entity][0];
    const query = ENTITY_GRAPH_QUERY[entity];
    // Fetch entity based on uts from ContractEntity model and update the variables object
    // Current dummy value is 0
    const variables = {
      contractAddress: entityRecord.contractAddress,
      uts: 0,
    };
    const response = await this.graphClient.query(query, variables);
    return response;
  }
}
