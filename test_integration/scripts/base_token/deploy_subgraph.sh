#!/usr/bin/env bash

originChain="dev-origin"
auxiliaryChain="dev-auxiliary"
auxChainIdentifier="1000"
originGraphAdminRPC="http://localhost:9535"
originGraphIPFS="http://localhost:6516"
auxiliaryGraphAdminRPC="http://localhost:9020"
auxiliaryGraphIPFS="http://localhost:6001"

echo deploying baseToken sub-graph for $originChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier origin $originGraphAdminRPC $originGraphIPFS
sleep 10

echo deploying baseToken sub-graph for $auxiliaryChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier auxiliary $auxiliaryGraphAdminRPC $auxiliaryGraphIPFS
sleep 10
