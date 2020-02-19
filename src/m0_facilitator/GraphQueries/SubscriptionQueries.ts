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

const gatewayProvenSubscriptionQuery = 'subscription{gatewayProvens(orderBy: uts, orderDirection: desc, first: 1){'
+ '   id'
+ '   contractAddress '
+ '   uts '
+ '  }'
+ '}';

const SubscriptionQueries: Record<string, Record<string, string>> = {
  origin: {

    // Stake & Mint entities in origin

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

    stakeProgresseds: 'subscription{stakeProgresseds(orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    // Redeem & Unstake entities

    stateRootAvailables: stateRootAvailableSubscriptionQuery,

    gatewayProvens: gatewayProvenSubscriptionQuery,

    redeemIntentConfirmeds: 'subscription{redeemIntentConfirmeds(orderBy: uts, orderDirection:'
    + ' desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    unstakeProgresseds: 'subscription{unstakeProgresseds(orderBy: uts, orderDirection: desc,'
    + ' first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',
  },
  auxiliary: {

    // Stake & Mint entities in auxiliary

    redeemRequesteds: 'subscription{redeemRequesteds(orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    stateRootAvailables: stateRootAvailableSubscriptionQuery,

    gatewayProvens: gatewayProvenSubscriptionQuery,

    stakeIntentConfirmeds: 'subscription{stakeIntentConfirmeds(orderBy: uts, orderDirection:'
    + ' desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    mintProgresseds: 'subscription{mintProgresseds(orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    // Redeem & Unstake entities

    redeemIntentDeclareds: 'subscription{redeemIntentDeclareds(orderBy: uts, orderDirection: desc,'
    + ' first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

    redeemProgresseds: 'subscription{redeemProgresseds(orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',

  },
};

export default SubscriptionQueries;
