/**
 * 실제 메트릭스 저장소
 * 실시간 통계 데이터를 메모리와 영구 저장소에 저장하고 관리
 */

import persistentStore from './persistentStore';

interface MetricsData {
  // 방문 통계
  totalPageViews: number;
  uniqueVisitors: Set<string>;
  todayPageViews: number;
  
  // 분석 요청 통계
  totalAnalyses: number;
  todayAnalyses: number;
  analysesByService: {
    [serviceName: string]: number;
  };
  
  // 결제 통계
  totalPayments: number;
  todayPayments: number;
  totalRevenue: number;
  todayRevenue: number;
  paymentsByService: {
    [serviceName: string]: {
      count: number;
      revenue: number;
    };
  };
  
  // 결제 실패 통계 (실제 결제 시도 중 실패한 경우만)
  totalPaymentFailures: number;
  todayPaymentFailures: number;
  paymentFailuresByService: {
    [serviceName: string]: number;
  };
  
  // 오류 통계
  totalErrors: number;
  todayErrors: number;
  errorsByType: {
    [errorType: string]: number;
  };
  criticalErrors: number;
  
  // 시스템 정보
  serverStartTime: Date;
  lastResetTime: Date;
  
  // 세션 정보
  activeSessions: Set<string>;
  sessionsByHour: {
    [hour: string]: number;
  };
}

class RealMetricsStore {
  private metrics: MetricsData;
  private resetTimer: NodeJS.Timeout | null = null;

  constructor() {
    // 영구 저장소에서 기존 데이터 로드
    const savedMetrics = persistentStore.loadMetrics();
    
    this.metrics = {
      totalPageViews: savedMetrics.totalPageViews || 0,
      uniqueVisitors: new Set(),
      todayPageViews: savedMetrics.todayPageViews || 0,
      
      totalAnalyses: savedMetrics.totalAnalyses || 0,
      todayAnalyses: savedMetrics.todayAnalyses || 0,
      analysesByService: savedMetrics.analysesByService || {},
      
      totalPayments: savedMetrics.totalPayments || 0,
      todayPayments: savedMetrics.todayPayments || 0,
      totalRevenue: savedMetrics.totalRevenue || 0,
      todayRevenue: savedMetrics.todayRevenue || 0,
      paymentsByService: savedMetrics.paymentsByService || {},
      
      totalPaymentFailures: savedMetrics.totalPaymentFailures || 0,
      todayPaymentFailures: savedMetrics.todayPaymentFailures || 0,
      paymentFailuresByService: savedMetrics.paymentFailuresByService || {},
      
      totalErrors: savedMetrics.totalErrors || 0,
      todayErrors: savedMetrics.todayErrors || 0,
      errorsByType: savedMetrics.errorsByType || {},
      criticalErrors: 0,
      
      serverStartTime: new Date(),
      lastResetTime: new Date(),
      
      activeSessions: new Set(),
      sessionsByHour: {}
    };

    // 데이터 로드 확인 로그
    console.log('📊 영구 저장소에서 메트릭스 로드됨:', {
      totalAnalyses: this.metrics.totalAnalyses,
      totalPayments: this.metrics.totalPayments,
      totalRevenue: this.metrics.totalRevenue,
      todayAnalyses: this.metrics.todayAnalyses,
      todayPayments: this.metrics.todayPayments,
      todayRevenue: this.metrics.todayRevenue
    });

    // 매일 자정에 일일 통계 리셋
    this.setupDailyReset();
    
    console.log('📊 실제 메트릭스 저장소 초기화됨');
  }

  // 페이지 방문 기록
  trackPageView(sessionId: string, page: string): void {
    this.metrics.totalPageViews++;
    this.metrics.todayPageViews++;
    this.metrics.uniqueVisitors.add(sessionId);
    this.metrics.activeSessions.add(sessionId);
    
    const hour = new Date().getHours().toString().padStart(2, '0');
    this.metrics.sessionsByHour[hour] = (this.metrics.sessionsByHour[hour] || 0) + 1;
    
    console.log(`📈 페이지 방문 기록: ${page}, 세션: ${sessionId}`);
  }

