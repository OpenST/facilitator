import { execSync } from 'child_process';
import * as path from 'path';
import fs from 'fs-extra';
import Directory from '../../../src/m0_facilitator/Directory';
import SharedStorage from '../SharedStorage';

const facilitatorKill = path.join(__dirname, '../kill_facilitator_process.sh');

describe('facilitator stop', async (): Promise<void> => {
  it('should stop facilitator', async (): Promise<void> => {
    execSync(
      facilitatorKill,
      { stdio: [process.stdout, process.stderr], env: process.env },
    );
    const testData = SharedStorage.getTestData();
    fs.removeSync(Directory.getFacilitatorConfigPath(
      testData.originChain,
      testData.auxChainId,
      SharedStorage.getGatewayAddresses().eip20GatewayAddress,
    ));
  });
});
