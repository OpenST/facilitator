const config = {
  chains: {
    origin: {
      wsEndpoint: '',
      graphEndpoint: '',
      valueToken: '',
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
