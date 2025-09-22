import { GeminiAnalysisResponse, AnalysisField, ImageValidationResult } from '../types/faceAnalysis.js';
export declare class GeminiService {
    private genAI;
    private freeModel;
    private premiumModel;
    constructor();
    validateImage(imageData: string): Promise<ImageValidationResult>;
    analyzeFaceFree(imageData: string): Promise<GeminiAnalysisResponse>;
    analyzeFacePremium(imageData: string, selectedField: AnalysisField): Promise<GeminiAnalysisResponse>;
    private handleGeminiError;
    analyzeWithRetry(imageData: string, isPremium?: boolean, selectedField?: AnalysisField, maxRetries?: number): Promise<GeminiAnalysisResponse>;
}
export declare const geminiService: GeminiService;
//# sourceMappingURL=geminiService.d.ts.map