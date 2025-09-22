import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { 
  ImageFile, 
  ImageUploadOptions, 
  ImageProcessingResult, 
  ImageMetadata,
  TempImageStorage,
  ImageCompressionOptions,
  ImageResizeOptions,
  DEFAULT_IMAGE_OPTIONS
} from '../types/image';
import { 
  extractImageMetadata, 
  compressImage, 
  generateThumbnail, 
  generateUniqueFilename,
  optimizeImage,
  cleanupTempFiles,
  resizeImage,
  convertImageFormat
} from '../utils/imageUtils';

/**
 * 이미지 서비스 클래스
 */
export class ImageService {
  private tempDirectory: string;
  private uploadDirectory: string;
  private thumbnailDirectory: string;
  private tempStorage: Map<string, TempImageStorage> = new Map();

  constructor(
    tempDir: string = '/tmp/images',
    uploadDir: string = './uploads/images',
    thumbnailDir: string = './uploads/thumbnails'
  ) {
    this.tempDirectory = tempDir;
    this.uploadDirectory = uploadDir;
    this.thumbnailDirectory = thumbnailDir;
    this.initializeDirectories();
    this.startCleanupTimer();
  }

  /**
   * 디렉토리 초기화
   */
  private async initializeDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.tempDirectory, { recursive: true });
      await fs.mkdir(this.uploadDirectory, { recursive: true });
      await fs.mkdir(this.thumbnailDirectory, { recursive: true });
    } catch (error) {
      console.error('디렉토리 초기화 실패:', error);
    }
  }

  /**
   * 정리 타이머 시작
   */
  private startCleanupTimer(): void {
    // 1시간마다 임시 파일 정리
    setInterval(async () => {
      await this.cleanupExpiredFiles();
    }, 60 * 60 * 1000);
  }

  /**
   * 이미지 처리 및 저장
   */
  async processImage(
    buffer: Buffer, 
    mimeType: string, 
    originalName: string,
    options: ImageUploadOptions = DEFAULT_IMAGE_OPTIONS
  ): Promise<ImageProcessingResult> {
    const startTime = Date.now();
    
    try {
      // 1. 메타데이터 추출
      const metadata = await extractImageMetadata(buffer);
      
      // 2. 고유 ID 생성
      const imageId = crypto.randomUUID();
      const fileName = generateUniqueFilename(originalName);
      
      // 3. 원본 이미지 정보 생성
      const originalImage: ImageFile = {
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
      let processedImage: ImageFile = { ...originalImage };
      let thumbnail: ImageFile | undefined;
      let compressionRatio = 1;

      // 4. 이미지 최적화 (압축 + 리사이즈)
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

      // 5. 썸네일 생성
      if (options.generateThumbnail) {
        const thumbnailBuffer = await generateThumbnail(
          processedBuffer,
          options.thumbnailSize.width,
          options.thumbnailSize.height
        );

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

      // 6. 임시 저장소에 저장
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

    } catch (error) {
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

  /**
   * Data URL로부터 이미지 처리
   */
  async processImageFromDataUrl(
    dataUrl: string,
    options: ImageUploadOptions = DEFAULT_IMAGE_OPTIONS
  ): Promise<ImageProcessingResult> {
    try {
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('유효하지 않은 Data URL 형식');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      return await this.processImage(buffer, mimeType, 'pasted-image', options);
    } catch (error) {
      throw new Error(`Data URL 처리 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 임시 저장소에 이미지 저장
   */
  private async saveToTempStorage(
    image: ImageFile, 
    thumbnail?: ImageFile
  ): Promise<TempImageStorage> {
    const tempId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후 만료
    
    const imagePath = path.join(this.tempDirectory, `${tempId}_${image.fileName}`);
    await fs.writeFile(imagePath, image.buffer);

    let thumbnailPath: string | undefined;
    if (thumbnail) {
      thumbnailPath = path.join(this.tempDirectory, `${tempId}_${thumbnail.fileName}`);
      await fs.writeFile(thumbnailPath, thumbnail.buffer);
    }

    const tempStorage: TempImageStorage = {
      id: tempId,
      filePath: imagePath,
      thumbnailPath,
      createdAt: new Date(),
      expiresAt
    };

    this.tempStorage.set(tempId, tempStorage);
    return tempStorage;
  }

  /**
   * 임시 저장소에서 이미지 조회
   */
  async getTempImage(tempId: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
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
    } catch (error) {
      console.error('임시 이미지 조회 실패:', error);
      return null;
    }
  }

  /**
   * 임시 이미지 삭제
   */
  async deleteTempImage(tempId: string): Promise<void> {
    const tempStorage = this.tempStorage.get(tempId);
    if (!tempStorage) {
      return;
    }

    try {
      await fs.unlink(tempStorage.filePath);
      if (tempStorage.thumbnailPath) {
        await fs.unlink(tempStorage.thumbnailPath);
      }
    } catch (error) {
      console.error('임시 파일 삭제 실패:', error);
    }

    this.tempStorage.delete(tempId);
  }

  /**
   * 영구 저장소로 이미지 이동
   */
  async permanentSave(tempId: string): Promise<{ imageUrl: string; thumbnailUrl?: string } | null> {
    const tempStorage = this.tempStorage.get(tempId);
    if (!tempStorage) {
      return null;
    }

    try {
      const fileName = path.basename(tempStorage.filePath);
      const permanentPath = path.join(this.uploadDirectory, fileName);
      
      await fs.copyFile(tempStorage.filePath, permanentPath);
      
      let thumbnailUrl: string | undefined;
      if (tempStorage.thumbnailPath) {
        const thumbnailFileName = path.basename(tempStorage.thumbnailPath);
        const permanentThumbnailPath = path.join(this.thumbnailDirectory, thumbnailFileName);
        await fs.copyFile(tempStorage.thumbnailPath, permanentThumbnailPath);
        thumbnailUrl = `/thumbnails/${thumbnailFileName}`;
      }

      // 임시 파일 삭제
      await this.deleteTempImage(tempId);

      return {
        imageUrl: `/images/${fileName}`,
        thumbnailUrl
      };
    } catch (error) {
      console.error('영구 저장 실패:', error);
      return null;
    }
  }

  /**
   * 이미지 리사이즈
   */
  async resizeImage(
    buffer: Buffer,
    options: ImageResizeOptions
  ): Promise<Buffer> {
    return await resizeImage(buffer, options);
  }

  /**
   * 이미지 압축
   */
  async compressImage(
    buffer: Buffer,
    options: ImageCompressionOptions
  ): Promise<Buffer> {
    return await compressImage(buffer, options);
  }

  /**
   * 이미지 형식 변환
   */
  async convertFormat(
    buffer: Buffer,
    targetFormat: 'jpeg' | 'png' | 'webp',
    quality: number = 85
  ): Promise<Buffer> {
    return await convertImageFormat(buffer, targetFormat, quality);
  }

  /**
   * 만료된 임시 파일 정리
   */
  private async cleanupExpiredFiles(): Promise<void> {
    const now = new Date();
    const expiredIds: string[] = [];

    for (const [id, storage] of this.tempStorage) {
      if (now > storage.expiresAt) {
        expiredIds.push(id);
      }
    }

    for (const id of expiredIds) {
      await this.deleteTempImage(id);
    }

    // 디렉토리 정리
    await cleanupTempFiles(this.tempDirectory);
  }

  /**
   * 최적 이미지 형식 결정
   */
  private getOptimalFormat(mimeType: string): 'jpeg' | 'png' | 'webp' {
    switch (mimeType) {
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        return 'jpeg';
    }
  }

  /**
   * 파일 경로에서 MIME 타입 추출
   */
  private getMimeTypeFromFile(filePath: string): string {
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

  /**
   * 서비스 종료 시 정리
   */
  async cleanup(): Promise<void> {
    await this.cleanupExpiredFiles();
  }
}

// 싱글톤 인스턴스
export const imageService = new ImageService();