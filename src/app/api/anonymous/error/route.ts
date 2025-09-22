import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/adminService';
import { anonymousUserService } from '@/services/anonymousUserService';

/**
 * 익명 사용자 오류 기록 및 관리 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sessionId, 
      serviceId, 
      errorType, 
      message, 
      orderId, 
      serviceType,
      additionalInfo 
    } = body;
    
    if (!sessionId || !serviceId || !errorType || !message) {
      return NextResponse.json(
        { success: false, error: '필수 오류 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // AdminService를 통해 통합 오류 기록
    const errorId = adminService.recordAnonymousUserError(
      sessionId,
      serviceId,
      errorType,
      message,
      orderId,
      serviceType
    );
    
    return NextResponse.json({
      success: true,
      data: {
        errorId,
        message: '익명 사용자 오류가 기록되었습니다.',
        adminNotified: true,
        compensationEvaluated: !!orderId
      }
    });
  } catch (error) {
    console.error('Anonymous error recording failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '오류 기록 중 문제가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 서비스 완료 처리
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, serviceId, result } = body;
    
    if (!sessionId || !serviceId) {
      return NextResponse.json(
        { success: false, error: '세션 ID와 서비스 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    anonymousUserService.completeService(sessionId, serviceId, result);
    
    return NextResponse.json({
      success: true,
      data: {
        message: '서비스가 완료되었습니다.',
        serviceId
      }
    });
  } catch (error) {
    console.error('Service completion error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서비스 완료 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 보상 필요 오류 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'uncontacted';
    
    const stats = anonymousUserService.getAnonymousUserStats();
    
    if (type === 'stats') {
      return NextResponse.json({
        success: true,
        data: stats
      });
    }
    
    // 보상이 필요한 오류만 필터링해서 반환하는 로직은 
    // 실제 구현에서 anonymousUserService에 추가 메서드가 필요
    return NextResponse.json({
      success: true,
      data: {
        stats,
        message: '익명 사용자 통계가 조회되었습니다.'
      }
    });
  } catch (error) {
    console.error('Anonymous error stats retrieval error:', error);
    return NextResponse.json(
      { success: false, error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}