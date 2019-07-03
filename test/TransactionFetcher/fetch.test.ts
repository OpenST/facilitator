import { assert } from 'chai';
import * as sinon from 'sinon';

import GraphClient from '../../src/GraphClient';
import TransactionFetcher from "../../src/TransactionFetcher";
import SpyAssert from "../utils/SpyAssert";
import EntityGraphQueries from "../../src/EntityGraphQueries";

describe('TransactionFetcher.fetch()', () => {

  it('should work with correct parameters', async () => {
    const mockApolloClient = sinon.stub as any;
    const graphClient = new GraphClient(mockApolloClient);

    const mockQueryResponse = {
      data: { stakeRequesteds: []
      },
    };
    const spyGraphClientQuery = sinon.replace(
      graphClient,
      'query',
      sinon.fake.resolves(mockQueryResponse),
    );
    const transactionFetcher = new TransactionFetcher(graphClient);

    const subscriptionResponse = {
      stakeRequesteds: [{
        id: "0x0000000000000000000000000000000000000000000000000000000000000021-0",
        contractAddress: "0x0000000000000000000000000000000000000022",
      }]
    };
    const response = await transactionFetcher.fetch(subscriptionResponse);
    const mockResponse = {
      stakeRequesteds: []
    };
    assert.equal(
      typeof(response),
      typeof(mockResponse),
      "Invalid response type."
    );
    assert.deepStrictEqual(
      response,
      mockResponse,
      "Invalid response."
    );

    const query = EntityGraphQueries['stakeRequesteds'];
    const variables = {
      contractAddress: "0x0000000000000000000000000000000000000022",
      uts: 0,
      limit: 100,
      skip: 0,
    };
    SpyAssert.assert(spyGraphClientQuery, 1 , [[query, variables]]);

    sinon.restore();
  });
});
