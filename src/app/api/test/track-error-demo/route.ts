import { NextRequest, NextResponse } from 'next/server';
import realMetricsStore from '@/services/realMetricsStore';
import refundTrackingService from '@/services/refundTrackingService';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 오류 트래킹 데모 시작...');
    
    // 1. 기본 오류 추적 (환불 정보 없음)
    console.log('1️⃣ 기본 오류 추적 테스트...');
    realMetricsStore.trackError('demo-session-001', 'network-error', false);
    
    // 2. 환불 가능한 서비스 오류 추적
    console.log('2️⃣ 환불 가능한 오류 추적 테스트...');
    const refundTrackingId = realMetricsStore.trackError(
      'demo-session-002',
      'ANALYSIS_FAILED',
      true,
      {
        serviceType: 'mbti-face',
        errorMessage: '데모: MBTI 얼굴 분석 실패',
        apiEndpoint: '/api/analysis/mbti-face',
        userInfo: {
          ip: '127.0.0.1',
          phone: '010-1234-5678',
          userAgent: 'Demo User Agent'
        },
        paymentInfo: {
          transactionId: 'demo-tx-12345',
          amount: 3000,
          paymentMethod: 'card',
          paymentStatus: 'completed'
        },
        requestData: { mbtiType: 'ENFP', age: '25' },
        stackTrace: 'Error: Demo stack trace'
      }
    );
    
    // 3. 환불 트래킹 서비스 직접 테스트
    console.log('3️⃣ 환불 트래킹 서비스 직접 테스트...');
    const directRefundId = refundTrackingService.trackRefundableError({
      sessionId: 'demo-session-003',
      serviceType: 'fortune',
      errorType: 'AI_SERVICE_ERROR',
      errorMessage: '데모: 운세 분석 AI 서비스 오류',
      paymentInfo: {
        transactionId: 'demo-tx-67890',
        amount: 2000,
        paymentMethod: 'card',
        paymentStatus: 'completed'
      },
      userInfo: {
        ip: '127.0.0.1',
        phone: '010-9876-5432',
        email: 'demo@example.com'
      },
      errorContext: {
        apiEndpoint: '/api/analysis/fortune',
        isCritical: true,
        requestData: { birthDate: '1990-01-01' }
      }
    });
    
    // 4. 현재 상태 조회
    const currentStats = realMetricsStore.getStats();
    const refundStats = refundTrackingService.getRefundStatistics();
    const refundableErrors = refundTrackingService.getRefundableErrors();
    
    console.log('✅ 오류 트래킹 데모 완료!');
    
    return NextResponse.json({
      success: true,
      data: {
        message: '오류 트래킹 시스템 작동 증명 완료',
        results: {
          basicErrorTracked: true,
          refundableErrorTracked: !!refundTrackingId,
          directRefundTracked: !!directRefundId,
          currentMetrics: {
            totalErrors: currentStats.errors.total,
            todayErrors: currentStats.errors.today,
            errorsByType: currentStats.errors.byType
          },
          refundMetrics: {
            totalRefundableErrors: refundStats.totalErrors,
            eligibleForRefund: refundStats.eligibleForRefund,
            pendingRefunds: refundStats.pendingRefunds,
            totalRefundAmount: refundStats.totalRefundAmount
          },
          refundableErrorsList: refundableErrors.map(error => ({
            id: error.id,
            serviceType: error.serviceType,
            errorType: error.errorType,
            amount: error.paymentInfo?.amount,
            phone: error.userInfo.phone,
            refundStatus: error.refundStatus.status,
            isEligible: error.refundStatus.isEligible
          }))
        },
        timestamp: new Date().toISOString(),
        demo: true
      }
    });

  } catch (error) {
    console.error('오류 트래킹 데모 실패:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: '오류 트래킹 데모 중 오류 발생',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }, { status: 500 });
  }
}