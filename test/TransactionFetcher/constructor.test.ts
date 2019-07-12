import sinon from 'sinon';

import GraphClient from '../../src/GraphClient';
import TransactionFetcher from '../../src/TransactionFetcher';
import assert from '../test_utils/assert';

describe('TransactionFetcher.constructor()', () => {
  it('should construct with correct parameters', async () => {
    const mockApolloClient = sinon.stub as any;
    const graphClient = new GraphClient(mockApolloClient);
    const transactionFetcher = new TransactionFetcher(graphClient, sinon.mock() as any);

    assert(
      transactionFetcher,
      'Invalid transaction fetcher object.',
    );

    sinon.restore();
  });
});
