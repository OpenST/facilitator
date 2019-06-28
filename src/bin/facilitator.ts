#!/usr/bin/env node

import * as facilitator from 'commander';

facilitator
  .command('init <mosaic-config> <chain-id> <origin-password> <auxiliary-password> <origin-rpc> <auxiliary-rpc> <db-path>', 'initializes the facilitator config')
  .command('start <mosaic-config> <facilitator-config>', 'starts the facilitator')
  .parse(process.argv);
