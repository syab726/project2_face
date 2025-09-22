export const SUPPORTED_IMAGE_FORMATS = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/bmp',
    'image/tiff'
];
export const DEFAULT_IMAGE_OPTIONS = {
    maxSize: 10 * 1024 * 1024,
    maxWidth: 4096,
    maxHeight: 4096,
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    quality: 85,
    generateThumbnail: true,
    thumbnailSize: { width: 200, height: 200 },
    compress: true
};
//# sourceMappingURL=image.js.map