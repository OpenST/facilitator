import * as sinon from 'sinon';
import { assert } from 'chai';

import Facilitator from '../../src/Facilitator';
import GraphClient from '../../src/GraphClient';
import Subscriber from '../../src/Subscriber';
import { Config, DBConfig, FacilitatorConfig } from '../../src/Config';
import SpyAssert from '../utils/SpyAssert';
import Database from '../../src/models/Database';

describe('Facilitator.start()', () => {
  it('should start facilitation', async () => {
    const mockGraphClient = sinon.createStubInstance(GraphClient);
    const databaseSpy = sinon.replace(
      Database,
      'create',
      sinon.fake.resolves(true),
    );
    const graphClientSpy = sinon.replace(
      GraphClient,
      'getClient',
      sinon.fake.returns(mockGraphClient),
    );
    const subscribeStub = sinon.stub(Subscriber.prototype, 'subscribe');
    const subGraphDetails = Facilitator.getSubscriptionDetails();

    const fakePath = 'SomePath';
    const database = sinon.createStubInstance(DBConfig);
    database.path = fakePath;
    const facilitatorStub = sinon.createStubInstance(FacilitatorConfig);
    facilitatorStub.database = database;
    const configStub = sinon.createStubInstance(Config);
    configStub.facilitator = facilitatorStub;

    const facilitator = new Facilitator(configStub);
    await facilitator.start();

    SpyAssert.assert(databaseSpy, 1, [[fakePath]]);

    SpyAssert.assert(
      graphClientSpy,
      2,
      [
        [subGraphDetails.origin.subGraphEndPoint],
        [subGraphDetails.auxiliary.subGraphEndPoint],
      ],
    );

    assert.strictEqual(
      2,
      subscribeStub.callCount,
      'Subscribe must be called twice',
    );

    subscribeStub.restore();
    sinon.restore();
  });
});
