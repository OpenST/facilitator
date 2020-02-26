import { StateRootAvailable } from '../generated/MosaicFacilitator/Anchor';
import { AvailableStateRoot } from '../generated/schema';

export default function handleStateRootAvailable(event: StateRootAvailable): void {
  const entity = new AvailableStateRoot(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
  );

  entity.blockHeight = event.params._blockNumber;
  entity.stateRoot = event.params._stateRoot;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  entity.save();
}
