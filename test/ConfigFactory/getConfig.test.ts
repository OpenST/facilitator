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


import sinon, { SinonStub, SinonStubbedInstance } from 'sinon';

import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import GatewayConfig from '@openst/mosaic-chains/lib/src/Config/GatewayConfig';
import { Config, ConfigType, FacilitatorConfig } from '../../src/Config/Config';
import ConfigFactory from '../../src/Config/ConfigFactory';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';
import GatewayAddresses from '../../src/Config/GatewayAddresses';

describe('ConfigFactory.getConfig()', () => {
  const originChain = '2';
  const auxChain = 3;
  const eip20CoGatewayAddress = '0xB6329BcFE2050F50db2eD347b3cE67DDfAc39110';
  const valueTokenAddress = '0xCDF29BcFE2050F50db2eD347b3cE67DDfAc39345';
  const stakePoolAddress = '0x34817AF7B685DBD8a360e8Bed3121eb03D56C9BD';
  const anchorAddress = '0xEa8D41fc6C6C0Ee155E5F6FbF9Cc1167Fa17927E';
  const anchorOrganizationAddress = '0x7de07272E4c6cb822503B46C8a41517935C3f0c0';
  const redeemPoolAddress = '0x8bA9C19BeacBB3eF85E1Df57ceef1Df922F2D87F';
  const utilityTokenAddress = '0x19F64B29789F02FFcCE2c37DFB3d65FEaDdea66a';
  const coGatewayOrganizationAddress = '0xbc67Ff0116248762c940B97bA1501BeD6Fa6D093';
  const baseTokenAddress = '0x9AC77F4c0ca4D0F2142D7a77175cf4F1295fb2d8';
  const eip20GatewayAddress = '0xA7f056b1320fE619571849f138Cd1Ae2f2e64179';
  const gatewayOrganizationAddress = '0xaB5335771fBA0270634e649882229c7e8CaA6158';

  function getMosaic(): object {
    return {
      originChain:
        {
          chain: originChain,
          contractAddresses: {
          valueTokenAddress: valueTokenAddress,
          stakePoolAddress: stakePoolAddress,
          }
        },
      auxiliaryChains:
        {
          [auxChain]:
            {
              chainId: auxChain,
              contractAddresses: {
              auxiliary: {
                eip20CoGatewayAddress: eip20CoGatewayAddress,
                anchorAddress: anchorAddress,
                anchorOrganizationAddress: anchorOrganizationAddress,
                redeemPoolAddress: redeemPoolAddress,
                utilityTokenAddress: utilityTokenAddress,
                coGatewayOrganizationAddress: coGatewayOrganizationAddress,
              },
                origin: {
                  baseTokenAddress: baseTokenAddress,
                  anchorAddress: anchorAddress,
                  anchorOrganizationAddress: anchorOrganizationAddress,
                  eip20GatewayAddress: eip20GatewayAddress,
                  gatewayOrganizationAddress: gatewayOrganizationAddress,
                },
            },
            },
        },
    };
  }

  function getFacilitator(): object {
    return {
      originChain,
      auxChainId: auxChain,
      chains:
        {
          [originChain]:
            {
              worker: '0x123',
            },
          [auxChain]:
            {
              worker: '0x123',
            },
        },
    };
  }

  const facilitatorConfigPath = './facilitator-config.json';
  const mosaicConfigPath = './test/mosaic-config.json';
  const gatewayConfigPath = './gateway-config.json';
  const mosaic = getMosaic() as MosaicConfig;

  const facilitator = getFacilitator() as FacilitatorConfig;

  function spyFromGatewayConfig(
    gatewayAddresses: GatewayAddresses,
  ): SinonStub<[GatewayConfig], GatewayAddresses> {
    const spy = sinon.stub(
      GatewayAddresses,
      'fromGatewayConfig',
    ).callsFake(
      sinon.fake.returns(gatewayAddresses),
    );
    return spy;
  }

  function spyFacilitatorFromFile(
    fcConfig: FacilitatorConfig | SinonStubbedInstance<FacilitatorConfig>,
  ): SinonStub<[string], FacilitatorConfig> {
    const spy = sinon.stub(
      FacilitatorConfig,
      'fromFile',
    ).callsFake(
      sinon.fake.returns(fcConfig),
    );
    return spy;
  }

  function spyGatewayConfigFromFile(
    gatewayConfig: GatewayConfig,
  ): SinonStub<[string], GatewayConfig> {
    const spy = sinon.stub(
      GatewayConfig,
      'fromFile',
    ).callsFake(
      sinon.fake.returns(gatewayConfig),
    );
    return spy;
  }

  function spyFacilitatorFromChain(
    fcConfig: FacilitatorConfig,
  ): SinonStub<[string, number, string], FacilitatorConfig> {
    const spy = sinon.stub(
      FacilitatorConfig,
      'fromChain',
    ).callsFake(
      sinon.fake.returns(fcConfig),
    );
    return spy;
  }

  function spyMosaicFromChain(mosaicConfig: MosaicConfig): SinonStub<[string], MosaicConfig> {
    const spy = sinon.stub(
      MosaicConfig,
      'fromChain',
    ).callsFake(
      sinon.fake.returns(mosaicConfig),
    );
    return spy;
  }

  function spyGatewayAddressesFromMosaicConfig(
    gatewayAddresses: GatewayAddresses,
  ): SinonStub<[MosaicConfig, number], GatewayAddresses> {
    const spy = sinon.stub(
      GatewayAddresses,
      'fromMosaicConfig',
    ).callsFake(
      sinon.fake.returns(gatewayAddresses),
    );
    return spy;
  }

  function spyMosaicfromFile(mosaicConfig: MosaicConfig): SinonStub<[string], MosaicConfig> {
    const spy = sinon.stub(
      MosaicConfig,
      'fromFile',
    ).callsFake(
      sinon.fake.returns(mosaicConfig),
    );
    return spy;
  }

  function spyConfigfromFile(config: Config): SinonStub<[string, string, ConfigType], Config> {
    const spy = sinon.stub(
      Config,
      'fromFile',
    ).callsFake(
      sinon.fake.returns(config),
    );
    return spy;
  }

  function spyMosaicExists(status: boolean): SinonStub<[string], boolean> {
    const spy = sinon.stub(
      MosaicConfig,
      'exists',
    ).callsFake(
      sinon.fake.returns(status),
    );
    return spy;
  }

  function getGatewayConfigStub(auxChain: number): SinonStubbedInstance<GatewayConfig> {
    const stubGatewayConfig = sinon.createStubInstance(GatewayConfig);
    stubGatewayConfig.mosaicConfig = mosaic;
    stubGatewayConfig.auxChainId = auxChain;
    return stubGatewayConfig;
  }

  const stubGatewayConfig = getGatewayConfigStub(auxChain);
  const gatewayAddresses = sinon.createStubInstance(GatewayAddresses);

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

  it('should fail when origin chain is provided but aux chain id is undefined', () => {
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

  it('should fail when aux chain id is an empty string', () => {
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
    const dummyoriginChain = '9';
    const spy = spyMosaicfromFile(getMosaic() as MosaicConfig);

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
    const dummyAuxChainId = 9;
    const spy = spyMosaicfromFile(getMosaic() as MosaicConfig);
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
    const mosaicConfig = sinon.createStubInstance(MosaicConfig);
    const facilitatorConfig = getFacilitator() as FacilitatorConfig;
    const facilitatorSpy = spyFacilitatorFromFile(facilitatorConfig);
    const mosaicSpy = spyMosaicFromChain(mosaicConfig);
    const gatewayAddressesSpy = spyGatewayAddressesFromMosaicConfig(gatewayAddresses);

    const fs: ConfigFactory = new ConfigFactory(
      originChain,
      auxChain,
      '',
      facilitatorConfigPath,
    );

    const configObj: Config = fs.getConfig();
    SpyAssert.assert(facilitatorSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(mosaicSpy, 1, [[originChain]]);
    SpyAssert.assert(gatewayAddressesSpy, 1, [[mosaicConfig, auxChain]]);

    assert.strictEqual(
      configObj.gatewayAddresses,
      gatewayAddresses,
      'gateway addresses object is invalid',
    );

    facilitatorSpy.restore();
    mosaicSpy.restore();
    sinon.restore();
  });

  it('should pass when origin chain, aux chain and mosaic config path is provided', () => {
    const mosaicSpy = spyMosaicfromFile(mosaic);
    const facilitatorSpy = spyFacilitatorFromChain(facilitator);
    const gatewayAddressesSpy = spyGatewayAddressesFromMosaicConfig(gatewayAddresses);

    const fs: ConfigFactory = new ConfigFactory(
      originChain,
      auxChain,
      mosaicConfigPath,
      '',
      '',
    );

    const configObj = fs.getConfig();

    SpyAssert.assert(mosaicSpy, 1, [[mosaicConfigPath]]);
    SpyAssert.assert(facilitatorSpy, 1, [[originChain, auxChain, eip20GatewayAddress]]);
    SpyAssert.assert(gatewayAddressesSpy, 1, [[mosaic, auxChain]]);
    assert.strictEqual(
      configObj.facilitator,
      facilitator as any,
      'invalid facilitator object',
    );
    assert.strictEqual(
      configObj.gatewayAddresses,
      gatewayAddresses,
    );

    facilitatorSpy.restore();
    mosaicSpy.restore();
    sinon.restore();
  });

  it('should pass when origin chain and aux chain is provided', () => {
    const facilitatorSpy = spyFacilitatorFromChain(facilitator);
    const mosaicSpy = spyMosaicFromChain(mosaic);
    const gatewayAddressesSpy = spyGatewayAddressesFromMosaicConfig(gatewayAddresses);

    const fs: ConfigFactory = new ConfigFactory(originChain, auxChain, '', '');
    console.log('mosaic:- ',mosaic);
    const config: Config = fs.getConfig();

    SpyAssert.assert(mosaicSpy, 1, [[originChain]]);
    SpyAssert.assert(facilitatorSpy, 1, [[originChain, auxChain, eip20GatewayAddress]]);
    SpyAssert.assert(gatewayAddressesSpy, 1, [[mosaic, auxChain]]);
    assert.strictEqual(
      config.gatewayAddresses,
      gatewayAddresses,
      'invalid gateway addresses object',
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
    const mosaicFromFileSpy = spyMosaicfromFile(mosaic);
    const facilitatorFromFileSpy = spyFacilitatorFromFile(facilitator);
    const gatewayAddressesSpy = spyGatewayAddressesFromMosaicConfig(gatewayAddresses);
    const fs: ConfigFactory = new ConfigFactory(
      undefined as any,
      undefined as any,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    const config: Config = fs.getConfig();

    SpyAssert.assert(gatewayAddressesSpy, 1, [[mosaic, auxChain]]);
    SpyAssert.assert(facilitatorFromFileSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(mosaicFromFileSpy, 1, [[mosaicConfigPath]]);
    assert.strictEqual(
      config.gatewayAddresses,
      gatewayAddresses,
      'Invalid gateway addresses object',
    );
    assert.strictEqual(
      config.facilitator,
      facilitator as any,
      'Invalid mosaic object',
    );

    sinon.restore();
  });

  it('should fail when facilitator config and mosaic config is provided but origin chain doesn\'t match', () => {
    const configJson = `{"originChain":{"chain":"${originChain}"},"auxiliaryChains":{"${auxChain}":{"chainId": ${auxChain}}}}`;
    const mosaicConfig = JSON.parse(configJson) as MosaicConfig;
    const facilitatorStub = sinon.createStubInstance(FacilitatorConfig);
    facilitatorStub.originChain = '5';

    facilitatorStub.auxChainId = 3;
    spyMosaicfromFile(mosaicConfig);
    spyFacilitatorFromFile(facilitatorStub);

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
    sinon.restore();
  });

  it('should fail when facilitator config and mosaic config is provided but auxiliary '
  + 'id doesn\'t match', () => {
    const facilitatorStub = sinon.createStubInstance(FacilitatorConfig);
    facilitatorStub.originChain = '5';

    facilitatorStub.auxChainId = 3;

    spyMosaicfromFile(mosaic);
    spyFacilitatorFromFile(facilitatorStub);

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

    sinon.restore();
  });

  it('should pass when only facilitator config is provided', () => {
    const facilitatorSpy = spyFacilitatorFromFile(getFacilitator() as FacilitatorConfig);
    const mosaicSpy = spyMosaicFromChain(mosaic);
    const gatewayAddressesSpy = spyGatewayAddressesFromMosaicConfig(gatewayAddresses);
    const mosaicExistsSpy = spyMosaicExists(true);
    const fs: ConfigFactory = new ConfigFactory(
      undefined,
      undefined,
      undefined,
      facilitatorConfigPath,
    );
    const config: Config = fs.getConfig();

    SpyAssert.assert(facilitatorSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(mosaicSpy, 1, [[originChain]]);
    SpyAssert.assert(gatewayAddressesSpy, 1, [[mosaic, auxChain]]);
    SpyAssert.assert(mosaicExistsSpy, 1, [[originChain]]);
    assert.strictEqual(
      config.gatewayAddresses,
      gatewayAddresses,
      'Invalid mosaic object in config object',
    );

    assert.strictEqual(
      config.facilitator.originChain,
      originChain,
      `Expected chain id is ${originChain} but got ${config.facilitator.originChain}`,
    );

    facilitatorSpy.restore();
    mosaicSpy.restore();
    sinon.restore();
  });

  it('should pass when origin chain, aux chain id, facilitator config and mosaic config is provided', () => {
    const mosaicFromFileSpy = spyMosaicfromFile(mosaic);
    const fakeConfig = sinon.createStubInstance(Config);
    const configFromFileSpy = spyConfigfromFile(fakeConfig);
    const facilitatorFromFileSpy = spyFacilitatorFromFile(facilitator);
    const fs: ConfigFactory = new ConfigFactory(
      originChain,
      auxChain,
      mosaicConfigPath,
      facilitatorConfigPath,
    );

    const config: Config = fs.getConfig();

    SpyAssert.assert(facilitatorFromFileSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(mosaicFromFileSpy, 1, [[mosaicConfigPath]]);
    SpyAssert.assert(
      configFromFileSpy,
      1,
      [[facilitatorConfigPath, mosaicConfigPath, ConfigType.MOSAIC]],
    );
    assert.strictEqual(
      config,
      fakeConfig,
      'Invalid gateway addresses object',
    );

    facilitatorFromFileSpy.restore();
    configFromFileSpy.restore();
    mosaicFromFileSpy.restore();
    sinon.restore();
  });

  it('should pass when origin chain, aux chain id and gateway config is provided', () => {
    const facilitatorFromChainSpy = spyFacilitatorFromChain(facilitator);
    const gatewayConfigFromFileSpy = spyGatewayConfigFromFile(stubGatewayConfig);
    const gatewayAddresses = GatewayAddresses.fromMosaicConfig(mosaic, auxChain);
    const fromGatewayConfigSpy = spyFromGatewayConfig(gatewayAddresses);

    const fs: ConfigFactory = new ConfigFactory(
      originChain,
      auxChain,
      undefined,
      undefined,
      gatewayConfigPath,
    );
    console.log('gatewayAddresses :- ',gatewayAddresses);
    const config: Config = fs.getConfig();

    SpyAssert.assert(facilitatorFromChainSpy, 1, [[originChain, auxChain, eip20GatewayAddress]]);
    SpyAssert.assert(gatewayConfigFromFileSpy, 1, [[gatewayConfigPath]]);
    SpyAssert.assert(fromGatewayConfigSpy, 1, [[stubGatewayConfig]]);

    assert.strictEqual(
      config.gatewayAddresses,
      gatewayAddresses,
      'Invalid gateway addresses object',
    );

    assert.strictEqual(
      config.facilitator,
      facilitator,
      'Invalid facilitator object',
    );

    sinon.restore();
  });

  it('should fail when origin chain, aux chain id and gateway config is provided but aux chain id is incorrect in mosaic config', () => {
    spyFacilitatorFromChain(facilitator);
    spyGatewayConfigFromFile(stubGatewayConfig);
    spyFromGatewayConfig(gatewayAddresses);
    const auxChainId = 200;

    const fs: ConfigFactory = new ConfigFactory(
      originChain,
      auxChainId,
      undefined,
      undefined,
      gatewayConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      'aux chain is not present in mosaic config',
    );

    sinon.restore();
  });

  it('should pass when facilitator and gateway config path is provided', () => {
    const facilitatorFromFileSpy = spyFacilitatorFromFile(facilitator);
    const gatewayConfigFromFileSpy = spyGatewayConfigFromFile(stubGatewayConfig);
    const fromGatewayConfigSpy = spyFromGatewayConfig(gatewayAddresses);

    const fs: ConfigFactory = new ConfigFactory(
      undefined,
      undefined,
      undefined,
      facilitatorConfigPath,
      gatewayConfigPath,
    );

    const config: Config = fs.getConfig();

    SpyAssert.assert(facilitatorFromFileSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(gatewayConfigFromFileSpy, 1, [[gatewayConfigPath]]);
    SpyAssert.assert(fromGatewayConfigSpy, 1, [[stubGatewayConfig]]);

    assert.strictEqual(
      config.gatewayAddresses,
      gatewayAddresses,
      'Invalid gateway addresses object',
    );

    assert.strictEqual(
      config.facilitator,
      facilitator,
      'Invalid facilitator object',
    );

    sinon.restore();
  });

  it('should fail when facilitator and gateway config path is provided but aux chain id is different', () => {
    const auxChainIdInGatewayConfig = 200;
    const stubGatewayConfig = getGatewayConfigStub(auxChainIdInGatewayConfig);
    spyFacilitatorFromFile(facilitator);
    spyGatewayConfigFromFile(stubGatewayConfig);
    spyFromGatewayConfig(gatewayAddresses);

    const fs: ConfigFactory = new ConfigFactory(
      undefined,
      undefined,
      undefined,
      facilitatorConfigPath,
      gatewayConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      `Aux chain id ${auxChainIdInGatewayConfig} in gatewayconfig and provided auxchain id ${auxChain} are not same`,
    );


    sinon.restore();
  });

  it('should fail when only facilitator config is provided but mosaic config is not found', () => {
    const facilitatorSpy = spyFacilitatorFromFile(getFacilitator() as FacilitatorConfig);
    const mosaicConfig = MosaicConfig.fromChain('200');
    spyMosaicExists(false);
    spyMosaicFromChain(mosaicConfig);
    spyGatewayAddressesFromMosaicConfig(gatewayAddresses);

    const fs: ConfigFactory = new ConfigFactory(
      undefined,
      undefined,
      undefined,
      facilitatorConfigPath,
    );

    assert.throws(
      () => fs.getConfig(),
      'mosaic config not found',
    );

    facilitatorSpy.restore();
    sinon.restore();
  });
});
