#!/usr/bin/env bash

originChain="dev-origin"
auxiliaryChain="dev-auxiliary"
auxChainIdentifier="1000"
ostGateway="0xae02c7b1c324a8d94a564bc8d713df89eae441fe"

echo deploying eip20Token sub-graph for $originChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier origin $ORIGIN_GRAPH_ADMIN_RPC $ORIGIN_GRAPH_IPFS -g $ostGateway
sleep 10

echo deploying eip20Token sub-graph for $auxiliaryChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier auxiliary $AUXILIARY_GRAPH_ADMIN_RPC $AUXILIARY_GRAPH_IPFS -g $ostGateway
sleep 10
