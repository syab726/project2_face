'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import AdminStats from '@/components/AdminStats';
import AdminAnalytics from '@/components/AdminAnalytics';
import AdminMonitoring from '@/components/AdminMonitoring';
import AdminBackup from '@/components/AdminBackup';
import {
  DashboardData,
  ServiceError,
  RefundRequestData,
  AdminAction
} from '@/types/admin';

export default function SecretAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'errors' | 'stats' | 'analytics' | 'monitoring' | 'backup'>('overview');

  // 페이지 로드 시 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedSessionId = localStorage.getItem('admin_session_id');
        if (savedSessionId) {
          // 개발 환경에서는 세션이 있으면 자동 로그인
          setIsAuthenticated(true);
          setSessionId(savedSessionId);
          await loadDashboardData();
        }
      } catch (err) {
        console.error('세션 확인 오류:', err);
        localStorage.removeItem('admin_session_id');
      }
    };
    
    checkSession();
  }, []);

  // 실시간 데이터 새로고침 (30초마다)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      console.log('🔄 자동 새로고침 중...');
      await loadDashboardData();
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // 대시보드 데이터 로드
  const loadDashboardData = async () => {
    try {
      console.log('🔄 대시보드 데이터 로드 시작...');
      
      // API를 통해 대시보드 데이터 조회
      const response = await fetch('/api/admin/dashboard', {
        method: 'POST', // 개발 전용 - 세션 검증 우회
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 대시보드 데이터 로드 성공:', result.data);
        setDashboardData(result.data);
      } else {
        throw new Error(result.error || '대시보드 데이터 조회 실패');
      }
    } catch (err) {
      console.error('❌ 대시보드 데이터 로드 오류:', err);
      setError('대시보드 데이터를 불러올 수 없습니다: ' + (err instanceof Error ? err.message : '알 수 없는 오류'));
    }
  };

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 개발 환경에서는 간단히 비밀번호만 확인
      if (password === 'admin123!@#') {
        const mockSessionId = 'mock-session-' + Date.now();
        setIsAuthenticated(true);
        setSessionId(mockSessionId);
        localStorage.setItem('admin_session_id', mockSessionId);
        await loadDashboardData();
      } else {
        setError('잘못된 비밀번호입니다.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('admin_session_id');
    setIsAuthenticated(false);
    setSessionId('');
    setDashboardData(null);
  };

  // 관리자 액션 실행
  const performAction = async (action: AdminAction) => {
    try {
      // 개발 환경에서는 간단히 로컬 상태만 업데이트
      alert('액션이 처리되었습니다: ' + action.type);
      await loadDashboardData(); // 데이터 새로고침
    } catch (err) {
      console.error('액션 처리 오류:', err);
      alert('액션 처리 중 오류가 발생했습니다.');
    }
  };

  // 인증되지 않은 경우 로그인 폼 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">관리자 인증</h1>
            <p className="text-gray-600 mt-2">관리자 비밀번호를 입력하세요</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="password"
                placeholder="관리자 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white p-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '인증 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            이 페이지는 승인된 관리자만 접근할 수 있습니다.
          </div>
        </div>
      </div>
    );
  }

  // 인증된 경우 대시보드 표시
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">관</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
              </span>
              <button
                onClick={() => loadDashboardData()}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                🔄 새로고침
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', name: '대시보드 개요', icon: '📊' },
              { id: 'errors', name: '서비스 오류', icon: '🚨' },
              { id: 'stats', name: '통계 및 그래프', icon: '📈' },
              { id: 'analytics', name: '사용자 분석', icon: '👥' },
              { id: 'monitoring', name: '시스템 모니터링', icon: '🖥️' },
              { id: 'backup', name: '백업 관리', icon: '💾' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardData && (
          <>
            {/* 대시보드 개요 */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 통계 카드들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="총 주문"
                    value={dashboardData.stats.totalOrders.toLocaleString()}
                    subtitle="전체 주문 수"
                    color="blue"
                  />
                  <StatCard
                    title="총 매출"
                    value={`${(dashboardData.stats.totalRevenue / 10000).toFixed(0)}만원`}
                    subtitle={`오늘: ${(dashboardData.stats.todayRevenue / 10000).toFixed(0)}만원`}
                    color="green"
                  />
                  <StatCard
                    title="결제 성공률"
                    value={`${dashboardData.stats.conversionRate}%`}
                    subtitle={`성공: ${dashboardData.stats.successfulPayments}`}
                    color="purple"
                  />
                  <StatCard
                    title="활성 오류"
                    value={dashboardData.stats.activeErrors}
                    subtitle="미해결 오류"
                    color="red"
                  />
                </div>

                {/* 최근 활동 */}
                <div className="grid grid-cols-1 gap-6">
                  <RecentErrorsWidget errors={dashboardData.recentErrors} onAction={performAction} />
                </div>
              </div>
            )}

            {/* 서비스 오류 탭 */}
            {activeTab === 'errors' && (
              <ServiceErrorsTab errors={dashboardData.recentErrors} onAction={performAction} />
            )}

            {/* 통계 및 그래프 탭 */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div style={{ 
                  background: '#fff', 
                  borderRadius: '12px', 
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ 
                    fontSize: '1.5em', 
                    marginBottom: '10px', 
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    📈 비즈니스 통계 대시보드
                    <span style={{ 
                      fontSize: '0.6em', 
                      background: '#4caf50', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '12px' 
                    }}>
                      실시간
                    </span>
                  </h2>
                  <p style={{ color: '#666', marginBottom: '20px' }}>
                    주문수, 매출, 결제 성공률, 활성 오류를 일별/주별/월별로 분석할 수 있습니다.
                  </p>
                  <AdminStats />
                </div>
              </div>
            )}

            {/* 사용자 분석 탭 */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div style={{ 
                  background: '#fff', 
                  borderRadius: '12px', 
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ 
                    fontSize: '1.5em', 
                    marginBottom: '10px', 
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    👥 사용자 분석 대시보드
                    <span style={{ 
                      fontSize: '0.6em', 
                      background: '#2196f3', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '12px' 
                    }}>
                      NEW
                    </span>
                  </h2>
                  <p style={{ color: '#666', marginBottom: '20px' }}>
                    MAU/DAU/WAU 지표와 메뉴별 사용량을 실시간으로 분석할 수 있습니다.
                  </p>
                  <AdminAnalytics />
                </div>
              </div>
            )}

            {/* 시스템 모니터링 탭 */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <AdminMonitoring />
              </div>
            )}

            {/* 백업 관리 탭 */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <AdminBackup />
              </div>
            )}

          </>
        )}
      </main>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ title, value, subtitle, color }: {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600', 
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-4`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}

// 최근 오류 위젯
function RecentErrorsWidget({ errors, onAction }: {
  errors: ServiceError[];
  onAction: (action: AdminAction) => void;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">최근 서비스 오류</h3>
      <div className="space-y-4">
        {errors.slice(0, 3).map((error) => (
          <div key={error.id} className="border-l-4 border-red-400 pl-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900">{error.title}</p>
                <p className="text-sm text-gray-600">{error.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(error.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              {error.status === 'new' && (
                <button
                  onClick={() => onAction({ type: 'RESOLVE_ERROR', errorId: error.id })}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                >
                  해결
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// 서비스 오류 탭
function ServiceErrorsTab({ errors, onAction }: {
  errors: ServiceError[];
  onAction: (action: AdminAction) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">서비스 오류 관리</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {errors.map((error) => (
            <div key={error.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{error.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    error.status === 'new' ? 'bg-red-100 text-red-800' :
                    error.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {error.status}
                  </span>
                </div>
                {error.status !== 'resolved' && (
                  <button
                    onClick={() => onAction({ type: 'RESOLVE_ERROR', errorId: error.id })}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    해결 표시
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-2">{error.message}</p>
              <div className="text-sm text-gray-500">
                <p>사용자: {error.userEmail}</p>
                <p>주문: {error.orderId}</p>
                <p>발생시간: {new Date(error.createdAt).toLocaleString('ko-KR')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

