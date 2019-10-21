#!/usr/bin/env bash

originChain="dev-origin"
auxiliaryChain="dev-auxiliary"
auxChainIdentifier="1000"

echo deploying baseToken sub-graph for $originChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier origin http://localhost:9535 http://localhost:6516
sleep 10

echo deploying baseToken sub-graph for $auxiliaryChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier auxiliary http://localhost:9020 http://localhost:6001
sleep 10
