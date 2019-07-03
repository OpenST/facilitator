import * as sinon from 'sinon';
import { assert } from 'chai';

import Facilitator from '../../src/Facilitator';
import GraphClient from '../../src/GraphClient';
import Subscriber from '../../src/Subscriber';
import { Config, DBConfig, FacilitatorConfig } from '../../src/Config';
import SpyAssert from '../utils/SpyAssert';
import Database from '../../src/models/Database';
import HandlerFactory from '../../src/handlers/HandlerFactory';

describe('Facilitator.start()', () => {
  it('should start facilitation', async () => {
    const handlerFactoryStub = sinon.replace(
      HandlerFactory,
      'get',
      sinon.fake.resolves(true),
    );
    const mockGraphClient = sinon.createStubInstance(GraphClient);
    const fakeDatabase = 'fakeDataBase';
    const databaseSpy = sinon.replace(
      Database,
      'create',
      sinon.fake.resolves(fakeDatabase),
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

    SpyAssert.assert(
      handlerFactoryStub,
      1,
      [[fakeDatabase]],
    );

    SpyAssert.assert(databaseSpy, 1, [[fakePath]]);

    SpyAssert.assert(
      graphClientSpy,
      4,
      [
        ['http', subGraphDetails.origin.httpSubGraphEndPoint],
        ['ws', subGraphDetails.origin.wsSubGraphEndPoint],
        ['http', subGraphDetails.auxiliary.httpSubGraphEndPoint],
        ['ws', subGraphDetails.auxiliary.wsSubGraphEndPoint],
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
