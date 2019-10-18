#!/usr/bin/env bash
kill -TERM `ps aux | grep -e "[f]acilitator-start.ts[[:space:]]$ORIGIN_CHAIN[[:space:]]$AUXILIARY_CHAIN_ID\|[f]acilitator.ts[[:space:]]start[[:space:]]$ORIGIN_CHAIN[[:space:]]$AUXILIARY_CHAIN_ID\|[f]acilitator[[:space:]]start[[:space:]]$ORIGIN_CHAIN[[:space:]]$AUXILIARY_CHAIN_ID\|[f]acilitator_start.sh" | awk '{print $2}'`
