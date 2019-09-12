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

    unstakeProgresseds: 'subscription{stakeProgresseds(orderBy: uts, orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '   uts '
    + '  }'
    + '}',
  },
  auxiliary: {

    // Stake & Mint entities in auxiliary

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
