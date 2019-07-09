
import BigNumber from 'bignumber.js';
import StakeRequest from '../../src/models/StakeRequest';
import ContractEntity from '../../src/models/ContractEntity';
import { EntityType } from '../../src/repositories/ContractEntityRepository';

export default class StubData {
  public static getAStakeRequest = (stakeRequestHash: string): StakeRequest => new StakeRequest(
    stakeRequestHash,
    new BigNumber('1'),
    'beneficiary',
    new BigNumber('2'),
    new BigNumber('3'),
    new BigNumber('4'),
    'gateway',
    'stakerProxy',
  );

  public static getContractEntity = (
    timestamp = new BigNumber(1),
  ): ContractEntity => new ContractEntity(
    '0x0000000000000000000000000000000000000002',
    EntityType.StakeProgresseds,
    timestamp,
    new Date(),
  );
}
