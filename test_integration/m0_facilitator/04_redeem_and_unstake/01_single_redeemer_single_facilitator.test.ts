import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { EIP20Gateway } from '@openst/mosaic-contracts/dist/interacts/EIP20Gateway';
import { EIP20CoGateway } from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';
import { RedeemPool } from '@openst/mosaic-contracts/dist/interacts/RedeemPool';
import { OSTPrime } from '@openst/mosaic-contracts/dist/interacts/OSTPrime';
import { UtilityToken } from '@openst/mosaic-contracts/dist/interacts/UtilityToken';
import Utils from '../Utils';
import MessageTransferRequest from '../../../src/m0_facilitator/models/MessageTransferRequest';
import Message from '../../../src/m0_facilitator/models/Message';

import {
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../../src/m0_facilitator/repositories/MessageRepository';
import assert from '../../../test/test_utils/assert';
import AuxiliaryChain from '../../../src/m0_facilitator/models/AuxiliaryChain';
import Logger from '../../../src/common/Logger';
import SharedStorage from '../SharedStorage';

describe('redeem and unstake with single redeemer & facilitator process', async (): Promise<void> => {
  const testDuration = 3;
  const interval = 3000;
  const testData = SharedStorage.getTestData();
  const { redeemAmount } = testData;
  const { gasPrice } = testData;
  const { gasLimit } = testData;
  const { redeemerOSTPrimeToFund } = testData;
  const { auxChainId } = testData;
  let redeemerAddress: string;
  const helperObject = SharedStorage.getHelperObject();
  const gatewayAddresses = SharedStorage.getGatewayAddresses();
  const redeemPool: string = gatewayAddresses.redeemPoolAddress;

  let originWeb3: Web3;
  let auxiliaryWeb3: Web3;
  let utils: Utils;
  let messageHash: string | undefined;
  let preGeneratedRedeemRequestHash: string;
  let expectedMessage: Message;
  let anchoredBlockNumber: number;
  let messageTransferRequest: MessageTransferRequest;

  before(async () => {
    utils = new Utils();
    ({ originWeb3, auxiliaryWeb3 } = utils);
  });

  it('should fund redeemer', async (): Promise<void> => {
    redeemerAddress = SharedStorage.getStakeAndMintBeneficiary();

    // Fund OSTPrime to redeemer
    await utils.fundOSTPrimeOnAuxiliary(
      redeemerAddress,
      redeemerOSTPrimeToFund,
    );

    // Utility Token's are not funded.
    // We would redeem the tokens which were minted in stake and mint test case

    // Wrap Utility Token
    await helperObject.wrapUtilityToken({
      from: redeemerAddress,
      gasPrice: await auxiliaryWeb3.eth.getGasPrice(),
      value: redeemAmount,
    });

    // Approve Utility Token
    const utilityTokenInstance: OSTPrime | UtilityToken = helperObject.getUtilityTokenInstance();
    Logger.debug('submitting approving wrapped Utility Token tx.');
    const approveRawTx: TransactionObject<boolean> = utilityTokenInstance.methods.approve(
      redeemPool,
      redeemAmount,
    );
    await Utils.sendTransaction(
      approveRawTx,
      {
        from: redeemerAddress,
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
      gatewayAddresses.eip20CoGatewayAddress,
      redeemerAddress,
      '', // would be filled later
      null,
    );

    preGeneratedRedeemRequestHash = utils.getRedeemRequestHash(
      messageTransferRequest,
      messageTransferRequest.gateway,
      redeemPool,
    );
    Logger.debug('preGeneratedRedeemRequestHash', preGeneratedRedeemRequestHash);
  }

  async function submitRequestRedeemTransaction(redeemPoolInstance: RedeemPool) {
    const requestRedeemRawTx: TransactionObject<string> = redeemPoolInstance.methods.requestRedeem(
      messageTransferRequest.amount.toString(10),
      messageTransferRequest.beneficiary,
      messageTransferRequest.gasPrice.toString(10),
      messageTransferRequest.gasLimit.toString(10),
      messageTransferRequest.nonce.toString(10),
      messageTransferRequest.gateway,
    );

    return Utils.sendTransaction(
      requestRedeemRawTx,
      {
        from: messageTransferRequest.sender,
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
          (messageHash = redeemRequestDb!.messageHash);
          expectedMessage = new Message(
            messageHash,
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
          const message = await coGateway.methods.messages(messageHash.toString()).call();

          const eip20CoGatewayMessageStatus = Utils.getEnumValue(
            parseInt(
              await coGateway.methods.getOutboxMessageStatus(messageHash).call(),
              10,
            ),
          );
          const eip20GatewayMessageStatus = Utils.getEnumValue(
            parseInt(
              await gateway.methods.getInboxMessageStatus(messageHash).call(),
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
      messageTransferRequest.sender,
      messageTransferRequest.gateway,
    ).call();

    assert.strictEqual(
      preGeneratedRedeemRequestHash,
      redeemRequestHash,
      'Incorrect redeem request hash',
    );

    await assertMessageTransferRequest();

    messageTransferRequest.senderProxy = await redeemPoolInstance.methods.redeemerProxies(
      messageTransferRequest.sender,
    ).call();

    await assertMessage();
  });

  it('should verify anchoring', async (): Promise<void> => {
    anchoredBlockNumber = await utils.anchorAuxiliary();
    let verifyAnchorInterval: NodeJS.Timeout;
    const verifyAnchorPromise = new Promise(((resolve, reject) => {
      const endTime = Utils.getEndTime(testDuration);
      verifyAnchorInterval = setInterval(async (): Promise<void> => {
        const auxiliaryChain: AuxiliaryChain | null = await utils.getAuxiliaryChainFromDb(
          auxChainId,
        );
        if (auxiliaryChain!.lastAuxiliaryBlockHeight!.comparedTo(anchoredBlockNumber) === 0) {
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
            const reward = messageTransferRequest.gasPrice.multipliedBy(messageTransferRequest.gasLimit);
            const redeemedAmount: BigNumber = messageTransferRequest.amount.minus(reward);
            Logger.debug('Verifying is redeemer OST balance is: ', redeemedAmount.toString(10));
            await utils.assertUnstakedBalance(messageTransferRequest.beneficiary, redeemedAmount);
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
