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

import Repositories from '../repositories/Repositories';
import AnchorHandler from './AnchorHandler';
import ProveGatewayHandler from "./ProveGatewayHandler";
import StakeRequestedHandler from "./StakeRequestHandler";
//import {HandlerTypes} from "../types";


export default class HandlerFactory {
  /**
   * This methods instantiate different kinds of handlers. This method also takes
   * responsibility of instantiating repositories and services.
   *
   * @return Different kinds of transaction handlers.
   */
  public static get(repos: Repositories): {
    stakeRequesteds: StakeRequestedHandler;
    stateRootAvailables: AnchorHandler,
    gatewayProvens: ProveGatewayHandler
  }
    {
    return {
      stakeRequesteds: new StakeRequestedHandler(
        repos.stakeRequestRepository,
      ),
      stateRootAvailables: new AnchorHandler(
        repos.auxiliaryChainRepository,
      1243,
      ),
      gatewayProvens: new ProveGatewayHandler(
        repos.gatewayRepository,
      ),
    };
  }
}
