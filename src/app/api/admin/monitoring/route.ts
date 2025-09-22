import { NextRequest, NextResponse } from 'next/server';
import monitoringService from '@/services/monitoringService';
import loggingService from '@/services/loggingService';

// GET: 모니터링 대시보드 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (type === 'dashboard') {
      const dashboardData = await monitoringService.getDashboardData();
      return NextResponse.json({
        success: true,
        data: dashboardData
      });
    } else if (type === 'metrics') {
      const category = searchParams.get('category') as any;
      const limit = parseInt(searchParams.get('limit') || '100');
      const metrics = monitoringService.getMetrics(category, limit);
      
      return NextResponse.json({
        success: true,
        data: metrics
      });
    } else if (type === 'health') {
      const healthChecks = monitoringService.getHealthStatus();
      return NextResponse.json({
        success: true,
        data: healthChecks
      });
    } else if (type === 'alerts') {
      const resolved = searchParams.get('resolved');
      const limit = parseInt(searchParams.get('limit') || '50');
      const alerts = monitoringService.getAlerts(
        resolved === 'true' ? true : resolved === 'false' ? false : undefined,
        limit
      );
      
      return NextResponse.json({
        success: true,
        data: alerts
      });
    } else if (type === 'config') {
      const config = monitoringService.getConfiguration();
      return NextResponse.json({
        success: true,
        data: config
      });
    } else {
      // 기본적으로 대시보드 데이터 반환
      const dashboardData = await monitoringService.getDashboardData();
      return NextResponse.json({
        success: true,
        data: dashboardData
      });
    }
  } catch (error) {
    loggingService.error('MONITORING_API', 'Failed to get monitoring data', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve monitoring data'
    }, { status: 500 });
  }
}

// POST: 모니터링 설정 업데이트 또는 수동 작업 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'start_collection') {
      const interval = data.interval || 60000;
      monitoringService.startCollection(interval);
      
      return NextResponse.json({
        success: true,
        message: 'Monitoring collection started'
      });
    } else if (action === 'stop_collection') {
      monitoringService.stopCollection();
      
      return NextResponse.json({
        success: true,
        message: 'Monitoring collection stopped'
      });
    } else if (action === 'update_thresholds') {
      monitoringService.updateThresholds(data.thresholds);
      
      return NextResponse.json({
        success: true,
        message: 'Monitoring thresholds updated'
      });
    } else if (action === 'resolve_alert') {
      const { alertId } = data;
      const resolved = monitoringService.resolveAlert(alertId);
      
      if (resolved) {
        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully'
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Alert not found or already resolved'
        }, { status: 404 });
      }
    } else if (action === 'create_test_alert') {
      // 테스트용 알림 생성
      monitoringService.createAlert(
        data.level || 'info',
        data.title || 'Test Alert',
        data.message || 'This is a test alert',
        'manual_test',
        data.metadata
      );
      
      return NextResponse.json({
        success: true,
        message: 'Test alert created'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action'
      }, { status: 400 });
    }
  } catch (error) {
    loggingService.error('MONITORING_API', 'Monitoring action failed', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    return NextResponse.json({
      success: false,
      error: 'Monitoring action failed'
    }, { status: 500 });
  }
}