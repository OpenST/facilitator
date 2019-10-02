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
}
