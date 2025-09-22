import { 
  FaceAnalysisRequest, 
  FaceAnalysisResponse, 
  FreeAnalysisResult, 
  PremiumAnalysisResult,
  AnalysisSession,
  AnalysisStatus,
  AnalysisStatusResponse,
  FaceAnalysisError,
  ImageValidationResult
} from '../types/faceAnalysis.js';
import { geminiService } from './geminiService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * 얼굴 인식 및 분석 서비스
 */
export class FaceDetectionService {
  private activeSessions: Map<string, AnalysisSession> = new Map();
  private readonly MAX_SESSIONS = 100;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30분

  constructor() {
    // 주기적으로 만료된 세션 정리
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // 5분마다 정리
  }

  /**
   * 이미지 전처리 및 검증
   */
  async validateAndPreprocessImage(imageData: string): Promise<ImageValidationResult> {
    try {
      // 1. 기본 이미지 형식 검증
      if (!imageData.startsWith('data:image/')) {
        return {
          isValid: false,
          error: '지원되지 않는 이미지 형식입니다. JPEG, PNG 형식만 지원됩니다.'
        };
      }

      // 2. 이미지 크기 검증 (base64 크기로 대략적 추정)
      const sizeInBytes = (imageData.length * 3) / 4;
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (sizeInBytes > maxSize) {
        return {
          isValid: false,
          error: '이미지 크기가 너무 큽니다. 10MB 이하의 이미지를 업로드해주세요.'
        };
      }

      // 3. Gemini를 통한 얼굴 검증
      const validation = await geminiService.validateImage(imageData);
      
      if (!validation.isValid) {
        return {
          isValid: false,
          error: validation.error || '얼굴을 인식할 수 없습니다. 명확한 얼굴 사진을 업로드해주세요.',
          faceDetected: validation.faceDetected,
          imageQuality: validation.imageQuality
        };
      }

      return validation;
    } catch (error) {
      console.error('Image validation failed:', error);
      return {
        isValid: false,
        error: '이미지 검증 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 무료 얼굴 분석 (오악 분석만)
   */
  async analyzeFaceFree(imageData: string): Promise<FaceAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      // 1. 이미지 검증
      const validation = await this.validateAndPreprocessImage(imageData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // 2. Gemini를 통한 분석
      const analysisResult = await geminiService.analyzeWithRetry(imageData, false);
      
      // 3. 응답 파싱 및 구조화
      const parsedResult = JSON.parse(analysisResult.rawResponse);
      
      const freeResult: FreeAnalysisResult = {
        fiveFeatures: parsedResult.faceFeatures.fiveFeatures,
        summary: parsedResult.summary,
        generalAdvice: parsedResult.generalAdvice
      };

      return {
        success: true,
        data: freeResult,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Free face analysis failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * 유료 얼굴 분석 (전문 분야별)
   */
  async analyzeFacePremium(request: FaceAnalysisRequest): Promise<FaceAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      if (!request.selectedField) {
        return {
          success: false,
          error: '분석할 분야를 선택해주세요.'
        };
      }

      // 1. 이미지 검증
      const validation = await this.validateAndPreprocessImage(request.imageData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // 2. Gemini를 통한 분석
      const analysisResult = await geminiService.analyzeWithRetry(
        request.imageData, 
        true, 
        request.selectedField
      );
      
      // 3. 응답 파싱 및 구조화
      const parsedResult = JSON.parse(analysisResult.rawResponse);
      
      const premiumResult: PremiumAnalysisResult = {
        selectedField: request.selectedField,
        detailedAnalysis: parsedResult.fieldAnalysis,
        comprehensiveSummary: parsedResult.comprehensiveSummary
      };

      return {
        success: true,
        data: premiumResult,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Premium face analysis failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * 비동기 분석 세션 생성
   */
  async createAnalysisSession(request: FaceAnalysisRequest): Promise<string> {
    // 세션 수 제한 확인
    if (this.activeSessions.size >= this.MAX_SESSIONS) {
      this.cleanupExpiredSessions();
      
      if (this.activeSessions.size >= this.MAX_SESSIONS) {
        throw new Error('서버가 과부하 상태입니다. 잠시 후 다시 시도해주세요.');
      }
    }

    const sessionId = uuidv4();
    const session: AnalysisSession = {
      sessionId,
      imageData: request.imageData,
      analysisType: request.analysisType,
      selectedField: request.selectedField,
      status: 'detecting',
      createdAt: new Date()
    };

    this.activeSessions.set(sessionId, session);

    // 비동기로 분석 시작
    this.processAnalysisSession(sessionId);

    return sessionId;
  }

  /**
   * 분석 세션 상태 확인
   */
  getAnalysisStatus(sessionId: string): AnalysisStatusResponse {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return {
        status: 'failed',
        progress: 0,
        message: '세션을 찾을 수 없습니다.'
      };
    }

    const statusMessages = {
      detecting: '얼굴 인식 중...',
      analyzing: '특징 분석 중...',
      interpreting: '관상 해설 작성 중...',
      completed: '분석 완료',
      failed: '분석 실패'
    };

    const progressMap = {
      detecting: 25,
      analyzing: 50,
      interpreting: 75,
      completed: 100,
      failed: 0
    };

    return {
      status: session.status,
      progress: progressMap[session.status],
      message: statusMessages[session.status],
      result: session.result
    };
  }

  /**
   * 비동기 분석 처리
   */
  private async processAnalysisSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      // 1. 얼굴 인식 단계
      session.status = 'detecting';
      await this.delay(1000); // 시각적 피드백을 위한 지연

      // 2. 특징 분석 단계
      session.status = 'analyzing';
      await this.delay(1500);

      // 3. 관상 해설 작성 단계
      session.status = 'interpreting';
      
      let result: FaceAnalysisResponse;
      if (session.analysisType === 'free') {
        result = await this.analyzeFaceFree(session.imageData);
      } else {
        result = await this.analyzeFacePremium({
          imageData: session.imageData,
          analysisType: session.analysisType,
          selectedField: session.selectedField
        });
      }

      // 4. 완료 처리
      session.status = result.success ? 'completed' : 'failed';
      session.result = result;
      session.completedAt = new Date();

      // 완료된 세션은 1시간 후 자동 삭제
      setTimeout(() => {
        this.activeSessions.delete(sessionId);
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error(`Analysis session ${sessionId} failed:`, error);
      session.status = 'failed';
      session.result = {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * 만료된 세션 정리
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      const elapsed = now - session.createdAt.getTime();
      
      if (elapsed > this.SESSION_TIMEOUT) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 에러 메시지 변환
   */
  private getErrorMessage(error: any): string {
    if (error.code) {
      switch (error.code) {
        case 'QUOTA_EXCEEDED':
          return 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        case 'SAFETY_VIOLATION':
          return '안전 정책 위반으로 분석을 진행할 수 없습니다.';
        case 'NETWORK_ERROR':
          return '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
        default:
          return error.message || '알 수 없는 오류가 발생했습니다.';
      }
    }
    
    return error.message || '분석 중 오류가 발생했습니다.';
  }

  /**
   * 세션 삭제
   */
  deleteSession(sessionId: string): boolean {
    return this.activeSessions.delete(sessionId);
  }

  /**
   * 활성 세션 수 조회
   */
  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  /**
   * 서비스 상태 확인
   */
  getServiceStatus(): { healthy: boolean; activeSessions: number; message: string } {
    const sessionCount = this.getActiveSessionCount();
    const healthy = sessionCount < this.MAX_SESSIONS * 0.8; // 80% 미만일 때 정상
    
    return {
      healthy,
      activeSessions: sessionCount,
      message: healthy ? '서비스가 정상적으로 운영되고 있습니다.' : '서비스가 과부하 상태입니다.'
    };
  }
}

// 싱글톤 인스턴스
export const faceDetectionService = new FaceDetectionService();