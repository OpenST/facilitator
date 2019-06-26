import Database from '../models/Database';
import StakeRequestService from './StakeRequestService';
import { Config } from '../Config';

export class Factory {
  public readonly stakeRequestService: StakeRequestService;

  public constructor(database: Database, config: Config) {
    this.stakeRequestService = new StakeRequestService(database.stakeRequestRepository, config);
  }
}
