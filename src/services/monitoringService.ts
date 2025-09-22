import os from 'os';
import fs from 'fs';
import { performance } from 'perf_hooks';
import loggingService from './loggingService';

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
    heapUsed: number;
    heapTotal: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  network: {
    interfaces: NetworkInterface[];
  };
  process: {
    pid: number;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: number;
  };
}

export interface NetworkInterface {
  name: string;
  address: string;
  family: string;
  internal: boolean;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage' | 'custom';
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  responseTime: number;
  details?: Record<string, any>;
  error?: string;
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  resolved: boolean;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alerts: Alert[] = [];
  private isCollecting: boolean = false;
  private collectionInterval: NodeJS.Timeout | null = null;
  private thresholds: Record<string, number> = {
    cpu_usage: 80, // CPU 사용률 80% 이상
    memory_usage: 85, // 메모리 사용률 85% 이상
    disk_usage: 90, // 디스크 사용률 90% 이상
    response_time: 5000, // 응답시간 5초 이상
    error_rate: 5 // 에러율 5% 이상
  };

  constructor() {
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    // 환경변수에서 임계값 설정 로드
    this.thresholds = {
      cpu_usage: parseInt(process.env.MONITOR_CPU_THRESHOLD || '80'),
      memory_usage: parseInt(process.env.MONITOR_MEMORY_THRESHOLD || '85'),
      disk_usage: parseInt(process.env.MONITOR_DISK_THRESHOLD || '90'),
      response_time: parseInt(process.env.MONITOR_RESPONSE_THRESHOLD || '5000'),
      error_rate: parseInt(process.env.MONITOR_ERROR_THRESHOLD || '5')
    };
  }

  // 시스템 메트릭 수집
  async collectSystemMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date().toISOString();

    // CPU 정보
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    
    // 메모리 정보
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    const processMemory = process.memoryUsage();

    // 디스크 정보 (현재 디렉토리 기준)
    let diskStats = { total: 0, used: 0, free: 0, usagePercent: 0 };
    try {
      const stats = fs.statSync(process.cwd());
      // 실제 디스크 사용량은 별도 라이브러리나 시스템 명령어 필요
      // 여기서는 기본값 설정
      diskStats = {
        total: 100 * 1024 * 1024 * 1024, // 100GB 가정
        used: 50 * 1024 * 1024 * 1024,  // 50GB 사용 가정
        free: 50 * 1024 * 1024 * 1024,  // 50GB 여유 가정
        usagePercent: 50
      };
    } catch (error) {
      // 디스크 정보 수집 실패 시 기본값
    }

    // 네트워크 인터페이스
    const networkInterfaces = os.networkInterfaces();
    const interfaces: NetworkInterface[] = [];
    
    Object.entries(networkInterfaces).forEach(([name, addresses]) => {
      if (addresses) {
        addresses.forEach(addr => {
          interfaces.push({
            name,
            address: addr.address,
            family: addr.family,
            internal: addr.internal
          });
        });
      }
    });

    const metrics: SystemMetrics = {
      timestamp,
      cpu: {
        usage: this.getCPUUsage(),
        loadAverage: loadAvg,
        cores: cpus.length
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: memoryUsage,
        heapUsed: processMemory.heapUsed,
        heapTotal: processMemory.heapTotal
      },
      disk: diskStats,
      network: {
        interfaces
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: processMemory,
        cpu: this.getProcessCPUUsage()
      }
    };

    // 임계값 확인 및 알림 생성
    this.checkThresholds(metrics);