  // 분석 요청 기록
  trackAnalysis(sessionId: string, serviceType: string): void {
    this.metrics.totalAnalyses++;
    this.metrics.todayAnalyses++;
    this.metrics.analysesByService[serviceType] = (this.metrics.analysesByService[serviceType] || 0) + 1;
    
    // 영구 저장소에 메트릭스 저장
    this.saveMetrics();
    
    console.log(`🔍 분석 요청 기록: ${serviceType}, 세션: ${sessionId}`);
  }

  // 결제 완료 기록
  trackPayment(sessionId: string, serviceType: string, amount: number): void {
    this.metrics.totalPayments++;
    this.metrics.todayPayments++;
    this.metrics.totalRevenue += amount;
    this.metrics.todayRevenue += amount;
    
    if (!this.metrics.paymentsByService[serviceType]) {
      this.metrics.paymentsByService[serviceType] = { count: 0, revenue: 0 };
    }
    this.metrics.paymentsByService[serviceType].count++;
    this.metrics.paymentsByService[serviceType].revenue += amount;
    
    // 영구 저장소에 메트릭스 저장
    this.saveMetrics();
    
    console.log(`💰 결제 완료 기록: ${serviceType}, 금액: ${amount}, 세션: ${sessionId}`);
  }

  // 결제 실패 기록 (실제 결제 시도 중 실패한 경우만)
  trackPaymentFailure(sessionId: string, serviceType: string, reason: string = 'unknown'): void {
    this.metrics.totalPaymentFailures++;
    this.metrics.todayPaymentFailures++;
    this.metrics.paymentFailuresByService[serviceType] = (this.metrics.paymentFailuresByService[serviceType] || 0) + 1;
    
    // 영구 저장소에 메트릭스 저장
    this.saveMetrics();
    
    console.log(`❌ 결제 실패 기록: ${serviceType}, 사유: ${reason}, 세션: ${sessionId}`);
  }

  // 오류 발생 기록 (확장된 환불 트래킹 포함)
  trackError(
    sessionId: string, 
    errorType: string, 
    isCritical: boolean = false,
    errorContext?: {
      serviceType?: string;
      errorMessage?: string;
      apiEndpoint?: string;
      userInfo?: {
        ip?: string;
        userAgent?: string;
        phone?: string;
        email?: string;
      };
      paymentInfo?: {
        transactionId?: string;
        amount?: number;
        paymentMethod?: string;
        paymentStatus?: 'completed' | 'pending' | 'failed';
      };
      requestData?: any;
      stackTrace?: string;
    }
  ): string | void {
    this.metrics.totalErrors++;
    this.metrics.todayErrors++;
    this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;
    
    if (isCritical) {
      this.metrics.criticalErrors++;
    }
    
    // 영구 저장소에 메트릭스 저장
    this.saveMetrics();
    
    console.log(`❌ 오류 발생 기록: ${errorType}, 중요도: ${isCritical ? '높음' : '낮음'}, 세션: ${sessionId}`);
    
    // 환불 가능한 서비스 오류인 경우 환불 트래킹 서비스에 기록
    if (errorContext?.serviceType && errorContext?.paymentInfo?.amount) {
      try {
        const refundTrackingService = require('./refundTrackingService').default;
        
        const refundTrackingId = refundTrackingService.trackRefundableError({
          sessionId,
          serviceType: errorContext.serviceType,
          errorType,
          errorMessage: errorContext.errorMessage || `${errorType} 오류 발생`,
          paymentInfo: errorContext.paymentInfo,
          userInfo: errorContext.userInfo || {},
          errorContext: {
            apiEndpoint: errorContext.apiEndpoint || 'unknown',
            requestData: errorContext.requestData,
            stackTrace: errorContext.stackTrace,
            isCritical
          }
        });
        
        console.log(`🔄 환불 트래킹 시작: ${refundTrackingId}`);
        return refundTrackingId;
      } catch (error) {
        console.error('환불 트래킹 서비스 오류:', error);
      }
    }
  }

  // 세션 종료
  endSession(sessionId: string): void {
    this.metrics.activeSessions.delete(sessionId);
    console.log(`🔚 세션 종료: ${sessionId}`);
  }

