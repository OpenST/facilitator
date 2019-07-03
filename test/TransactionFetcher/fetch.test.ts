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
    const mockResponse = {
      data: {stakeRequesteds: []}
    };
    const spyGraphClientQuery = sinon.replace(
      graphClient,
      'query',
      sinon.fake.resolves(mockResponse),
    );
    const transactionFetcher = new TransactionFetcher(graphClient);
    const data = {
      stakeRequested: [{
        id: "0x0000000000000000000000000000000000000000000000000000000000000001-0",
        contractAddress: "0x0000000000000000000000000000000000000002",
      }]
    };

    const response = await transactionFetcher.fetch(data);
    assert.strictEqual(
      response,
      mockResponse,
      "Invalid response."
    );

    const query = EntityGraphQueries['stakeRequested'];
    const variables = {
      contractAddress: "0x0000000000000000000000000000000000000002",
      uts: 0,
    };
    SpyAssert.assert(spyGraphClientQuery, 1 , [[query, variables]]);

    sinon.restore();
  });
});
