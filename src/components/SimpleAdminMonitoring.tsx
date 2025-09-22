'use client';

import { useState, useEffect } from 'react';

interface MonitoringData {
  success: boolean;
  data?: {
    systemMetrics: {
      timestamp: string;
      cpu: { usage: number };
      memory: { usagePercent: number };
      disk: { usagePercent: number };
      process: { uptime: number };
    };
    summary: {
      totalAlerts: number;
      criticalAlerts: number;
      totalErrors: number;
    };
    activeAlerts: Array<{
      id: string;
      type: string;
      severity: string;
      message: string;
      timestamp: string;
    }>;
  };
}

export default function SimpleAdminMonitoring() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/monitoring');
      const result = await response.json();
      
      setData(result);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // 15초마다 새로고침
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">모니터링 데이터 로딩 중...</div>
      </div>
    );
  }

  if (!data || !data.success || !data.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">모니터링 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">🖥️ 시스템 모니터링</h2>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {lastUpdate}
        </div>
      </div>

      {/* 시스템 상태 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">활성 알림</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{data.data.summary.totalAlerts}</div>
          <div className="text-xs text-gray-400 mt-1">건</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">CPU 사용률</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{data.data.systemMetrics.cpu.usage}</div>
          <div className="text-xs text-gray-400 mt-1">%</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">메모리 사용률</div>
          <div className="text-2xl font-bold text-orange-600 mt-2">{Math.round(data.data.systemMetrics.memory.usagePercent)}</div>
          <div className="text-xs text-gray-400 mt-1">%</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">서버 상태</div>
          <div className={`text-2xl font-bold mt-2 ${
            data.data.summary.criticalAlerts === 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {data.data.summary.criticalAlerts === 0 ? '정상' : '불안정'}
          </div>
          <div className="text-xs text-gray-400 mt-1">업타임: {Math.round(data.data.systemMetrics.process.uptime / 3600)}시간</div>
        </div>
      </div>

      {/* 새로고침 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 새로고침
        </button>
      </div>
    </div>
  );
}