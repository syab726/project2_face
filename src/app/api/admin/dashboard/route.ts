import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/adminService';

/**
 * Admin 대시보드 데이터 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    
    // 세션 검증 (개발 환경에서는 우회)
    if (sessionId && !adminService.validateSession(sessionId)) {
      return NextResponse.json(
        { success: false, error: '세션이 만료되었습니다.' },
        { status: 401 }
      );
    }

    // 대시보드 데이터 조회
    const dashboardData = await adminService.getDashboardData();
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('대시보드 데이터 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '대시보드 데이터 조회 실패' },
      { status: 500 }
    );
  }
}

/**
 * 세션 없이도 테스트할 수 있는 공개 대시보드 (개발 전용)
 */
export async function POST() {
  try {
    const dashboardData = await adminService.getDashboardData();
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: '개발 전용 - 세션 검증 우회',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('대시보드 데이터 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '대시보드 데이터 조회 실패' },
      { status: 500 }
    );
  }
}