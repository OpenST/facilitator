const stateRootAvailableSubscriptionQuery = 'subscription{stateRootAvailables(orderDirection:'
  + ' desc, first: 1){'
+ '   id'
+ '   contractAddress '
+ '  }'
+ '}';

const SubscriptionQueries: Record<string, Record<string, string>> = {
  origin: {
    stakeRequesteds: 'subscription{stakeRequesteds(orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '  }'
    + '}',

    stakeIntentDeclareds: 'subscription{stakeIntentDeclareds(orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '  }'
    + '}',

    stakeProgresseds: 'subscription{stakeProgresseds(orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '  }'
    + '}',
  },
  auxiliary: {
    stakeIntentConfirmeds: 'subscription{stakeIntentConfirmeds(orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '  }'
    + '}',

    stateRootAvailables: stateRootAvailableSubscriptionQuery,

    mintProgresseds: 'subscription{mintProgresseds(orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '  }'
    + '}',

    gatewayProvens: 'subscription{gatewayProvens(orderDirection: desc, first: 1){'
    + '   id'
    + '   contractAddress '
    + '  }'
    + '}',

  },

};

export default SubscriptionQueries;
