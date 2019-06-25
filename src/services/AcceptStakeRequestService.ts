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

import Database from '../models/Database';
import { StakeRequest, StakeRequestRepository } from '../models/StakeRequestRepository';
import Observer from '../observer/Observer';

export default class AcceptStakeRequestService extends Observer {
  /* Storage */

  private stakeRequestRepository: StakeRequestRepository;


  /* Public Functions */

  public constructor(db: Database) {
    super();

    this.stakeRequestRepository = db.stakeRequestRepository;
  }

  public async notify(): Promise<void> {
    const nonAcceptedStakeRequests = await this.collectNonAcceptedStakeRequests();

    const acceptStakeRequestPromises = [];

    for (let i = 0; i < nonAcceptedStakeRequests.length; i += 1) {
      acceptStakeRequestPromises.push(this.acceptStakeRequest(nonAcceptedStakeRequests[i]));
    }

    await Promise.all(acceptStakeRequestPromises);
  }


  /* Private Functions */

  private async collectNonAcceptedStakeRequests(): Promise<StakeRequest[]> {
    return this.stakeRequestRepository.getStakeRequestsWithNullMessageHash();
  }

  private async acceptStakeRequest(stakeRequest: StakeRequest): Promise<void>;
}
