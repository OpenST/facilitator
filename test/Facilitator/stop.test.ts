import sinon from 'sinon';

import { Config, DBConfig, FacilitatorConfig } from '../../src/Config';
import Facilitator from '../../src/Facilitator';
import GraphClient from '../../src/GraphClient';
import HandlerFactory from '../../src/handlers/HandlerFactory';
import Repositories from '../../src/repositories/Repositories';
import Subscriber from '../../src/Subscriber';
import SpyAssert from '../test_utils/SpyAssert';

describe('Facilitator.stop()', (): void => {
  it('should stop facilitation', async (): Promise<void> => {
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
      Repositories,
      'create',
      sinon.fake.resolves(true),
    );
    const subscribeStub = sinon.stub(Subscriber.prototype, 'subscribe');

    const fakePath = 'SomePath';
    const database = sinon.createStubInstance(DBConfig);
    database.path = fakePath;
    const facilitatorStub = sinon.createStubInstance(FacilitatorConfig) as any;
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
