/**
 * The exception is thrown if a mosaic config is invalid.
 */
export class InvalidMosaicConfigException extends Error {
  /**
   * It calls constructor of Error class and sets error message.
   * @param message A human-readable description of the error.
   */
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidMosaicConfigException';
    this.message = message;
  }
}

/**
 * This exception is used for any error during mosaic config generation.
 */
export class MosaicConfigNotFoundException extends Error {
  /**
   * It calls constructor of Error class and sets error message.
   * @param message A human-readable description of the error.
   */
  public constructor(message: string) {
    super(message);
    this.name = 'MosaicConfigNotFoundException';
    this.message = message;
  }
}

/**
 * Defines the error for Facilitator Start command.
 */
export class FacilitatorStartException extends Error {
  /**
   * It calls constructor of Error class and sets error message.
   * @param message A human-readable description of the error.
   */
  public constructor(message: string) {
    super(message);
    this.name = 'FacilitatorStartException';
    this.message = message;
  }
}

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
export default class InvalidFacilitatorConfigException extends Error {
  /**
   * It calls constructor of Error class and sets error message.
   * @param {string} message Error message.
   */
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidFacilitatorConfigException';
    this.message = message;
  }
}
