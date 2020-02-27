import { StateRootAvailable } from '../generated/Anchor/Anchor';
import { AvailableStateRoot } from '../generated/schema';

// eslint-disable-next-line import/prefer-default-export
export function handleStateRootAvailable(event: StateRootAvailable): void {
  // eslint-disable-next-line prefer-const
  let entity = new AvailableStateRoot(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
  );

  entity.anchoredBlockNumber = event.params._blockNumber;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  entity.save();
}
