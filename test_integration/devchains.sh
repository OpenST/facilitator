#!/usr/bin/env bash

operation=$1
originChain="dev-origin"
auxiliaryChain="dev-auxiliary"
auxChainIdentifier="1000"

function start_chains {

echo starting $originChain chain
./node_modules/.bin/mosaic start $originChain
sleep 10

echo starting $auxiliaryChain chain
./node_modules/.bin/mosaic start $auxiliaryChain
sleep 10

echo deploying OST sub-graph for $originChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier origin http://localhost:9535 http://localhost:6516
sleep 10

echo deploying WETH sub-graph for $originChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier origin http://localhost:9535 http://localhost:6516 -g 0xae02c7b1c324a8d94a564bc8d713df89eae441fe
sleep 10

echo deploying OST sub-graph for $auxiliaryChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier auxiliary http://localhost:9020 http://localhost:6001
sleep 10

echo deploying WETH sub-graph for $auxiliaryChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier auxiliary http://localhost:9020 http://localhost:6001 -g 0xae02c7b1c324a8d94a564bc8d713df89eae441fe
sleep 10

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

