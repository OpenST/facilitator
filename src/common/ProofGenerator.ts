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

import Web3 from 'web3';
import * as Web3Utils from 'web3-utils';
import { GetProof } from 'web3-eth';
import Logger from './Logger';

const RLP = require('rlp');

/** Storage proof data interface. */
export interface StorageProof {
  key: string;
  value: string;
  proof: string[];
  serializedProof: string;
}

/** Generated proof data interface. */
export interface ProofData {
  address: string;
  accountProof: string[];
  balance: string;
  codeHash: string;
  nonce: string;
  storageHash: string;
  storageProof: StorageProof[];
  serializedAccountProof?: string;
  encodedAccountValue?: string;
  block_number?: string;
}

/**
 * Generates and account proof.
 */
export default class ProofGenerator {
  /** Web3 instance. */
  private web3: Web3;


  /**
   * Creates proof generator instance with params.
   * @param web3 Instance of web3.
   */
  public constructor(web3: Web3) {
    this.web3 = web3;
  }

  /**
   * Generate merkle proof for account and storage.
   *
   * @param address Ethereum address of account.
   * @param blockNumber Block number at which proof will be generated.
   * @param storageOffset Storage offset in EVM.
   * @param keys Array of storage keys.
   */
  public async generate(
    address: string,
    blockNumber: string,
    storageOffset?: string,
    keys: string[] = [],
  ): Promise<ProofData> {
    Logger.debug('Generating proof');
    Logger.debug(`Generating proof: address ${address}`);
    Logger.debug(`Generating proof: block number ${blockNumber}`);
    Logger.debug(`Generating proof: storageOffset ${storageOffset}`);
    Logger.debug(`Generating proof: keys ${keys}`);
    const storageKeys = storageOffset
      ? [ProofGenerator.storagePath(storageOffset, keys)] : [];
    const blockNumberInHex = Web3Utils.toHex(blockNumber);
    return this.fetchProof(address, storageKeys, blockNumberInHex);
  }

  /**
   * Fetch proof from geth RPC call and serialize it in desired format.
   * @param web3 web3 instance of chain from which proof is generated.
   * @param address Address of ethereum account for which proof needs to be generated.
   * @param storageKeys Array of keys for a mapping in solidity.
   * @param blockNumber Block number in hex.
   * @return Promise that resolves to proof object.
   */
  private async fetchProof(
    address: string,
    storageKeys: string[] = [],
    blockNumber: string = 'latest',
  ): Promise<ProofData> {
    return new Promise((resolve, reject): void => {
      this.web3.eth.getProof(
        address,
        storageKeys,
        blockNumber,
        (error: Error, result: GetProof): void => {
          if (result) {
            try {
              // `as any as` is used here because as per the code, the result
              // should be of type GetProof, but its returning GetProof.result.
              const proofData = result as any as ProofData;

              proofData.serializedAccountProof = ProofGenerator.serializeProof(
                proofData.accountProof,
              );
              proofData.encodedAccountValue = ProofGenerator.encodedAccountValue(
                proofData.serializedAccountProof,
              );

              proofData.storageProof.forEach((sp: StorageProof): void => {
                /* eslint no-param-reassign: "error" */
                sp.serializedProof = ProofGenerator.serializeProof(sp.proof);
              });
              resolve(proofData);
            } catch (exception) {
              reject(exception);
            }
            reject(error);
          }
        },
      );
    });
  }

  /**
   * Provides storage path.
   * @param storageIndex Position of storage in the contract.
   * @param mappings List of keys in case storage is mapping.
   * @return Storage path.
   */
  private static storagePath(
    storageIndex: string,
    mappings: string[],
  ): string {
    let path = '';

    if (mappings && mappings.length > 0) {
      mappings.map((mapping): string => {
        path = `${path}${Web3Utils.padLeft(mapping, 64)}`;
        return path;
      });
    }

    path = `${path}${Web3Utils.padLeft(storageIndex, 64)}`;
    path = Web3Utils.sha3(path);

    return path;
  }

  /**
   * Flatten the array of nodes.
   * @param proof Array of nodes representing merkel proof.
   * @return Serialized proof.
   */
  private static serializeProof(proof: string[]): string {
    const serializedProof: Buffer[] = [];
    proof.forEach((p: string): void => {
      serializedProof.push(RLP.decode(p) as Buffer);
    });
    return `0x${RLP.encode(serializedProof).toString('hex')}`;
  }

  /**
   * Fetch rlp encoded account value (nonce, balance, code hash, storageRoot)
   * @param accountProof Account proof.
   * @return Encoded string.
   */
  private static encodedAccountValue(accountProof: string): string {
    const decodedProof = RLP.decode(accountProof) as Buffer[];
    const leafElement = decodedProof[decodedProof.length - 1];
    // @ts-ignore
    return `0x${leafElement[leafElement.length - 1].toString('hex')}`;
  }
}
