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

import Facilitator from '../common/Facilitator';
import Manifest from './manifest/Manifest';
import Repositories from './repositories/Repositories';

export default class Container {
  public static async create(
    manifest: Manifest,
  ): Promise<{ facilitator: Facilitator; repositories: Repositories} > {
    return {
      facilitator: manifest as any as Facilitator,
      repositories: manifest as any as Repositories,
    };
  }
}
