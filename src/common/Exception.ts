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

/* eslint-disable import/prefer-default-export */

/**
 * This exception is thrown if a handler implementation for the given
 * transaction kind was not found while handling transactions in the
 * TransactionHandler module.
 */
export class HandlerNotFoundException extends Error {
  public constructor(transactionKind: string) {
    const message = `Handler implementation for a '${transactionKind}' `
    + 'transaction kind was not found.';

    super(message);

    Object.setPrototypeOf(this, HandlerNotFoundException.prototype);
    this.name = 'HandlerNotFoundException';
  }
}
