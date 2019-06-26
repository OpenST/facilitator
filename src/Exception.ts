export class InvalidMosaicConfigException extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidMosaicConfigException';
    this.message = message;
  }
}

export class MosaicConfigNotFoundException extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'MosaicConfigNotFoundException';
    this.message = message;
  }
}

export class FacilitatorStartException extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'FacilitatorStartException';
    this.message = message;
  }
}
