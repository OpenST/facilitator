import Deposit from '../lib/Deposit';

async function requestMultipleDeposits(): Promise<void> {
  const depositorKeystore = '';
  const password = '';
  const beneficiary = '';
  Deposit.requestDeposit(
    'https://rpc.slock.it/goerli',
    '0xd426b22f3960d01189a3d548b45a7202489ff4de',
    '0x26DdFbC848Ba67bB4329592021635a5bd8dcAe56',
    '0x3B9ACA00',
    depositorKeystore,
    password,
    {
      amountToDeposit: '500000000000000000',
      beneficiary,
      gasPrice: '0',
      gasLimit: '0',
    },
  ).then((): void => {
    console.log('Request withdraw done');
    process.exit(0);
  });
}

requestMultipleDeposits();
