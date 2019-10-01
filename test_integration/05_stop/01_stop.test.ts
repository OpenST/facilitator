import { execSync } from 'child_process';
import * as path from 'path';
import fs from 'fs-extra';
import Directory from '../../src/Directory';
import * as Constants from '../Constants.json';

const facilitatorKill = path.join(__dirname, '../kill_facilitator_process.sh');

describe('facilitator stop', async (): Promise<void> => {
  it('should stop facilitator', async (): Promise<void> => {
    execSync(
      facilitatorKill,
      { stdio: [process.stdout, process.stderr], env: process.env },
    );
    fs.removeSync(Directory.getFacilitatorConfigPath(Constants.auxChainId.toString()));
  });
});
