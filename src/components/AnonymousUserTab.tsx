import { useState, useEffect } from 'react';
import UserIdentificationTool from './UserIdentificationTool';

/**
 * 익명 사용자 관리 탭 컴포넌트
 */
export default function AnonymousUserTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 익명 사용자 통계 조회
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/anonymous/error?type=stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || '통계 조회 실패');
      }
    } catch (err) {
      setError('네트워크 오류: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">익명 사용자 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-red-600">
          <div className="text-2xl mb-2">❌</div>
          <p>오류: {error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">👤 익명 사용자 관리</h2>
            <p className="text-gray-600 mt-2">
              회원가입 없이 결제한 사용자들의 세션 및 오류 추적 관리
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>새로고침</span>
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 익명 세션"
          value={stats?.totalSessions || 0}
          subtitle="전체 익명 사용자 세션 수"
          color="blue"
          icon="👥"
        />
        <StatCard
          title="활성 세션"
          value={stats?.activeSessions || 0}
          subtitle="현재 활동 중인 세션"
          color="green"
          icon="✅"
        />
        <StatCard
          title="결제 완료"
          value={stats?.totalPayments || 0}
          subtitle="익명 사용자 결제 건수"
          color="purple"
          icon="💰"
        />
        <StatCard
          title="오류 발생"
          value={stats?.totalErrors || 0}
          subtitle="익명 사용자 오류 총 건수"
          color="red"
          icon="🚨"
        />
      </div>

      {/* 보상 필요 알림 */}
      {stats?.uncontactedErrors > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                연락 대기 중인 보상 건수: {stats.uncontactedErrors}건
              </h3>
              <p className="text-red-700 mt-1">
                결제 완료 후 서비스 미제공으로 인한 보상이 필요한 익명 사용자가 있습니다.
                빠른 처리가 필요합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 식별 도구 */}
      <UserIdentificationTool />

      {/* 익명 사용자 관리 도구 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">🔧 관리 도구</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 세션 조회 도구 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">세션 조회</h4>
              <SessionLookup />
            </div>
            
            {/* 결제 추적 도구 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">결제 추적</h4>
              <PaymentLookup />
            </div>
          </div>
        </div>
      </div>

      {/* 시스템 구조 설명 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🏗️ 익명 사용자 트래킹 시스템</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🔗</div>
            <h4 className="font-medium text-blue-900">세션 생성</h4>
            <p className="text-sm text-blue-700 mt-2">
              페이지 방문 시 고유 세션 생성<br/>
              디바이스 정보와 함께 추적 시작
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">💳</div>
            <h4 className="font-medium text-green-900">결제 연계</h4>
            <p className="text-sm text-green-700 mt-2">
              결제 정보와 연락처를 세션에 연결<br/>
              보상 처리를 위한 연락 방법 확보
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl mb-2">🚨</div>
            <h4 className="font-medium text-red-900">오류 추적</h4>
            <p className="text-sm text-red-700 mt-2">
              서비스 실패 시 자동 기록<br/>
              보상 필요성 자동 판정 및 연락
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ title, value, subtitle, color, icon }: {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'red';
  icon: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}

// 세션 조회 컴포넌트
function SessionLookup() {
  const [sessionId, setSessionId] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const lookupSession = async () => {
    if (!sessionId.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/anonymous/session?sessionId=${encodeURIComponent(sessionId)}`);
      const result = await response.json();
      
      if (result.success) {
        setSessionData(result.data.session);
      } else {
        setSessionData({ error: result.error });
      }
    } catch (error) {
      setSessionData({ error: '조회 실패: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="세션 ID 입력 (sess_...)"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={lookupSession}
          disabled={loading || !sessionId.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '조회중...' : '조회'}
        </button>
      </div>
      
      {sessionData && (
        <div className="mt-3 p-3 border border-gray-200 rounded bg-gray-50 text-sm">
          {sessionData.error ? (
            <div className="text-red-600">{sessionData.error}</div>
          ) : (
            <div className="space-y-2">
              <div><strong>사용자 ID:</strong> {sessionData.userId}</div>
              <div><strong>생성 시간:</strong> {new Date(sessionData.createdAt).toLocaleString('ko-KR')}</div>
              <div><strong>서비스 이용:</strong> {sessionData.services.length}건</div>
              <div><strong>오류 발생:</strong> {sessionData.errors.length}건</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 결제 추적 컴포넌트
function PaymentLookup() {
  const [orderId, setOrderId] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const lookupPayment = async () => {
    if (!orderId.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/anonymous/payment?orderId=${encodeURIComponent(orderId)}`);
      const result = await response.json();
      
      if (result.success) {
        setPaymentData(result.data);
      } else {
        setPaymentData({ error: result.error });
      }
    } catch (error) {
      setPaymentData({ error: '조회 실패: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="주문 ID 입력"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={lookupPayment}
          disabled={loading || !orderId.trim()}
          className="bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? '조회중...' : '조회'}
        </button>
      </div>
      
      {paymentData && (
        <div className="mt-3 p-3 border border-gray-200 rounded bg-gray-50 text-sm">
          {paymentData.error ? (
            <div className="text-red-600">{paymentData.error}</div>
          ) : (
            <div className="space-y-2">
              <div><strong>결제 상태:</strong> {paymentData.payment?.paymentStatus}</div>
              <div><strong>서비스:</strong> {paymentData.payment?.serviceType}</div>
              <div><strong>금액:</strong> {paymentData.payment?.amount?.toLocaleString()}원</div>
              <div><strong>연락처:</strong> {paymentData.payment?.contactInfo?.email || paymentData.payment?.contactInfo?.phone || 'N/A'}</div>
              <div><strong>오류 발생:</strong> {paymentData.session?.errors?.length || 0}건</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}