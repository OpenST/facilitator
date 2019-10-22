import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import * as web3Utils from 'web3-utils';

import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { EIP20Token } from '@openst/mosaic-contracts/dist/interacts/EIP20Token';
import { FacilitatorConfig } from '../../src/Config/Config';
import Utils from '../Utils';
import SharedStorage from '../SharedStorage';

describe('should fund facilitator workers on origin & auxiliary', async (): Promise<void> => {
  let originWeb3: Web3;
  let auxiliaryWeb3: Web3;
  const testData = SharedStorage.getTestData();
  const auxChainId = Number(testData.auxChainId);

  const baseTokenToBeFundedToWorkerForBounty = new BigNumber(5);
  const amountTobeFundedOnOrigin = new BigNumber(0.1);
  const amountTobeFundedOnAuxiliary = new BigNumber(0.1);

  let originWorker: string;
  let auxiliaryWorker: string;
  let utils: Utils;

  before(async () => {
    const facilitatorConfig: FacilitatorConfig = SharedStorage.getFacilitatorConfig();
    utils = new Utils();
    ({ originWeb3, auxiliaryWeb3 } = utils);

    originWorker = facilitatorConfig.chains[facilitatorConfig.originChain].worker;
    auxiliaryWorker = facilitatorConfig.chains[auxChainId].worker;

    const originAccounts = await originWeb3.eth.getAccounts();
    SharedStorage.setOriginFunder(originAccounts[4]);

    const auxiliaryAccounts = await auxiliaryWeb3.eth.getAccounts();
    SharedStorage.setAuxiliaryFunder(auxiliaryAccounts[6]);
  });

  it('should fund auxiliary worker', async (): Promise<void> => {
    await utils.fundOSTPrimeOnAuxiliary(
      auxiliaryWorker,
      new BigNumber(amountTobeFundedOnAuxiliary),
    );
  });

  it('should fund origin worker', async (): Promise<void> => {
    // Fund ETH
    await utils.fundEthOnOrigin(originWorker, new BigNumber(amountTobeFundedOnOrigin));

    // Fund base token (for bounty)
    const baseTokenInstance: EIP20Token = utils.getBaseTokenInstance();
    const transferRawTx: TransactionObject<boolean> = baseTokenInstance.methods.transfer(
      originWorker,
      web3Utils.toWei(baseTokenToBeFundedToWorkerForBounty.toString()),
    );
    const transferReceipt = await Utils.sendTransaction(
      transferRawTx,
      {
        from: SharedStorage.getOriginFunder(),
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );
    await utils.verifyBaseTokenTransfer(
      transferReceipt,
      originWorker,
      new BigNumber(baseTokenToBeFundedToWorkerForBounty),
    );
  });
});
