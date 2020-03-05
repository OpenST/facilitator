#!/usr/bin/env bash

docker-compose up &
sleep 1m
mocha -t 1800000 --require ts-node/register --require source-map-support/register --recursive ./**/*.test.ts
docker-compose down
