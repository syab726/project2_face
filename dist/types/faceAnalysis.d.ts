export interface FiveFeatures {
    forehead: string;
    eyes: string;
    nose: string;
    mouth: string;
    chin: string;
}
export interface FaceFeatures {
    faceShape: string;
    skinTone: string;
    eyeShape: string;
    eyebrowShape: string;
    noseShape: string;
    mouthShape: string;
    chinShape: string;
    fiveFeatures: FiveFeatures;
    ears?: string;
    cheekbones?: string;
    jawline?: string;
    faceSymmetry?: string;
    overallHarmony?: string;
}
export type AnalysisField = 'love' | 'business' | 'health' | 'children' | 'comprehensive' | 'personality' | 'tendency' | 'wealth' | 'relationships' | 'career' | 'marriage';
export interface AnalysisResult {
    field: AnalysisField;
    positiveAspects: string[];
    negativeAspects: string[];
    interpretation: string;
    advice: string;
}
export interface FreeAnalysisResult {
    fiveFeatures: FiveFeatures;
    summary: string;
    generalAdvice: string;
}
export interface PremiumAnalysisResult {
    selectedField: AnalysisField;
    detailedAnalysis: AnalysisResult;
    comprehensiveSummary?: {
        balance: string;
        overallTendency: string;
        lifeFlowAdvice: string;
    };
}
export interface FaceAnalysisRequest {
    imageData: string;
    analysisType: 'free' | 'premium';
    selectedField?: AnalysisField;
}
export interface FaceAnalysisResponse {
    success: boolean;
    data?: FreeAnalysisResult | PremiumAnalysisResult;
    error?: string;
    processingTime?: number;
}
export interface GeminiAnalysisResponse {
    faceFeatures: FaceFeatures;
    rawResponse: string;
}
export type AnalysisStatus = 'detecting' | 'analyzing' | 'interpreting' | 'completed' | 'failed';
export interface AnalysisStatusResponse {
    status: AnalysisStatus;
    progress: number;
    message: string;
    result?: FaceAnalysisResponse;
}
export interface FaceAnalysisError {
    code: string;
    message: string;
    details?: any;
}
export interface ImageValidationResult {
    isValid: boolean;
    error?: string;
    faceDetected?: boolean;
    imageQuality?: 'high' | 'medium' | 'low';
}
export interface AnalysisOptions {
    language?: 'ko' | 'en';
    detailLevel?: 'basic' | 'detailed';
    includeConfidence?: boolean;
}
export interface AnalysisSession {
    sessionId: string;
    imageData: string;
    analysisType: 'free' | 'premium';
    selectedField?: AnalysisField;
    status: AnalysisStatus;
    createdAt: Date;
    completedAt?: Date;
    result?: FaceAnalysisResponse;
}
//# sourceMappingURL=faceAnalysis.d.ts.map