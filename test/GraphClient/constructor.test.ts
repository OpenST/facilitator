'use strict';

import { assert } from  'chai'
const sinon = require('sinon');
import GraphClient from './../../src/GraphClient'

describe('GraphClient.constructor()', () => {

  it('should construct with correct parameters', async () => {
    const mockApolloClient = sinon.stub;
    const graphClient = new GraphClient(mockApolloClient);

    assert(
      graphClient,
      "Invalid graph client object!!!"
    );

    sinon.restore();
  });

});
