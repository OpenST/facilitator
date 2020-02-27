// Copyright 2020 OpenST Ltd.
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

import Repositories from './repositories/Repositories';
import Gateway from './models/Gateway';

/**
 * Initializes the seed data in repositories and validate the seeded data.
 */
export default class SeedDataInitializer {
  private repositories: Repositories;

  /**
   * @param repositories Instance of repository class.
   */
  public constructor(
    repositories: Repositories,
  ) {
    this.repositories = repositories;
  }

  /**
   * Gateway global address is used for vallidating seed data as it is used in manifest file
   * and if the gateway record is present, then it can be used for deriving other attributes also.
   * @param gatewayAddress Gateway address for which seed data is to be verified.
   *
   * @returns Returns true if the gateway record is present for the given gateway address.
   */
  public async isValidSeedData(gatewayAddress: string): Promise<boolean> {
    const gatewayGA = Gateway.getGlobalAddress(gatewayAddress);
    const gatewayRecord = await this.repositories.gatewayRepository.get(gatewayGA);

    return (gatewayRecord !== null);
  }
}
