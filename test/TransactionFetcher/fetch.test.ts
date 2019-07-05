import { assert } from 'chai';
import * as sinon from 'sinon';

import GraphClient from '../../src/GraphClient';
import TransactionFetcher from '../../src/TransactionFetcher';
import SpyAssert from '../test_utils/SpyAssert';
import FetchQueries from '../../src/GraphQueries/FetchQueries';

describe('TransactionFetcher.fetch()', () => {
  it('should work with correct parameters', async () => {
    const mockApolloClient = sinon.stub as any;
    const graphClient = new GraphClient(mockApolloClient);

    const subscriptionResponse = {
      stakeRequesteds: [{
        id: '0x0000000000000000000000000000000000000000000000000000000000000001-0',
        contractAddress: '0x0000000000000000000000000000000000000022',
      }],
    };

    const mockQueryResponseIterationOne = {
      data: {
        stakeRequesteds: [{
          id: '0x0000000000000000000000000000000000000000000000000000000000000021-0',
          contractAddress: '0x0000000000000000000000000000000000000022',
        }],
      },
    };
    const iterationOneVariables = {
      contractAddress: '0x0000000000000000000000000000000000000022',
      uts: 0,
      limit: 100,
      skip: 0,
    };

    const mockQueryResponseIterationTwo = {
      data: {
        stakeRequesteds: [{
          id: '0x0000000000000000000000000000000000000000000000000000000000000022-0',
          contractAddress: '0x0000000000000000000000000000000000000022',
        }],
      },
    };
    const iterationTwoVariables = {
      contractAddress: '0x0000000000000000000000000000000000000022',
      uts: 0,
      limit: 100,
      skip: 100,
    };

    const mockQueryResponseIterationThree = {
      data: { stakeRequesteds: [] },
    };
    const iterationThreeVariables = {
      contractAddress: '0x0000000000000000000000000000000000000022',
      uts: 0,
      limit: 100,
      skip: 200,
    };

    const spyGraphClientQuery = sinon.stub(
      graphClient,
      'query',
    );
    spyGraphClientQuery.onCall(0).resolves(mockQueryResponseIterationOne);
    spyGraphClientQuery.onCall(1).resolves(mockQueryResponseIterationTwo);
    spyGraphClientQuery.onCall(2).resolves(mockQueryResponseIterationThree);

    const transactionFetcher = new TransactionFetcher(graphClient);

    const response = await transactionFetcher.fetch(subscriptionResponse);
    const expectedResponse = {
      stakeRequesteds: [
        {
          id: '0x0000000000000000000000000000000000000000000000000000000000000021-0',
          contractAddress: '0x0000000000000000000000000000000000000022',
        },
        {
          id: '0x0000000000000000000000000000000000000000000000000000000000000022-0',
          contractAddress: '0x0000000000000000000000000000000000000022',
        },
      ],
    };
    assert.equal(
      typeof (response),
      typeof (expectedResponse),
      'Invalid response type.',
    );
    assert.deepStrictEqual(
      response,
      expectedResponse,
      'Invalid response.',
    );

    const query = FetchQueries.stakeRequesteds;
    SpyAssert.assert(spyGraphClientQuery, 3, [
      [query, iterationOneVariables],
      [query, iterationTwoVariables],
      [query, iterationThreeVariables],
    ]);

    sinon.restore();
  });
});
