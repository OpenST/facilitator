#!/bin/bash

rm -rf ./lib
npm ci

./node_modules/.bin/tsc
