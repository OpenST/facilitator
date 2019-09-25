import { execSync } from 'child_process';
import * as path from 'path';
const facilitatorKill = path.join(__dirname, '../kill_facilitator_process.sh');

describe('redeem and unstake with single redeemer & facilitator process', async (): Promise<void> => {

  before(async () => {

  });

  after(async (): Promise<void> => {
    execSync(facilitatorKill, { stdio: [process.stdout, process.stderr], env: process.env });
  });

});
