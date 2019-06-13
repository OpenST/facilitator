#!/usr/bin/env node

import * as facilitator from 'commander';

facilitator
  .command('init <mosaic-config> <chain-id> <origin-password> <auxiliary-password> <origin-rpc> <auxiliary-rpc> <db-host>', 'initializes the facilitator config')
  .parse(process.argv);
