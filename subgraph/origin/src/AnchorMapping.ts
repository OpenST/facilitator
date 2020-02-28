import { StateRootAvailable } from '../generated/Anchor/Anchor';
import { AvailableStateRoot } from '../generated/AnchorSchema';

/* eslint-disable import/prefer-default-export, prefer-const, prefer-template */
export function handleStateRootAvailable(event: StateRootAvailable): void {
  let entity = new AvailableStateRoot(
    event.transaction.hash.toHex() + '_' + event.logIndex.toString(),
  );

  entity.anchoredBlockNumber = event.params._blockNumber;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  entity.save();
}
