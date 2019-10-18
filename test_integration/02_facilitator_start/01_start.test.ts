import { spawn } from 'child_process';
import * as path from 'path';

const facilitatorStart = path.join(__dirname, '../facilitator_start.sh');

describe('facilitator start', async (): Promise<void> => {
  it('should start facilitator', async (): Promise<void> => {
    spawn(
      facilitatorStart,
      { stdio: [process.stdout, process.stderr], env: process.env },
    );
    // Note: Ensuring that facilitator starts before doing any transactions.
    await new Promise(done => setTimeout(done, 30000));
  });
});
