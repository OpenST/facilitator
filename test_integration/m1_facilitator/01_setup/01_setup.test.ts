// Copyright 2020 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { assert } from 'chai';
import shared from '../shared';
import Utils from '../utils';

const MAX_STATE_ROOTS = '100';

describe('Setup contracts ', (): void => {
  it('should setup anchors', async (): Promise<void> => {
    const originTransactionObject = shared.contracts.originAnchor.methods.setup(
      MAX_STATE_ROOTS,
      shared.anchorConsensusAddress,
    );
    await Utils.sendTransaction(
      originTransactionObject,
      {
        from: shared.origin.deployer,
      },
    );

    const auxiliaryTransactionObject = shared.contracts.auxiliaryAnchor.methods.setup(
      MAX_STATE_ROOTS,
      shared.anchorCoconsensusAddress,
    );
    await Utils.sendTransaction(
      auxiliaryTransactionObject,
      {
        from: shared.auxiliary.deployer,
      },
    );

    assert.strictEqual(
      shared.anchorConsensusAddress,
      await shared.contracts.originAnchor
        .methods.consensus().call(),
      'Consensus Address must match',
    );

    assert.strictEqual(
      shared.anchorCoconsensusAddress,
      await shared.contracts.auxiliaryAnchor
        .methods.consensus().call(),
      'Coconsensus Address must match',
    );
  });
  it('should setup erc20 gateway', async (): Promise<void> => {
    const params = {
      metachainId: shared.metachainId,
      erc20Cogateway: shared.contracts.erc20Cogateway.address,
      stateRootProvider: shared.contracts.originAnchor.address,
      maxStorageRootItems: MAX_STATE_ROOTS,
      gatewayOutboxIndex: await shared.contracts.erc20Cogateway.methods.OUTBOX_OFFSET().call(),
    };

    const rawTx = shared.contracts.erc20Gateway.methods.setup(
      params.metachainId,
      params.erc20Cogateway,
      params.stateRootProvider,
      params.maxStorageRootItems,
      params.gatewayOutboxIndex.toString(),
    );

    await Utils.sendTransaction(
      rawTx,
      {
        from: shared.origin.deployer,
      },
    );

    assert.strictEqual(
      await shared.contracts.erc20Gateway.methods.stateRootProvider().call(),
      params.stateRootProvider,
      'State root provider must match',
    );
  });

  it('should activate erc20 cogateway', async (): Promise<void> => {
    const params = {
      metachainId: shared.metachainId,
      erc20Gateway: shared.contracts.erc20Gateway.address,
      stateRootProvider: shared.contracts.auxiliaryAnchor.address,
      maxStorageRootItems: MAX_STATE_ROOTS,
      coGatewayOutboxIndex: await shared.contracts.erc20Gateway.methods.OUTBOX_OFFSET().call(),
      utilityTokenMasterCopy: shared.contracts.utilityTokenMasterCopy.address,
    };

    const rawTx = shared.contracts.erc20Cogateway.methods.activate(
      params.metachainId,
      params.erc20Gateway,
      params.stateRootProvider,
      params.maxStorageRootItems,
      params.coGatewayOutboxIndex,
      params.utilityTokenMasterCopy,
    );

    await Utils.sendTransaction(
      rawTx,
      {
        from: shared.auxiliary.deployer,
      },
    );

    assert.strictEqual(
      await shared.contracts.erc20Cogateway.methods.stateRootProvider().call(),
      params.stateRootProvider,
      'Stateroot provider must match',
    );
  });
});
