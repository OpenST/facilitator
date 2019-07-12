import Subscriber from './subscriptions/Subscriber';

/**
 * The class defines properties and behavior of a facilitator.
 */
export default class Facilitator {
  private originSubscriber: Subscriber;

  private auxiliarySubscriber: Subscriber;

  /**
   * Facilitator class constructor.
   *
   */
  public constructor(originSubscriber: Subscriber, auxiliarySubscriber: Subscriber) {
    this.originSubscriber = originSubscriber;
    this.auxiliarySubscriber = auxiliarySubscriber;
  }

  /** Starts the facilitator by subscribing to subscription queries. */
  public async start(): Promise<void> {
    await this.originSubscriber.subscribe();
    await this.auxiliarySubscriber.subscribe();
  }

  /**
   * Stops the facilitator and unsubscribe to query subscriptions.
   * This function should be called on signint or control-c.
   */
  public async stop(): Promise<void> {
    if (this.originSubscriber) {
      await this.originSubscriber.unsubscribe();
    }
    if (this.auxiliarySubscriber) {
      await this.auxiliarySubscriber.unsubscribe();
    }
  }
}
