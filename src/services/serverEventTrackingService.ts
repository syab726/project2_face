/**
 * 서버 사이드 이벤트 트래킹 서비스
 * 메모리 기반 실시간 데이터 트래킹
 */

import { serverMetricsStore, MetricEvent } from './serverMetricsStore';
// import loggingService from './loggingService'; // 제거됨

class ServerEventTrackingService {
  private sessionId: string;

  constructor() {
    this.sessionId = 'server-session-' + Date.now();
  }

  /**
   * 페이지 뷰 트래킹
   */
  trackPageView(pagePath?: string): void {
    const event: MetricEvent = {
      id: this.generateId(),
      eventType: 'page_view',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      metadata: {
        path: pagePath || '/',
        server: true
      }
    };

    serverMetricsStore.recordEvent(event);
  }

  /**
   * 분석 시작 트래킹
   */
  trackAnalysisStart(serviceType: string, metadata?: any): void {
    const event: MetricEvent = {
      id: this.generateId(),
      eventType: 'analysis_start',
      serviceType,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        startTime: Date.now(),
        server: true
      }
    };

    serverMetricsStore.recordEvent(event);
    
    console.log('ANALYSIS_START', `Analysis started: ${serviceType}`, {
      metadata: { serviceType, sessionId: this.sessionId }
    });
  }

  /**
   * 분석 완료 트래킹
   */
  trackAnalysisComplete(serviceType: string, metadata?: any): void {
    const event: MetricEvent = {
      id: this.generateId(),
      eventType: 'analysis_complete',
      serviceType,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        completionTime: Date.now(),
        server: true
      }
    };

    serverMetricsStore.recordEvent(event);
    
    console.log('ANALYSIS_COMPLETE', `Analysis completed: ${serviceType}`, {
      metadata: { serviceType, sessionId: this.sessionId }
    });
  }

  /**
   * 분석 오류 트래킹
   */
  trackAnalysisError(
    serviceType: string, 
    errorType: string, 
    errorMessage: string, 
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: any
  ): void {
    const event: MetricEvent = {
      id: this.generateId(),
      eventType: 'analysis_error',
      serviceType,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      errorType,
      errorMessage,
      severity,
      metadata: {
        ...metadata,
        errorTime: Date.now(),
        server: true
      }
    };

    serverMetricsStore.recordEvent(event);
    
    loggingService.error('ANALYSIS_ERROR', `Analysis error: ${errorMessage}`, {
      metadata: { 
        serviceType, 
        errorType, 
        severity, 
        sessionId: this.sessionId 
      }
    });
  }

  /**
   * 결제 시작 트래킹
   */
  trackPaymentStart(serviceType: string, amount: number, metadata?: any): void {
    const event: MetricEvent = {
      id: this.generateId(),
      eventType: 'payment_start',
      serviceType,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      amount,
      metadata: {
        ...metadata,
        paymentStartTime: Date.now(),
        server: true
      }
    };

    serverMetricsStore.recordEvent(event);
    
    console.log('PAYMENT_START', `Payment started: ${serviceType}`, {
      metadata: { serviceType, amount, sessionId: this.sessionId }
    });
  }

  /**
   * 결제 완료 트래킹
   */
  trackPaymentComplete(
    serviceType: string, 
    amount: number, 
    orderId: string, 
    metadata?: any
  ): void {
    const event: MetricEvent = {
      id: this.generateId(),
      eventType: 'payment_complete',
      serviceType,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      amount,
      metadata: {
        ...metadata,
        orderId,
        paymentCompleteTime: Date.now(),
        server: true
      }
    };

    serverMetricsStore.recordEvent(event);
    
    console.log('PAYMENT_COMPLETE', `Payment completed: ${serviceType}`, {
      metadata: { 
        serviceType, 
        amount, 
        orderId, 
        sessionId: this.sessionId 
      }
    });
  }

  /**
   * 결제 오류 트래킹
   */
  trackPaymentError(
    serviceType: string, 
    errorType: string, 
    errorMessage: string, 
    metadata?: any
  ): void {
    const event: MetricEvent = {
      id: this.generateId(),
      eventType: 'payment_error',
      serviceType,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      errorType,
      errorMessage,
      severity: 'high',
      metadata: {
        ...metadata,
        paymentErrorTime: Date.now(),
        server: true
      }
    };

    serverMetricsStore.recordEvent(event);
    
    loggingService.error('PAYMENT_ERROR', `Payment error: ${errorMessage}`, {
      metadata: { 
        serviceType, 
        errorType, 
        sessionId: this.sessionId 
      }
    });
  }

  /**
   * 실시간 통계 조회
   */
  getRealtimeStats() {
    return serverMetricsStore.getRealtimeStats();
  }

  /**
   * 서비스별 통계 조회
   */
  getServiceStats(serviceType?: string) {
    return serverMetricsStore.getServiceStats(serviceType);
  }

  /**
   * 오류 통계 조회
   */
  getErrorStats() {
    return serverMetricsStore.getErrorStats();
  }

  /**
   * 이벤트 조회
   */
  getEvents(filters?: any) {
    return serverMetricsStore.getEvents(filters);
  }

  /**
   * 일별 통계 조회
   */
  getDailyStats(startDate?: string, endDate?: string) {
    return serverMetricsStore.getDailyStats(startDate, endDate);
  }

  /**
   * ID 생성
   */
  private generateId(): string {
    return 'evt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

// 싱글톤 인스턴스
export const serverEventTracking = new ServerEventTrackingService();