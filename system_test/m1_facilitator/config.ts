const config = {
  chains: {
    origin: {
      wsEndpoint: 'https://rpc.slock.it/goerli',
      graphEndpoint: '',
      valueToken: '0xd426b22f3960d01189a3d548b45a7202489ff4de',
      gateway: '',
      chainId: 5,
    },
    auxiliary: {
      wsEndpoint: '',
      graphEndpoint: '',
      utilityToken: '',
      cogateway: '',
      chainId: 1405,
    },
  },
  testData: {
    deposit: {
      iterations: 1,
      depositorCount: 2,
      concurrencyCount: 3,
      pollingInterval: 1,
      timeoutInterval: 20,
      minAmount: 150,
      maxAmount: 250,
      minGasPrice: 5,
      maxGasPrice: 15,
      minGasLimit: 2,
      maxGasLimit: 5,
    },
    withdraw: {
      iterations: 10,
      withdrawerCount: 6,
      concurrencyCount: 5,
      pollingInterval: 2,
      timeoutInterval: 20,
      minAmount: 150,
      maxAmount: 250,
      minGasPrice: 5,
      maxGasPrice: 15,
      minGasLimit: 2,
      maxGasLimit: 5,
    },
  },
  accounts:
  [
    '0x3EC46ea7786b3804b5AE74BF9F6d68356e219629',
    '0x0972Af988933F5d016FdE0f862E8920AE2Ca5892',
    '0xA40fe6fcA6276D7656fCd188585ec8EFfc11E1bc',
    '0x020657dd3773Bf00826e06Af22220E4ACaeaddfF',
    '0xCf88610C6547Fb0e3849e6C2d00e95ba4cAe77b9',
  ],
};

export default config;
