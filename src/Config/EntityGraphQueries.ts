export const ENTITY_GRAPH_QUERY = {
  stakeRequested: 'query ($contractAddress: String!, $uts: BigInt!,) {\n'
  + 'stakeRequesteds(where: {contractAddress: $contractAddress, uts_gt: $uts}, ' +
  '    orderDirection: asc,' +
  '    limit: 100) {\n'
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
} as Record<string, string>;