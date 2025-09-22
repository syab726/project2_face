/**
 * 테스트 데이터 생성 API
 * Admin 대시보드 테스트용 실제 데이터 생성
 */

import { NextResponse } from 'next/server';
import { serverEventTracking } from '@/services/serverEventTrackingService';

export async function POST() {
  try {
    // 다양한 이벤트 생성
    const services = [
      'professional-physiognomy',
      'mbti-face',
      'face-saju',
      'analyze-interview-face'
    ];

    // 페이지뷰 생성
    for (let i = 0; i < 10; i++) {
      serverEventTracking.trackPageView(`/service/${services[i % 4]}`);
    }

    // 분석 시작/완료 이벤트
    for (let i = 0; i < 5; i++) {
      const service = services[Math.floor(Math.random() * services.length)];
      serverEventTracking.trackAnalysisStart(service, {
        testData: true,
        testId: i
      });
      
      // 80% 성공률
      if (Math.random() > 0.2) {
        serverEventTracking.trackAnalysisComplete(service, {
          testData: true,
          testId: i,
          duration: Math.floor(Math.random() * 5000) + 1000
        });
      } else {
        serverEventTracking.trackAnalysisError(
          service,
          'test_error',
          '테스트 오류 메시지',
          Math.random() > 0.5 ? 'medium' : 'low',
          { testData: true, testId: i }
        );
      }
    }

    // 결제 이벤트
    for (let i = 0; i < 3; i++) {
      const service = services[Math.floor(Math.random() * services.length)];
      const amount = service === 'face-saju' ? 3900 : 
                    service === 'professional-physiognomy' ? 2900 :
                    service === 'analyze-interview-face' ? 2400 : 1900;
      
      serverEventTracking.trackPaymentStart(service, amount, {
        testData: true,
        testId: i
      });
      
      // 70% 성공률
      if (Math.random() > 0.3) {
        serverEventTracking.trackPaymentComplete(
          service,
          amount,
          `TEST-ORDER-${Date.now()}-${i}`,
          { testData: true, testId: i }
        );
      } else {
        serverEventTracking.trackPaymentError(
          service,
          'payment_failed',
          '테스트 결제 실패',
          { testData: true, testId: i }
        );
      }
    }

    // 통계 확인
    const stats = serverEventTracking.getRealtimeStats();

    return NextResponse.json({
      success: true,
      message: '테스트 데이터가 생성되었습니다',
      summary: {
        todayStats: stats.today,
        totalStats: stats.totalStats,
        eventsGenerated: 18 // 10 페이지뷰 + 5 분석 + 3 결제
      }
    });

  } catch (error) {
    console.error('테스트 데이터 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: '테스트 데이터 생성 실패'
    }, { status: 500 });
  }
}