#!/usr/bin/env bash

operation=$1
originChain="dev-origin"
auxiliaryChain="dev-auxiliary"
auxChainIdentifier="1000"

function start_chains {
echo starting $originChain chain
./node_modules/.bin/mosaic start $originChain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier origin  http://localhost:9535 http://localhost:6516
sleep 20

echo starting $auxiliaryChain chain
./node_modules/.bin/mosaic start $auxiliaryChain
./node_modules/.bin/mosaic subgraph
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier auxiliary  http://localhost:9020  http://localhost:6001

sleep 20

}

function stop_chains {
echo stopping $originChain chain
./node_modules/.bin/mosaic stop $originChain

echo stopping $auxiliaryChain chain
./node_modules/.bin/mosaic stop $auxiliaryChain
}

if [ $operation = "start" ]; then
	start_chains
elif [ $operation = "stop" ]; then
	stop_chains
else
	echo "invalid input"
fi

