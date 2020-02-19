import { spawn } from 'child_process';

import SharedStorage from '../SharedStorage';

describe('facilitator start', async (): Promise<void> => {
  it('should start facilitator', async (): Promise<void> => {
    const helperObject = SharedStorage.getHelperObject();
    const facilitatorStartScriptPath = helperObject.facilitatorStartScriptPath();

    spawn(
      facilitatorStartScriptPath,
      { stdio: [process.stdout, process.stderr], env: process.env },
    );
    // Note: Ensuring that facilitator starts before doing any transactions.
    await new Promise(done => setTimeout(done, 30000));
  });
});
