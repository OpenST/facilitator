// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------

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
 * This exception is thrown if mosaic config is not found.
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
 * This exception is thrown if facilitator config is not found.
 */
export class FacilitatorConfigNotFoundException extends Error {
  /**
   * It calls constructor of Error class and sets error message.
   * @param message A human-readable description of the error.
   */
  public constructor(message: string) {
    super(message);
    this.name = 'FacilitatorConfigNotFoundException';
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
export class InvalidFacilitatorConfigException extends Error {
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

/**
 * Defines error if auxiliary chain record doesn't exist.
 */
export class AuxiliaryChainRecordNotFoundException extends Error {
  /**
   * @param message Error message.
   */
  public constructor(message: string) {
    super(message);
    this.name = 'AuxiliaryChainRecordNotFoundException';
    this.message = message;
  }
}
