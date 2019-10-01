import * as path from 'path';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { Account } from 'web3-eth-accounts';
import { EIP20Gateway } from '@openst/mosaic-contracts/dist/interacts/EIP20Gateway';
import { EIP20CoGateway } from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';
import { RedeemPool } from '@openst/mosaic-contracts/dist/interacts/RedeemPool';
import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import { OSTPrime } from '@openst/mosaic-contracts/dist/interacts/OSTPrime';
import * as Constants from '../Constants.json';
import Utils from '../Utils';
import MessageTransferRequest from '../../src/models/MessageTransferRequest';
import Message from '../../src/models/Message';

import {
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../src/repositories/MessageRepository';
import assert from '../../test/test_utils/assert';
import AuxiliaryChain from '../../src/models/AuxiliaryChain';
import { FacilitatorConfig } from '../../src/Config/Config';
import Logger from '../../src/Logger';

describe('redeem and unstake with single redeemer & facilitator process', async (): Promise<void> => {
  const redeemAmount = '130';
  const gasPrice = '2';
  const gasLimit = '5';
  const testDuration = 3;
  const interval = 3000;
  const auxChainId = Number(Constants.auxChainId);
  const mosaicConfigPath = path.join(__dirname, '../mosaic.json');
  const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);
  const redeemPool: string = mosaicConfig.auxiliaryChains[auxChainId]
    .contractAddresses.auxiliary.redeemPoolAddress;

  let originWeb3: Web3;
  let auxiliaryWeb3: Web3;
  let utils: Utils;
  let redeemerAccount: Account;
  let messageHash: string | undefined;
  let preGeneratedRedeemRequestHash: string;
  let expectedMessage: Message;
  let anchoredBlockNumber: number;
  let messageTransferRequest: MessageTransferRequest;

  before(async () => {
    const facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromChain(auxChainId);
    utils = new Utils(
      mosaicConfig,
      facilitatorConfig,
      auxChainId,
    );
    ({ originWeb3, auxiliaryWeb3 } = utils);
  });

  it('should fund redeemer', async (): Promise<void> => {
    redeemerAccount = auxiliaryWeb3.eth.accounts.create('redeemTest');
    auxiliaryWeb3.eth.accounts.wallet.add(redeemerAccount);

    const ostPrimeAmountToBeFunded = '0.1'; // OSTPrime unit
    const ostPrimeAmountToBeFundedInWei = Utils.convertToWei(ostPrimeAmountToBeFunded).toString();

    // Fund OSTPrime to redeemer
    await utils.fundOSTPrimeOnAuxiliary(
      redeemerAccount.address,
      new BigNumber(ostPrimeAmountToBeFunded).mul(1.2), // 20% extra for gas usage
    );

    const simpleTokenPrimeInstance: OSTPrime = utils.getSimpleTokenPrimeInstance();

    // Wrap OSTPrime
    Logger.debug('submitting wrapping OSTPrime tx.');
    const wrapRawTx: TransactionObject<boolean> = simpleTokenPrimeInstance.methods.wrap();
    await Utils.sendTransaction(
      wrapRawTx,
      {
        from: redeemerAccount.address,
        gasPrice: await auxiliaryWeb3.eth.getGasPrice(),
        value: ostPrimeAmountToBeFundedInWei,
      },
    );

    // Approve OSTPrime
    Logger.debug('submitting approving wrapped OSTPrime tx.');
    const approveRawTx: TransactionObject<boolean> = simpleTokenPrimeInstance.methods.approve(
      redeemPool,
      ostPrimeAmountToBeFundedInWei,
    );
    await Utils.sendTransaction(
      approveRawTx,
      {
        from: redeemerAccount.address,
        gasPrice: await auxiliaryWeb3.eth.getGasPrice(),
      },
    );
  });

  function prepareRequestRedeemData() {
    messageTransferRequest = new MessageTransferRequest(
      '', // would be filled later
      MessageType.Redeem,
      new BigNumber(0), // It will be updated after redeem request is done.
      new BigNumber(redeemAmount),
      originWeb3.eth.accounts.create('beneficiary').address,
      new BigNumber(gasPrice),
      new BigNumber(gasLimit),
      new BigNumber(1),
      mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.ostEIP20CogatewayAddress,
      redeemerAccount.address,
      '' // would be filled later
    );

    preGeneratedRedeemRequestHash = utils.getRedeemRequestHash(
      messageTransferRequest,
      messageTransferRequest.gateway!,
      redeemPool,
    );
    Logger.debug('preGeneratedRedeemRequestHash', preGeneratedRedeemRequestHash);
  }

  async function submitRequestRedeemTransaction(redeemPoolInstance: RedeemPool) {
    const requestRedeemRawTx: TransactionObject<string> = redeemPoolInstance.methods.requestRedeem(
      messageTransferRequest.amount!.toString(10),
      messageTransferRequest.beneficiary!,
      messageTransferRequest.gasPrice!.toString(10),
      messageTransferRequest.gasLimit!.toString(10),
      messageTransferRequest.nonce!.toString(10),
      messageTransferRequest.gateway!,
    );

    return Utils.sendTransaction(
      requestRedeemRawTx,
      {
        from: messageTransferRequest.sender!,
        gasPrice: await auxiliaryWeb3.eth.getGasPrice(),
      },
    );
  }

  async function assertMessageTransferRequest() {
    let assertMessageTransferRequestInterval: NodeJS.Timeout;
    const assertMessageTransferRequestPromise = new Promise(((resolve, reject) => {
      const endTime = Utils.getEndTime(testDuration);
      assertMessageTransferRequestInterval = setInterval(async () => {
          const messageTransferRequestDb: MessageTransferRequest | null = await
            utils.getMessageTransferRequest(
              preGeneratedRedeemRequestHash,
            );

          if (messageTransferRequestDb != null) {
            try {
              Utils.assertMessageTransferRequests(messageTransferRequestDb, messageTransferRequest);
            } catch (e) {
              reject(e);
            }
            resolve();
          }

          const currentTime = process.hrtime()[0];

          if (currentTime >= endTime) {
            reject(
              new Error(
                'Assertion for redeem requests table failed as response was not received'
                + ` within ${testDuration} mins`,
              ),
            );
          }
        },
        interval);
    }));

    await assertMessageTransferRequestPromise.then((): void => {
      clearInterval(assertMessageTransferRequestInterval);
    }).catch((err: Error): Error => {
      clearInterval(assertMessageTransferRequestInterval);
      throw err;
    });
  }

  async function assertMessage() {
    let assertMessageInterval: NodeJS.Timeout;
    const assertMessagePromise = new Promise(((resolve, reject) => {
      const endTime = Utils.getEndTime(testDuration);
      const coGateway: EIP20CoGateway = utils.getEIP20CoGatewayInstance();
      const gateway: EIP20Gateway = utils.getEIP20GatewayInstance();

      assertMessageInterval = setInterval(async (): Promise<void> => {
          const redeemRequestDb: MessageTransferRequest | null = await utils.getMessageTransferRequest(
            preGeneratedRedeemRequestHash,
          );

          if (redeemRequestDb!.messageHash) {
            ({messageHash} = redeemRequestDb!);
            expectedMessage = new Message(
              messageHash!,
              MessageType.Redeem,
              MessageDirection.AuxiliaryToOrigin,
              messageTransferRequest.gateway,
              MessageStatus.Undeclared,
              MessageStatus.Undeclared,
              messageTransferRequest.gasPrice,
              messageTransferRequest.gasLimit,
              messageTransferRequest.nonce,
              messageTransferRequest.senderProxy,
              new BigNumber(0),
              '',
            );
            const messageInDb = await utils.getMessageFromDB(messageHash);
            const message = await coGateway.methods.messages(messageHash!.toString()).call();

            const eip20CoGatewayMessageStatus = Utils.getEnumValue(
              parseInt(
                await coGateway.methods.getOutboxMessageStatus(messageHash!).call(),
                10,
              ),
            );
            const eip20GatewayMessageStatus = Utils.getEnumValue(
              parseInt(
                await gateway.methods.getInboxMessageStatus(messageHash!).call(),
                10,
              ),
            );
            try {
              if (
                eip20CoGatewayMessageStatus === MessageStatus.Undeclared
                && eip20GatewayMessageStatus === MessageStatus.Undeclared
                && Utils.isSourceUndeclaredTargetUndeclared(messageInDb!)
              ) {
                Utils.assertMessages(messageInDb!, expectedMessage);
              } else if (
                eip20CoGatewayMessageStatus === MessageStatus.Declared
                && eip20GatewayMessageStatus === MessageStatus.Undeclared
              ) {
                if (Utils.isSourceUndeclaredTargetUndeclared(messageInDb!)) {
                  Utils.assertMessages(messageInDb!, expectedMessage);
                } else if (Utils.isSourceDeclaredTargetUndeclared(messageInDb!)) {
                  expectedMessage.hashLock = message.hashLock;
                  Utils.assertMessages(messageInDb!, expectedMessage);
                  resolve();
                }
              } else {
                throw new Error(
                  `Message status for source in db is ${messageInDb!.sourceStatus} but in `
                  + `eip20CoGateway is ${eip20CoGatewayMessageStatus} and Message status for target in db is `
                  + `${messageInDb!.targetStatus} but got ${eip20GatewayMessageStatus}`,
                );
              }
            } catch (e) {
              reject(e);
            }
            const currentTime = process.hrtime()[0];

            if (currentTime >= endTime) {
              reject(
                new Error(
                  'Assertion for messages table while request staking failed as response was not received'
                  + ` within ${testDuration} mins`,
                ),
              );
            }
          }
        },
        interval);
    }));

    await assertMessagePromise.then((): void => {
      clearInterval(assertMessageInterval);
    }).catch((err: Error): Error => {
      clearInterval(assertMessageInterval);
      throw err;
    });
  }

  it('should perform & validate request redeem', async (): Promise<void> => {

    const redeemPoolInstance = utils.getRedeemPoolInstance();

    prepareRequestRedeemData();

    const receipt = await submitRequestRedeemTransaction(redeemPoolInstance);

    messageTransferRequest.blockNumber = new BigNumber(receipt.blockNumber);

    assert.strictEqual(
      receipt.status,
      true,
      'redeem request receipt status should be true',
    );

    const redeemRequestHash = await redeemPoolInstance.methods.redeemRequestHashes(
      messageTransferRequest.sender!,
      messageTransferRequest.gateway!,
    ).call();

    assert.strictEqual(
      preGeneratedRedeemRequestHash,
      redeemRequestHash,
      'Incorrect redeem request hash',
    );

    await assertMessageTransferRequest();

    messageTransferRequest.senderProxy = await redeemPoolInstance.methods.redeemerProxies(
      messageTransferRequest.sender!,
    ).call();

    await assertMessage();

  });

  it('should verify anchoring', async (): Promise<void> => {
    anchoredBlockNumber = await utils.anchorAuxiliary(auxChainId);
    let verifyAnchorInterval: NodeJS.Timeout;
    const verifyAnchorPromise = new Promise(((resolve, reject) => {
      const endTime = Utils.getEndTime(testDuration);
      verifyAnchorInterval = setInterval(async (): Promise<void> => {
        const auxiliaryChain: AuxiliaryChain | null = await utils.getAuxiliaryChainFromDb(
          auxChainId,
        );
        if (auxiliaryChain!.lastAuxiliaryBlockHeight!.cmp(anchoredBlockNumber) === 0) {
          const expectedAuxiliaryChain = utils.getAuxiliaryChainStub(
            auxiliaryChain!.lastOriginBlockHeight!,
            new BigNumber(anchoredBlockNumber),
          );
          try {
            Utils.assertAuxiliaryChain(auxiliaryChain!, expectedAuxiliaryChain);
          } catch (e) {
            reject(e);
          }
          resolve();
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          reject(
            new Error(
              'Assertion for auxiliary chains table while anchoring failed as'
                + ` response was not received within ${testDuration} mins`,
            ),
          );
        }
      },
      interval);
    }));

    await verifyAnchorPromise.then((): void => {
      clearInterval(verifyAnchorInterval);
    }).catch((err: Error): Error => {
      clearInterval(verifyAnchorInterval);
      throw err;
    });
  });

  it('should verify progress unstaking', async (): Promise<void> => {
    let progressUnstakingInterval: NodeJS.Timeout;

    const progressUnstaking = new Promise(((resolve, reject) => {
      const endTime = Utils.getEndTime(testDuration * 2);
      const eip20CoGateway = utils.getEIP20CoGatewayInstance();
      const eip20Gateway = utils.getEIP20GatewayInstance();

      progressUnstakingInterval = setInterval(async (): Promise<void> => {
        const eip20CoGatewayMessageStatus = Utils.getEnumValue(parseInt(
          await eip20CoGateway.methods.getOutboxMessageStatus(
            messageHash!,
          ).call(),
          10,
        ));

        const eip20GatewayMessageStatus = Utils.getEnumValue(parseInt(
          await eip20Gateway.methods.getInboxMessageStatus(
            messageHash!,
          ).call(),
          10,
        ));
        Logger.debug('Verifying if message statuses are valid');
        Logger.debug('eip20CoGatewayMessageStatus: ', eip20CoGatewayMessageStatus);
        Logger.debug('eip20GatewayMessageStatus: ', eip20GatewayMessageStatus);
        const messageInCoGateway = await eip20CoGateway.methods.messages(messageHash!).call();

        const messageInDb = await utils.getMessageFromDB(messageHash);

        expectedMessage = Utils.getMessageStub(messageInCoGateway, expectedMessage!);
        try {
          if (Utils.isMessageStatusValid(
            eip20CoGatewayMessageStatus,
            eip20GatewayMessageStatus,
            messageInDb!,
          )) {
            Utils.assertMessages(messageInDb!, expectedMessage);
          } else if (
            eip20GatewayMessageStatus === MessageStatus.Progressed
              && eip20CoGatewayMessageStatus === MessageStatus.Progressed
              && Utils.isSourceProgressedTargetProgressed(messageInDb!)
          ) {
            Utils.assertMessages(messageInDb!, expectedMessage);
            const reward = messageTransferRequest.gasPrice!.mul(messageTransferRequest.gasLimit!);
            const redeemedAmount: BigNumber = messageTransferRequest.amount!.sub(reward);
            Logger.debug('Verifying is redeemer OST balance is: ', redeemedAmount.toString(10));
            await utils.assertUnstakedBalance(messageTransferRequest.beneficiary!, redeemedAmount);
            resolve();
          } else {
            throw new Error(
              `Message status for source in db is ${messageInDb!.sourceStatus} but in `
                + `eip20CoGateway is ${eip20CoGatewayMessageStatus} and Message status for target in db is `
                + `${messageInDb!.targetStatus} but got ${eip20GatewayMessageStatus}`,
            );
          }
        } catch (e) {
          reject(e);
        }

        const currentTime = process.hrtime()[0];
        if (currentTime >= endTime) {
          reject(
            new Error(
              'Time out while verifying progress minting of message. Source status at db is'
                + `${messageInDb!.sourceStatus} and Target status at db is ${messageInDb!.targetStatus}`
                + `EIP20Gateway status is ${eip20GatewayMessageStatus} and EIP20CoGateway status is`
                + `${eip20CoGatewayMessageStatus}`,
            ),
          );
        }
      },
      interval);
    }));

    await progressUnstaking.then((): void => {
      clearInterval(progressUnstakingInterval);
    }).catch((err: Error): Error => {
      clearInterval(progressUnstakingInterval);
      throw err;
    });
  });
});
