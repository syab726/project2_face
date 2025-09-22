// 얼굴 분석 관련 타입 정의

export interface FaceAnalysisRequest {
  image: File;
  analysisType: 'mbti' | 'physiognomy' | 'comprehensive';
  userInfo?: {
    birthDate?: string;
    gender?: 'male' | 'female';
  };
}

export interface MBTIAnalysisResult {
  mbtiType: string;
  confidence: number;
  traits: {
    extraversion: number; // 0-100
    intuition: number;    // 0-100
    thinking: number;     // 0-100
    judging: number;      // 0-100
  };
  description: string;
  advice: string;
  compatibility: string[];
}

export interface PhysiognomyAnalysis {
  overall: {
    personalityType: string;
    fortune: 'good' | 'moderate' | 'challenging';
    description: string;
  };
  features: {
    forehead: FeatureAnalysis;
    eyes: FeatureAnalysis;
    nose: FeatureAnalysis;
    mouth: FeatureAnalysis;
    chin: FeatureAnalysis;
  };
}

export interface FeatureAnalysis {
  shape: string;
  meaning: string;
  fortune: string;
  advice: string;
}

export interface IdealTypeRequest {
  baseAnalysis: MBTIAnalysisResult;
  preferences?: {
    gender: 'male' | 'female';
    ageRange: string;
    style: 'cute' | 'sophisticated' | 'natural' | 'charismatic';
  };
}

export interface IdealTypeResult {
  imageUrl: string | null;
  description: string;
  compatibility: {
    score: number;
    explanation: string;
  };
  characteristics: string[];
}

export interface PalmistryAnalysis {
  lifeLine: {
    length: 'short' | 'medium' | 'long';
    depth: 'shallow' | 'medium' | 'deep';
    meaning: string;
  };
  heartLine: {
    curve: 'straight' | 'curved' | 'broken';
    meaning: string;
  };
  headLine: {
    length: 'short' | 'medium' | 'long';
    meaning: string;
  };
  fortune: {
    health: string;
    wealth: string;
    love: string;
  };
}

export interface FortuneAnalysis {
  saju: {
    elements: string[];
    personality: string;
    career: string;
    relationship: string;
    health: string;
  };
  timing: {
    currentYear: string;
    nextMonth: string;
    advice: string;
  };
}

export interface ComprehensiveReport {
  userId: string;
  timestamp: string;
  mbtiAnalysis: MBTIAnalysisResult;
  physiognomy?: PhysiognomyAnalysis;
  palmistry?: PalmistryAnalysis;
  fortune?: FortuneAnalysis;
  idealType?: IdealTypeResult;
  summary: string;
  recommendations: string[];
}

// API 응답 타입
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 세션 관리
export interface UserSession {
  sessionId: string;
  createdAt: string;
  analysisHistory: ComprehensiveReport[];
  currentStep: 'upload' | 'analyzing' | 'result' | 'payment';
}

// 가격 정책
export interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  analysisTypes: ('mbti' | 'physiognomy' | 'palmistry' | 'fortune' | 'idealType')[];
}