  // 메트릭스 영구 저장
  private saveMetrics(): void {
    try {
      const metricsToSave = {
        totalPageViews: this.metrics.totalPageViews,
        totalAnalyses: this.metrics.totalAnalyses,
        totalPayments: this.metrics.totalPayments,
        totalRevenue: this.metrics.totalRevenue,
        totalErrors: this.metrics.totalErrors,
        todayErrors: this.metrics.todayErrors,
        todayPageViews: this.metrics.todayPageViews,
        todayAnalyses: this.metrics.todayAnalyses,
        todayPayments: this.metrics.todayPayments,
        todayRevenue: this.metrics.todayRevenue,
        analysesByService: this.metrics.analysesByService,
        paymentsByService: this.metrics.paymentsByService,
        errorsByType: this.metrics.errorsByType,
        // 새로운 결제 실패 필드들
        totalPaymentFailures: this.metrics.totalPaymentFailures,
        todayPaymentFailures: this.metrics.todayPaymentFailures,
        paymentFailuresByService: this.metrics.paymentFailuresByService
      };
      persistentStore.saveMetrics(metricsToSave);
    } catch (error) {
      console.error('Failed to save metrics to persistent store:', error);
    }
  }

  // 통계 조회
  getStats(): {
    summary: any;
    today: any;
    services: any;
    errors: any;
    system: any;
  } {
    const now = new Date();
    const uptime = Math.floor((now.getTime() - this.metrics.serverStartTime.getTime()) / 1000);
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeDays = Math.floor(uptimeHours / 24);
    
    return {
      summary: {
        totalPageViews: this.metrics.totalPageViews,
        totalAnalyses: this.metrics.totalAnalyses,
        totalPayments: this.metrics.totalPayments,
        totalRevenue: this.metrics.totalRevenue,
        totalErrors: this.metrics.totalErrors,
        uniqueVisitors: this.metrics.uniqueVisitors.size,
        conversionRate: this.metrics.totalAnalyses > 0 ? 
          Math.round((this.metrics.totalPayments / this.metrics.totalAnalyses) * 100) : 0
      },
      today: {
        pageViews: this.metrics.todayPageViews,
        analyses: this.metrics.todayAnalyses,
        payments: this.metrics.todayPayments,
        revenue: this.metrics.todayRevenue,
        errors: this.metrics.todayErrors,
        activeUsers: this.metrics.activeSessions.size,
        paymentFailures: this.metrics.todayPaymentFailures,
        // 분석 미완료 (새로고침 등으로 중단된 분석)
        incompleteAnalyses: this.metrics.todayAnalyses - this.metrics.todayPayments - this.metrics.todayPaymentFailures
      },
      services: Object.entries(this.metrics.analysesByService).map(([service, count]) => ({
        service,
        analysisCount: count,
        paymentCount: this.metrics.paymentsByService[service]?.count || 0,
        revenue: this.metrics.paymentsByService[service]?.revenue || 0,
        conversionRate: count > 0 ? Math.round(((this.metrics.paymentsByService[service]?.count || 0) / count) * 100) : 0
      })),
      errors: {
        total: this.metrics.totalErrors,
        today: this.metrics.todayErrors,
        critical: this.metrics.criticalErrors,
        byType: this.metrics.errorsByType
      },
      system: {
        uptime: uptimeDays > 0 ? `${uptimeDays}일 ${uptimeHours % 24}시간` : `${uptimeHours}시간`,
        serverStartTime: this.metrics.serverStartTime.toISOString(),
        lastResetTime: this.metrics.lastResetTime.toISOString(),
        activeSessions: this.metrics.activeSessions.size
      }
    };
  }

