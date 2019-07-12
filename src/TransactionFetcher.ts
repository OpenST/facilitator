import EntityGraphQueries from './EntityGraphQueries';
import GraphClient from './GraphClient';

/**
 * The class fetches the transactions based on contract address and uts.
 */
export default class TransactionFetcher {
  private readonly graphClient: GraphClient;

  private readonly queryLimit = 100;

  /**
   * Constructor
   * @param graphClient Graph client object.
   */
  public constructor(graphClient: GraphClient) {
    this.graphClient = graphClient;
  }

  /**
   * Queries graph node.
   *
   * @param data Data received from subscription.
   * @return Graph query response from graph node.
   */
  public async fetch(data: Record<string, any[]>): Promise<{[key: string]: object[]}> {
    const entity = (Object.keys(data)[0]);
    const entityRecord = data[entity][0];
    const query = EntityGraphQueries[entity];
    // Fetch uts based on entity & contract address from ContractEntity model and update the
    // variables object uts field. <PLACEHOLDER>
    let skip = 0;
    let transactions: object[] = [];
    const response: any = {};
    while (true) {
      const variables = {
        contractAddress: entityRecord.contractAddress,
        uts: 0,
        limit: this.queryLimit,
        skip,
      };
      /* eslint-disable no-await-in-loop */
      // Note: await is needed here because GraphQL doesn't support aggregated count query.
      const graphQueryResult = await this.graphClient.query(query, variables);
      if (graphQueryResult.data[entity].length === 0) break;
      transactions = transactions.concat(graphQueryResult.data[entity]);
      skip += this.queryLimit;
    }

    response[entity] = transactions;
    return response;
  }
}
