#!/bin/bash

# ------------------------------------------------------------------------------
# Global Constants
# ------------------------------------------------------------------------------
docker_geth_image="ethereum/client-go:stable"
origin_geth_wsaddr="0.0.0.0"
origin_geth_wsport=8546
auxiliary_geth_wsaddr="localhost"
auxiliary_geth_wsport=8547
docker_origin_geth_container_name="devchains_origin_geth_container"
docker_auxiliary_geth_container_name="devchains_auxiliary_geth_container"
# ------------------------------------------------------------------------------


# ------------------------------------------------------------------------------
# Functions
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
function print_usage() {
    echo "Usage: devchains.sh (start|stop)"
}
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
function docker_container_exists {
    if [ $# -ne 1 ]; then
        echo "Error: Incorrect number of arguments for docker_container_exists()"
        return 1
    fi

    local docker_container_name="${1}"

    local result=`docker inspect -f '{{.State.Running}}' \
                        "${docker_container_name}" 2> /dev/null`
    if [ $? -eq 0 ]; then
        echo "true"
        return 0
    else
        echo "false"
        return 0
    fi
}
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
function docker_container_running {
    if [ $# -ne 1 ]; then
        echo "Error: Incorrect number of arguments for docker_container_running()."
        return 1
    fi

    local docker_container_name="${1}"

    local result=`docker inspect -f '{{.State.Running}}' \
                "${docker_container_name}" 2> /dev/null`
    if [ $? -ne 0 ]; then
        echo "Error: There is no docker container with name: ${docker_container_name}"
        return 1
    fi

    echo "${result}"
    return 0
}
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
function run_docker {

    if [ $# -ne 5 ]; then
        echo "Error: Incorrect number of arguments for run_docker() function."
        return 1
    fi

    local chain="${1}"
    local docker_geth_image="${2}"
    local docker_container_name="${3}"
    local geth_ws_addr="${4}"
    local geth_ws_port="${5}"

    if [ "${chain}" != "origin" ] && [ "${chain}" != "auxiliary" ]; then
        echo "Error: Incorrect \"chain\" argument value is specified: ${chain}."
        return 1
    fi

    echo "Running detached docker container for ${chain} node ..."
    docker run -d \
        -p "${geth_ws_port}:${geth_ws_port}" \
        --name "${docker_container_name}" \
        "${docker_geth_image}" --dev --ws \
                               -wsport "${geth_ws_port}" \
                               --wsaddr "${geth_ws_addr}" \
                               --nousb || return 1
    echo "Done!"
}
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
function stop_docker {
    if [ $# -ne 2 ]; then
        echo "Error: Incorrect number of arguments for stop_docker() function."
        return 1
    fi

    local chain="${1}"
    local docker_container_name="${2}"

    if [ "${chain}" != "origin" ] && [ "${chain}" != "auxiliary" ]; then
        echo "Error: Incorrect \"chain\" argument value is specified: ${chain}"
        return 1
    fi

    local running_status=`docker inspect \
                            -f '{{.State.Running}}' \
                            ${docker_container_name} 2> /dev/null`
    if [ $? -ne 0 ]; then
        echo "Warning: There is no container with name: ${docker_container_name}"
        return 0
    fi


    if [[ ${running_status} ]]; then
        echo "Stopping docker container for ${chain} node ..."
        docker stop "${docker_container_name}" 1> /dev/null
        if [ $? -eq 0 ]; then
            echo "Done!"
        else
            echo "Error: Failed to stop docker geth container for {$chain} node."
            echo "Please, see more details above."
            return 1
        fi
    fi

    return 0
}
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
function remove_docker {
    if [ $# -ne 2 ]; then
        echo "Error: Incorrect number of arguments for remove_docker() function."
        return 1
    fi

    local chain="${1}"
    local docker_container_name="${2}"

    if [ "${chain}" != "origin" ] && [ "${chain}" != "auxiliary" ]; then
        echo "Error: Incorrect \"chain\" argument value is specified: ${chain}"
        return 1
    fi

    docker ps -a | grep "${docker_container_name}" > /dev/null
    if [ $? -eq 0 ]; then
        echo "Removing docker container for ${chain} node ..."
        docker rm "${docker_container_name}" 1> /dev/null
        if [ $? -eq 0 ]; then
            echo "Done!"
        else
            echo "Error: Failed to remove docker container for ${chain} node."
            echo "Please, see more details above."
            return 1
        fi
    fi

    return 0
}
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
function clear_docker {
    if [ $# -ne 2 ]; then
        echo "Error: Incorrect number of arguments for clear_docker() function."
        return 1
    fi

    local chain="${1}"
    local docker_container_name="${2}"

    if [ "${chain}" != "origin" ] && [ "${chain}" != "auxiliary" ]; then
        echo "Error: Incorrect \"chain\" argument value is specified: ${chain}"
        return 1
    fi

    local exists=`docker_container_exists "${docker_container_name}"` || return 1
    if [ "${exists}" == "true" ]; then
        local running=`docker_container_running "${docker_container_name}"` || return 1
        if [ "${running}" == "true" ]; then
            stop_docker "${chain}" "${docker_container_name}" || return 1
        fi
        remove_docker "${chain}" "${docker_container_name}" || return 1
    fi
}
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
function run_dockers {
    run_docker  "origin" \
                "${docker_geth_image}" \
                "${docker_origin_geth_container_name}" \
                "${origin_geth_wsaddr}" \
                "${origin_geth_wsport}" || return 1

    run_docker  "auxiliary" \
                "${docker_geth_image}" \
                "${docker_auxiliary_geth_container_name}" \
                "${auxiliary_geth_wsaddr}" \
                "${auxiliary_geth_wsport}" || return 1
}
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
function clear_dockers {
    clear_docker "origin" "${docker_origin_geth_container_name}"
    origin_status=$?
    clear_docker "auxiliary" "${docker_auxiliary_geth_container_name}"
    auxiliary_status=$?

    return "${origin_status}" || "${auxiliary_status}";
}
# ------------------------------------------------------------------------------


# ------------------------------------------------------------------------------
# Main Entry Point
# ------------------------------------------------------------------------------
if [ $# -ne 1 ]; then
    echo "Error: Incorrect number of parameters are specified."
    print_usage
    exit 1
fi
operation="${1}"

if [ "${operation}" == "start" ]; then
    run_dockers || exit 1
elif [ "${operation}" == "stop" ]; then
    clear_dockers || exit 1
else
    echo "Error: Incorrect \"operation\" is specified: \"${operation}\""
    print_usage
    exit 1
fi
# ------------------------------------------------------------------------------
