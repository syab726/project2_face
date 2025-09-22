import { ImageMetadata, ImageCompressionOptions, ImageResizeOptions, SecurityValidationResult } from '../types/image';
export declare function extractImageMetadata(buffer: Buffer): Promise<ImageMetadata>;
export declare function validateFileSignature(buffer: Buffer, mimeType: string): SecurityValidationResult;
export declare function compressImage(buffer: Buffer, options: ImageCompressionOptions): Promise<Buffer>;
export declare function resizeImage(buffer: Buffer, options: ImageResizeOptions): Promise<Buffer>;
export declare function generateThumbnail(buffer: Buffer, width: number, height: number): Promise<Buffer>;
export declare function extractImageFromDataUrl(dataUrl: string): {
    buffer: Buffer;
    mimeType: string;
};
export declare function generateUniqueFilename(originalName: string, extension?: string): string;
export declare function convertImageFormat(buffer: Buffer, targetFormat: 'jpeg' | 'png' | 'webp', quality?: number): Promise<Buffer>;
export declare function calculateImageSize(buffer: Buffer): {
    width: number;
    height: number;
};
export declare function cleanupTempFiles(tempDir: string, maxAge?: number): Promise<void>;
export declare function optimizeImage(buffer: Buffer, options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
}): Promise<Buffer>;
//# sourceMappingURL=imageUtils.d.ts.map