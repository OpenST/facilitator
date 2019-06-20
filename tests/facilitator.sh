#!/usr/bin/env bash

auxChainId="301"
homedir=$HOME
facilitatorConfigPath="${homedir}/.mosaic/${auxChainId}/facilitator-config.json"

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
 try_silent "./facilitator init --mosaic-config ./mosaic-config.json --chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://originrpc.com' --auxiliary-rpc 'https://auxiliary.com'"
}

# fails silently if the command executes succesfully
function facilitator_init_fail {
 fail_silent "./facilitator init --mosaic-config ./mosaic-config.json --chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://originrpc.com' --auxiliary-rpc 'https://auxiliary.com'"
}

# creates the facilitator-config.json forcefully
function facilitator_init_force_pass {
 try_silent "./facilitator init --mosaic-config ./mosaic-config.json --chain-id $auxChainId --origin-password '123' --auxiliary-password '123' --origin-rpc 'https://originrpc.com' --auxiliary-rpc 'https://auxiliary.com' -f"
}

function facilitator_config_present {
 if [ -s $facilitatorConfigPath ]
 then
 	echo "facilitator-config present"
  else
     echo "facilitator-config does not exists"
 fi
}

echo 'creating facilitator config'
# facilitator init
facilitator_init_pass

facilitator_config_present

# Above command has already generated facilitator config. So below command should silently fail as it is already present.
facilitator_init_fail
echo "removing facilitator-config"
rm $facilitatorConfigPath

facilitator_config_present

facilitator_init_force_pass

facilitator_config_present
