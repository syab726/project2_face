/**
 * 서버 사이드 메트릭 저장소
 * 메모리 기반 실시간 데이터 저장
 */

export interface MetricEvent {
  id: string;
  eventType: 'page_view' | 'analysis_start' | 'analysis_complete' | 'analysis_error' | 'payment_start' | 'payment_complete' | 'payment_error';
  serviceType?: string;
  sessionId: string;
  userId?: string;
  timestamp: string;
  metadata?: any;
  amount?: number;
  errorType?: string;
  errorMessage?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalViews: number;
  uniqueUsers: number;
  totalAnalyses: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalRevenue: number;
  errorCount: number;
  criticalErrors: number;
  serviceStats: {
    [serviceType: string]: {
      count: number;
      revenue: number;
      errors: number;
    };
  };
}

class ServerMetricsStore {
  private events: MetricEvent[] = [];
  private dailyStatsCache: Map<string, DailyStats> = new Map();
  private maxEvents = 10000; // 최대 이벤트 수

  /**
   * 이벤트 기록
   */
  recordEvent(event: MetricEvent): void {
    // 이벤트 추가
    this.events.push(event);
    
    // 최대 이벤트 수 제한
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // 일별 통계 업데이트
    this.updateDailyStats(event);
  }

  /**
   * 일별 통계 업데이트
   */
  private updateDailyStats(event: MetricEvent): void {
    const today = new Date().toISOString().split('T')[0];
    
    let stats = this.dailyStatsCache.get(today);
    if (!stats) {
      stats = {
        date: today,
        totalViews: 0,
        uniqueUsers: 0,
        totalAnalyses: 0,
        successfulAnalyses: 0,
        failedAnalyses: 0,
        totalPayments: 0,
        successfulPayments: 0,
        failedPayments: 0,
        totalRevenue: 0,
        errorCount: 0,
        criticalErrors: 0,
        serviceStats: {}
      };
    }

    // 이벤트 타입별 통계 업데이트
    switch (event.eventType) {
      case 'page_view':
        stats.totalViews++;
        break;
      case 'analysis_start':
        stats.totalAnalyses++;
        if (event.serviceType) {
          if (!stats.serviceStats[event.serviceType]) {
            stats.serviceStats[event.serviceType] = { count: 0, revenue: 0, errors: 0 };
          }
          stats.serviceStats[event.serviceType].count++;
        }
        break;
      case 'analysis_complete':
        stats.successfulAnalyses++;
        break;
      case 'analysis_error':
        stats.failedAnalyses++;
        stats.errorCount++;
        if (event.severity === 'critical') stats.criticalErrors++;
        if (event.serviceType && stats.serviceStats[event.serviceType]) {
          stats.serviceStats[event.serviceType].errors++;
        }
        break;
      case 'payment_complete':
        stats.successfulPayments++;
        stats.totalRevenue += event.amount || 0;
        if (event.serviceType && stats.serviceStats[event.serviceType]) {
          stats.serviceStats[event.serviceType].revenue += event.amount || 0;
        }
        break;
      case 'payment_error':
        stats.failedPayments++;
        stats.errorCount++;
        break;
    }

    this.dailyStatsCache.set(today, stats);
  }

  /**
   * 이벤트 조회
   */
  getEvents(filters?: {
    eventType?: string;
    serviceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): MetricEvent[] {
    let filteredEvents = [...this.events];

    if (filters?.eventType) {
      filteredEvents = filteredEvents.filter(e => e.eventType === filters.eventType);
    }

    if (filters?.serviceType) {
      filteredEvents = filteredEvents.filter(e => e.serviceType === filters.serviceType);
    }

    if (filters?.startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= filters.endDate!);
    }

    // 최신순 정렬
    filteredEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    if (filters?.limit) {
      filteredEvents = filteredEvents.slice(0, filters.limit);
    }

    return filteredEvents;
  }

