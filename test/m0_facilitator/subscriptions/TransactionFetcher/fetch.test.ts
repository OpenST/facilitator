// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------


import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import FetchQueries from '../../../../src/m0_facilitator/GraphQueries/FetchQueries';
import ContractEntityRepository from '../../../../src/m0_facilitator/repositories/ContractEntityRepository';
import GraphClient from '../../../../src/m0_facilitator/subscriptions/GraphClient';
import TransactionFetcher from '../../../../src/m0_facilitator/subscriptions/TransactionFetcher';
import assert from '../../../test_utils/assert';
import SpyAssert from '../../../test_utils/SpyAssert';
import StubData from '../../../test_utils/StubData';

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
      skip: 0,
      limit: 100,
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
      skip: 100,
      limit: 100,
    };

    const mockQueryResponseIterationThree = {
      data: { stakeRequesteds: [] },
    };
    const iterationThreeVariables = {
      contractAddress: '0x0000000000000000000000000000000000000022',
      uts,
      skip: 200,
      limit: 100,
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
