import multer from 'multer';
import { DEFAULT_IMAGE_OPTIONS, SUPPORTED_IMAGE_FORMATS } from '../types/image';
import { extractImageMetadata, validateFileSignature, extractImageFromDataUrl } from '../utils/imageUtils';
export function createImageUploadOptions(options = {}) {
    return {
        ...DEFAULT_IMAGE_OPTIONS,
        ...options
    };
}
export function createMulterConfig(options = DEFAULT_IMAGE_OPTIONS) {
    return multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: options.maxSize,
            files: 1
        },
        fileFilter: (req, file, cb) => {
            if (options.allowedFormats.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error(`지원되지 않는 파일 형식: ${file.mimetype}`));
            }
        }
    });
}
export async function validateImageFile(buffer, mimeType, originalName, options = DEFAULT_IMAGE_OPTIONS) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };
    try {
        if (buffer.length > options.maxSize) {
            result.errors.push(`파일 크기가 너무 큽니다. 최대 크기: ${Math.round(options.maxSize / 1024 / 1024)}MB`);
            result.isValid = false;
        }
        if (!options.allowedFormats.includes(mimeType)) {
            result.errors.push(`지원되지 않는 파일 형식: ${mimeType}`);
            result.isValid = false;
        }
        const securityResult = validateFileSignature(buffer, mimeType);
        if (!securityResult.isSecure) {
            result.errors.push(...securityResult.threats);
            result.isValid = false;
        }
        try {
            const metadata = await extractImageMetadata(buffer);
            result.fileInfo = {
                size: buffer.length,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                hasTransparency: metadata.hasTransparency
            };
            if (metadata.width > options.maxWidth) {
                result.errors.push(`이미지 너비가 너무 큽니다. 최대 너비: ${options.maxWidth}px`);
                result.isValid = false;
            }
            if (metadata.height > options.maxHeight) {
                result.errors.push(`이미지 높이가 너무 큽니다. 최대 높이: ${options.maxHeight}px`);
                result.isValid = false;
            }
            if (metadata.width < 10 || metadata.height < 10) {
                result.warnings.push('이미지 크기가 너무 작습니다');
            }
            if (metadata.format === 'gif' && buffer.length > 5 * 1024 * 1024) {
                result.warnings.push('GIF 파일이 너무 큽니다. 성능에 영향을 줄 수 있습니다');
            }
        }
        catch (metadataError) {
            result.errors.push(`이미지 메타데이터 추출 실패: ${metadataError instanceof Error ? metadataError.message : 'Unknown error'}`);
            result.isValid = false;
        }
        if (originalName) {
            const forbiddenChars = /[<>:"/\\|?*\x00-\x1f]/;
            if (forbiddenChars.test(originalName)) {
                result.warnings.push('파일명에 허용되지 않는 문자가 포함되어 있습니다');
            }
            if (originalName.length > 255) {
                result.warnings.push('파일명이 너무 깁니다');
            }
        }
    }
    catch (error) {
        result.errors.push(`이미지 검증 중 오류 발생: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.isValid = false;
    }
    return result;
}
export async function validateImageFromDataUrl(dataUrl, options = DEFAULT_IMAGE_OPTIONS) {
    try {
        const { buffer, mimeType } = extractImageFromDataUrl(dataUrl);
        const validation = await validateImageFile(buffer, mimeType, 'pasted-image', options);
        return {
            ...validation,
            buffer,
            mimeType
        };
    }
    catch (error) {
        return {
            isValid: false,
            errors: [`Data URL 처리 실패: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: []
        };
    }
}
export function validateImageUpload(options = {}) {
    const uploadOptions = createImageUploadOptions(options);
    const upload = createMulterConfig(uploadOptions);
    return async (req, res, next) => {
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
                const validation = await validateImageFile(req.file.buffer, req.file.mimetype, req.file.originalname, uploadOptions);
                req.imageValidation = {
                    ...validation,
                    buffer: req.file.buffer,
                    mimeType: req.file.mimetype,
                    originalName: req.file.originalname
                };
                next();
            }
            catch (error) {
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
export function validateImagePaste(options = {}) {
    const uploadOptions = createImageUploadOptions(options);
    return async (req, res, next) => {
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
        }
        catch (error) {
            req.imageValidation = {
                isValid: false,
                errors: [`이미지 붙여넣기 검증 실패: ${error instanceof Error ? error.message : 'Unknown error'}`],
                warnings: []
            };
            next();
        }
    };
}
export function requireValidImage(req, res, next) {
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
export function isValidImageFormat(mimeType) {
    return SUPPORTED_IMAGE_FORMATS.includes(mimeType);
}
export function isValidImageSize(width, height, options) {
    return width <= options.maxWidth && height <= options.maxHeight;
}
export function isValidFileSize(size, maxSize) {
    return size <= maxSize;
}
export function setValidationOptions(options) {
    return (req, res, next) => {
        req.imageValidationOptions = createImageUploadOptions(options);
        next();
    };
}
//# sourceMappingURL=imageValidation.js.map