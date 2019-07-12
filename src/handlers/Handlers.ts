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

import StakeRequestHandler from './StakeRequestHandler';
import Repositories from '../repositories/Repositories';
import AnchorHandler from './AnchorHandler';

export default class Handlers {
  /**
   * This methods instantiate different kinds of handlers. This method also takes
   * responsibility of instantiating repositories and services.
   *
   * @param repos Repository container.
   * @param auxChainId ID of auxiliary chain.
   * @return Different kinds of transaction handlers.
   */
  public static create(repos: Repositories, auxChainId: number):
  {
    stakeRequesteds: StakeRequestHandler;
    anchor: AnchorHandler;
  } {
    return {
      stakeRequesteds: new StakeRequestHandler(
        repos.stakeRequestRepository,
      ),
      anchor: new AnchorHandler(
        repos.auxiliaryChainRepository,
        auxChainId,
      ),
    };
  }
}
