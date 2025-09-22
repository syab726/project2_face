/**
 * API 오류 추적 유틸리티
 * 모든 분석 API에서 오류 발생 시 호출하여 통계에 반영
 */

import realMetricsStore from '@/services/realMetricsStore';

export interface ErrorTrackingInfo {
  sessionId?: string;
  serviceType: string;
  errorType: string;
  errorMessage?: string;
  isCritical?: boolean;
}

export function trackAPIError(info: ErrorTrackingInfo): void {
  try {
    const sessionId = info.sessionId || 'anonymous';
    const errorType = `${info.serviceType}-${info.errorType}`;
    const isCritical = info.isCritical !== false; // 기본값은 true
    
    // realMetricsStore에 오류 추적
    realMetricsStore.trackError(sessionId, errorType, isCritical);
    
    console.log(`🚨 API 오류 추적됨: ${info.serviceType}, 타입: ${info.errorType}, 메시지: ${info.errorMessage || 'Unknown'}`);
    
  } catch (error) {
    console.error('오류 추적 중 실패:', error);
  }
}

// 특정 분석 서비스별 오류 추적 헬퍼 함수들
export const errorTrackers = {
  mbti: (sessionId?: string, errorMessage?: string) => trackAPIError({
    sessionId,
    serviceType: 'mbti-face',
    errorType: 'analysis-failed',
    errorMessage,
    isCritical: true
  }),
  
  physiognomy: (sessionId?: string, errorMessage?: string) => trackAPIError({
    sessionId,
    serviceType: 'professional-physiognomy', 
    errorType: 'analysis-failed',
    errorMessage,
    isCritical: true
  }),
  
  faceSaju: (sessionId?: string, errorMessage?: string) => trackAPIError({
    sessionId,
    serviceType: 'face-saju',
    errorType: 'analysis-failed', 
    errorMessage,
    isCritical: true
  }),
  
  interview: (sessionId?: string, errorMessage?: string) => trackAPIError({
    sessionId,
    serviceType: 'interview-face',
    errorType: 'analysis-failed',
    errorMessage,
    isCritical: true
  }),
  
  fortune: (sessionId?: string, errorMessage?: string) => trackAPIError({
    sessionId,
    serviceType: 'fortune',
    errorType: 'analysis-failed',
    errorMessage,
    isCritical: false // 무료 서비스이므로 낮은 중요도
  })
};

export default trackAPIError;