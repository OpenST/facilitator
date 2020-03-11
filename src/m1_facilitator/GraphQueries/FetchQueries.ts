// Copyright 2020 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


const FetchQueries: Record<string, string> = {

  // Common fetch queries for origin and auxiliary

  availableStateRoots: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'availableStateRoots(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    anchoredBlockNumber\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  provenGateways: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'provenGateways(orderBy: blockNumber, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    remoteGateway\n'
  + '    provenBlockNumber\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  // Deposit flow fetch queries

  declaredDepositIntents: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'declaredDepositIntents(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    amount\n'
  + '    nonce\n'
  + '    beneficiary\n'
  + '    feeGasPrice\n'
  + '    feeGasLimit\n'
  + '    depositor\n'
  + '    valueToken\n'
  + '    messageHash\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  confirmedDepositIntents: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'confirmedDepositIntents(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, , where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    messageHash\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  createdUtilityTokens: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'createdUtilityTokens(orderBy: uts, orderDirection: asc, first:$limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    valueToken\n'
  + '    utilityToken\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  // Withdraw flow fetch queries

  declaredWithdrawIntents: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'declaredWithdrawIntents(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    amount\n'
  + '    nonce\n'
  + '    beneficiary\n'
  + '    feeGasPrice\n'
  + '    feeGasLimit\n'
  + '    depositor\n'
  + '    valueToken\n'
  + '    messageHash\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  confirmedWithdrawIntents: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit:'
  + ' Int!) {\n'
  + 'confirmedWithdrawIntents(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    messageHash\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  redeemIntentConfirmeds: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit:'
  + ' Int!) {\n'
  + 'redeemIntentConfirmeds(orderBy: uts, orderDirection: asc, first:$limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _redeemer\n'
  + '    _redeemerNonce\n'
  + '    _beneficiary\n'
  + '    _amount\n'
  + '    _blockHeight\n'
  + '    _hashLock\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

};

export default FetchQueries;
