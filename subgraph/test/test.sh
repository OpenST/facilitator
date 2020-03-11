#!/usr/bin/env bash

IP=`ifconfig ${NET_IF} | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1'`
ethereum=dev:http://${IP}:9546 docker-compose up &

sleep 30s

npm run deploy:subgraph:origin 0xda932fc0d5bd5AC06fB2CeCF72Ab05b9CFEE7808 0xda932fc0d5bd5AC06fB2CeCF72Ab05b9CFEE7808 http://localhost:8020  http://localhost:5001
npm run deploy:subgraph:auxiliary 0xda932fc0d5bd5AC06fB2CeCF72Ab05b9CFEE7808  0xda932fc0d5bd5AC06fB2CeCF72Ab05b9CFEE7808 http://localhost:8020  http://localhost:5001

docker-compose down

