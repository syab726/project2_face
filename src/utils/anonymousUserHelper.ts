/**
 * 클라이언트에서 익명 사용자 관리를 위한 헬퍼 함수
 */

// 브라우저 환경에서 사용 가능한 유틸리티
export class AnonymousUserHelper {
  private static readonly SESSION_KEY = 'anonymous_session_id';
  private static readonly USER_KEY = 'anonymous_user_id';

  /**
   * 브라우저에서 디바이스 정보 수집
   */
  static getDeviceInfo() {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'SSR',
        platform: 'server',
        screen: '0x0',
        timezone: 'UTC'
      };
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform || 'Unknown',
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  /**
   * 새 익명 세션 시작
   */
  static async startAnonymousSession(serviceType?: string, contactInfo?: any) {
    try {
      const deviceInfo = this.getDeviceInfo();
      
      const response = await fetch('/api/anonymous/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceInfo,
          serviceType,
          contactInfo
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // 로컬 스토리지에 세션 정보 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.SESSION_KEY, result.data.sessionId);
          localStorage.setItem(this.USER_KEY, result.data.userId);
        }
        
        return {
          sessionId: result.data.sessionId,
          userId: result.data.userId,
          serviceId: result.data.serviceId
        };
      }
      
      throw new Error(result.error || '세션 생성 실패');
    } catch (error) {
      console.error('Anonymous session start failed:', error);
      throw error;
    }
  }

  /**
   * 현재 세션 ID 조회
   */
  static getCurrentSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.SESSION_KEY);
  }

  /**
   * 현재 사용자 ID 조회
   */
  static getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.USER_KEY);
  }

  /**
   * 결제 정보 연계
   */
  static async linkPayment(
    serviceId: string, 
    paymentInfo: {
      orderId: string;
      paymentId: string;
      amount: number;
      email?: string;
      phone?: string;
      name?: string;
      preferredContact?: 'email' | 'phone';
    }
  ) {
    try {
      const sessionId = this.getCurrentSessionId();
      if (!sessionId) {
        throw new Error('활성 세션이 없습니다. 세션을 먼저 시작하세요.');
      }

      const response = await fetch('/api/anonymous/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          serviceId,
          paymentInfo
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '결제 연계 실패');
      }
      
      return result.data;
    } catch (error) {
      console.error('Payment linking failed:', error);
      throw error;
    }
  }

  /**
   * 결제 완료 처리
   */
  static async completePayment(paymentId: string) {
    try {
      const response = await fetch('/api/anonymous/payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          status: 'completed'
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '결제 완료 처리 실패');
      }
      
      return result.data;
    } catch (error) {
      console.error('Payment completion failed:', error);
      throw error;
    }
  }

  /**
   * 오류 기록
   */
  static async recordError(
    serviceId: string,
    errorType: string,
    message: string,
    orderId?: string,
    serviceType?: string
  ) {
    try {
      const sessionId = this.getCurrentSessionId();
      if (!sessionId) {
        throw new Error('활성 세션이 없습니다.');
      }

      const response = await fetch('/api/anonymous/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          serviceId,
          errorType,
          message,
          orderId,
          serviceType
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '오류 기록 실패');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error recording failed:', error);
      throw error;
    }
  }

  /**
   * 서비스 완료 처리
   */
  static async completeService(serviceId: string, result?: any) {
    try {
      const sessionId = this.getCurrentSessionId();
      if (!sessionId) {
        throw new Error('활성 세션이 없습니다.');
      }

      const response = await fetch('/api/anonymous/error', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          serviceId,
          result
        })
      });

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.error || '서비스 완료 처리 실패');
      }
      
      return responseData.data;
    } catch (error) {
      console.error('Service completion failed:', error);
      throw error;
    }
  }

  /**
   * 세션 정보 조회
   */
  static async getSessionInfo() {
    try {
      const sessionId = this.getCurrentSessionId();
      if (!sessionId) {
        return null;
      }

      const response = await fetch(`/api/anonymous/session?sessionId=${sessionId}`);
      const result = await response.json();
      
      if (!result.success) {
        return null;
      }
      
      return result.data.session;
    } catch (error) {
      console.error('Session info retrieval failed:', error);
      return null;
    }
  }

  /**
   * 세션 정리 (로그아웃 등)
   */
  static clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * 세션 존재 여부 확인
   */
  static hasActiveSession(): boolean {
    return !!this.getCurrentSessionId();
  }
}

// 사용 예시를 위한 타입 정의
export interface AnonymousUserSessionInfo {
  sessionId: string;
  userId: string;
  createdAt: string;
  lastActivity: string;
  services: Array<{
    serviceId: string;
    serviceType: string;
    orderId?: string;
    paymentId?: string;
    status: string;
    timestamp: string;
  }>;
  errors: Array<{
    errorId: string;
    serviceId: string;
    errorType: string;
    severity: string;
    compensationRequired: boolean;
    compensationAmount?: number;
    contactAttempted: boolean;
    resolved: boolean;
    timestamp: string;
  }>;
}

/**
 * React Hook으로 익명 사용자 관리
 */
export function useAnonymousUser() {
  const [sessionInfo, setSessionInfo] = useState<AnonymousUserSessionInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const startSession = async (serviceType?: string, contactInfo?: any) => {
    setLoading(true);
    try {
      const result = await AnonymousUserHelper.startAnonymousSession(serviceType, contactInfo);
      const info = await AnonymousUserHelper.getSessionInfo();
      setSessionInfo(info);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const recordError = async (
    serviceId: string,
    errorType: string,
    message: string,
    orderId?: string,
    serviceType?: string
  ) => {
    return await AnonymousUserHelper.recordError(serviceId, errorType, message, orderId, serviceType);
  };

  const linkPayment = async (serviceId: string, paymentInfo: any) => {
    return await AnonymousUserHelper.linkPayment(serviceId, paymentInfo);
  };

  const completeService = async (serviceId: string, result?: any) => {
    const response = await AnonymousUserHelper.completeService(serviceId, result);
    // 세션 정보 갱신
    const info = await AnonymousUserHelper.getSessionInfo();
    setSessionInfo(info);
    return response;
  };

  return {
    sessionInfo,
    loading,
    startSession,
    recordError,
    linkPayment,
    completeService,
    hasActiveSession: AnonymousUserHelper.hasActiveSession(),
    clearSession: AnonymousUserHelper.clearSession
  };
}

// React import가 필요한 경우를 위한 조건부 import
let useState: any;
if (typeof window !== 'undefined') {
  try {
    const React = require('react');
    useState = React.useState;
  } catch (e) {
    // React가 없는 환경에서는 Hook 사용 불가
    console.warn('React not available - hooks will not work');
  }
}