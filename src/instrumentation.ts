export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: monitoringService } = await import('./services/monitoringService');
    const { default: loggingService } = await import('./services/loggingService');

    try {
      // 모니터링 수집 시작 (환경변수에서 간격 설정)
      const interval = parseInt(process.env.MONITOR_COLLECTION_INTERVAL || '60000');
      monitoringService.startCollection(interval);

      // 기본 헬스체크 등록
      monitoringService.registerHealthCheck('database', async () => {
        try {
          // 데이터베이스 연결 확인 (실제 구현에서는 DB 쿼리 수행)
          return { status: 'healthy' };
        } catch (error) {
          return { 
            status: 'unhealthy', 
            details: { error: error instanceof Error ? error.message : 'Unknown error' }
          };
        }
      });

      monitoringService.registerHealthCheck('memory', async () => {
        const usage = process.memoryUsage();
        const heapUsedMB = usage.heapUsed / 1024 / 1024;
        const heapTotalMB = usage.heapTotal / 1024 / 1024;
        const usagePercent = (heapUsedMB / heapTotalMB) * 100;

        if (usagePercent > 90) {
          return { status: 'unhealthy', details: { heapUsedMB, heapTotalMB, usagePercent } };
        } else if (usagePercent > 80) {
          return { status: 'degraded', details: { heapUsedMB, heapTotalMB, usagePercent } };
        } else {
          return { status: 'healthy', details: { heapUsedMB, heapTotalMB, usagePercent } };
        }
      });

      loggingService.info('MONITORING', 'Monitoring system initialized successfully', {
        metadata: { collectionInterval: interval }
      });
    } catch (error) {
      loggingService.error('MONITORING', 'Failed to initialize monitoring system', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }
}