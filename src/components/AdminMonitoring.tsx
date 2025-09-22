'use client';

import { useState, useEffect } from 'react';

interface SystemMetrics {
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
  process: {
    pid: number;
    uptime: number;
    memory: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
    cpu: number;
  };
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage' | 'custom';
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  responseTime: number;
  details?: Record<string, any>;
  error?: string;
}

interface Alert {
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

interface DashboardData {
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
}

interface MonitoringConfig {
  thresholds: Record<string, number>;
  isCollecting: boolean;
  metricsCount: number;
  alertsCount: number;
  healthChecksCount: number;
}

export default function AdminMonitoring() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [config, setConfig] = useState<MonitoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'metrics' | 'alerts' | 'health' | 'config'>('dashboard');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    loadDashboardData();
    loadConfiguration();
    
    // 30초마다 자동 새로고침
    const interval = setInterval(() => {
      if (activeTab === 'dashboard') {
        loadDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/monitoring?type=dashboard');
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/admin/monitoring?type=config');
      const result = await response.json();
      
      if (result.success) {
        setConfig(result.data);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const loadAlerts = async (resolved?: boolean) => {
    try {
      const params = resolved !== undefined ? `&resolved=${resolved}` : '';
      const response = await fetch(`/api/admin/monitoring?type=alerts${params}`);
      const result = await response.json();
      
      if (result.success) {
        setAlerts(result.data);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadMetrics = async (category?: string) => {
    try {
      const params = category ? `&category=${category}` : '';
      const response = await fetch(`/api/admin/monitoring?type=metrics${params}`);
      const result = await response.json();
      
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const startCollection = async () => {
    setOperationLoading(true);
    try {
      const response = await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'start_collection', interval: 60000 })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('모니터링 수집이 시작되었습니다.');
        loadConfiguration();
      } else {
        alert(`시작 실패: ${result.error}`);
      }
    } catch (error) {
      alert('모니터링 시작 중 오류가 발생했습니다.');
      console.error('Start collection error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const stopCollection = async () => {
    setOperationLoading(true);
    try {
      const response = await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'stop_collection' })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('모니터링 수집이 중지되었습니다.');
        loadConfiguration();
      } else {
        alert(`중지 실패: ${result.error}`);
      }
    } catch (error) {
      alert('모니터링 중지 중 오류가 발생했습니다.');
      console.error('Stop collection error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    setOperationLoading(true);
    try {
      const response = await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'resolve_alert', alertId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('알림이 해결되었습니다.');
        loadAlerts();
        loadDashboardData();
      } else {
        alert(`해결 실패: ${result.error}`);
      }
    } catch (error) {
      alert('알림 해결 중 오류가 발생했습니다.');
      console.error('Resolve alert error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}일 ${hours}시간`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertLevelColor = (level: string): string => {
    switch (level) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (usage: number): string => {
    if (usage >= 90) return 'text-red-600';
    if (usage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">시스템 모니터링</h2>
        
        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'dashboard', label: '대시보드', icon: '📊' },
              { key: 'metrics', label: '메트릭', icon: '📈' },
              { key: 'alerts', label: '알림', icon: '🚨' },
              { key: 'health', label: '상태 확인', icon: '💚' },
              { key: 'config', label: '설정', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 대시보드 탭 */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="space-y-6">
            {/* 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🖥️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">CPU 사용률</div>
                    <div className={`text-2xl font-bold ${getUsageColor(dashboardData.systemMetrics.cpu.usage)}`}>
                      {dashboardData.systemMetrics.cpu.usage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">💾</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">메모리 사용률</div>
                    <div className={`text-2xl font-bold ${getUsageColor(dashboardData.systemMetrics.memory.usagePercent)}`}>
                      {dashboardData.systemMetrics.memory.usagePercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-sm">🚨</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">활성 알림</div>
                    <div className="text-2xl font-bold text-gray-700">
                      {dashboardData.summary.criticalAlerts}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm">⏱️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">가동 시간</div>
                    <div className="text-2xl font-bold text-gray-700">
                      {formatUptime(dashboardData.systemMetrics.process.uptime)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 시스템 메트릭 상세 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 리소스</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>CPU 사용률</span>
                      <span className={getUsageColor(dashboardData.systemMetrics.cpu.usage)}>
                        {dashboardData.systemMetrics.cpu.usage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          dashboardData.systemMetrics.cpu.usage >= 80 ? 'bg-red-500' :
                          dashboardData.systemMetrics.cpu.usage >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{width: `${Math.min(dashboardData.systemMetrics.cpu.usage, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>메모리 사용률</span>
                      <span className={getUsageColor(dashboardData.systemMetrics.memory.usagePercent)}>
                        {formatBytes(dashboardData.systemMetrics.memory.used)} / {formatBytes(dashboardData.systemMetrics.memory.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          dashboardData.systemMetrics.memory.usagePercent >= 80 ? 'bg-red-500' :
                          dashboardData.systemMetrics.memory.usagePercent >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{width: `${Math.min(dashboardData.systemMetrics.memory.usagePercent, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>디스크 사용률</span>
                      <span className={getUsageColor(dashboardData.systemMetrics.disk.usagePercent)}>
                        {formatBytes(dashboardData.systemMetrics.disk.used)} / {formatBytes(dashboardData.systemMetrics.disk.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          dashboardData.systemMetrics.disk.usagePercent >= 80 ? 'bg-red-500' :
                          dashboardData.systemMetrics.disk.usagePercent >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{width: `${Math.min(dashboardData.systemMetrics.disk.usagePercent, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">헬스 체크</h3>
                {dashboardData.healthChecks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">등록된 헬스 체크가 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.healthChecks.map((health, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{health.service}</div>
                          <div className="text-sm text-gray-500">
                            응답시간: {health.responseTime.toFixed(0)}ms
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(health.status)}`}>
                          {health.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 최근 알림 */}
            {dashboardData.activeAlerts.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">최근 알림</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {dashboardData.activeAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertLevelColor(alert.level)}`}>
                              {alert.level}
                            </span>
                            <span className="font-medium">{alert.title}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(alert.timestamp).toLocaleString('ko-KR')}
                          </div>
                        </div>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          disabled={operationLoading}
                          className="ml-4 text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                        >
                          해결
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 설정 탭 */}
        {activeTab === 'config' && config && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-900">모니터링 설정</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">수집 상태</h4>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      config.isCollecting ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {config.isCollecting ? '수집 중' : '중지됨'}
                    </span>
                    {config.isCollecting ? (
                      <button
                        onClick={stopCollection}
                        disabled={operationLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        수집 중지
                      </button>
                    ) : (
                      <button
                        onClick={startCollection}
                        disabled={operationLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        수집 시작
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>메트릭 개수:</strong> {config.metricsCount.toLocaleString()}</p>
                    <p><strong>알림 개수:</strong> {config.alertsCount.toLocaleString()}</p>
                    <p><strong>헬스체크 개수:</strong> {config.healthChecksCount}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">알림 임계값</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>CPU 사용률:</strong> {config.thresholds.cpu_usage}%</p>
                    <p><strong>메모리 사용률:</strong> {config.thresholds.memory_usage}%</p>
                    <p><strong>디스크 사용률:</strong> {config.thresholds.disk_usage}%</p>
                    <p><strong>응답 시간:</strong> {config.thresholds.response_time}ms</p>
                    <p><strong>에러율:</strong> {config.thresholds.error_rate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {operationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>작업 중...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}