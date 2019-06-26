import { StakeRequestRepository } from '../models/StakeRequestRepository';
import { Config } from '../Config';

export default class StakeRequestService {
  // @ts-ignore
  private stakeRequestRepository: StakeRequestRepository;

  // @ts-ignore
  private config: Config;

  public constructor(stakeRequestRepository: StakeRequestRepository, config: Config) {
    this.stakeRequestRepository = stakeRequestRepository;
    this.config = config;
  }
}
