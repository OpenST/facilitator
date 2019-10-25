#!/usr/bin/env bash

originChain="dev-origin"
auxiliaryChain="dev-auxiliary"
auxChainIdentifier="1000"
ostGateway="0xae02c7b1c324a8d94a564bc8d713df89eae441fe"
originGraphAdminRPC="http://localhost:9535"
originGraphIPFS="http://localhost:6516"
auxiliaryGraphAdminRPC="http://localhost:9020"
auxiliaryGraphIPFS="http://localhost:6001"

echo deploying eip20Token sub-graph for $originChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier origin $originGraphAdminRPC $originGraphIPFS -g $ostGateway
sleep 10

echo deploying eip20Token sub-graph for $auxiliaryChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier auxiliary $auxiliaryGraphAdminRPC $auxiliaryGraphIPFS -g $ostGateway
sleep 10
