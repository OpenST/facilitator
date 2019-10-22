#!/usr/bin/env bash

MOSAIC_FACILITATOR_LOG_LEVEL=debug ./facilitator start $ORIGIN_CHAIN $AUXILIARY_CHAIN_ID --gateway-config $GATEWAY_CONFIG_PATH
