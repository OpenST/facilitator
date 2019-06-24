// This is temporary, `MosaicConfig` will be used from mosaic-chains.
export class MosaicConfig {
  public config: any;

  public constructor(config: any) {
    this.config = config || '';
  }

  public static fromPath(filePath: string): MosaicConfig {
    return new MosaicConfig(filePath || {});
  }
}
