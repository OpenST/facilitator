import Withdraw from '../lib/Withdraw';

async function requestMultipleWithdraws(): Promise<void> {
  const withdrawerKeystore = '';
  const password = '';
  const beneficiary = '';
  Withdraw.requestWithdraw(
    'https://chain.mosaicdao.org/hadapsar',
    '0x6b9011bde760e3c0db26fc1708f5942a6616ff4e',
    '0x25a1CE197371735D6EDccC178F90841a7CEc23bb',
    '0x3B9ACA00',
    withdrawerKeystore,
    password,
    {
      amountToWithdraw: '500000000000000000',
      beneficiary,
      gasPrice: '0',
      gasLimit: '0',
    },
  ).then((): void => {
    console.log('Request withdraw done');
    process.exit(0);
  });
}

requestMultipleWithdraws();
