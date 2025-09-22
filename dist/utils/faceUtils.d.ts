import { AnalysisField, FreeAnalysisResult, PremiumAnalysisResult } from '../types/faceAnalysis.js';
export declare function getFieldDisplayName(field: AnalysisField): string;
export declare function getFieldDescription(field: AnalysisField): string;
export declare function getFieldPrice(field: AnalysisField): number;
export declare function getFieldPriceString(field: AnalysisField): string;
export declare function validateImageData(imageData: string): {
    isValid: boolean;
    error?: string;
};
export declare function preprocessImage(imageData: string): Promise<string>;
export declare function formatAnalysisResult(result: FreeAnalysisResult | PremiumAnalysisResult): string;
export declare function formatAnalysisResultAsHTML(result: FreeAnalysisResult | PremiumAnalysisResult): string;
export declare function generateSessionId(): string;
export declare function calculateProgress(status: string): number;
export declare function getStatusMessage(status: string): string;
export declare function getUserFriendlyErrorMessage(error: string): string;
export declare function generateAnalysisSummary(result: FreeAnalysisResult | PremiumAnalysisResult): string;
export declare function canAnalyze(imageData: string): {
    canAnalyze: boolean;
    reason?: string;
};
export declare function getMimeTypeFromExtension(filename: string): string;
export declare function calculateImageSize(base64Data: string): number;
export declare function generateAnalysisStats(results: (FreeAnalysisResult | PremiumAnalysisResult)[]): {
    totalAnalyses: number;
    freeAnalyses: number;
    premiumAnalyses: number;
    fieldDistribution: Record<string, number>;
};
//# sourceMappingURL=faceUtils.d.ts.map