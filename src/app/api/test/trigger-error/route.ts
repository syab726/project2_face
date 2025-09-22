/**
 * 오류 트래킹 테스트 API
 * 다양한 유형의 오류를 시뮬레이션하여 추적 시스템을 테스트
 */

import { NextRequest, NextResponse } from 'next/server';
import realMetricsStore from '@/services/realMetricsStore';
import { adminService } from '@/services/adminService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { errorType, isCritical = false } = body;

    // 세션 ID 생성
    const sessionId = `test-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 다양한 오류 유형 시뮬레이션
    switch (errorType) {
      case 'analysis-failed':
        realMetricsStore.trackError(sessionId, 'analysis-failed', true);
        
        // 관리자 서비스에도 오류 기록
        await adminService.logServiceError({
          type: 'analysis-failed',
          title: '분석 서비스 실패 (테스트)',
          message: '얼굴 분석 처리 중 알 수 없는 오류가 발생했습니다.',
          userEmail: 'test@example.com',
          serviceType: 'professional-physiognomy',
          orderId: `TEST-ORDER-${Date.now()}`,
          analysisStep: 'face_processing',
          metadata: {
            testGenerated: true,
            sessionId: sessionId,
            simulationType: 'critical_error'
          }
        });
        
        return NextResponse.json({
          success: true,
          message: '분석 실패 오류가 추적되었습니다.',
          errorType: 'analysis-failed',
          critical: true
        });

      case 'payment-failed':
        realMetricsStore.trackError(sessionId, 'payment-failed', true);
        
        // 관리자 서비스에도 오류 기록
        await adminService.logServiceError({
          type: 'payment_error',
          title: '결제 처리 실패 (테스트)',
          message: '결제 승인 과정에서 오류가 발생했습니다.',
          userEmail: 'test@example.com',
          serviceType: 'professional-physiognomy',
          orderId: `TEST-ORDER-${Date.now()}`,
          metadata: {
            testGenerated: true,
            sessionId: sessionId,
            simulationType: 'payment_critical_error'
          }
        });
        
        return NextResponse.json({
          success: true,
          message: '결제 실패 오류가 추적되었습니다.',
          errorType: 'payment-failed',
          critical: true
        });

      case 'network-error':
        realMetricsStore.trackError(sessionId, 'network-error', false);
        
        // 관리자 서비스에도 오류 기록
        await adminService.logServiceError({
          type: 'network_error',
          title: '네트워크 연결 오류 (테스트)',
          message: '외부 API 호출 중 네트워크 연결이 불안정합니다.',
          userEmail: 'test@example.com',
          serviceType: 'professional-physiognomy',
          metadata: {
            testGenerated: true,
            sessionId: sessionId,
            simulationType: 'network_error'
          }
        });
        
        return NextResponse.json({
          success: true,
          message: '네트워크 오류가 추적되었습니다.',
          errorType: 'network-error',
          critical: false
        });

      case 'server-error':
        realMetricsStore.trackError(sessionId, 'server-error', true);
        
        // 관리자 서비스에도 오류 기록
        await adminService.logServiceError({
          type: 'system_error',
          title: '서버 내부 오류 (테스트)',
          message: '서버 내부에서 처리되지 않은 예외가 발생했습니다.',
          userEmail: 'test@example.com',
          serviceType: 'professional-physiognomy',
          orderId: `TEST-ORDER-${Date.now()}`,
          metadata: {
            testGenerated: true,
            sessionId: sessionId,
            simulationType: 'server_critical_error'
          }
        });
        
        return NextResponse.json({
          success: true,
          message: '서버 오류가 추적되었습니다.',
          errorType: 'server-error',
          critical: true
        });

      case 'ai-service-error':
        realMetricsStore.trackError(sessionId, 'ai-service-error', true);
        
        // 관리자 서비스에도 오류 기록
        await adminService.logServiceError({
          type: 'ai_service_error',
          title: 'AI 서비스 접근 실패 (테스트)',
          message: 'OpenAI 또는 Gemini API 호출이 실패했습니다.',
          userEmail: 'test@example.com',
          serviceType: 'professional-physiognomy',
          orderId: `TEST-ORDER-${Date.now()}`,
          analysisStep: 'ai_processing',
          metadata: {
            testGenerated: true,
            sessionId: sessionId,
            simulationType: 'ai_service_error'
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'AI 서비스 오류가 추적되었습니다.',
          errorType: 'ai-service-error',
          critical: true
        });

      case 'custom':
        realMetricsStore.trackError(sessionId, 'custom-test-error', isCritical);
        
        // 관리자 서비스에도 오류 기록
        await adminService.logServiceError({
          type: 'custom_error',
          title: `커스텀 테스트 오류 (중요도: ${isCritical ? '높음' : '낮음'})`,
          message: '사용자 정의 오류 시뮬레이션입니다.',
          userEmail: 'test@example.com',
          serviceType: 'professional-physiognomy',
          metadata: {
            testGenerated: true,
            sessionId: sessionId,
            simulationType: 'custom_error',
            customCritical: isCritical
          }
        });
        
        return NextResponse.json({
          success: true,
          message: `커스텀 오류가 추적되었습니다. (중요도: ${isCritical ? '높음' : '낮음'})`,
          errorType: 'custom-test-error',
          critical: isCritical
        });

      default:
        return NextResponse.json({
          success: false,
          error: '알 수 없는 오류 유형입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('오류 시뮬레이션 실패:', error);
    return NextResponse.json({
      success: false,
      error: '오류 시뮬레이션 중 문제가 발생했습니다.'
    }, { status: 500 });
  }
}