// Copyright 2019 OpenST Ltd.
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
//
// ----------------------------------------------------------------------------


import fs from 'fs-extra';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { interacts } from '@openst/mosaic-contracts';
import * as Web3Utils from 'web3-utils';
import { EIP20Gateway } from '@openst/mosaic-contracts/dist/interacts/EIP20Gateway';
import { EIP20CoGateway } from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';
import Logger from './Logger';
import Account from './Account';
import MessageTransferRequest from './models/MessageTransferRequest';
import { CODE_HASH, MESSAGE_BOX_OFFSET } from './Constants';
import { GatewayType } from './repositories/GatewayRepository';

const Utils = {
  /**
   * Get config json data from the given file path.
   * @param filePath Config file path.
   * @returns JSON data from config file.
   */
  getJsonDataFromPath(filePath: string): Record<string, any> {
    if (fs.existsSync(filePath)) {
      const config = fs.readFileSync(filePath).toString();
      if (config && config.length > 0) {
        return JSON.parse(config);
      }
      throw new Error('Empty file.');
    }
    throw new Error('File not found.');
  },

  /**
   * This method submits a raw transaction and returns transaction hash.
   * @param tx Raw transaction.
   * @param txOption Transaction options.
   * @param web3 The web3 instance to be used for fetching nonce.
   */
  async sendTransaction(tx: any, txOption: any, web3: Web3): Promise<string> {
    return new Promise(async (onResolve, onReject): Promise<void> => {
      const txOptions = Object.assign({}, txOption);
      Logger.debug(`Transaction sender ${txOptions.from}`);
      if (txOptions.gas === undefined) {
        Logger.debug('Estimating gas for the transaction');
        txOptions.gas = await tx.estimateGas(txOptions).catch((e: Error) => {
          Logger.error('Error on estimating gas, using default value  ', e);
          return 6000000;
        });
        Logger.debug(`Transaction gas estimates  ${txOptions.gas}`);
      }
      if (txOptions.nonce === undefined) {
        const account: Account = new Account(txOptions.from);
        txOptions.nonce = await account.getNonce(web3);
        Logger.debug(`Nonce to be used for transaction sender: ${txOptions.from} is ${txOptions.nonce}`);
      }
      tx.send(txOptions)
        .on('transactionHash', (hash: string): void => onResolve(hash))
        .on('error', (error: Error): void => onReject(error));
    });
  },

  getDefinedOwnProps(obj: {}): string[] {
    const nonUndefinedOwnedProps: string[] = [];
    Object.entries(obj).forEach(
      ([key, value]): void => {
        if (value !== undefined) {
          nonUndefinedOwnedProps.push(key);
        }
      },
    );
    return nonUndefinedOwnedProps;
  },

  /**
   * @return Current timestamp as BigNumber object.
   */
  getCurrentTimestamp(): BigNumber {
    const currentTimestampInMs = new Date().getTime();
    const currentTimestampInS = Math.round(currentTimestampInMs / 1000);
    return new BigNumber(currentTimestampInS);
  },

  /**
   * It provides checksum address using web3.
   * @param address Address.
   * @returns It returns checksum address.
   */
  toChecksumAddress(address: string): string {
    return Web3Utils.toChecksumAddress(address);
  },

  /**
   * Generates and returns hashlock and secret.
   */
  generateSecret(): { secret: string; hashLock: string } {
    const secret = Web3Utils.randomHex(32);
    const hashLock = Web3Utils.keccak256(secret);

    return {
      secret,
      hashLock,
    };
  },

  /**
   * It pre-calculates message hash.
   *
   * @param web3 Web3 instance.
   * @param messageTransferRequest Redeem request object.
   * @param hashLock Hash lock of acceptRedeem transaction.
   * @param intentHash Stake/Redeem intent hash.
   *
   * @return Returns message hash.
   */
  calculateMessageHash(
    web3: Web3,
    messageTransferRequest: MessageTransferRequest,
    hashLock: string,
    intentHash: string,
  ): string {
    const messageTypeHash = web3.utils.sha3(
      web3.eth.abi.encodeParameter(
        'string',
        'Message(bytes32 intentHash,uint256 nonce,uint256 gasPrice,'
      + 'uint256 gasLimit,address sender,bytes32 hashLock)',
      ),
    );

    return web3.utils.sha3(
      web3.eth.abi.encodeParameters(
        [
          'bytes32',
          'bytes32',
          'uint256',
          'uint256',
          'uint256',
          'address',
          'bytes32',
        ],
        [
          messageTypeHash,
          intentHash,
          (messageTransferRequest.nonce).toString(10),
          (messageTransferRequest.gasPrice).toString(10),
          (messageTransferRequest.gasLimit).toString(10),
          messageTransferRequest.senderProxy,
          hashLock,
        ],
      ),
    );
  },

  /**
   * It returns message box offset of gateway.
   * @param web3 Web3 instance.
   * @param gatewayType Type of gateway.
   * @param address Address of gateway contract.
   * @returns Message box offset of gateway of origin or auxiliary.
   */
  async getMessageBoxOffset(
    web3: Web3,
    gatewayType: GatewayType,
    address: string,
  ): Promise<string> {
    let messageBoxOffset = '';
    let gatewayInstance: EIP20Gateway | EIP20CoGateway;
    let codeHash: string;
    if (gatewayType === GatewayType.Origin) {
      gatewayInstance = interacts.getEIP20Gateway(web3, address);
      codeHash = CODE_HASH.eip20Gateway;
    } else {
      gatewayInstance = interacts.getEIP20CoGateway(web3, address);
      codeHash = CODE_HASH.eip20CoGateway;
    }
    messageBoxOffset = await gatewayInstance.methods.MESSAGE_BOX_OFFSET().call();
    if (messageBoxOffset === null) {
      const chainCodeHash = await this.getCodeHash(web3, address);
      if (chainCodeHash === codeHash) {
        messageBoxOffset = MESSAGE_BOX_OFFSET;
      } else {
        throw new Error(`Message box offset not found for contract address ${address}`);
      }
    }
    return messageBoxOffset;
  },

  /**
   * It gets code of the address and performs hash of it.
   * @param web3 Web3 instance.
   * @param address Address of contract.
   * @returns Hash of the contract code.
   */
  async getCodeHash(web3: Web3, address: string): Promise<string> {
    const code = await web3.eth.getCode(address);
    return web3.utils.sha3(code);
  },
};

export default Utils;
