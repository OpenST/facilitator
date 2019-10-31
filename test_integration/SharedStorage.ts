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
//
// http://www.simpletoken.org/
//
// ----------------------------------------------------------------------------

import { HelperInterface } from './helpers/HelperInterface';
import GatewayAddresses from '../src/Config/GatewayAddresses';
import { FacilitatorConfig } from '../src/Config/Config';

/**
 * @file `shared` exists so that integration tests can share data among each other.
 *
 * One example is the addresses of contracts that were deployed on the test
 * environment.
 *
 * Due to node's caching behavior when loading modules, it always returns the
 * same object for repeated calls to `require()`.
 *
 * It is important that every `require` is written exactly `shared`,
 * case-sensitive!
 */

// This class variable is used to persist nonce in-memory
const dataMap: Record<string, any> = {};

/**
 * It provides methods to get & set values against a key.
 * Can be used to share some data across test case files
 */
export default class SharedStorage {
  public static getOriginFunder(): string {
    return SharedStorage.get(SharedStorage.originFunderKey);
  }

  public static setOriginFunder(value: string): void {
    return SharedStorage.set(SharedStorage.originFunderKey, value);
  }

  public static getAuxiliaryFunder(): string {
    return SharedStorage.get(SharedStorage.auxiliaryFunderKey);
  }

  public static setAuxiliaryFunder(value: string): void {
    return SharedStorage.set(SharedStorage.auxiliaryFunderKey, value);
  }

  public static getStakeAndMintBeneficiary(): string {
    return SharedStorage.get(SharedStorage.stakeAndMintBeneficiaryKey);
  }

  public static setStakeAndMintBeneficiary(value: string): void {
    return SharedStorage.set(SharedStorage.stakeAndMintBeneficiaryKey, value);
  }

  public static getTestData(): any {
    return SharedStorage.get(SharedStorage.testDataKey);
  }

  public static setTestData(testData: any): void {
    return SharedStorage.set(SharedStorage.testDataKey, testData);
  }

  public static getHelperObject(): HelperInterface {
    return SharedStorage.get(SharedStorage.helperObjectKey);
  }

  public static setHelperObject(testData: HelperInterface): void {
    return SharedStorage.set(SharedStorage.helperObjectKey, testData);
  }

  public static getGatewayAddresses(): GatewayAddresses {
    return SharedStorage.get(SharedStorage.gatewayAddressesKey);
  }

  public static setGatewayAddresses(gatewayAddresses: GatewayAddresses): void {
    return SharedStorage.set(SharedStorage.gatewayAddressesKey, gatewayAddresses);
  }

  public static getFacilitatorConfig(): FacilitatorConfig {
    return SharedStorage.get(SharedStorage.facilitatorConfigKey);
  }

  public static setFacilitatorConfig(facilitatorConfig: FacilitatorConfig): void {
    return SharedStorage.set(SharedStorage.facilitatorConfigKey, facilitatorConfig);
  }

  private static get(key: string): any {
    return dataMap[key];
  }

  private static set(key: string, value: any): void {
    dataMap[key] = value;
  }

  private static get originFunderKey(): string {
    return 'ORIGIN_FUNDER';
  }

  private static get auxiliaryFunderKey(): string {
    return 'AUXILIARY_FUNDER';
  }

  private static get stakeAndMintBeneficiaryKey(): string {
    return 'S_M_BENEFICIARY';
  }

  private static get facilitatorConfigKey(): string {
    return 'FACILITATOR_CONFIG';
  }

  private static get gatewayAddressesKey(): string {
    return 'GATEWAY_ADDRESSES';
  }

  private static get testDataKey(): string {
    return 'TEST_DATA';
  }

  private static get helperObjectKey(): string {
    return 'HELPER_OBJECT';
  }
}
