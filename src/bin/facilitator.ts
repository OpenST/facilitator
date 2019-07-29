#!/usr/bin/env node

import facilitator from 'commander';

facilitator
  .command('init <mosaic-config> <aux-chain-id> <origin-password> <auxiliary-password> <origin-rpc> <auxiliary-rpc> <origin-graph-ws> <origin-graph-rpc> <auxiliary-graph-ws> <auxiliary-graph-rpc> <db-path>', 'initializes the facilitator config')
  .command('start <mosaic-config> <facilitator-config>', 'starts the facilitator')
  .parse(process.argv);
