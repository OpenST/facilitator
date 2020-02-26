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
//
// ----------------------------------------------------------------------------

import Repositories from './repositories/Repositories';

/**
 * Takes the address of ERC20Gateway address to check if the database is initial
 * with the proper seed data.
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
   * @param gatewayAddress Gateway address for which seed data is to be verified.
   */
  public async verfiySeedData(gatewayAddress: string): Promise<boolean> {
    const gatewayRecord = await this.repositories.gatewayRepository.get(gatewayAddress);

    return (gatewayRecord !== null);
  }
}
