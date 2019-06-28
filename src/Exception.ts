/**
 * This exception is used when mosaic config is invalid.
 */
export class InvalidMosaicConfigException extends Error {
  /**
   * Constructor
   * @param {string} message Error message
   */
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidMosaicConfigException';
    this.message = message;
  }
}

/**
 * This exception is used for any exception during mosaic config generation.
 */
export class MosaicConfigNotFoundException extends Error {
  /**
   * Constructor
   * @param {string} message Error message
   */
  public constructor(message: string) {
    super(message);
    this.name = 'MosaicConfigNotFoundException';
    this.message = message;
  }
}

/**
 * This exception is used for any exception in Facilitator start command.
 */
export class FacilitatorStartException extends Error {
  /**
   * Constructor
   * @param {string} message Error message
   */
  public constructor(message: string) {
    super(message);
    this.name = 'FacilitatorStartException';
    this.message = message;
  }
}

/**
 * Defines error for facilitator config.
 */
export default class InvalidFacilitatorConfigException extends Error {
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
