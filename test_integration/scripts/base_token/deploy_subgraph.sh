#!/usr/bin/env bash

originChain="dev-origin"
auxiliaryChain="dev-auxiliary"
auxChainIdentifier="1000"

echo deploying baseToken sub-graph for $originChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier origin $ORIGIN_GRAPH_ADMIN_RPC $ORIGIN_GRAPH_IPFS
sleep 10

echo deploying baseToken sub-graph for $auxiliaryChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier auxiliary $AUXILIARY_GRAPH_ADMIN_RPC $AUXILIARY_GRAPH_IPFS
sleep 10
