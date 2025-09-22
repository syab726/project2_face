/**
 * 오류 추적 API
 * 클라이언트에서 500 에러 등을 받았을 때 호출하여 통계에 반영
 */

import { NextRequest, NextResponse } from 'next/server';
import realMetricsStore from '@/services/realMetricsStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId = 'anonymous',
      serviceType = 'unknown',
      errorType = 'api-error',
      errorMessage = 'Unknown error',
      isCritical = true
    } = body;

    // realMetricsStore에 오류 추적
    const errorTypeName = `${serviceType}-${errorType}`;
    realMetricsStore.trackError(sessionId, errorTypeName, isCritical);

    console.log(`🚨 클라이언트 오류 추적됨: ${serviceType}, 타입: ${errorType}, 메시지: ${errorMessage}`);

    return NextResponse.json({
      success: true,
      message: 'Error tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking API failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to track error'
    }, { status: 500 });
  }
}