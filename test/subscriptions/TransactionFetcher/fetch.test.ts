import { assert } from 'chai';
import * as sinon from 'sinon';

import BigNumber from 'bignumber.js';
import GraphClient from '../../../src/subscriptions/GraphClient';
import TransactionFetcher from '../../../src/subscriptions/TransactionFetcher';
import SpyAssert from '../../test_utils/SpyAssert';
import FetchQueries from '../../../src/GraphQueries/FetchQueries';
import StubData from '../../test_utils/StubData';
import ContractEntityRepository from '../../../src/repositories/ContractEntityRepository';

describe('TransactionFetcher.fetch()', () => {
  it('should work with correct parameters', async () => {
    const mockApolloClient = sinon.stub as any;
    const mockedContractEntityRepo = sinon.createStubInstance(ContractEntityRepository);

    const uts = new BigNumber(1);
    const contractEntityRepoSpy = sinon.replace(
      mockedContractEntityRepo,
      'get',
      sinon.fake.resolves(StubData.getContractEntity(uts)) as any,
    );
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
      uts,
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
      uts,
      limit: 100,
      skip: 100,
    };

    const mockQueryResponseIterationThree = {
      data: { stakeRequesteds: [] },
    };
    const iterationThreeVariables = {
      contractAddress: '0x0000000000000000000000000000000000000022',
      uts,
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

    const transactionFetcher = new TransactionFetcher(
      graphClient,
      mockedContractEntityRepo as any,
    );

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

    SpyAssert.assert(
      contractEntityRepoSpy,
      1,
      [[
        '0x0000000000000000000000000000000000000022', 'stakeRequesteds',
      ]],
    );

    sinon.restore();
  });
});