  /**
   * 일별 통계 조회
   */
  getDailyStats(startDate?: string, endDate?: string): DailyStats[] {
    let stats = Array.from(this.dailyStatsCache.values());

    if (startDate) {
      stats = stats.filter(s => s.date >= startDate);
    }
    if (endDate) {
      stats = stats.filter(s => s.date <= endDate);
    }

    // 날짜순 정렬
    stats.sort((a, b) => b.date.localeCompare(a.date));

    return stats;
  }

  /**
   * 실시간 통계 집계
   */
  getRealtimeStats(): {
    today: DailyStats | null;
    last7Days: DailyStats[];
    last30Days: DailyStats[];
    totalStats: {
      totalRevenue: number;
      totalOrders: number;
      totalErrors: number;
      conversionRate: number;
    };
  } {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const todayStats = this.dailyStatsCache.get(today) || null;
    const last7Days = this.getDailyStats(sevenDaysAgo).slice(0, 7);
    const last30Days = this.getDailyStats(thirtyDaysAgo).slice(0, 30);

    // 전체 통계 계산
    const totalStats = last30Days.reduce((acc, day) => {
      acc.totalRevenue += day.totalRevenue;
      acc.totalOrders += day.successfulPayments;
      acc.totalErrors += day.errorCount;
      return acc;
    }, {
      totalRevenue: 0,
      totalOrders: 0,
      totalErrors: 0,
      conversionRate: 0
    });

    // 전환율 계산
    if (last30Days.length > 0) {
      const totalAnalyses = last30Days.reduce((sum, day) => sum + day.totalAnalyses, 0);
      const totalPayments = last30Days.reduce((sum, day) => sum + day.successfulPayments, 0);
      totalStats.conversionRate = totalAnalyses > 0 ? Math.round((totalPayments / totalAnalyses) * 100) : 0;
    }

    return {
      today: todayStats,
      last7Days,
      last30Days,
      totalStats
    };
  }

  /**
   * 서비스별 통계
   */
  getServiceStats(serviceType?: string): {
    [service: string]: {
      totalCount: number;
      totalRevenue: number;
      totalErrors: number;
      successRate: number;
    };
  } {
    const last30Days = this.getDailyStats(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

    const serviceStats: any = {};

    last30Days.forEach(day => {
      Object.entries(day.serviceStats || {}).forEach(([service, stats]) => {
        if (!serviceType || service === serviceType) {
          if (!serviceStats[service]) {
            serviceStats[service] = {
              totalCount: 0,
              totalRevenue: 0,
              totalErrors: 0,
              successRate: 0
            };
          }
          serviceStats[service].totalCount += stats.count;
          serviceStats[service].totalRevenue += stats.revenue;
          serviceStats[service].totalErrors += stats.errors;
        }
      });
    });

    // 성공률 계산
    Object.keys(serviceStats).forEach(service => {
      const stats = serviceStats[service];
      stats.successRate = stats.totalCount > 0 
        ? Math.round(((stats.totalCount - stats.totalErrors) / stats.totalCount) * 100)
        : 0;
    });

    return serviceStats;
  }

  /**
   * 오류 통계
   */
  getErrorStats(): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    recentErrors: MetricEvent[];
  } {
    const errors = this.getEvents({
      eventType: 'analysis_error',
      limit: 100
    });

    const stats = {
      total: errors.length,
      critical: errors.filter(e => e.severity === 'critical').length,
      high: errors.filter(e => e.severity === 'high').length,
      medium: errors.filter(e => e.severity === 'medium').length,
      low: errors.filter(e => e.severity === 'low').length,
      recentErrors: errors.slice(0, 10)
    };

    return stats;
  }

  /**
   * 데이터 초기화
   */
  clearAllData(): void {
    this.events = [];
    this.dailyStatsCache.clear();
  }
}

// 싱글톤 인스턴스
export const serverMetricsStore = new ServerMetricsStore();