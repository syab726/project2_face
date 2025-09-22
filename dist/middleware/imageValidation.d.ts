import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ImageValidationResult, ImageUploadOptions } from '../types/image';
export interface ImageValidatedRequest extends Request {
    imageValidation?: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        fileInfo?: any;
        buffer?: Buffer;
        mimeType?: string;
        originalName?: string;
    };
}
export declare function createImageUploadOptions(options?: Partial<ImageUploadOptions>): ImageUploadOptions;
export declare function createMulterConfig(options?: ImageUploadOptions): multer.Multer;
export declare function validateImageFile(buffer: Buffer, mimeType: string, originalName: string, options?: ImageUploadOptions): Promise<ImageValidationResult>;
export declare function validateImageFromDataUrl(dataUrl: string, options?: ImageUploadOptions): Promise<ImageValidationResult & {
    buffer?: Buffer;
    mimeType?: string;
}>;
export declare function validateImageUpload(options?: Partial<ImageUploadOptions>): (req: ImageValidatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare function validateImagePaste(options?: Partial<ImageUploadOptions>): (req: ImageValidatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare function requireValidImage(req: ImageValidatedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function isValidImageFormat(mimeType: string): boolean;
export declare function isValidImageSize(width: number, height: number, options: ImageUploadOptions): boolean;
export declare function isValidFileSize(size: number, maxSize: number): boolean;
export declare function setValidationOptions(options: Partial<ImageUploadOptions>): (req: any, res: Response, next: NextFunction) => void;
//# sourceMappingURL=imageValidation.d.ts.map