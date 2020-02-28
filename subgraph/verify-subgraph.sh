#!/bin/bash

type=$1
echo '==========Verifying ' $type ' subgraph=========='
cd ./subgraph/$type
npm ci
npm run build
TEST_STATUS=$?
exit $TEST_STATUS
