#!/usr/bin/env node

import facilitator from 'commander';

facilitator
  .command('init <mosaic-config> <chain-id> <origin-password> <auxiliary-password> <origin-rpc> <auxiliary-rpc> <db-path>', 'initializes the facilitator config')
  .parse(process.argv);
