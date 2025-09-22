import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { 
  ImageMetadata, 
  ImageCompressionOptions, 
  ImageResizeOptions, 
  SecurityValidationResult,
  SUPPORTED_IMAGE_FORMATS,
  ImageFormat
} from '../types/image';

/**
 * 이미지 파일 헤더 시그니처 검증을 위한 매직 바이트
 */
const FILE_SIGNATURES: Record<string, Buffer[]> = {
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

/**
 * 이미지 메타데이터 추출
 */
export async function extractImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
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
  } catch (error) {
    throw new Error(`이미지 메타데이터 추출 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 이미지 파일 시그니처 검증
 */
export function validateFileSignature(buffer: Buffer, mimeType: string): SecurityValidationResult {
  const result: SecurityValidationResult = {
    isSecure: false,
    threats: [],
    fileSignature: buffer.subarray(0, 16).toString('hex'),
    actualFormat: 'unknown',
    suspiciousContent: false
  };

  // 지원되는 형식인지 확인
  if (!SUPPORTED_IMAGE_FORMATS.includes(mimeType as ImageFormat)) {
    result.threats.push('지원되지 않는 파일 형식');
    return result;
  }

  // 파일 시그니처 검증
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) {
    result.threats.push('알 수 없는 파일 형식');
    return result;
  }

  let signatureMatch = false;
  for (const signature of signatures) {
    if (mimeType === 'image/webp') {
      // WebP는 특별한 검증이 필요
      if (buffer.subarray(0, 4).equals(signature) && buffer.subarray(8, 12).equals(Buffer.from('WEBP', 'ascii'))) {
        signatureMatch = true;
        result.actualFormat = 'webp';
        break;
      }
    } else {
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

  // 의심스러운 콘텐츠 검사
  if (buffer.includes(Buffer.from('<?xml', 'ascii')) || 
      buffer.includes(Buffer.from('<script', 'ascii')) ||
      buffer.includes(Buffer.from('javascript:', 'ascii'))) {
    result.suspiciousContent = true;
    result.threats.push('의심스러운 스크립트 콘텐츠 발견');
  }

  result.isSecure = result.threats.length === 0;
  return result;
}

/**
 * 이미지 압축
 */
export async function compressImage(
  buffer: Buffer, 
  options: ImageCompressionOptions
): Promise<Buffer> {
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
        // 기본적으로 원본 형식 유지
        break;
    }
    
    return await image.toBuffer();
  } catch (error) {
    throw new Error(`이미지 압축 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 이미지 리사이즈
 */
export async function resizeImage(
  buffer: Buffer, 
  options: ImageResizeOptions
): Promise<Buffer> {
  try {
    let image = sharp(buffer);
    
    if (options.width || options.height) {
      image = image.resize({
        width: options.width,
        height: options.height,
        fit: options.fit as any,
        position: options.position as any,
        background: options.background,
        withoutEnlargement: options.withoutEnlargement
      });
    }
    
    return await image.toBuffer();
  } catch (error) {
    throw new Error(`이미지 리사이즈 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 썸네일 생성
 */
export async function generateThumbnail(
  buffer: Buffer, 
  width: number, 
  height: number
): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    throw new Error(`썸네일 생성 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Data URL에서 이미지 버퍼 추출
 */
export function extractImageFromDataUrl(dataUrl: string): { buffer: Buffer; mimeType: string } {
  try {
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('유효하지 않은 Data URL 형식');
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    return { buffer, mimeType };
  } catch (error) {
    throw new Error(`Data URL 파싱 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 고유한 파일명 생성
 */
export function generateUniqueFilename(originalName: string, extension?: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = extension || path.extname(originalName);
  const baseName = path.basename(originalName, path.extname(originalName));
  
  return `${baseName}_${timestamp}_${randomString}${ext}`;
}

/**
 * 이미지 형식 변환
 */
export async function convertImageFormat(
  buffer: Buffer, 
  targetFormat: 'jpeg' | 'png' | 'webp',
  quality: number = 85
): Promise<Buffer> {
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
  } catch (error) {
    throw new Error(`이미지 형식 변환 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 이미지 버퍼의 크기 계산
 */
export async function calculateImageSize(buffer: Buffer): Promise<{ width: number; height: number }> {
  try {
    // 간단한 크기 계산 (정확한 크기는 extractImageMetadata 사용)
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0
    };
  } catch (error) {
    throw new Error(`이미지 크기 계산 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 임시 파일 정리
 */
export async function cleanupTempFiles(tempDir: string, maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
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
  } catch (error) {
    console.error('임시 파일 정리 실패:', error);
  }
}

/**
 * 이미지 최적화 (압축 + 리사이즈)
 */
export async function optimizeImage(
  buffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }
): Promise<Buffer> {
  try {
    let image = sharp(buffer);
    
    // 리사이즈
    if (options.maxWidth || options.maxHeight) {
      image = image.resize({
        width: options.maxWidth,
        height: options.maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // 압축
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
  } catch (error) {
    throw new Error(`이미지 최적화 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}