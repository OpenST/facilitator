import {Config, FacilitatorConfig} from '../../src/Config';
import MosaicConfig from '../../src/MosaicConfig';
import * as sinon from 'sinon';
import {assert} from 'chai';
import SpyAssert from "../utils/SpyAssert";
import FacilitatorStart from '../../src/bin/FacilitatorStart';

describe('Facilitator.getConfig()', function () {
  const originChain = '2';
  const auxChain = '3';
  const facilitatorConfigPath = "./facilitator-config.json";
  const mosaicConfigPath = './test/mosaic-config.json';
  const options = {
    facilitatorConfig: facilitatorConfigPath,
    mosaicConfig: mosaicConfigPath
  };

  function spyFacilitatorFromPath(fcConfig: any): any {
    const spy = sinon.stub(
      FacilitatorConfig,
      'fromPath'
    ).callsFake(
      sinon.fake.returns(fcConfig)
    );
    return spy;
  }

  function spyFacilitatorFrom(fcConfig: any): any {
    const spy = sinon.stub(
      FacilitatorConfig,
      'from'
    ).callsFake(
      sinon.fake.returns(fcConfig)
    );
    return spy;
  }

  // MosaicConfig.fromChain
  function spyMosaicFromChain(mosaicConfig: any): any {
    const spy = sinon.stub(
      MosaicConfig,
      'fromChain'
    ).callsFake(
      sinon.fake.returns(mosaicConfig)
    );
    return spy;
  }

  function spyMosaicfromFile(mosaicConfig: MosaicConfig): any {
    const spy = sinon.stub(
      MosaicConfig,
      'fromFile'
    ).callsFake(
      sinon.fake.returns(mosaicConfig)
    );
    return spy;
  }

  function spyConfigFromPath(mosaic: any, facilitator: any): any {
    const spy = sinon.stub(
      Config,
      'getConfigFromPath'
    ).callsFake(
      sinon.fake.returns(new Config(mosaic, facilitator))
    );
    return spy;
  }

  it('should fail when origin chain id is provided but aux chain id is undefined', function () {
    assert.throws(
      () => FacilitatorStart.getConfig(originChain, undefined as any, options),
      'both origin_chain and aux_chain_id is required'
    );
  });

  it('should fail when aux chain id is provided but origin chain is undefined', function () {
    assert.throws(
      () => FacilitatorStart.getConfig(undefined as any, auxChain, options),
      'both origin_chain and aux_chain_id is required'
    );
  });

  it('should pass when origin chain id and aux chain is provided', function () {
     // const facilitator: FacilitatorConfig = FacilitatorConfig.from(auxChain);
     //  const mosaic: MosaicConfig = MosaicConfig.fromChain(originChain);
    const facilitator = sinon.createStubInstance(FacilitatorConfig);
    const mosaic = sinon.createStubInstance(MosaicConfig);

    const facilitatorSpy = spyFacilitatorFrom(facilitator);
    const mosaicSpy = spyMosaicFromChain(mosaic);

    const config: Config= FacilitatorStart.getConfig(originChain, auxChain, {});

    SpyAssert.assert(mosaicSpy, 1, [[originChain]]);
    SpyAssert.assert(facilitatorSpy, 1, [[auxChain]]);
    assert.strictEqual(
      config.mosaic,
      mosaic,
      'invalid mosaic object'
    );
    assert.strictEqual(
      config.facilitator,
      facilitator,
      'invalid facilitator object'
    );
  });

  it('should fail when aux chain id is not present in facilitator config', function () {
    const config = '{"originChainId":"7","chains":{"2":{"worker": "0x123"},"5":{"worker": "0x123"}}}';
    const fcConfig: FacilitatorConfig = JSON.parse(config) as FacilitatorConfig;
    const spy = spyFacilitatorFromPath(fcConfig);
    assert.throws(
      () => FacilitatorStart.getConfig(originChain, auxChain, options),
      `facilitator config is invalid as provided auxchain ${auxChain} is not present`
    );
    spy.restore();
    sinon.restore();
  });

  it('should fail when origin chain id is not present in facilitator config', function () {
    const config = '{"originChainId":"7","chains":{"3":{"worker": "0x123"},"7":{"worker": "0x123"}}}';
    const facilitatorConfig = JSON.parse(config) as FacilitatorConfig;

    const spy = spyFacilitatorFromPath(facilitatorConfig);
    assert.throws(
      () => FacilitatorStart.getConfig(originChain, auxChain, options),
      `facilitator config is invalid as provided origin chain ${originChain} is not present`
    );
    spy.restore();
    sinon.restore();
  });

  it('should pass when origin chain, aux chain id is provided but mosaic config is not provided', function () {
    const config = `{"originChainId":"7","chains":{"${originChain}":{"worker": "0x123"},"${auxChain}":{"worker": "0x123"}}}`;
    const mosaicConfig = sinon.createStubInstance(MosaicConfig);
    const facilitatorConfig = JSON.parse(config) as FacilitatorConfig;
    const facilitatorSpy = spyFacilitatorFromPath(facilitatorConfig);
    const mosaicSpy = spyMosaicFromChain(mosaicConfig);

    const configObj: Config = FacilitatorStart.getConfig(originChain, auxChain, {facilitatorConfig: facilitatorConfigPath});
    SpyAssert.assert(facilitatorSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(mosaicSpy, 1, [[originChain]]);

    assert.strictEqual(
      configObj.mosaic,
      mosaicConfig,
      'mosaic config object is invalid'
    );

    facilitatorSpy.restore();
    mosaicSpy.restore();
    sinon.restore();
  });

  it('should pass when origin chain, aux chain and mosaic config is provided', function () {
    const config = `{"originChain":{"chain":"${originChain}"},"auxiliaryChains":{"${auxChain}":{"chainId": ${auxChain}}}}`;
    const mosaic = JSON.parse(config) as MosaicConfig;
    const mosaicSpy = spyMosaicfromFile(mosaic);
    const facilitator = sinon.createStubInstance(FacilitatorConfig);
    const facilitatorSpy = spyFacilitatorFrom(facilitator);

    const configObj = FacilitatorStart.getConfig(originChain, auxChain, {mosaicConfig: mosaicConfigPath});

    SpyAssert.assert(mosaicSpy, 1, [[mosaicConfigPath]]);
    SpyAssert.assert(facilitatorSpy, 1, [[auxChain]]);
    assert.strictEqual(
      configObj.facilitator,
      facilitator,
      'invalid facilitator object'
    );
    assert.strictEqual(
      configObj.mosaic,
      mosaic
    );
    facilitatorSpy.restore();
    mosaicSpy.restore();
    sinon.restore();

  });

  it('should pass when mosaic config is provided and input origin chain id doesn\'t match in it', function () {
    const config = `{"originChain":{"chain":"${originChain}"},"auxiliaryChains":{"${auxChain}":{"chainId": ${auxChain}}}}`;
    const dummyOriginChainId = '9';
    const spy = spyMosaicfromFile(JSON.parse(config));
    assert.throws(
      () => FacilitatorStart.getConfig(dummyOriginChainId, auxChain, {'mosaicConfig': mosaicConfigPath}),
      'origin chain id in mosaic config is different than the one provided'
    );
    spy.restore();
    sinon.restore();

  });

  it('should pass when mosaic config is provided and input aux chain id is not present in it', function () {
    const config = `{"originChain":{"chain":"${originChain}"},"auxiliaryChains":{"${auxChain}":{"chainId": ${auxChain}}}}`;
    const dummyAuxChainId = '9';
    const spy = spyMosaicfromFile(JSON.parse(config));
    assert.throws(
      () => FacilitatorStart.getConfig(originChain, dummyAuxChainId, {'mosaicConfig': mosaicConfigPath}),
      'aux chain is not present in mosaic config'
    );
    sinon.restore();
    spy.restore();
  });

  it('should pass when facilitator config and mosaic config is provided', function () {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = sinon.createStubInstance(FacilitatorConfig);
    const configSpy = spyConfigFromPath(mosaic, facilitator);

    const config: Config = FacilitatorStart.getConfig(
      undefined as any,
      undefined as any,
      {
        facilitatorConfig: facilitatorConfigPath,
        mosaicConfig: mosaicConfigPath
      }
    );

    SpyAssert.assert(configSpy, 1, [[mosaicConfigPath, facilitatorConfigPath]]);
    assert.strictEqual(
      config.mosaic,
      mosaic,
      'Invalid mosaic object'
    );
    assert.strictEqual(
      config.facilitator,
      facilitator,
      'Invalid mosaic object'
    );

    configSpy.restore();
    sinon.restore();
  });

  it('should pass when only facilitator config is provided', function () {

    const mosaic = sinon.createStubInstance(MosaicConfig);

    const facilitatorSpy = spyFacilitatorFromPath(JSON.parse(`{"originChainId":"${originChain}"}`));
    const mosaicSpy = spyMosaicFromChain(mosaic);
    const config: Config = FacilitatorStart.getConfig(undefined as any, undefined as any, {facilitatorConfig: facilitatorConfigPath});

    SpyAssert.assert(facilitatorSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(mosaicSpy, 1, [[originChain]]);
    assert.strictEqual(
      config.mosaic,
      mosaic,
      'Invalid mosaic object in config object'
    );

    assert.strictEqual(
      config.facilitator.originChainId,
      originChain,
      `Expected chain id is ${originChain} but got ${config.facilitator.originChainId}`
    );

    sinon.restore();
    facilitatorSpy.restore();
    mosaicSpy.restore();
  });
});

