'use strict';

import { assert } from  'chai'
import GraphClient from './../../src/GraphClient'
import { createMockClient } from 'mock-apollo-client';

describe('GraphClient.constructor()', () => {

  it('should construct with correct parameters', async () => {
    const apolloClient = createMockClient();
    const graphClient = new GraphClient(apolloClient);
    assert(graphClient);
  });

});
