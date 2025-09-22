/**
 * 얼굴 분석 관련 타입 정의
 */

// 오악 (五岳) - 이마, 눈, 코, 입, 턱
export interface FiveFeatures {
  forehead: string;    // 이마
  eyes: string;        // 눈
  nose: string;        // 코
  mouth: string;       // 입
  chin: string;        // 턱
}

// 얼굴 특징점 데이터
export interface FaceFeatures {
  // 기본 얼굴 특징
  faceShape: string;
  skinTone: string;
  eyeShape: string;
  eyebrowShape: string;
  noseShape: string;
  mouthShape: string;
  chinShape: string;
  
  // 오악 분석
  fiveFeatures: FiveFeatures;
  
  // 추가 특징점 (유료 분석용)
  ears?: string;
  cheekbones?: string;
  jawline?: string;
  faceSymmetry?: string;
  overallHarmony?: string;
}

// 분석 분야 타입
export type AnalysisField = 
  | 'love'          // 연애
  | 'business'      // 사업
  | 'health'        // 건강
  | 'children'      // 자녀
  | 'comprehensive' // 종합
  | 'personality'   // 성격
  | 'tendency'      // 성향
  | 'wealth'        // 재물운
  | 'relationships' // 대인관계
  | 'career'        // 직업
  | 'marriage';     // 결혼

// 분석 결과 타입
export interface AnalysisResult {
  field: AnalysisField;
  positiveAspects: string[];
  negativeAspects: string[];
  interpretation: string;
  advice: string;
}

// 무료 분석 결과 (오악만)
export interface FreeAnalysisResult {
  fiveFeatures: FiveFeatures;
  summary: string;
  generalAdvice: string;
}

// 유료 분석 결과
export interface PremiumAnalysisResult {
  selectedField: AnalysisField;
  detailedAnalysis: AnalysisResult;
  comprehensiveSummary?: {
    balance: string;
    overallTendency: string;
    lifeFlowAdvice: string;
  };
}

// 얼굴 분석 요청 타입
export interface FaceAnalysisRequest {
  imageData: string;    // base64 encoded image
  analysisType: 'free' | 'premium';
  selectedField?: AnalysisField;
}

// 얼굴 분석 응답 타입
export interface FaceAnalysisResponse {
  success: boolean;
  data?: FreeAnalysisResult | PremiumAnalysisResult;
  error?: string;
  processingTime?: number;
}

// Gemini API 응답 타입
export interface GeminiAnalysisResponse {
  faceFeatures: FaceFeatures;
  rawResponse: string;
}

// 분석 진행 상태
export type AnalysisStatus = 
  | 'detecting'     // 얼굴 인식 중
  | 'analyzing'     // 특징 분석 중
  | 'interpreting'  // 관상 해설 작성 중
  | 'completed'     // 완료
  | 'failed';       // 실패

// 분석 진행 상태 응답
export interface AnalysisStatusResponse {
  status: AnalysisStatus;
  progress: number;
  message: string;
  result?: FaceAnalysisResponse;
}

// 에러 타입
export interface FaceAnalysisError {
  code: string;
  message: string;
  details?: any;
}

// 이미지 검증 결과
export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  faceDetected?: boolean;
  imageQuality?: 'high' | 'medium' | 'low';
}

// 분석 옵션
export interface AnalysisOptions {
  language?: 'ko' | 'en';
  detailLevel?: 'basic' | 'detailed';
  includeConfidence?: boolean;
}

// 분석 세션 정보
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