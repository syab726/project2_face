'use client';

import { useState, useEffect } from 'react';

interface SimpleStats {
  todayVisitors: number;
  todayPayments: number;
  totalErrors: number;
  activeUsers: number;
  recentErrors: Array<{
    id: string;
    message: string;
    time: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export default function SimpleAdminStats() {
  const [stats, setStats] = useState<SimpleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/simple-stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30초마다 새로고침
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">통계 로딩 중...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">통계 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">📊 실시간 통계</h2>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {lastUpdate}
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">오늘 방문자</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{stats.todayVisitors}</div>
          <div className="text-xs text-gray-400 mt-1">명</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">오늘 결제</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{stats.todayPayments}</div>
          <div className="text-xs text-gray-400 mt-1">건</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">오류 수</div>
          <div className="text-2xl font-bold text-red-600 mt-2">{stats.totalErrors}</div>
          <div className="text-xs text-gray-400 mt-1">개</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">활성 사용자</div>
          <div className="text-2xl font-bold text-purple-600 mt-2">{stats.activeUsers}</div>
          <div className="text-xs text-gray-400 mt-1">명</div>
        </div>
      </div>

      {/* 새로고침 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 새로고침
        </button>
      </div>
    </div>
  );
}