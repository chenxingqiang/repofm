export declare class AdaptiveCompression {
    private compressionLevel;
    private compressionStats;
    compress(data: any): Promise<any>;
    private compressWithLevel;
    private adjustCompressionLevel;
    private getSize;
    private updateStats;
}
