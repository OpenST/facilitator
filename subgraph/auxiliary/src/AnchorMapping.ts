import { StateRootAvailable } from '../generated/MosaicFacilitator/Anchor';
import { AvailableStateRoot } from '../generated/schema';

export default function handleStateRootAvailable(event: StateRootAvailable): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = AvailableStateRoot.load(event.transaction.from.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new AvailableStateRoot(event.transaction.from.toHex());
  }

  // Entity fields can be set based on event parameters
  entity.blockHeight = event.params._blockNumber;
  entity.stateRoot = event.params._stateRoot;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.contractAddress = event.address;
  entity.uts = event.block.timestamp;

  // Entities can be written to the store with `.save()`
  entity.save();
}
