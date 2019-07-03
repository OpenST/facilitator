import BigNumber from 'bignumber.js';
import ContractEntityHandler from './ContractEntityHandler';
import {
  AuxiliaryChain,
  AuxiliaryChainRepository,
} from '../models/AuxiliaryChainRepository';
import Logger from '../Logger';
import { AuxiliaryChainRecordNotFoundException } from '../Exception';

export default class AnchorHandler extends ContractEntityHandler<AuxiliaryChain> {
  private auxiliaryChainRepository: AuxiliaryChainRepository;

  private auxiliaryChainID: number;

  public constructor(auxiliaryChainRepository: AuxiliaryChainRepository, auxiliaryChainID: number) {
    super();
    this.auxiliaryChainRepository = auxiliaryChainRepository;
    this.auxiliaryChainID = auxiliaryChainID;
  }

  public async persist(transactions: any[]): Promise<AuxiliaryChain[]> {
    const chainRecord = await this.auxiliaryChainRepository.get(this.auxiliaryChainID);
    if (chainRecord == null) {
      throw new AuxiliaryChainRecordNotFoundException('Cannot find record for auxiliary chain');
    }

    let anchorBlockHeight = chainRecord.lastOriginBlockHeight;
    transactions
      .filter(transaction => chainRecord.anchorAddress === transaction.contractAddress)
      .forEach((filteredTransaction) => {
        if (
          anchorBlockHeight === undefined
          || anchorBlockHeight.lt(new BigNumber(filteredTransaction._blockHeight))
        ) {
          anchorBlockHeight = new BigNumber(filteredTransaction._blockHeight);
        }
      });

    // No change in block height of interested anchor.
    if (anchorBlockHeight === undefined) {
      return [chainRecord];
    }

    const hasChanged = chainRecord.lastOriginBlockHeight === undefined
      || !chainRecord.lastOriginBlockHeight.eq(anchorBlockHeight);

    if (hasChanged) {
      this.auxiliaryChainRepository.update(chainRecord);
    }

    return [chainRecord];
  }


  public async handle(models: AuxiliaryChain[]): Promise<void> {
    Logger.info(`Anchor  : ${models}`);
    return Promise.resolve();
  }
}
