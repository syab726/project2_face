/**
 * 이미지 업로드 및 검증 시스템 타입 정의
 */

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
  maxSize: number; // bytes
  maxWidth: number;
  maxHeight: number;
  allowedFormats: string[];
  quality: number; // 1-100
  generateThumbnail: boolean;
  thumbnailSize: { width: number; height: number };
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

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
  'image/tiff'
] as const;

export const DEFAULT_IMAGE_OPTIONS: ImageUploadOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxWidth: 4096,
  maxHeight: 4096,
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  quality: 85,
  generateThumbnail: true,
  thumbnailSize: { width: 200, height: 200 },
  compress: true
};

export type ImageFormat = typeof SUPPORTED_IMAGE_FORMATS[number];