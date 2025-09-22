import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { 
  ImageValidationResult, 
  ImageUploadOptions, 
  DEFAULT_IMAGE_OPTIONS,
  SUPPORTED_IMAGE_FORMATS,
  ImageFormat
} from '../types/image';
import { 
  extractImageMetadata, 
  validateFileSignature, 
  extractImageFromDataUrl 
} from '../utils/imageUtils';

/**
 * 이미지 검증 결과를 담은 Request 확장
 */
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

/**
 * 기본 이미지 업로드 옵션 확장
 */
export function createImageUploadOptions(options: Partial<ImageUploadOptions> = {}): ImageUploadOptions {
  return {
    ...DEFAULT_IMAGE_OPTIONS,
    ...options
  };
}

/**
 * Multer 설정 생성
 */
export function createMulterConfig(options: ImageUploadOptions = DEFAULT_IMAGE_OPTIONS) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: options.maxSize,
      files: 1
    },
    fileFilter: (req, file, cb) => {
      if (options.allowedFormats.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`지원되지 않는 파일 형식: ${file.mimetype}`));
      }
    }
  });
}

/**
 * 이미지 파일 검증
 */
export async function validateImageFile(
  buffer: Buffer, 
  mimeType: string, 
  originalName: string,
  options: ImageUploadOptions = DEFAULT_IMAGE_OPTIONS
): Promise<ImageValidationResult> {
  const result: ImageValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // 1. 기본 파일 크기 검증
    if (buffer.length > options.maxSize) {
      result.errors.push(`파일 크기가 너무 큽니다. 최대 크기: ${Math.round(options.maxSize / 1024 / 1024)}MB`);
      result.isValid = false;
    }

    // 2. MIME 타입 검증
    if (!options.allowedFormats.includes(mimeType)) {
      result.errors.push(`지원되지 않는 파일 형식: ${mimeType}`);
      result.isValid = false;
    }

    // 3. 파일 시그니처 보안 검증
    const securityResult = validateFileSignature(buffer, mimeType);
    if (!securityResult.isSecure) {
      result.errors.push(...securityResult.threats);
      result.isValid = false;
    }

    // 4. 이미지 메타데이터 추출 및 검증
    try {
      const metadata = await extractImageMetadata(buffer);
      
      result.fileInfo = {
        size: buffer.length,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        hasTransparency: metadata.hasTransparency
      };

      // 크기 제한 검증
      if (metadata.width > options.maxWidth) {
        result.errors.push(`이미지 너비가 너무 큽니다. 최대 너비: ${options.maxWidth}px`);
        result.isValid = false;
      }

      if (metadata.height > options.maxHeight) {
        result.errors.push(`이미지 높이가 너무 큽니다. 최대 높이: ${options.maxHeight}px`);
        result.isValid = false;
      }

      // 최소 크기 검증 (선택사항)
      if (metadata.width < 10 || metadata.height < 10) {
        result.warnings.push('이미지 크기가 너무 작습니다');
      }

      // 형식별 추가 검증
      if (metadata.format === 'gif' && buffer.length > 5 * 1024 * 1024) {
        result.warnings.push('GIF 파일이 너무 큽니다. 성능에 영향을 줄 수 있습니다');
      }

    } catch (metadataError) {
      result.errors.push(`이미지 메타데이터 추출 실패: ${metadataError instanceof Error ? metadataError.message : 'Unknown error'}`);
      result.isValid = false;
    }

    // 5. 파일명 검증
    if (originalName) {
      const forbiddenChars = /[<>:"/\\|?*\x00-\x1f]/;
      if (forbiddenChars.test(originalName)) {
        result.warnings.push('파일명에 허용되지 않는 문자가 포함되어 있습니다');
      }

      if (originalName.length > 255) {
        result.warnings.push('파일명이 너무 깁니다');
      }
    }

  } catch (error) {
    result.errors.push(`이미지 검증 중 오류 발생: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Data URL 이미지 검증
 */
export async function validateImageFromDataUrl(
  dataUrl: string,
  options: ImageUploadOptions = DEFAULT_IMAGE_OPTIONS
): Promise<ImageValidationResult & { buffer?: Buffer; mimeType?: string }> {
  try {
    const { buffer, mimeType } = extractImageFromDataUrl(dataUrl);
    const validation = await validateImageFile(buffer, mimeType, 'pasted-image', options);
    
    return {
      ...validation,
      buffer,
      mimeType
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Data URL 처리 실패: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

/**
 * 이미지 업로드 미들웨어 (파일 업로드)
 */
export function validateImageUpload(options: Partial<ImageUploadOptions> = {}) {
  const uploadOptions = createImageUploadOptions(options);
  const upload = createMulterConfig(uploadOptions);

  return async (req: ImageValidatedRequest, res: Response, next: NextFunction) => {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        req.imageValidation = {
          isValid: false,
          errors: [err.message],
          warnings: []
        };
        return next();
      }

      if (!req.file) {
        req.imageValidation = {
          isValid: false,
          errors: ['이미지 파일이 업로드되지 않았습니다'],
          warnings: []
        };
        return next();
      }

      try {
        const validation = await validateImageFile(
          req.file.buffer,
          req.file.mimetype,
          req.file.originalname,
          uploadOptions
        );

        req.imageValidation = {
          ...validation,
          buffer: req.file.buffer,
          mimeType: req.file.mimetype,
          originalName: req.file.originalname
        };

        next();
      } catch (error) {
        req.imageValidation = {
          isValid: false,
          errors: [`이미지 검증 실패: ${error instanceof Error ? error.message : 'Unknown error'}`],
          warnings: []
        };
        next();
      }
    });
  };
}

/**
 * 이미지 붙여넣기 미들웨어 (Data URL)
 */
export function validateImagePaste(options: Partial<ImageUploadOptions> = {}) {
  const uploadOptions = createImageUploadOptions(options);

  return async (req: ImageValidatedRequest, res: Response, next: NextFunction) => {
    try {
      const { dataUrl } = req.body;

      if (!dataUrl) {
        req.imageValidation = {
          isValid: false,
          errors: ['Data URL이 제공되지 않았습니다'],
          warnings: []
        };
        return next();
      }

      const validation = await validateImageFromDataUrl(dataUrl, uploadOptions);

      req.imageValidation = {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        fileInfo: validation.fileInfo,
        buffer: validation.buffer,
        mimeType: validation.mimeType,
        originalName: 'pasted-image'
      };

      next();
    } catch (error) {
      req.imageValidation = {
        isValid: false,
        errors: [`이미지 붙여넣기 검증 실패: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
      next();
    }
  };
}

