import * as sinon from 'sinon';
import assert from '../test_utils/assert';

import GraphClient from '../../src/GraphClient';

describe('GraphClient.constructor()', () => {
  let mockApolloClient;

  it('should construct with correct parameters', async () => {
    mockApolloClient = sinon.stub as any;
    const graphClient = new GraphClient(mockApolloClient);

    assert(
      graphClient,
      'Invalid graph client object.',
    );

    sinon.restore();
  });
});
