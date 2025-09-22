import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { SUPPORTED_IMAGE_FORMATS } from '../types/image';
const FILE_SIGNATURES = {
    'image/jpeg': [
        Buffer.from([0xFF, 0xD8, 0xFF]),
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]),
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE1]),
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE2]),
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE3]),
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE8])
    ],
    'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
    'image/webp': [Buffer.from('RIFF', 'ascii'), Buffer.from('WEBP', 'ascii')],
    'image/gif': [
        Buffer.from('GIF87a', 'ascii'),
        Buffer.from('GIF89a', 'ascii')
    ],
    'image/bmp': [Buffer.from([0x42, 0x4D])],
    'image/tiff': [
        Buffer.from([0x49, 0x49, 0x2A, 0x00]),
        Buffer.from([0x4D, 0x4D, 0x00, 0x2A])
    ]
};
export async function extractImageMetadata(buffer) {
    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();
        return {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || 'unknown',
            size: buffer.length,
            hasTransparency: metadata.hasAlpha || false,
            colorSpace: metadata.space || 'unknown',
            density: metadata.density,
            exif: metadata.exif
        };
    }
    catch (error) {
        throw new Error(`이미지 메타데이터 추출 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export function validateFileSignature(buffer, mimeType) {
    const result = {
        isSecure: false,
        threats: [],
        fileSignature: buffer.subarray(0, 16).toString('hex'),
        actualFormat: 'unknown',
        suspiciousContent: false
    };
    if (!SUPPORTED_IMAGE_FORMATS.includes(mimeType)) {
        result.threats.push('지원되지 않는 파일 형식');
        return result;
    }
    const signatures = FILE_SIGNATURES[mimeType];
    if (!signatures) {
        result.threats.push('알 수 없는 파일 형식');
        return result;
    }
    let signatureMatch = false;
    for (const signature of signatures) {
        if (mimeType === 'image/webp') {
            if (buffer.subarray(0, 4).equals(signature) && buffer.subarray(8, 12).equals(Buffer.from('WEBP', 'ascii'))) {
                signatureMatch = true;
                result.actualFormat = 'webp';
                break;
            }
        }
        else {
            if (buffer.subarray(0, signature.length).equals(signature)) {
                signatureMatch = true;
                result.actualFormat = mimeType.split('/')[1];
                break;
            }
        }
    }
    if (!signatureMatch) {
        result.threats.push('파일 시그니처가 MIME 타입과 일치하지 않음');
    }
    if (buffer.includes(Buffer.from('<?xml', 'ascii')) ||
        buffer.includes(Buffer.from('<script', 'ascii')) ||
        buffer.includes(Buffer.from('javascript:', 'ascii'))) {
        result.suspiciousContent = true;
        result.threats.push('의심스러운 스크립트 콘텐츠 발견');
    }
    result.isSecure = result.threats.length === 0;
    return result;
}
export async function compressImage(buffer, options) {
    try {
        let image = sharp(buffer);
        switch (options.format) {
            case 'jpeg':
                image = image.jpeg({
                    quality: options.quality,
                    progressive: options.progressive,
                    optimizeScans: options.optimizeScans,
                    mozjpeg: options.mozjpeg
                });
                break;
            case 'png':
                image = image.png({
                    quality: options.quality,
                    progressive: options.progressive
                });
                break;
            case 'webp':
                image = image.webp({
                    quality: options.quality
                });
                break;
            default:
                break;
        }
        return await image.toBuffer();
    }
    catch (error) {
        throw new Error(`이미지 압축 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function resizeImage(buffer, options) {
    try {
        let image = sharp(buffer);
        if (options.width || options.height) {
            image = image.resize({
                width: options.width,
                height: options.height,
                fit: options.fit,
                position: options.position,
                background: options.background,
                withoutEnlargement: options.withoutEnlargement
            });
        }
        return await image.toBuffer();
    }
    catch (error) {
        throw new Error(`이미지 리사이즈 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function generateThumbnail(buffer, width, height) {
    try {
        return await sharp(buffer)
            .resize(width, height, {
            fit: 'cover',
            position: 'center'
        })
            .jpeg({ quality: 80 })
            .toBuffer();
    }
    catch (error) {
        throw new Error(`썸네일 생성 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export function extractImageFromDataUrl(dataUrl) {
    try {
        const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            throw new Error('유효하지 않은 Data URL 형식');
        }
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        return { buffer, mimeType };
    }
    catch (error) {
        throw new Error(`Data URL 파싱 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export function generateUniqueFilename(originalName, extension) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = extension || path.extname(originalName);
    const baseName = path.basename(originalName, path.extname(originalName));
    return `${baseName}_${timestamp}_${randomString}${ext}`;
}
export async function convertImageFormat(buffer, targetFormat, quality = 85) {
    try {
        let image = sharp(buffer);
        switch (targetFormat) {
            case 'jpeg':
                image = image.jpeg({ quality });
                break;
            case 'png':
                image = image.png({ quality });
                break;
            case 'webp':
                image = image.webp({ quality });
                break;
        }
        return await image.toBuffer();
    }
    catch (error) {
        throw new Error(`이미지 형식 변환 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export function calculateImageSize(buffer) {
    try {
        const metadata = sharp(buffer).metadata();
        return metadata.then(meta => ({
            width: meta.width || 0,
            height: meta.height || 0
        }));
    }
    catch (error) {
        throw new Error(`이미지 크기 계산 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function cleanupTempFiles(tempDir, maxAge = 24 * 60 * 60 * 1000) {
    try {
        const files = await fs.readdir(tempDir);
        const now = Date.now();
        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = await fs.stat(filePath);
            if (now - stats.mtime.getTime() > maxAge) {
                await fs.unlink(filePath);
            }
        }
    }
    catch (error) {
        console.error('임시 파일 정리 실패:', error);
    }
}
export async function optimizeImage(buffer, options) {
    try {
        let image = sharp(buffer);
        if (options.maxWidth || options.maxHeight) {
            image = image.resize({
                width: options.maxWidth,
                height: options.maxHeight,
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        const quality = options.quality || 85;
        switch (options.format) {
            case 'jpeg':
                image = image.jpeg({ quality });
                break;
            case 'png':
                image = image.png({ quality });
                break;
            case 'webp':
                image = image.webp({ quality });
                break;
        }
        return await image.toBuffer();
    }
    catch (error) {
        throw new Error(`이미지 최적화 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=imageUtils.js.map