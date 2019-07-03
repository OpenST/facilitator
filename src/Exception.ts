/**
 * This will be thrown when handler implementation not found.
 */
export class HandlerNotFoundException extends Error {
  /**
   * Constructor
   *
   * @param message Exception reason.
   */
  public constructor(message: string) {
    super(message);
    this.name = 'HandlerNotFoundException';
    this.message = message;
  }
}

/**
 * Defines error for facilitator config.
 */
export class InvalidFacilitatorConfigException extends Error {
  /**
   * Constructor
   * @param {string} message Error message.
   */
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidFacilitatorConfigException';
    this.message = message;
  }
}

/**
 * Defines error if auxiliary chain record doesn't exist.
 */
export class AuxiliaryChainRecordNotFoundException extends Error {
  /**
   * Constructor
   * @param {string} message Error message.
   */
  public constructor(message: string) {
    super(message);
    this.name = 'AuxiliaryChainRecordNotFoundException';
    this.message = message;
  }
}
