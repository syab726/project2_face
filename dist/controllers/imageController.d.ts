import { Request, Response } from 'express';
import { ImageValidatedRequest } from '../middleware/imageValidation';
export declare class ImageController {
    uploadImage(req: ImageValidatedRequest, res: Response): Promise<void>;
    pasteImage(req: ImageValidatedRequest, res: Response): Promise<void>;
    getTempImage(req: Request, res: Response): Promise<void>;
    getTempThumbnail(req: Request, res: Response): Promise<void>;
    saveImage(req: Request, res: Response): Promise<void>;
    deleteTempImage(req: Request, res: Response): Promise<void>;
    resizeImage(req: ImageValidatedRequest, res: Response): Promise<void>;
    compressImage(req: ImageValidatedRequest, res: Response): Promise<void>;
    convertImage(req: ImageValidatedRequest, res: Response): Promise<void>;
    getImageInfo(req: ImageValidatedRequest, res: Response): Promise<void>;
}
export declare const imageController: ImageController;
//# sourceMappingURL=imageController.d.ts.map