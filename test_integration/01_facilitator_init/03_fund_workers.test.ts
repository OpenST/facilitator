import * as path from 'path';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { EIP20Token } from '@openst/mosaic-contracts/dist/interacts/EIP20Token';
import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import { FacilitatorConfig } from '../../src/Config/Config';
import Utils from '../Utils';
import * as Constants from '../Constants.json';
import SharedStorage from '../SharedStorage';

describe('should fund facilitator workers on origin & auxiliary', async (): Promise<void> => {
  let originWeb3: Web3;
  let auxiliaryWeb3: Web3;
  const auxChainId = Number(Constants.auxChainId);
  const mosaicConfigPath = path.join(__dirname, '../mosaic.json');
  const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);

  const OSTToBeFundedToWorkerForBounty = new BigNumber(500);
  const amountTobeFundedOnOrigin = new BigNumber(1);
  const amountTobeFundedOnAuxiliary = new BigNumber(1);

  let originWorker: string;
  let auxiliaryWorker: string;
  let utils: Utils;

  before(async () => {
    const facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromChain(auxChainId);
    utils = new Utils(
      mosaicConfig,
      facilitatorConfig,
      Number(Constants.auxChainId),
    );
    ({ originWeb3, auxiliaryWeb3 } = utils);

    utils.setWorkerPasswordInEnvironment();

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

    // Fund OST (for bounty)
    const simpleTokenInstance: EIP20Token = utils.getSimpleTokenInstance();
    const transferRawTx: TransactionObject<boolean> = simpleTokenInstance.methods.transfer(
      originWorker,
      OSTToBeFundedToWorkerForBounty.toString(),
    );
    const transferReceipt = await Utils.sendTransaction(
      transferRawTx,
      {
        from: SharedStorage.getOriginFunder(),
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );
    await utils.verifyOSTTransfer(
      transferReceipt,
      originWorker,
      new BigNumber(OSTToBeFundedToWorkerForBounty),
    );
  });

});
