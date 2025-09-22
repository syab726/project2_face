import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { DEFAULT_IMAGE_OPTIONS } from '../types/image';
import { extractImageMetadata, compressImage, generateThumbnail, generateUniqueFilename, optimizeImage, cleanupTempFiles, resizeImage, convertImageFormat } from '../utils/imageUtils';
export class ImageService {
    tempDirectory;
    uploadDirectory;
    thumbnailDirectory;
    tempStorage = new Map();
    constructor(tempDir = '/tmp/images', uploadDir = './uploads/images', thumbnailDir = './uploads/thumbnails') {
        this.tempDirectory = tempDir;
        this.uploadDirectory = uploadDir;
        this.thumbnailDirectory = thumbnailDir;
        this.initializeDirectories();
        this.startCleanupTimer();
    }
    async initializeDirectories() {
        try {
            await fs.mkdir(this.tempDirectory, { recursive: true });
            await fs.mkdir(this.uploadDirectory, { recursive: true });
            await fs.mkdir(this.thumbnailDirectory, { recursive: true });
        }
        catch (error) {
            console.error('디렉토리 초기화 실패:', error);
        }
    }
    startCleanupTimer() {
        setInterval(async () => {
            await this.cleanupExpiredFiles();
        }, 60 * 60 * 1000);
    }
    async processImage(buffer, mimeType, originalName, options = DEFAULT_IMAGE_OPTIONS) {
        const startTime = Date.now();
        try {
            const metadata = await extractImageMetadata(buffer);
            const imageId = crypto.randomUUID();
            const fileName = generateUniqueFilename(originalName);
            const originalImage = {
                id: imageId,
                originalName,
                fileName,
                mimeType,
                size: buffer.length,
                width: metadata.width,
                height: metadata.height,
                buffer,
                uploadedAt: new Date(),
                isCompressed: false,
                quality: 100
            };
            let processedBuffer = buffer;
            let processedImage = { ...originalImage };
            let thumbnail;
            let compressionRatio = 1;
            if (options.compress || metadata.width > options.maxWidth || metadata.height > options.maxHeight) {
                const optimizedBuffer = await optimizeImage(buffer, {
                    maxWidth: options.maxWidth,
                    maxHeight: options.maxHeight,
                    quality: options.quality,
                    format: this.getOptimalFormat(mimeType)
                });
                const optimizedMetadata = await extractImageMetadata(optimizedBuffer);
                processedBuffer = optimizedBuffer;
                processedImage = {
                    ...originalImage,
                    buffer: optimizedBuffer,
                    size: optimizedBuffer.length,
                    width: optimizedMetadata.width,
                    height: optimizedMetadata.height,
                    isCompressed: true,
                    quality: options.quality
                };
                compressionRatio = buffer.length / optimizedBuffer.length;
            }
            if (options.generateThumbnail) {
                const thumbnailBuffer = await generateThumbnail(processedBuffer, options.thumbnailSize.width, options.thumbnailSize.height);
                const thumbnailMetadata = await extractImageMetadata(thumbnailBuffer);
                const thumbnailFileName = `thumb_${fileName}`;
                thumbnail = {
                    id: `${imageId}_thumb`,
                    originalName: `thumb_${originalName}`,
                    fileName: thumbnailFileName,
                    mimeType: 'image/jpeg',
                    size: thumbnailBuffer.length,
                    width: thumbnailMetadata.width,
                    height: thumbnailMetadata.height,
                    buffer: thumbnailBuffer,
                    uploadedAt: new Date(),
                    isCompressed: true,
                    quality: 80
                };
            }
            const tempStorage = await this.saveToTempStorage(processedImage, thumbnail);
            const processingTime = Date.now() - startTime;
            return {
                success: true,
                originalImage,
                processedImage,
                thumbnail,
                compressionRatio,
                processingTime
            };
        }
        catch (error) {
            return {
                success: false,
                originalImage: {
                    id: crypto.randomUUID(),
                    originalName,
                    fileName: originalName,
                    mimeType,
                    size: buffer.length,
                    width: 0,
                    height: 0,
                    buffer,
                    uploadedAt: new Date(),
                    isCompressed: false,
                    quality: 100
                },
                processingTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async processImageFromDataUrl(dataUrl, options = DEFAULT_IMAGE_OPTIONS) {
        try {
            const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (!matches) {
                throw new Error('유효하지 않은 Data URL 형식');
            }
            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            return await this.processImage(buffer, mimeType, 'pasted-image', options);
        }
        catch (error) {
            throw new Error(`Data URL 처리 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async saveToTempStorage(image, thumbnail) {
        const tempId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const imagePath = path.join(this.tempDirectory, `${tempId}_${image.fileName}`);
        await fs.writeFile(imagePath, image.buffer);
        let thumbnailPath;
        if (thumbnail) {
            thumbnailPath = path.join(this.tempDirectory, `${tempId}_${thumbnail.fileName}`);
            await fs.writeFile(thumbnailPath, thumbnail.buffer);
        }
        const tempStorage = {
            id: tempId,
            filePath: imagePath,
            thumbnailPath,
            createdAt: new Date(),
            expiresAt
        };
        this.tempStorage.set(tempId, tempStorage);
        return tempStorage;
    }
    async getTempImage(tempId) {
        const tempStorage = this.tempStorage.get(tempId);
        if (!tempStorage) {
            return null;
        }
        if (new Date() > tempStorage.expiresAt) {
            await this.deleteTempImage(tempId);
            return null;
        }
        try {
            const buffer = await fs.readFile(tempStorage.filePath);
            const mimeType = this.getMimeTypeFromFile(tempStorage.filePath);
            return { buffer, mimeType };
        }
        catch (error) {
            console.error('임시 이미지 조회 실패:', error);
            return null;
        }
    }
    async deleteTempImage(tempId) {
        const tempStorage = this.tempStorage.get(tempId);
        if (!tempStorage) {
            return;
        }
        try {
            await fs.unlink(tempStorage.filePath);
            if (tempStorage.thumbnailPath) {
                await fs.unlink(tempStorage.thumbnailPath);
            }
        }
        catch (error) {
            console.error('임시 파일 삭제 실패:', error);
        }
        this.tempStorage.delete(tempId);
    }
    async permanentSave(tempId) {
        const tempStorage = this.tempStorage.get(tempId);
        if (!tempStorage) {
            return null;
        }
        try {
            const fileName = path.basename(tempStorage.filePath);
            const permanentPath = path.join(this.uploadDirectory, fileName);
            await fs.copyFile(tempStorage.filePath, permanentPath);
            let thumbnailUrl;
            if (tempStorage.thumbnailPath) {
                const thumbnailFileName = path.basename(tempStorage.thumbnailPath);
                const permanentThumbnailPath = path.join(this.thumbnailDirectory, thumbnailFileName);
                await fs.copyFile(tempStorage.thumbnailPath, permanentThumbnailPath);
                thumbnailUrl = `/thumbnails/${thumbnailFileName}`;
            }
            await this.deleteTempImage(tempId);
            return {
                imageUrl: `/images/${fileName}`,
                thumbnailUrl
            };
        }
        catch (error) {
            console.error('영구 저장 실패:', error);
            return null;
        }
    }
    async resizeImage(buffer, options) {
        return await resizeImage(buffer, options);
    }
    async compressImage(buffer, options) {
        return await compressImage(buffer, options);
    }
    async convertFormat(buffer, targetFormat, quality = 85) {
        return await convertImageFormat(buffer, targetFormat, quality);
    }
    async cleanupExpiredFiles() {
        const now = new Date();
        const expiredIds = [];
        for (const [id, storage] of this.tempStorage) {
            if (now > storage.expiresAt) {
                expiredIds.push(id);
            }
        }
        for (const id of expiredIds) {
            await this.deleteTempImage(id);
        }
        await cleanupTempFiles(this.tempDirectory);
    }
    getOptimalFormat(mimeType) {
        switch (mimeType) {
            case 'image/png':
                return 'png';
            case 'image/webp':
                return 'webp';
            default:
                return 'jpeg';
        }
    }
    getMimeTypeFromFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.png':
                return 'image/png';
            case '.webp':
                return 'image/webp';
            case '.gif':
                return 'image/gif';
            default:
                return 'application/octet-stream';
        }
    }
    async cleanup() {
        await this.cleanupExpiredFiles();
    }
}
export const imageService = new ImageService();
//# sourceMappingURL=imageService.js.map