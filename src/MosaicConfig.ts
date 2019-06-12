// This is temporary, `MosaicConfig` will be used from mosaic-chains.
export class MosaicConfig {
    public constructor(config: any) {

    }

    public static fromPath(filePath: string): MosaicConfig {
        return new MosaicConfig({});
    }
}
