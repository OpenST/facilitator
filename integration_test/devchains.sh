#!/usr/bin/env bash

operation=$1
originChain="dev-origin"
auxiliaryChain="dev-auxiliary"

function start_chains {
echo starting $originChain chain
./node_modules/.bin/mosaic start $originChain

echo starting $auxiliaryChain chain
./node_modules/.bin/mosaic start $auxiliaryChain
}

function stop_chains {
echo stopping $originChain chain
./node_modules/.bin/mosaic stop $originChain

echo starting $auxiliaryChain chain
./node_modules/.bin/mosaic stop $auxiliaryChain
}

if [ $operation = "start" ]; then
	start_chains
elif [ $operation = "stop" ]; then
	stop_chains
else
	echo "invalid input"
fi

