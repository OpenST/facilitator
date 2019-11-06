#!/usr/bin/env bash

MOSAIC_FACILITATOR_LOG_LEVEL=debug ./facilitator start $ORIGIN_CHAIN $AUXILIARY_CHAIN_ID --mosaic-config $MOSAIC_CONFIG_PATH
