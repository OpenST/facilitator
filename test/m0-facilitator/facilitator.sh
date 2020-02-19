#!/bin/bash

auxChainId="1000"
homedir=$HOME
facilitatorConfigPath="${homedir}/.mosaic/${auxChainId}/facilitator-config.json"
mosaicConfigPath="./testdata/m0-facilitator/mosaic.json"

# Prints an error string to stdout.
function error {
    echo "ERROR! Aborting."
    echo "ERROR: $1"
    exit 1
}

function info {
    echo "INFO: $1"
}

# Tries a command without output. Errors if the command does not execute successfully.
function try_silent {
    eval $1 2>&1 || error "$2"
}

# Tries a command without output. Errors if the command *executes successfully.
function fail_silent {
    eval $1 2>&1 && error "$2"
}

# Creates the facilitator-config.json.
function facilitator_init_pass {
 info 'creating facilitator config'
 try_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999'   --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767' "
}

# It fails silently if the command executes succesfully.
function facilitator_init_fail {
 info "facilitator init should fail as facilitator config already present"
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999'   --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767' "
}

# It fails silently if the command executes successfully.
function facilitator_init_no_mosaicconfig_fail {
 info "trying facilitator init by not providing mosaic config option"
 fail_silent "./facilitator init --aux-chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999'   --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767' "
}

# It fails silently if the command executes successfully.
function facilitator_init_no_chainid_fail {
 info "trying facilitator init by not providing chain id option"
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath  --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999'   --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767' "
}

# It fails silently if the command executes successfully.
function facilitator_init_no_originpassword_fail {
 info "trying facilitator init by not providing origin password option"
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999'   --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767' "
}

# It fails silently if the command executes successfully.
function facilitator_init_no_auxiliarypassword_fail {
 info "trying facilitator init by not providing auxiliary password option"
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --origin-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999'   --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767' "
}

# It fails silently if the command executes successfully.
function facilitator_init_no_originrpc_fail {
 info "trying facilitator init by not providing origin rpc option"
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999'   --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767'"
}

# It fails silently if the command executes successfully.
function facilitator_init_no_auxiliaryrpc_fail {
 info "trying facilitator init by not providing auxiliary rpc option"
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999'   --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767' "
}

function facilitator_init_no_origin_subgraph_ws {
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-rpc 'https://localhost:9999' --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767' "
}

function facilitator_init_no_origin_subgraph_rpc {
 info 'creating facilitator config'
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767' "
}

function facilitator_init_no_auxiliary_subgraph_ws {
 info 'creating facilitator config'
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999' --auxiliary-graph-rpc 'https://localhost:6767' "
}

function facilitator_init_no_auxiliary_subgraph_rpc {
 info 'creating facilitator config'
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999'   --auxiliary-graph-ws 'https://localhost:8787' "
}

# Creates the facilitator-config.json forcefully.
function facilitator_init_force_pass {
 info "creating facilitator init with --force option"
 try_silent "./facilitator init --mosaic-config $mosaicConfigPath --aux-chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' --origin-graph-ws 'https://localhost:3553' --origin-graph-rpc 'https://localhost:9999'   --auxiliary-graph-ws 'https://localhost:8787' --auxiliary-graph-rpc 'https://localhost:6767' -f "
}

# If facilitator-config doesn't exists it will exit.
function facilitator_config_exists {
 if [ -s $facilitatorConfigPath ]
 then
 	info "facilitator-config present"
  else
    error "facilitator config is not generated !!!"
 fi
}

# If facilitator-config exists, it will exit.
function facilitator_config_does_not_exist {
 if [ -s $facilitatorConfigPath ]
 then
 	error "facilitator-config should not be already present"
 fi
}

function remove_facilitator_config {
 info "removing facilitator-config"
 rm $facilitatorConfigPath
}

info "facilitator init should fail because all mandatory options are not provided"
info "refer readme for all mandatory options"

# Following tests is to test the fail conditions when the mandatory params are
# not provided in the facilitator init command
facilitator_init_no_mosaicconfig_fail
facilitator_init_no_chainid_fail
facilitator_init_no_originpassword_fail
facilitator_init_no_auxiliarypassword_fail
facilitator_init_no_auxiliaryrpc_fail
facilitator_init_no_originrpc_fail
facilitator_init_no_origin_subgraph_ws
facilitator_init_no_origin_subgraph_rpc
facilitator_init_no_auxiliary_subgraph_ws
facilitator_init_no_auxiliary_subgraph_rpc

remove_facilitator_config
# Facilitator init will create facilitator-config.json file.
# All mandatory params are provided.
facilitator_init_pass
facilitator_config_exists

# Facilitator config already exists, so facilitator init command should fail.
facilitator_init_fail

# Removing facilitator config
remove_facilitator_config
facilitator_config_does_not_exist


# Facilitator init with force option.
facilitator_init_pass
facilitator_init_force_pass

# Clean up the created facilitator config.
remove_facilitator_config
