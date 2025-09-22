/**
 * 간단한 통계 API - 필수 정보만 제공
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 실제 메트릭스 데이터 사용
    const realMetricsStore = (await import('@/services/realMetricsStore')).default;
    const realStats = realMetricsStore.getStats();
    
    // 실제 오류 데이터 가져오기
    const adminService = (await import('@/services/adminService')).adminService;
    const adminErrors = await adminService.getServiceErrors();
    
    // realMetricsStore의 오류 데이터를 recentErrors 형식으로 변환
    const realErrors = Object.entries(realStats.errors.byType).map(([errorType, count], index) => ({
      id: String(index + 1),
      message: `${errorType}: ${count}회 발생`,
      time: new Date().toLocaleString('ko-KR'),
      severity: errorType.includes('critical') || errorType.includes('failed') ? 'high' : 'medium',
      type: errorType,
      count: count
    }));

    // adminService 오류와 realMetrics 오류를 합쳐서 표시
    const combinedErrors = [
      ...realErrors,
      ...adminErrors.slice(0, 3).map((error, index) => ({
        id: String(realErrors.length + index + 1),
        message: error.message || '알 수 없는 오류',
        time: error.timestamp ? new Date(error.timestamp).toLocaleString('ko-KR') : '시간 미상',
        severity: error.severity === 'critical' ? 'high' : error.severity === 'high' ? 'medium' : 'low'
      }))
    ];

    const stats = {
      // 실제 오늘 방문자
      todayVisitors: realStats.today.pageViews,
      
      // 실제 오늘 결제건수  
      todayPayments: realStats.today.payments,
      
      // 실제 총 오류 수 (realMetrics + admin 오류)
      totalErrors: realStats.today.errors,
      
      // 실제 활성 사용자
      activeUsers: realStats.today.activeUsers,
      
      // 실제 최근 오류 목록 (realMetrics + admin 오류 통합)
      recentErrors: combinedErrors.slice(0, 5)
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Simple stats API error:', error);
    
    return NextResponse.json({
      success: false,
      error: '통계 조회 실패'
    }, { status: 500 });
  }
}