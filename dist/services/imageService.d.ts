import { ImageUploadOptions, ImageProcessingResult, ImageCompressionOptions, ImageResizeOptions } from '../types/image';
export declare class ImageService {
    private tempDirectory;
    private uploadDirectory;
    private thumbnailDirectory;
    private tempStorage;
    constructor(tempDir?: string, uploadDir?: string, thumbnailDir?: string);
    private initializeDirectories;
    private startCleanupTimer;
    processImage(buffer: Buffer, mimeType: string, originalName: string, options?: ImageUploadOptions): Promise<ImageProcessingResult>;
    processImageFromDataUrl(dataUrl: string, options?: ImageUploadOptions): Promise<ImageProcessingResult>;
    private saveToTempStorage;
    getTempImage(tempId: string): Promise<{
        buffer: Buffer;
        mimeType: string;
    } | null>;
    deleteTempImage(tempId: string): Promise<void>;
    permanentSave(tempId: string): Promise<{
        imageUrl: string;
        thumbnailUrl?: string;
    } | null>;
    resizeImage(buffer: Buffer, options: ImageResizeOptions): Promise<Buffer>;
    compressImage(buffer: Buffer, options: ImageCompressionOptions): Promise<Buffer>;
    convertFormat(buffer: Buffer, targetFormat: 'jpeg' | 'png' | 'webp', quality?: number): Promise<Buffer>;
    private cleanupExpiredFiles;
    private getOptimalFormat;
    private getMimeTypeFromFile;
    cleanup(): Promise<void>;
}
export declare const imageService: ImageService;
//# sourceMappingURL=imageService.d.ts.map