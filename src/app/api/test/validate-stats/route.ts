import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/adminService';
import { orderService } from '@/services/orderService';

/**
 * 통계 데이터 검증 및 테스트를 위한 API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'summary';
    
    switch (type) {
      case 'summary':
        return await getStatsSummary();
      case 'errors':
        return await getErrorStats();
      case 'compensation':
        return await getCompensationStats();
      case 'revenue_impact':
        return await getRevenueImpactStats();
      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 통계 타입입니다.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { success: false, error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 전체 통계 요약
async function getStatsSummary() {
  try {
    const dashboardData = await adminService.getDashboardData();
    const orderStats = orderService.getOrderStats();
    const serviceErrors = await adminService.getServiceErrors();
    
    // 보상 관련 통계 계산
    const compensationErrors = serviceErrors.filter(e => e.compensationRequired);
    const pendingCompensation = compensationErrors.filter(e => e.compensationStatus === 'pending');
    const approvedCompensation = compensationErrors.filter(e => e.compensationStatus === 'approved');
    const paidCompensation = compensationErrors.filter(e => e.compensationStatus === 'paid');
    
    const totalCompensationAmount = compensationErrors.reduce((sum, error) => 
      sum + (error.compensationAmount || 0), 0
    );
    
    const summary = {
      timestamp: new Date().toISOString(),
      business: {
        totalOrders: orderStats.total,
        totalRevenue: orderStats.totalRevenue,
        successRate: orderStats.successRate,
        todayOrders: orderStats.today
      },
      errors: {
        total: serviceErrors.length,
        active: serviceErrors.filter(e => e.status === 'new').length,
        critical: serviceErrors.filter(e => e.severity === 'critical').length,
        recentWeek: serviceErrors.filter(error => {
          const errorDate = new Date(error.createdAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return errorDate >= weekAgo;
        }).length
      },
      compensation: {
        totalRequired: compensationErrors.length,
        pending: pendingCompensation.length,
        approved: approvedCompensation.length,
        paid: paidCompensation.length,
        totalAmount: totalCompensationAmount,
        averageAmount: compensationErrors.length > 0 ? Math.round(totalCompensationAmount / compensationErrors.length) : 0
      },
      healthMetrics: {
        errorRate: orderStats.total > 0 ? (serviceErrors.length / orderStats.total * 100).toFixed(2) + '%' : '0%',
        compensationRate: orderStats.total > 0 ? (compensationErrors.length / orderStats.total * 100).toFixed(2) + '%' : '0%',
        averageResolutionTime: calculateAverageResolutionTime(serviceErrors),
        criticalErrorRatio: serviceErrors.length > 0 ? (serviceErrors.filter(e => e.severity === 'critical').length / serviceErrors.length * 100).toFixed(1) + '%' : '0%'
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        metadata: {
          calculatedAt: new Date().toISOString(),
          dataPoints: {
            orders: orderStats.total,
            errors: serviceErrors.length,
            compensationCases: compensationErrors.length
          }
        }
      }
    });
  } catch (error) {
    throw new Error(`통계 요약 계산 실패: ${error}`);
  }
}

// 오류 통계 상세
async function getErrorStats() {
  const serviceErrors = await adminService.getServiceErrors();
  
  // 오류 타입별 분석
  const errorTypeAnalysis = serviceErrors.reduce((acc, error) => {
    const type = error.type;
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        criticalCount: 0,
        compensationRequired: 0,
        totalCompensation: 0
      };
    }
    
    acc[type].count++;
    if (error.severity === 'critical') acc[type].criticalCount++;
    if (error.compensationRequired) {
      acc[type].compensationRequired++;
      acc[type].totalCompensation += (error.compensationAmount || 0);
    }
    
    return acc;
  }, {} as Record<string, any>);
  
  return NextResponse.json({
    success: true,
    data: {
      errorTypeAnalysis,
      trends: {
        totalErrors: serviceErrors.length,
        last24Hours: serviceErrors.filter(e => 
          new Date(e.createdAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        last7Days: serviceErrors.filter(e => 
          new Date(e.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      }
    }
  });
}

// 보상 통계 상세
async function getCompensationStats() {
  const serviceErrors = await adminService.getServiceErrors();
  const compensationErrors = serviceErrors.filter(e => e.compensationRequired);
  
  // 보상 상태별 분석
  const statusBreakdown = compensationErrors.reduce((acc, error) => {
    const status = error.compensationStatus || 'pending';
    if (!acc[status]) {
      acc[status] = { count: 0, totalAmount: 0, averageAmount: 0 };
    }
    acc[status].count++;
    acc[status].totalAmount += (error.compensationAmount || 0);
    return acc;
  }, {} as Record<string, any>);
  
  // 평균 계산
  Object.keys(statusBreakdown).forEach(status => {
    const data = statusBreakdown[status];
    data.averageAmount = data.count > 0 ? Math.round(data.totalAmount / data.count) : 0;
  });
  
  return NextResponse.json({
    success: true,
    data: {
      statusBreakdown,
      performance: {
        totalCompensationCases: compensationErrors.length,
        totalAmountPaid: statusBreakdown.paid?.totalAmount || 0,
        totalAmountPending: statusBreakdown.pending?.totalAmount || 0,
        processingEfficiency: compensationErrors.length > 0 ? 
          ((statusBreakdown.paid?.count || 0) / compensationErrors.length * 100).toFixed(1) + '%' : '0%'
      }
    }
  });
}

// 매출 임팩트 분석
async function getRevenueImpactStats() {
  const orderStats = orderService.getOrderStats();
  const serviceErrors = await adminService.getServiceErrors();
  const compensationErrors = serviceErrors.filter(e => e.compensationRequired);
  
  const totalCompensationAmount = compensationErrors.reduce((sum, error) => 
    sum + (error.compensationAmount || 0), 0
  );
  
  const revenueImpact = {
    totalRevenue: orderStats.totalRevenue,
    totalCompensation: totalCompensationAmount,
    compensationRatio: orderStats.totalRevenue > 0 ? 
      (totalCompensationAmount / orderStats.totalRevenue * 100).toFixed(2) + '%' : '0%',
    netRevenue: orderStats.totalRevenue - totalCompensationAmount
  };
  
  return NextResponse.json({
    success: true,
    data: revenueImpact
  });
}

// 헬퍼 함수
function calculateAverageResolutionTime(errors: any[]): string {
  const resolvedErrors = errors.filter(e => e.resolvedAt);
  if (resolvedErrors.length === 0) return '0분';
  
  const totalTime = resolvedErrors.reduce((sum, error) => {
    const created = new Date(error.createdAt).getTime();
    const resolved = new Date(error.resolvedAt).getTime();
    return sum + (resolved - created);
  }, 0);
  
  const averageMs = totalTime / resolvedErrors.length;
  const averageMinutes = Math.round(averageMs / (1000 * 60));
  
  return averageMinutes > 60 ? 
    `${Math.round(averageMinutes / 60)}시간 ${averageMinutes % 60}분` : 
    `${averageMinutes}분`;
}