// Copyright 2019 OpenST Ltd.
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
//
// ----------------------------------------------------------------------------


const FetchQueries: Record<string, string> = {

  // Common fetch queries

  stateRootAvailables: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'stateRootAvailables(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    _blockHeight\n'
  + '    _stateRoot\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  gatewayProvens: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'gatewayProvens(orderBy: blockNumber, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    _gateway\n'
  + '    _blockHeight\n'
  + '    _storageRoot\n'
  + '    _wasAlreadyProved\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  // Stake & Mint fetch queries

  stakeRequesteds: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'stakeRequesteds(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    amount\n'
  + '    gasPrice\n'
  + '    gasLimit\n'
  + '    staker\n'
  + '    stakerProxy\n'
  + '    gateway\n'
  + '    stakeRequestHash\n'
  + '    nonce\n'
  + '    beneficiary\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  stakeIntentDeclareds: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'stakeIntentDeclareds(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, , where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _staker\n'
  + '    _stakerNonce\n'
  + '    _amount\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  stakeIntentConfirmeds: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'stakeIntentConfirmeds(orderBy: uts, orderDirection: asc, first:$limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _staker\n'
  + '    _stakerNonce\n'
  + '    _beneficiary\n'
  + '    _amount\n'
  + '    _blockHeight\n'
  + '    _hashLock\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  stakeProgresseds: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'stakeProgresseds(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress:'
  + ' $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _staker\n'
  + '    _stakerNonce\n'
  + '    _amount\n'
  + '    _proofProgress\n'
  + '    _unlockSecret\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  mintProgresseds: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'mintProgresseds(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _staker\n'
  + '    _beneficiary\n'
  + '    _stakeAmount\n'
  + '    _mintedAmount\n'
  + '    _rewardAmount\n'
  + '    _proofProgress\n'
  + '    _unlockSecret\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  // Redeem & Unstake fetch queries

  redeemRequesteds: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!) {\n'
  + 'redeemRequesteds(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    amount\n'
  + '    gasPrice\n'
  + '    gasLimit\n'
  + '    redeemer\n'
  + '    redeemerProxy\n'
  + '    cogateway\n'
  + '    redeemRequestHash\n'
  + '    nonce\n'
  + '    beneficiary\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  redeemIntentDeclareds: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit:'
  + ' Int!) {\n'
  + 'redeemIntentDeclareds(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _redeemer\n'
  + '    _redeemerNonce\n'
  + '    _amount\n'
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

  redeemProgresseds: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit: Int!)'
  + ' {\n'
  + 'redeemProgresseds(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress:'
  + ' $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _redeemer\n'
  + '    _redeemerNonce\n'
  + '    _amount\n'
  + '    _proofProgress\n'
  + '    _unlockSecret\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  unstakeProgresseds: 'query ($contractAddress: Bytes!, $uts: BigInt!, $skip: Int!, $limit:'
  + ' Int!) {\n'
  + 'unstakeProgresseds(orderBy: uts, orderDirection: asc, first: $limit, skip: $skip, where:'
  + ' {contractAddress: $contractAddress, uts_gt: $uts}) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _redeemer\n'
  + '    _beneficiary\n'
  + '    _redeemAmount\n'
  + '    _unstakeAmount\n'
  + '    _rewardAmount\n'
  + '    _proofProgress\n'
  + '    _unlockSecret\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

};

export default FetchQueries;