/**
 * 검증 결과 확인 미들웨어
 */
export function requireValidImage(req: ImageValidatedRequest, res: Response, next: NextFunction) {
  if (!req.imageValidation) {
    return res.status(400).json({
      success: false,
      error: '이미지 검증이 수행되지 않았습니다'
    });
  }

  if (!req.imageValidation.isValid) {
    return res.status(400).json({
      success: false,
      error: '이미지 검증 실패',
      validationErrors: req.imageValidation.errors,
      warnings: req.imageValidation.warnings
    });
  }

  next();
}

/**
 * 이미지 형식 검증 헬퍼
 */
export function isValidImageFormat(mimeType: string): boolean {
  return SUPPORTED_IMAGE_FORMATS.includes(mimeType as ImageFormat);
}

/**
 * 이미지 크기 검증 헬퍼
 */
export function isValidImageSize(width: number, height: number, options: ImageUploadOptions): boolean {
  return width <= options.maxWidth && height <= options.maxHeight;
}

/**
 * 파일 크기 검증 헬퍼
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

/**
 * 검증 옵션 미들웨어
 */
export function setValidationOptions(options: Partial<ImageUploadOptions>) {
  return (req: any, res: Response, next: NextFunction) => {
    req.imageValidationOptions = createImageUploadOptions(options);
    next();
  };
}