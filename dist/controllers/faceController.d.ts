import { Request, Response } from 'express';
export declare class FaceController {
    validateImage(req: Request, res: Response): Promise<void>;
    analyzeFree(req: Request, res: Response): Promise<void>;
    analyzePremium(req: Request, res: Response): Promise<void>;
    startAnalysisSession(req: Request, res: Response): Promise<void>;
    getAnalysisStatus(req: Request, res: Response): Promise<void>;
    deleteAnalysisSession(req: Request, res: Response): Promise<void>;
    getAnalysisFields(req: Request, res: Response): Promise<void>;
    getServiceStatus(req: Request, res: Response): Promise<void>;
    prepareDownload(req: Request, res: Response): Promise<void>;
}
export declare const faceController: FaceController;
//# sourceMappingURL=faceController.d.ts.map