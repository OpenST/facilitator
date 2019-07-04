import * as sinon from 'sinon';
import { assert } from 'chai';
import { Config, FacilitatorConfig } from '../../src/Config';
import MosaicConfig from '../../src/MosaicConfig';
import SpyAssert from '../test_utils/SpyAssert';
import FacilitatorStart from '../../src/FacilitatorOptionParser/FacilitatorStart';

describe('FacilitatorOptionParser.getConfig()', () => {
  const originChain = '2';
  const auxChain = '3';
  const facilitatorConfigPath = './facilitator-config.json';
  const mosaicConfigPath = './test/mosaic-config.json';

  function spyFacilitatorFromFile(fcConfig: any): any {
    const spy = sinon.stub(
      FacilitatorConfig,
      'fromFile',
    ).callsFake(
      sinon.fake.returns(fcConfig),
    );
    return spy;
  }

  function spyFacilitatorFromChain(fcConfig: any): any {
    const spy = sinon.stub(
      FacilitatorConfig,
      'fromChain',
    ).callsFake(
      sinon.fake.returns(fcConfig),
    );
    return spy;
  }

  function spyMosaicFromChain(mosaicConfig: any): any {
    const spy = sinon.stub(
      MosaicConfig,
      'fromChain',
    ).callsFake(
      sinon.fake.returns(mosaicConfig),
    );
    return spy;
  }

  function spyMosaicfromFile(mosaicConfig: MosaicConfig): any {
    const spy = sinon.stub(
      MosaicConfig,
      'fromFile',
    ).callsFake(
      sinon.fake.returns(mosaicConfig),
    );
    return spy;
  }

  function spyConfigFromPath(mosaic: any, facilitator: any): any {
    const spy = sinon.stub(
      Config,
      'fromFile',
    ).callsFake(
      sinon.fake.returns(new Config(mosaic, facilitator)),
    );
    return spy;
  }

  it('should fail when origin chain is provided but aux chain id is undefined', () => {
    const fs: FacilitatorStart = new FacilitatorStart(
      originChain,
      undefined as any,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      'both origin_chain and aux_chain_id is required',
    );
  });

  it('should fail when origin chain is provided but aux chain id is blank', () => {
    const fs: FacilitatorStart = new FacilitatorStart(
      originChain,
      '',
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      'both origin_chain and aux_chain_id is required',
    );
  });

  it('should fail when aux chain id is provided but origin chain is undefined', () => {
    const fs: FacilitatorStart = new FacilitatorStart(
      undefined as any,
      auxChain,
      mosaicConfigPath,
      facilitatorConfigPath,
    );


    assert.throws(
      () => fs.getConfig(),
      'both origin_chain and aux_chain_id is required',
    );
  });

  it('should fail when aux chain id is provided but origin chain is blank', () => {
    const fs: FacilitatorStart = new FacilitatorStart(
      undefined as any,
      auxChain,
      mosaicConfigPath,
      facilitatorConfigPath,
    );


    assert.throws(
      () => fs.getConfig(),
      'both origin_chain and aux_chain_id is required',
    );
  });

  it('should fail when aux chain id is not present in facilitator config', () => {
    const config = '{"originChain":"7","chains":{"2":{"worker": "0x123"},"5":{"worker": "0x123"}}}';
    const fcConfig: FacilitatorConfig = JSON.parse(config) as FacilitatorConfig;
    const spy = spyFacilitatorFromFile(fcConfig);

    const fs: FacilitatorStart = new FacilitatorStart(
      originChain,
      auxChain,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      `facilitator config is invalid as provided auxchain ${auxChain} is not present`,
    );
    spy.restore();
    sinon.restore();
  });

  it('should fail when origin chain is not present in facilitator config', () => {
    const config = '{"originChain":"7","chains":{"3":{"worker": "0x123"},"7":{"worker": "0x123"}}}';
    const facilitatorConfig = JSON.parse(config) as FacilitatorConfig;

    const spy = spyFacilitatorFromFile(facilitatorConfig);

    const fs: FacilitatorStart = new FacilitatorStart(
      originChain,
      auxChain,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      `facilitator config is invalid as provided origin chain ${originChain} is not present`,
    );
    spy.restore();
    sinon.restore();
  });

  it('should fail when mosaic config path is provided and input origin chain doesn\'t match in it', () => {
    const config = `{"originChain":{"chain":"${originChain}"},"auxiliaryChains":{"${auxChain}":{"chainId": ${auxChain}}}}`;
    const dummyoriginChain = '9';
    const spy = spyMosaicfromFile(JSON.parse(config));

    const fs: FacilitatorStart = new FacilitatorStart(
      dummyoriginChain,
      auxChain,
      mosaicConfigPath,
      '',
    );

    assert.throws(
      () => fs.getConfig(),
      'origin chain id in mosaic config is different than the one provided',
    );

    spy.restore();
    sinon.restore();
  });

  it('should fail when mosaic config path is provided and aux chain id is not present in it', () => {
    const config = `{"originChain":{"chain":"${originChain}"},"auxiliaryChains":{"${auxChain}":{"chainId": ${auxChain}}}}`;
    const dummyAuxChainId = '9';
    const spy = spyMosaicfromFile(JSON.parse(config));
    const fs: FacilitatorStart = new FacilitatorStart(
      originChain,
      dummyAuxChainId,
      mosaicConfigPath,
      '',
    );

    assert.throws(
      () => fs.getConfig(),
      'aux chain is not present in mosaic config',
    );

    sinon.restore();
    spy.restore();
  });

  it('should pass when origin chain, aux chain id is provided and facilitator config path is '
    + 'provided', () => {
    const config = `{"originChain":"7","chains":{"${originChain}":{"worker": "0x123"},"${auxChain}":{"worker": "0x123"}}}`;
    const mosaicConfig = sinon.createStubInstance(MosaicConfig);
    const facilitatorConfig = JSON.parse(config) as FacilitatorConfig;
    const facilitatorSpy = spyFacilitatorFromFile(facilitatorConfig);
    const mosaicSpy = spyMosaicFromChain(mosaicConfig);

    const fs: FacilitatorStart = new FacilitatorStart(
      originChain,
      auxChain,
      '',
      facilitatorConfigPath,
    );

    const configObj: Config = fs.getConfig();
    SpyAssert.assert(facilitatorSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(mosaicSpy, 1, [[originChain]]);

    assert.strictEqual(
      configObj.mosaic,
      mosaicConfig,
      'mosaic config object is invalid',
    );

    facilitatorSpy.restore();
    mosaicSpy.restore();
    sinon.restore();
  });

  it('should pass when origin chain, aux chain and mosaic config path is provided', () => {
    const config = `{"originChain":{"chain":"${originChain}"},"auxiliaryChains":{"${auxChain}":{"chainId": ${auxChain}}}}`;
    const mosaic = JSON.parse(config) as MosaicConfig;
    const mosaicSpy = spyMosaicfromFile(mosaic);
    const facilitator = sinon.createStubInstance(FacilitatorConfig);
    const facilitatorSpy = spyFacilitatorFromChain(facilitator);

    const fs: FacilitatorStart = new FacilitatorStart(
      originChain,
      auxChain,
      mosaicConfigPath,
      '',
    );

    const configObj = fs.getConfig();

    SpyAssert.assert(mosaicSpy, 1, [[mosaicConfigPath]]);
    SpyAssert.assert(facilitatorSpy, 1, [[auxChain]]);
    assert.strictEqual(
      configObj.facilitator,
      facilitator,
      'invalid facilitator object',
    );
    assert.strictEqual(
      configObj.mosaic,
      mosaic,
    );

    facilitatorSpy.restore();
    mosaicSpy.restore();
    sinon.restore();
  });

  it('should pass when origin chain and aux chain is provided', () => {
    const facilitator = sinon.createStubInstance(FacilitatorConfig);
    const mosaic = sinon.createStubInstance(MosaicConfig);

    const facilitatorSpy = spyFacilitatorFromChain(facilitator);
    const mosaicSpy = spyMosaicFromChain(mosaic);

    const fs: FacilitatorStart = new FacilitatorStart(originChain, auxChain, '', '');
    const config: Config = fs.getConfig();

    SpyAssert.assert(mosaicSpy, 1, [[originChain]]);
    SpyAssert.assert(facilitatorSpy, 1, [[auxChain]]);
    assert.strictEqual(
      config.mosaic,
      mosaic,
      'invalid mosaic object',
    );
    assert.strictEqual(
      config.facilitator,
      facilitator,
      'invalid facilitator object',
    );

    mosaicSpy.restore();
    facilitatorSpy.restore();
    sinon.restore();
  });

  it('should pass when facilitator config and mosaic config is provided', () => {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = sinon.createStubInstance(FacilitatorConfig);
    const configSpy = spyConfigFromPath(mosaic, facilitator);
    const fs: FacilitatorStart = new FacilitatorStart(
      undefined as any,
      undefined as any,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    const config: Config = fs.getConfig();

    SpyAssert.assert(configSpy, 1, [[mosaicConfigPath, facilitatorConfigPath]]);
    assert.strictEqual(
      config.mosaic,
      mosaic,
      'Invalid mosaic object',
    );
    assert.strictEqual(
      config.facilitator,
      facilitator,
      'Invalid mosaic object',
    );

    configSpy.restore();
    sinon.restore();
  });

  it('should pass when only facilitator config is provided', () => {
    const mosaic = sinon.createStubInstance(MosaicConfig);

    const facilitatorSpy = spyFacilitatorFromFile(JSON.parse(`{"originChain":"${originChain}"}`));
    const mosaicSpy = spyMosaicFromChain(mosaic);
    const fs: FacilitatorStart = new FacilitatorStart(
      '',
      '',
      '',
      facilitatorConfigPath,
    );
    const config: Config = fs.getConfig();

    SpyAssert.assert(facilitatorSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(mosaicSpy, 1, [[originChain]]);
    assert.strictEqual(
      config.mosaic,
      mosaic,
      'Invalid mosaic object in config object',
    );

    assert.strictEqual(
      config.facilitator.originChain,
      originChain,
      `Expected chain id is ${originChain} but got ${config.facilitator.originChain}`,
    );

    sinon.restore();
    facilitatorSpy.restore();
    mosaicSpy.restore();
  });
});
