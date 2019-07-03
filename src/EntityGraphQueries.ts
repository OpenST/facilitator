const EntityGraphQueries: Record<string, string> = {
  stakeRequesteds: 'query ($contractAddress: String!, $uts: BigInt!, $skip: BigInt!, $limit:'
  + ' BigInt!) {\n'
  + 'stakeRequesteds(skip: $skip, first:$limit, orderDirection: asc, where: {contractAddress:'
  + ' $contractAddress, uts_gt: $uts}, '
  + '    orderDirection: asc,'
  + '    limit: 100) {\n'
  + '    id\n'
  + '    amount\n'
  + '    gasPrice\n'
  + '    gasLimit\n'
  + '    staker\n'
  + '    gateway\n'
  + '    stakeRequestHash\n'
  + '    nonce\n'
  + '    beneficiary\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',
};

export default EntityGraphQueries;
