/**
 *
 */
export class InvalidFacilitatorConfigException extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidFacilitatorConfigException';
    this.message = message;
  }
}
