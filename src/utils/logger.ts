// 로깅 및 오류 추적 유틸리티

import { adminService } from '@/services/adminService';
import { ServiceError } from '@/types/admin';

export class Logger {
  /**
   * 결제 오류 로깅
   */
  static async logPaymentError(error: {
    message: string;
    userEmail?: string;
    orderId?: string;
    errorCode?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await adminService.logServiceError({
        type: 'payment_error',
        title: '결제 처리 오류',
        message: error.message,
        userEmail: error.userEmail,
        orderId: error.orderId,
        errorCode: error.errorCode,
        metadata: error.metadata
      });
    } catch (err) {
      console.error('결제 오류 로깅 실패:', err);
    }
  }

  /**
   * AI 분석 오류 로깅
   */
  static async logAnalysisError(error: {
    message: string;
    userEmail?: string;
    orderId?: string;
    analysisType?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await adminService.logServiceError({
        type: 'analysis_error',
        title: 'AI 분석 오류',
        message: error.message,
        userEmail: error.userEmail,
        orderId: error.orderId,
        errorCode: `ANALYSIS_${error.analysisType?.toUpperCase()}`,
        metadata: error.metadata
      });
    } catch (err) {
      console.error('분석 오류 로깅 실패:', err);
    }
  }

  /**
   * 시스템 오류 로깅
   */
  static async logSystemError(error: {
    message: string;
    stackTrace?: string;
    component?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await adminService.logServiceError({
        type: 'system_error',
        title: '시스템 오류',
        message: error.message,
        stackTrace: error.stackTrace,
        errorCode: `SYS_${error.component?.toUpperCase()}`,
        metadata: error.metadata
      });
    } catch (err) {
      console.error('시스템 오류 로깅 실패:', err);
    }
  }

  /**
   * API 오류 로깅
   */
  static async logApiError(error: {
    message: string;
    endpoint?: string;
    statusCode?: number;
    userEmail?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await adminService.logServiceError({
        type: 'api_error',
        title: 'API 호출 오류',
        message: error.message,
        userEmail: error.userEmail,
        errorCode: `API_${error.statusCode}`,
        metadata: {
          ...error.metadata,
          endpoint: error.endpoint,
          statusCode: error.statusCode
        }
      });
    } catch (err) {
      console.error('API 오류 로깅 실패:', err);
    }
  }

  /**
   * 환불 요청 로깅
   */
  static async logRefundRequest(refundData: {
    orderId: string;
    userEmail: string;
    userName: string;
    amount: number;
    productName: string;
    reason: string;
    transactionId?: string;
  }) {
    try {
      // 환불 요청 로깅 (관리자 서비스 통해)
      console.log('환불 요청 기록됨:', refundData.orderId);
    } catch (err) {
      console.error('환불 요청 로깅 실패:', err);
    }
  }

  /**
   * 사용자 활동 로깅 (선택적)
   */
  static logUserActivity(activity: {
    userEmail?: string;
    action: string;
    details?: string;
    metadata?: Record<string, any>;
  }) {
    // 개발/디버깅용 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('사용자 활동:', {
        timestamp: new Date().toISOString(),
        ...activity
      });
    }
  }

  /**
   * 결제 성공 로깅
   */
  static logPaymentSuccess(data: {
    orderId: string;
    userEmail: string;
    amount: number;
    productName: string;
    paymentMethod: string;
    transactionId: string;
  }) {
    console.log('결제 성공:', {
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * 일반적인 정보 로깅
   */
  static info(message: string, metadata?: Record<string, any>) {
    console.log(`[INFO] ${message}`, metadata || '');
  }

  /**
   * 경고 로깅
   */
  static warn(message: string, metadata?: Record<string, any>) {
    console.warn(`[WARN] ${message}`, metadata || '');
  }

  /**
   * 오류 로깅 (콘솔만)
   */
  static error(message: string, error?: Error, metadata?: Record<string, any>) {
    console.error(`[ERROR] ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...metadata
    });
  }
}

// 전역 오류 핸들러에서 사용할 수 있는 헬퍼 함수
export const handleGlobalError = async (error: Error, context?: {
  userEmail?: string;
  orderId?: string;
  component?: string;
}) => {
  Logger.error('전역 오류 발생', error, context);
  
  await Logger.logSystemError({
    message: error.message,
    stackTrace: error.stack,
    component: context?.component,
    metadata: context
  });
};

// 결제 관련 오류 처리 헬퍼
export const handlePaymentError = async (error: Error, context: {
  userEmail?: string;
  orderId?: string;
  paymentMethod?: string;
  amount?: number;
}) => {
  Logger.error('결제 오류 발생', error, context);
  
  await Logger.logPaymentError({
    message: error.message,
    userEmail: context.userEmail,
    orderId: context.orderId,
    errorCode: 'PAYMENT_FAILED',
    metadata: context
  });
};

export default Logger;