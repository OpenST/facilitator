import Observer from "../observer/Observer";
import {MessageRepository, MessageStatus} from "../repositories/MessageRepository";
import Gateway from "../models/Gateway";
import Message from "../models/Message";

export default class ConfirmStakeIntentService extends Observer<Gateway> {

  private messageRepository: MessageRepository;

  private originWeb3: object;

  private auxiliaryWeb3: object;

  public constructor(
    messageRepository: MessageRepository,
    originWeb3: object,
    auxiliaryWeb3: object,
  ) {
    super();

    this.messageRepository = messageRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
  }

  /**
   * This method react on changes when Gateway model is updated.
   *
   * @param gateways List of Gateway model
   */
  public async update(gateways: Gateway[]): Promise<void> {
    // Pass only first gateway address as A facilitaor works for a gateway pair.
    // Here for all gateways object gatewayAddress will be same
    // Collect all messages to be done confirmStakeIntent
    const messages: Message[] = await this.messageRepository.getMessagesForProvenGateway(
      gateways[0].gatewayAddress
    );
    // Call confirmStakeIntent. Integrate with mosaic.js and mosaic-contracts

    await this.confirmStakeIntent();

    // Updates messages targetStatus = declared
    for(let i=0; i < messages.length; i++) {
      let message:Message = messages[i];
      message.targetStatus = MessageStatus.Declared;
      await this.messageRepository.save(message);
    }
  }

  private async confirmStakeIntent() {

  }
}