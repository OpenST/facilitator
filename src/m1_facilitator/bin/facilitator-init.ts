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

import commander from 'commander';
import FacilitatorInit from '../commands/FacilitatorInit';
import Logger from '../../common/Logger';

commander
  .option('-m, --manifest <manifest>', 'Path to manifest file')
  .option('-f, --force <force>', 'Set this option for reinitialize facilitator')
  .action(async (options: {
    manifest: string;
    force?: boolean;

  }): Promise<void> => {
    console.log('init called');
    try {
      await new FacilitatorInit(options.manifest, options.force ? options.force : false)
        .execute();
    } catch (e) {
      Logger.error(`Error in facilitator init command. Reason: ${e.message}`);
    }
  }).parse(process.argv);
