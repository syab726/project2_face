import { FaceAnalysisRequest, FaceAnalysisResponse, AnalysisStatusResponse, ImageValidationResult } from '../types/faceAnalysis.js';
export declare class FaceDetectionService {
    private activeSessions;
    private readonly MAX_SESSIONS;
    private readonly SESSION_TIMEOUT;
    constructor();
    validateAndPreprocessImage(imageData: string): Promise<ImageValidationResult>;
    analyzeFaceFree(imageData: string): Promise<FaceAnalysisResponse>;
    analyzeFacePremium(request: FaceAnalysisRequest): Promise<FaceAnalysisResponse>;
    createAnalysisSession(request: FaceAnalysisRequest): Promise<string>;
    getAnalysisStatus(sessionId: string): AnalysisStatusResponse;
    private processAnalysisSession;
    private cleanupExpiredSessions;
    private delay;
    private getErrorMessage;
    deleteSession(sessionId: string): boolean;
    getActiveSessionCount(): number;
    getServiceStatus(): {
        healthy: boolean;
        activeSessions: number;
        message: string;
    };
}
export declare const faceDetectionService: FaceDetectionService;
//# sourceMappingURL=faceDetectionService.d.ts.map