  // 시간별 트래픽 조회
  getHourlyTraffic(): Array<{hour: string, views: number}> {
    const result = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(Date.now() - i * 60 * 60 * 1000).getHours().toString().padStart(2, '0');
      result.push({
        hour: `${hour}:00`,
        views: this.metrics.sessionsByHour[hour] || 0
      });
    }
    return result;
  }

  // 서비스별 분석 결과 조회
  getServiceBreakdown(): Array<{service: string, count: number, revenue: number}> {
    return Object.entries(this.metrics.analysesByService).map(([service, count]) => ({
      service,
      count,
      revenue: this.metrics.paymentsByService[service]?.revenue || 0
    }));
  }

  // 일일 통계 리셋 설정
  private setupDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetDailyStats();
      // 이후 24시간마다 반복
      this.resetTimer = setInterval(() => {
        this.resetDailyStats();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  // 일일 통계 리셋
  private resetDailyStats(): void {
    this.metrics.todayPageViews = 0;
    this.metrics.todayAnalyses = 0;
    this.metrics.todayPayments = 0;
    this.metrics.todayRevenue = 0;
    this.metrics.todayPaymentFailures = 0;
    this.metrics.todayErrors = 0;
    this.metrics.lastResetTime = new Date();
    this.metrics.sessionsByHour = {};
    
    console.log('🔄 일일 통계 리셋됨:', new Date().toISOString());
  }

  // 환불 완료 추적
  trackRefundComplete(refundData: {
    transactionId: string;
    refundAmount: number;
    reason: string;
    refundMethod: string;
  }): void {
    console.log('💰 환불 완료 기록됨:', refundData);
    
    // 환불 통계 업데이트 (필요시 추가)
    // 환불은 일반적으로 수익에서 차감되므로 별도 추적 가능
    
    // 영구 저장소에 환불 기록
    persistentStore.trackRefund({
      ...refundData,
      timestamp: new Date()
    });
  }

  // 환불 실패 추적
  trackRefundFailure(refundData: {
    transactionId: string;
    reason: string;
    errorMessage: string;
  }): void {
    console.log('❌ 환불 실패 기록됨:', refundData);
    
    // 환불 실패를 오류로 기록
    this.trackError(
      refundData.transactionId,
      'refund_failed',
      false,
      {
        serviceType: 'payment',
        errorContext: {
          originalReason: refundData.reason,
          errorMessage: refundData.errorMessage
        }
      }
    );
  }

  // 결제 완료 추적 (기존 trackPayment 확장)
  trackPaymentComplete(paymentData: {
    orderId: string;
    serviceType: string;
    amount: number;
    paymentMethod: string;
    tid: string;
  }): void {
    // 기존 trackPayment 호출
    this.trackPayment(paymentData.orderId, paymentData.serviceType, paymentData.amount);
    
    console.log('💳 결제 완료 상세 기록됨:', paymentData);
    
    // 영구 저장소에 상세 결제 정보 저장
    persistentStore.trackPaymentDetail({
      ...paymentData,
      timestamp: new Date(),
      status: 'completed'
    });
  }

  // 결제 검증 실패 추적
  trackPaymentVerificationFailure(paymentData: {
    orderId: string;
    serviceType: string;
    reason: string;
  }): void {
    console.log('🚫 결제 검증 실패 기록됨:', paymentData);
    
    // 결제 실패와 오류 둘 다 기록
    this.trackPaymentFailure('system', paymentData.serviceType, paymentData.reason);
    this.trackError(
      paymentData.orderId,
      'payment_verification_failed',
      true,
      {
        serviceType: paymentData.serviceType,
        errorContext: {
          reason: paymentData.reason
        }
      }
    );
  }

  // 메트릭스 강제 리셋 (테스트용)
  reset(): void {
    this.metrics = {
      totalPageViews: 0,
      uniqueVisitors: new Set(),
      todayPageViews: 0,
      
      totalAnalyses: 0,
      todayAnalyses: 0,
      analysesByService: {},
      
      totalPayments: 0,
      todayPayments: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      paymentsByService: {},
      
      totalPaymentFailures: 0,
      todayPaymentFailures: 0,
      paymentFailuresByService: {},
      
      totalErrors: 0,
      todayErrors: 0,
      errorsByType: {},
      criticalErrors: 0,
      
      serverStartTime: new Date(),
      lastResetTime: new Date(),
      
      activeSessions: new Set(),
      sessionsByHour: {}
    };
    
    console.log('🔄 메트릭스 전체 리셋됨');
  }
}

// 싱글톤 인스턴스 생성
const realMetricsStore = new RealMetricsStore();

export default realMetricsStore;