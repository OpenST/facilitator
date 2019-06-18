'use strict';

import { assert } from  'chai'
import GraphClient from './../../src/GraphClient'

describe('GraphClient.constructor()', () => {
  let subgraphEndPoint;

  beforeEach(() => {
    subgraphEndPoint = '/subgraph/v1/subgraph1';
  });

  it('should construct with correct parameters', async () => {
    const graphClient = new GraphClient(subgraphEndPoint);
    assert(graphClient);
  });

});
