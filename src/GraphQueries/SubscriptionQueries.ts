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
