#!/usr/bin/env bash

script_name="facilitator parent script"

function trap_ctrlc ()
{
	sig=$1

	echo "sig: ${sig}"

    echo "in ${script_name}"

	kill -${sig} "$child"
    # exit shell script with error code 2
    # if omitted, shell script will continue execution
#    exit 2
}

trap "trap_ctrlc TERM" TERM
trap "trap_ctrlc INT" INT

MOSAIC_FACILITATOR_LOG_LEVEL=debug ./facilitator start dev 1000 --mosaic-config './integration_test/mosaic.json' 2>&1 &

child=$!
wait "$child"

