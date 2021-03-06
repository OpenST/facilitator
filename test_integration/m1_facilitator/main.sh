#!/usr/bin/env bash

IP=`ifconfig ${NEaT_IF} | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | grep -v '172*'`

origin_ethereum=dev:http://${IP}:8546 auxiliary_ethereum=dev:http://${IP}:9546 docker-compose up &
sleep 1m
mocha -t 1800000 --require ts-node/register --require source-map-support/register --recursive ./**/*.test.ts
TEST_STATUS=$?
docker-compose down
exit $TEST_STATUS
