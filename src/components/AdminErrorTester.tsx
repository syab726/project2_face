'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  message: string;
  errorType?: string;
  critical?: boolean;
}

const AdminErrorTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const errorTypes = [
    { value: 'analysis-failed', label: '분석 실패', critical: true },
    { value: 'payment-failed', label: '결제 실패', critical: true },
    { value: 'network-error', label: '네트워크 오류', critical: false },
    { value: 'server-error', label: '서버 오류', critical: true },
    { value: 'ai-service-error', label: 'AI 서비스 오류', critical: true },
    { value: 'custom', label: '커스텀 오류', critical: false }
  ];

  const triggerTestError = async (errorType: string, isCritical: boolean) => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test/trigger-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorType,
          isCritical
        }),
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: '테스트 요청 실패: ' + (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">오류 트래킹 테스트</h3>
      <p className="text-sm text-gray-600 mb-4">
        아래 버튼을 클릭하여 다양한 오류 유형을 시뮬레이션하고 추적 시스템이 제대로 작동하는지 확인하세요.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {errorTypes.map((errorType) => (
          <button
            key={errorType.value}
            onClick={() => triggerTestError(errorType.value, errorType.critical)}
            disabled={isLoading}
            className={`
              p-3 rounded-md text-sm font-medium transition-colors
              ${errorType.critical 
                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' 
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
            `}
          >
            {errorType.label}
            {errorType.critical && <span className="ml-1 text-xs">(중요)</span>}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500 mt-2">오류 시뮬레이션 중...</p>
        </div>
      )}

      {testResult && (
        <div className={`
          p-4 rounded-md border
          ${testResult.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `}>
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {testResult.success ? '✅ 성공' : '❌ 실패'}
            </span>
            {testResult.errorType && (
              <span className="text-xs bg-white px-2 py-1 rounded">
                {testResult.errorType}
              </span>
            )}
          </div>
          <p className="text-sm mt-2">{testResult.message}</p>
          {testResult.critical !== undefined && (
            <p className="text-xs mt-1">
              중요도: {testResult.critical ? '높음' : '낮음'}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>💡 <strong>사용법:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>버튼 클릭 → 오류 시뮬레이션 → 대시보드에서 오류 카운트 증가 확인</li>
          <li>중요 오류는 빨간색, 일반 오류는 노란색으로 표시됩니다</li>
          <li>페이지를 새로고침하여 실시간 통계 업데이트를 확인하세요</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminErrorTester;