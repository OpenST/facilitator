const Queries: Record<string, Record<string, string>> = {
  auxiliary: {
    mintProgresseds: 'query ($contractAddress: Bytes!, $messageHash: Bytes!) {\n'
  + 'mintProgresseds(orderBy: uts, orderDirection: asc, first: 1, where:'
  + ' {contractAddress: $contractAddress, _messageHash: $messageHash}) {\n'
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
  },

};

export default Queries;
