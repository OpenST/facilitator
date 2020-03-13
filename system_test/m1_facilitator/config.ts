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
};

export default config;
