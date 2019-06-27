/**
 * Defines error for facilitator config.
 */
export default class InvalidFacilitatorConfigException extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidFacilitatorConfigException';
    this.message = message;
  }
}
