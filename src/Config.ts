/**
 * The class encapsulates properties and behaviour of mosaicConfig and facilitatorConfig.
 */
export default class Config {

  private mosaicConfigPath: string;

  private facilitatorConfigPath: string;

  /**
   * Config class constructor.
   */
  public constructor(mosaicConfigPath, facilitatorConfigPath) {
   this.mosaicConfigPath = mosaicConfigPath;
   this.facilitatorConfigPath = facilitatorConfigPath;
  }
}
