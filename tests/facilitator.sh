#!/bin/bash

auxChainId="301"
homedir=$HOME
facilitatorConfigPath="${homedir}/.mosaic/${auxChainId}/facilitator-config.json"
mosaicConfigPath="./tests/facilitator/testdata/mosaic-config.json"

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
    eval $1 1>/dev/null 2>&1 || error "$2"
}

# Tries a command without output. Errors if the command *executes successfully.*
function fail_silent {
    eval $1 1>/dev/null 2>&1 && error "$2"
}

# creates the facilitator-config.json
function facilitator_init_pass {
 info 'creating facilitator config'
 try_silent "./facilitator init --mosaic-config $mosaicConfigPath --chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645'"
}

# fails silently if the command executes succesfully
function facilitator_init_fail {
 info "facilitator init should fail as facilitator config already present"
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645'"
}

# fails silently if the command executes successfully.
function facilitator_init_no_mosaicconfig_fail {
 fail_silent "./facilitator init --chain-id $auxChainId --chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645'"
}

# fails silently if the command executes successfully.
function facilitator_init_no_chainid_fail {
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath  --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645'"
}

# fails silently if the command executes successfully.
function facilitator_init_no_originpassword_fail {
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --chain-id $auxChainId --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645'"
}

# fails silently if the command executes successfully.
function facilitator_init_no_auxiliarypassword_fail {
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --chain-id $auxChainId --origin-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645'"
}

# fails silently if the command executes successfully.
function facilitator_init_no_originrpc_fail {
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --auxiliary-rpc 'https://localhost.com:8645'"
}

# fails silently if the command executes successfully.
function facilitator_init_no_auxiliaryrpc_fail {
 fail_silent "./facilitator init --mosaic-config $mosaicConfigPath --chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545'"
}

# creates the facilitator-config.json forcefully
function facilitator_init_force_pass {
 info "creating facilitator init with --force option"
 try_silent "./facilitator init --mosaic-config $mosaicConfigPath --chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://localhost.com:8545' --auxiliary-rpc 'https://localhost.com:8645' -f"
}

function facilitator_config_present {
 if [ -s $facilitatorConfigPath ]
 then
 	info "facilitator-config present"
  else
    info "facilitator-config does not exists"
 fi
}

function remove_facilitator_config {
 info "removing facilitator-config"
 rm $facilitatorConfigPath

}

# facilitator init
facilitator_init_pass

facilitator_config_present

# Above command has already generated facilitator config. So below command should silently fail as it is already present.
facilitator_init_fail

remove_facilitator_config

facilitator_config_present

info "now facilitator init should fail because all mandatory options are not provided"
info "Refer readme for all mandatory options"

info "trying facilitator init by not providing mosaic config option"
facilitator_init_no_mosaicconfig_fail

info "trying facilitator init by not providing chain id option"
facilitator_init_no_chainid_fail

info "trying facilitator init by not providing origin password option"
facilitator_init_no_originpassword_fail

info "trying facilitator init by not providing auxiliary password option"
facilitator_init_no_auxiliarypassword_fail

info "trying facilitator init by not providing auxiliary rpc option"
facilitator_init_no_auxiliaryrpc_fail

info "trying facilitator init by not providing origin rpc option"
facilitator_init_no_originrpc_fail

facilitator_init_pass

facilitator_init_force_pass

remove_facilitator_config
