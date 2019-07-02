import { assert } from 'chai';
import * as sinon from 'sinon';

import GraphClient from '../../src/GraphClient';
import TransactionFetcher from "../../src/TransactionFetcher";

describe('TransactionFetcher.constructor()', () => {

  it('should construct with correct parameters', async () => {
    const mockApolloClient = sinon.stub as any;
    const graphClient = new GraphClient(mockApolloClient);
    const transactionFetcher = new TransactionFetcher(graphClient);

    assert(
      transactionFetcher,
      'Invalid transaction fetcher object.',
    );

    sinon.restore();
  });
});
