import { execSync } from 'child_process';
import fs from 'fs-extra';
import * as path from 'path';
const facilitatorKill = path.join(__dirname, '../kill_facilitator_process.sh');
import Directory from '../../src/Directory';
import * as Constants from '../Constants.json';

describe('redeem and unstake with single redeemer & facilitator process', async (): Promise<void> => {

  before(async () => {

  });

  it('verify redeem', async (): Promise<void> => {
    console.log('verify redeem');
  });

  after(async (): Promise<void> => {
    execSync(facilitatorKill, { stdio: [process.stdout, process.stderr], env: process.env });
    fs.removeSync(Directory.getFacilitatorConfigPath(Constants.auxChainId.toString()));
  });

});
