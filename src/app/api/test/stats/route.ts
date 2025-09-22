import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/orderService';

/**
 * 테스트용 통계 API - 세션 없이도 기본 통계 제공
 */
export async function GET(request: NextRequest) {
  try {
    // 실제 orderService에서 통계 가져오기
    const realStats = orderService.getOrderStats();
    
    // 기본 통계 데이터 (실제 데이터가 없는 경우)
    const defaultStats = {
      total: Math.max(realStats.total, 15),
      totalRevenue: Math.max(realStats.totalRevenue, 125000),
      completed: Math.max(realStats.completed, 12),
      failed: Math.max(realStats.failed, 2),
      pendingRefunds: realStats.pendingRefunds || 0,
      today: Math.max(realStats.today, 3),
      successRate: Math.max(realStats.successRate, 80)
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: defaultStats,
        message: '테스트용 통계 데이터'
      }
    });

  } catch (error) {
    console.error('테스트 통계 API 오류:', error);
    
    // 완전 기본값 반환
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total: 15,
          totalRevenue: 125000,
          completed: 12,
          failed: 3,
          pendingRefunds: 1,
          today: 3,
          successRate: 80
        },
        message: '기본 통계 데이터'
      }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}