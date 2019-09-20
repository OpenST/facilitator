// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------


import sinon from 'sinon';

import { Config, FacilitatorConfig } from '../../src/Config/Config';
import ConfigFactory from '../../src/Config/ConfigFactory';
import MosaicConfig from "@openst/mosaic-chains/lib/src/Config/MosaicConfig";
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

describe('FacilitatorOptionParser.getConfig()', () => {
  const originChain = '2';
  const auxChain = 3;
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
    const fs: ConfigFactory = new ConfigFactory(
      originChain,
      undefined as any,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      'Origin chain and auxiliary chain id both are required',
    );
  });

  it('should fail when origin chain is provided but aux chain id is blank', () => {
    const fs: ConfigFactory = new ConfigFactory(
      originChain,
      undefined,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      'Origin chain and auxiliary chain id both are required',
    );
  });

  it('should fail when aux chain id is provided but origin chain is undefined', () => {
    const fs: ConfigFactory = new ConfigFactory(
      undefined as any,
      auxChain,
      mosaicConfigPath,
      facilitatorConfigPath,
    );


    assert.throws(
      () => fs.getConfig(),
      'Origin chain and auxiliary chain id both are required',
    );
  });

  it('should fail when aux chain id an empty string', () => {
    const fs: ConfigFactory = new ConfigFactory(
      originChain,
      undefined,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      'Origin chain and auxiliary chain id both are required',
    );
  });

  it('should fail when aux chain id is not present in facilitator config', () => {
    const config = '{"originChain":"7","chains":{"2":{"worker": "0x123"},"5":{"worker": "0x123"}}}';
    const fcConfig: FacilitatorConfig = JSON.parse(config) as FacilitatorConfig;
    const spy = spyFacilitatorFromFile(fcConfig);

    const fs: ConfigFactory = new ConfigFactory(
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

    const fs: ConfigFactory = new ConfigFactory(
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

    const fs: ConfigFactory = new ConfigFactory(
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
    const dummyAuxChainId = 9;
    const spy = spyMosaicfromFile(JSON.parse(config));
    const fs: ConfigFactory = new ConfigFactory(
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

    const fs: ConfigFactory = new ConfigFactory(
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

    const fs: ConfigFactory = new ConfigFactory(
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
      facilitator as any,
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

    const fs: ConfigFactory = new ConfigFactory(originChain, auxChain, '', '');
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
      facilitator as any,
      'invalid facilitator object',
    );

    mosaicSpy.restore();
    facilitatorSpy.restore();
    sinon.restore();
  });

  it('should pass when facilitator config and mosaic config is provided', () => {
    const configJson = `{"originChain":{"chain":"${originChain}"},"auxiliaryChains":{"${auxChain}":{"chainId": ${auxChain}}}}`;
    const mosaic = JSON.parse(configJson) as MosaicConfig;
    // const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = sinon.createStubInstance(FacilitatorConfig);
    facilitator.originChain = '2';
    // mosaic.originChain = new OriginChain();
    // mosaic.originChain.chain = '12346';
    facilitator.auxChainId = 3;
    const configSpy = spyConfigFromPath(mosaic, facilitator);
    const fs: ConfigFactory = new ConfigFactory(
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
      facilitator as any,
      'Invalid mosaic object',
    );

    configSpy.restore();
    sinon.restore();
  });

  it('should fail when facilitator config and mosaic config is provided but origin chain doesn\'t match', () => {
    const configJson = `{"originChain":{"chain":"${originChain}"},"auxiliaryChains":{"${auxChain}":{"chainId": ${auxChain}}}}`;
    const mosaic = JSON.parse(configJson) as MosaicConfig;
    const facilitator = sinon.createStubInstance(FacilitatorConfig);
    facilitator.originChain = '5';

    facilitator.auxChainId = 3;
    const configSpy = spyConfigFromPath(mosaic, facilitator);
    const fs: ConfigFactory = new ConfigFactory(
      undefined as any,
      undefined as any,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      'origin chain id in mosaic config is different than the one provided',
    );

    configSpy.restore();
    sinon.restore();
  });

  it('should fail when facilitator config and mosaic config is provided but auxiliary '
  + 'id doesn\'t match', () => {
    const configJson = `{"originChain":{"chain":"${originChain}"},"auxiliaryChains":{"${auxChain}":{"chainId": ${auxChain}}}}`;
    const mosaic = JSON.parse(configJson) as MosaicConfig;
    const facilitator = sinon.createStubInstance(FacilitatorConfig);
    facilitator.originChain = '5';

    facilitator.auxChainId = 3;
    const configSpy = spyConfigFromPath(mosaic, facilitator);
    const fs: ConfigFactory = new ConfigFactory(
      undefined as any,
      undefined as any,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      'origin chain id in mosaic config is different than the one provided',
    );

    configSpy.restore();
    sinon.restore();
  });

  it('should pass when only facilitator config is provided', () => {
    const mosaic = sinon.createStubInstance(MosaicConfig);

    const facilitatorSpy = spyFacilitatorFromFile(JSON.parse(`{"originChain":"${originChain}"}`));
    const mosaicSpy = spyMosaicFromChain(mosaic);
    const fs: ConfigFactory = new ConfigFactory(
      undefined,
      undefined,
      undefined,
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
