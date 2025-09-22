/**
 * 이벤트 트래킹 API
 * 클라이언트에서 호출하여 실제 사용 통계를 기록
 */

import { NextRequest, NextResponse } from 'next/server';
import realMetricsStore from '@/services/realMetricsStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔵 Track API 요청 받음:', body);
    const { action, sessionId, data, page, serviceType, amount, errorType, isCritical } = body;

    // 세션 ID가 없으면 생성
    const actualSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔵 Track API 처리 중:', { action, sessionId: actualSessionId, data });

    switch (action) {
      case 'page_view':
        realMetricsStore.trackPageView(actualSessionId, page || data?.page || '/');
        break;

      case 'analysis_request':
        realMetricsStore.trackAnalysis(actualSessionId, serviceType || data?.serviceType);
        break;

      case 'payment_completed':
        realMetricsStore.trackPayment(actualSessionId, serviceType || data?.serviceType, amount || data?.amount);
        break;

      case 'error_occurred':
        realMetricsStore.trackError(actualSessionId, errorType || data?.errorType, isCritical || data?.isCritical || false);
        break;

      case 'session_end':
        realMetricsStore.endSession(actualSessionId);
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      sessionId: actualSessionId,
      message: `Event tracked: ${action}`
    });

  } catch (error) {
    console.error('Failed to track event:', error);
    return NextResponse.json({
      success: false,
      error: '이벤트 트래킹 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}