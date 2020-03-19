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

import fund_facilitator_account from 'commander';
import FundFacilitatorAccount from './FundFacilitatorAccount';
import Logger from '../../../src/common/Logger';


/**
 * To excute fundFacilitatorAccount command,
 * ./fund_facilitator_account -m <manifest_file_path>
 */
fund_facilitator_account.option('-m, --manifest <manifest>', 'Path to manifest file')
  .action(
    async (
      options: {
        manifest: string;
      }): Promise<void> => {
      try {
        await new FundFacilitatorAccount(options.manifest).execute();
      } catch (e) {
        Logger.error(`Error in fundFacilitatorAccount command. Reason: ${e.message}`);
        process.exit(1);
      }
    },
  ).parse(process.argv);
