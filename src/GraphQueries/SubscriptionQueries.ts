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


const stateRootAvailableSubscriptionQuery = 'subscription{stateRootAvailables(orderBy: uts,'
  + ' orderDirection:'
  + ' desc, first: 1){'
+ '   id'
+ '   contractAddress '
+ '   uts '
+ '  }'
+ '}';

const SubscriptionQueries: Record<string, Record<string, string>> = {
  origin: {
    stakeRequesteds: 'subscription{stakeRequesteds(orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    stakeIntentDeclareds: 'subscription{stakeIntentDeclareds(orderBy: uts, orderDirection: desc,'
    + ' first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    stateRootAvailables: stateRootAvailableSubscriptionQuery,

    stakeProgresseds: 'subscription{stakeProgresseds(orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',
  },
  auxiliary: {
    stakeIntentConfirmeds: 'subscription{stakeIntentConfirmeds(orderBy: uts, orderDirection:'
    + ' desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    stateRootAvailables: stateRootAvailableSubscriptionQuery,

    mintProgresseds: 'subscription{mintProgresseds(orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    gatewayProvens: 'subscription{gatewayProvens(orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

  },

};

export default SubscriptionQueries;
