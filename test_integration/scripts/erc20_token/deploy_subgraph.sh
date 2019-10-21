#!/usr/bin/env bash

originChain="dev-origin"
auxiliaryChain="dev-auxiliary"
auxChainIdentifier="1000"

echo deploying erc20Token sub-graph for $originChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier origin http://localhost:9535 http://localhost:6516 -g 0xae02c7b1c324a8d94a564bc8d713df89eae441fe
sleep 10

echo deploying erc20Token sub-graph for $auxiliaryChain chain
./node_modules/.bin/mosaic subgraph $originChain $auxChainIdentifier auxiliary http://localhost:9020 http://localhost:6001 -g 0xae02c7b1c324a8d94a564bc8d713df89eae441fe
sleep 10
