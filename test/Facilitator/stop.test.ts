import * as sinon from 'sinon';

import Facilitator from '../../src/Facilitator';
import GraphClient from '../../src/GraphClient';
import Subscriber from '../../src/Subscriber';
import { Config, DBConfig, FacilitatorConfig } from '../../src/Config';
import SpyAssert from '../utils/SpyAssert';
import Database from '../../src/models/Database';
import HandlerFactory from '../../src/handlers/HandlerFactory';

describe('Facilitator.stop()', () => {
  it('should stop facilitation', async () => {
    sinon.replace(
      HandlerFactory,
      'get',
      sinon.fake.resolves(true),
    );
    const mockGraphClient = sinon.createStubInstance(GraphClient);
    sinon.replace(
      GraphClient,
      'getClient',
      sinon.fake.returns(mockGraphClient),
    );
    sinon.replace(
      Database,
      'create',
      sinon.fake.resolves(true),
    );
    const subscribeStub = sinon.stub(Subscriber.prototype, 'subscribe');

    const fakePath = 'SomePath';
    const database = sinon.createStubInstance(DBConfig);
    database.path = fakePath;
    const facilitatorStub = sinon.createStubInstance(FacilitatorConfig);
    facilitatorStub.database = database;
    const configStub = sinon.createStubInstance(Config);
    configStub.facilitator = facilitatorStub;
    const facilitator = new Facilitator(configStub);
    await facilitator.start();

    const unSubscribeStub = sinon.stub(Subscriber.prototype, 'unsubscribe');
    await facilitator.stop();

    SpyAssert.assert(
      unSubscribeStub,
      2,
      [[], []],
    );

    subscribeStub.restore();
    unSubscribeStub.restore();
    sinon.restore();
  });
});