    return metrics;
  }

  private getCPUUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    return 100 - Math.floor((totalIdle / totalTick) * 100);
  }

  private getProcessCPUUsage(): number {
    const usage = process.cpuUsage();
    return (usage.user + usage.system) / 1000000; // 마이크로초를 초로 변환
  }

  private checkThresholds(metrics: SystemMetrics): void {
    // CPU 사용률 체크
    if (metrics.cpu.usage > this.thresholds.cpu_usage) {
      this.createAlert('warning', 'High CPU Usage', 
        `CPU usage is ${metrics.cpu.usage.toFixed(1)}%`, 'system_monitor', {
          current: metrics.cpu.usage,
          threshold: this.thresholds.cpu_usage
        });
    }

    // 메모리 사용률 체크
    if (metrics.memory.usagePercent > this.thresholds.memory_usage) {
      this.createAlert('warning', 'High Memory Usage',
        `Memory usage is ${metrics.memory.usagePercent.toFixed(1)}%`, 'system_monitor', {
          current: metrics.memory.usagePercent,
          threshold: this.thresholds.memory_usage
        });
    }

    // 디스크 사용률 체크
    if (metrics.disk.usagePercent > this.thresholds.disk_usage) {
      this.createAlert('error', 'High Disk Usage',
        `Disk usage is ${metrics.disk.usagePercent.toFixed(1)}%`, 'system_monitor', {
          current: metrics.disk.usagePercent,
          threshold: this.thresholds.disk_usage
        });
    }
  }

  // 성능 메트릭 기록
  recordMetric(name: string, value: number, unit: string, category: PerformanceMetric['category'] = 'custom'): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      category
    };

    this.metrics.push(metric);

    // 최대 1000개까지만 보관
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // 임계값 체크
    if (name === 'response_time' && value > this.thresholds.response_time) {
      this.createAlert('warning', 'Slow Response Time',
        `Response time is ${value}ms`, 'performance_monitor', {
          current: value,
          threshold: this.thresholds.response_time
        });
    }
  }

  // API 응답 시간 측정
  measureApiResponse<T>(apiCall: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    
    return apiCall().then(result => {
      const duration = performance.now() - start;
      this.recordMetric('api_response_time', duration, 'ms', 'response_time');
      return { result, duration };
    }).catch(error => {
      const duration = performance.now() - start;
      this.recordMetric('api_response_time', duration, 'ms', 'response_time');
      this.recordMetric('api_error', 1, 'count', 'error_rate');
      throw error;
    });
  }

  // 헬스체크 등록
  registerHealthCheck(service: string, checkFunction: () => Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details?: any }>): void {
    setInterval(async () => {
      const startTime = performance.now();
      
      try {
        const result = await checkFunction();
        const responseTime = performance.now() - startTime;
        
        const healthCheck: HealthCheck = {
          service,
          status: result.status,
          lastCheck: new Date().toISOString(),
          responseTime,
          details: result.details
        };

        this.healthChecks.set(service, healthCheck);

        // 상태가 좋지 않으면 알림 생성
        if (result.status !== 'healthy') {
          this.createAlert(
            result.status === 'degraded' ? 'warning' : 'error',
            `Service ${service} is ${result.status}`,
            `Health check failed for ${service}`,
            'health_monitor',
            { service, status: result.status, responseTime }
          );
        }
      } catch (error) {
        const responseTime = performance.now() - startTime;
        const healthCheck: HealthCheck = {
          service,
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        };

        this.healthChecks.set(service, healthCheck);

        this.createAlert('error', `Service ${service} is unhealthy`,
          `Health check failed: ${healthCheck.error}`, 'health_monitor',
          { service, error: healthCheck.error, responseTime });
      }
    }, 30000); // 30초마다 체크
  }

  // 알림 생성
  createAlert(level: Alert['level'], title: string, message: string, source: string, metadata?: Record<string, any>): void {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level,
      title,
      message,
      timestamp: new Date().toISOString(),
      source,
      resolved: false,
      metadata
    };

    this.alerts.push(alert);

    // 최대 500개까지만 보관
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }

    // 로깅
    const logLevel = level === 'critical' || level === 'error' ? 'error' : 
                    level === 'warning' ? 'warn' : 'info';
    
    loggingService[logLevel]('MONITORING', `${title}: ${message}`, {
      metadata: {
        alertId: alert.id,
        source,
        level,
        ...(metadata || {})
      }
    });
  }

  // 알림 해결
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      
      loggingService.info('MONITORING', `Alert resolved: ${alert.title}`, {
        metadata: { alertId, resolvedAt: alert.resolvedAt }
      });
      
      return true;
    }
    
    return false;
  }

  // 데이터 수집 시작
  startCollection(intervalMs: number = 60000): void {
    if (this.isCollecting) {
      return;
    }

    this.isCollecting = true;
    this.collectionInterval = setInterval(async () => {
      try {
        await this.collectSystemMetrics();
      } catch (error) {
        loggingService.error('MONITORING', 'Failed to collect system metrics', {
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }, intervalMs);

    loggingService.info('MONITORING', 'Started system metrics collection', {
      metadata: { intervalMs }
    });
  }

  // 데이터 수집 중지
  stopCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    
    this.isCollecting = false;
    loggingService.info('MONITORING', 'Stopped system metrics collection');
  }

  // 메트릭 조회
  getMetrics(category?: PerformanceMetric['category'], limit: number = 100): PerformanceMetric[] {
    let filteredMetrics = this.metrics;
    
    if (category) {
      filteredMetrics = this.metrics.filter(m => m.category === category);
    }
    
    return filteredMetrics.slice(-limit).reverse();
  }

  // 헬스체크 상태 조회
  getHealthStatus(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  // 알림 조회
  getAlerts(resolved?: boolean, limit: number = 50): Alert[] {
    let filteredAlerts = this.alerts;
    
    if (typeof resolved === 'boolean') {
      filteredAlerts = this.alerts.filter(a => a.resolved === resolved);
    }
    
    return filteredAlerts.slice(-limit).reverse();
  }

  // 대시보드 데이터 조회
  async getDashboardData(): Promise<{
    systemMetrics: SystemMetrics;
    recentMetrics: PerformanceMetric[];
    healthChecks: HealthCheck[];
    activeAlerts: Alert[];
    summary: {
      totalAlerts: number;
      criticalAlerts: number;
      healthyServices: number;
      totalServices: number;
    };
  }> {
    const systemMetrics = await this.collectSystemMetrics();
    const recentMetrics = this.getMetrics(undefined, 20);
    const healthChecks = this.getHealthStatus();
    const activeAlerts = this.getAlerts(false);

    const summary = {
      totalAlerts: this.alerts.length,
      criticalAlerts: this.alerts.filter(a => !a.resolved && (a.level === 'critical' || a.level === 'error')).length,
      healthyServices: healthChecks.filter(h => h.status === 'healthy').length,
      totalServices: healthChecks.length
    };

    return {
      systemMetrics,
      recentMetrics,
      healthChecks,
      activeAlerts,
      summary
    };
  }

  // 임계값 업데이트
  updateThresholds(newThresholds: Partial<Record<string, number>>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds as Record<string, number> };
    loggingService.info('MONITORING', 'Monitoring thresholds updated', {
      metadata: { newThresholds: this.thresholds }
    });
  }

  // 설정 정보 조회
  getConfiguration(): {
    thresholds: Record<string, number>;
    isCollecting: boolean;
    metricsCount: number;
    alertsCount: number;
    healthChecksCount: number;
  } {
    return {
      thresholds: { ...this.thresholds },
      isCollecting: this.isCollecting,
      metricsCount: this.metrics.length,
      alertsCount: this.alerts.length,
      healthChecksCount: this.healthChecks.size
    };
  }
}

// 싱글톤 인스턴스 생성
const monitoringService = new MonitoringService();

export default monitoringService;