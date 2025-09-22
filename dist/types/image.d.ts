export interface ImageFile {
    id: string;
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    width: number;
    height: number;
    buffer: Buffer;
    url?: string;
    thumbnailUrl?: string;
    uploadedAt: Date;
    isCompressed: boolean;
    quality: number;
}
export interface ImageUploadOptions {
    maxSize: number;
    maxWidth: number;
    maxHeight: number;
    allowedFormats: string[];
    quality: number;
    generateThumbnail: boolean;
    thumbnailSize: {
        width: number;
        height: number;
    };
    compress: boolean;
}
export interface ImageValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    fileInfo?: {
        size: number;
        width: number;
        height: number;
        format: string;
        hasTransparency: boolean;
    };
}
export interface ImageProcessingResult {
    success: boolean;
    originalImage: ImageFile;
    processedImage?: ImageFile;
    thumbnail?: ImageFile;
    compressionRatio?: number;
    processingTime: number;
    error?: string;
}
export interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    size: number;
    hasTransparency: boolean;
    colorSpace: string;
    density?: number;
    exif?: any;
}
export interface ImageUploadRequest {
    file?: Express.Multer.File;
    pasteData?: {
        dataUrl: string;
        fileName?: string;
    };
    options?: Partial<ImageUploadOptions>;
}
export interface ImageUploadResponse {
    success: boolean;
    data?: {
        imageId: string;
        url: string;
        thumbnailUrl?: string;
        metadata: ImageMetadata;
    };
    error?: string;
    validationErrors?: string[];
}
export interface TempImageStorage {
    id: string;
    filePath: string;
    thumbnailPath?: string;
    createdAt: Date;
    expiresAt: Date;
}
export interface ImageCompressionOptions {
    quality: number;
    format?: 'jpeg' | 'png' | 'webp';
    progressive?: boolean;
    optimizeScans?: boolean;
    mozjpeg?: boolean;
}
export interface ImageResizeOptions {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    position?: string;
    background?: string;
    withoutEnlargement?: boolean;
}
export interface SecurityValidationResult {
    isSecure: boolean;
    threats: string[];
    fileSignature: string;
    actualFormat: string;
    suspiciousContent: boolean;
}
export declare const SUPPORTED_IMAGE_FORMATS: readonly ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/bmp", "image/tiff"];
export declare const DEFAULT_IMAGE_OPTIONS: ImageUploadOptions;
export type ImageFormat = typeof SUPPORTED_IMAGE_FORMATS[number];
//# sourceMappingURL=image.d.ts.map