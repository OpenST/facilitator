// Copyright 2020 OpenST Ltd.
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


const availableStateRootSubscriptionQuery = 'subscription{availableStateRoots(orderBy: uts,'
  + ' orderDirection:'
  + ' desc, first: 1){'
+ '   id'
+ '   contractAddress '
+ '   uts '
+ '  }'
+ '}';

const provenGatewaysSubscriptionQuery = 'subscription{provenGateways(orderBy: uts, orderDirection: desc, first: 1){'
+ '   id'
+ '   contractAddress '
+ '   uts '
+ '  }'
+ '}';


const SubscriptionQueries: Record<string, Record<string, string>> = {
  origin: {

    // Deposit entities in origin

    declaredDepositIntents: 'subscription{declaredDepositIntents('
    + ' orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    // Withdraw entities

    availableStateRoots: availableStateRootSubscriptionQuery,

    provenGateways: provenGatewaysSubscriptionQuery,

    confirmedWithdrawIntents: 'subscription{confirmedWithdrawIntents(orderBy: uts, orderDirection:'
    + ' desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',
  },
  auxiliary: {

    // Deposit entities in auxiliary

    confirmedDepositIntents: 'subscription{confirmedDepositIntents('
    + ' orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    availableStateRoots: availableStateRootSubscriptionQuery,

    provenGateways: provenGatewaysSubscriptionQuery,

    createdUtilityTokens: 'subscription{createdUtilityTokens(orderBy: uts, orderDirection:'
    + ' desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    // Withdraw entities

    declaredWithdrawIntents: 'subscription{declaredWithdrawIntents('
    + ' orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

  },
};

export default SubscriptionQueries;
