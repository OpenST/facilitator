import * as fs from 'fs-extra';
import * as path from 'path';
import {Directory} from '../Directory';
import {Validator} from 'jsonschema';
import {InvalidFacilitatorConfigException} from '../Exception';

const schema = require('./FacilitatorConfig.schema.json');
// TODO: Add description to facilitator schema
/**
 * Holds config of facilitator for a auxiliary chain.
 */
export class FacilitatorConfig {

  /**
   * It reads facilitator config for a chain and verifies the config contents.
   * @param chain
   */
  public static from(chain): void {
    const facilitatorConfig = path.join(
      Directory.getProjectMosaicConfigDir(),
      chain,
      'facilitator-config.json'
    );

    if (fs.existsSync(facilitatorConfig)) {
      const config = fs.readFileSync(facilitatorConfig).toString();
      if (config && config.length > 0) {
        const jsonObject = JSON.parse(config);
        FacilitatorConfig.validateSchema(jsonObject);
      }
    }
  }

 /**
  * This method validate json object against facilitator config schema also throws an exception on failure.
  * @param jsonObject JSON object to be validated against schema.
  */
  private static validateSchema(jsonObject: any): void {

    const validator = new Validator();
    try {
      validator.validate(jsonObject, schema, {throwError: true});
    } catch (error) {
      throw new InvalidFacilitatorConfigException(error.message);
    }
  }
}
