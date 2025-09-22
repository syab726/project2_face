import { NextResponse } from 'next/server';
import realMetricsStore from '@/services/realMetricsStore';

export async function GET() {
  try {
    const stats = realMetricsStore.getStats();
    
    return NextResponse.json({
      success: true,
      data: {
        summary: stats.summary,
        today: stats.today,
        services: stats.services,
        errors: stats.errors,
        raw: {
          todayAnalyses: stats.today.analyses,
          todayPayments: stats.today.payments,
          totalAnalyses: stats.summary.totalAnalyses,
          totalPayments: stats.summary.totalPayments,
          analysesByService: stats.services,
          // 오류 데이터 추가
          totalErrors: stats.errors.total,
          todayErrors: stats.errors.today,
          errorsByType: stats.errors.byType,
          criticalErrors: stats.errors.critical
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch debug metrics' },
      { status: 500 }
    );
  }
}