'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}

export default function ErrorTrackingTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedErrorType, setSelectedErrorType] = useState('ai_timeout');

  const errorTypes = [
    { value: 'ai_timeout', label: '🤖 AI 분석 타임아웃', description: 'Gemini API 응답 지연 시뮬레이션' },
    { value: 'payment_failure', label: '💳 결제 실패', description: 'KG이니시스 결제 오류 시뮬레이션' },
    { value: 'image_processing_error', label: '🖼️ 이미지 처리 오류', description: '얼굴 인식 실패 시뮬레이션' },
    { value: 'system_overload', label: '⚡ 시스템 과부하', description: '동시 요청 수 초과 시뮬레이션' },
    { value: 'database_connection', label: '💾 DB 연결 오류', description: '데이터베이스 연결 실패 시뮬레이션' },
    { value: 'validation_error', label: '✅ 입력 검증 오류', description: '필수 필드 누락 시뮬레이션' }
  ];

  const simulateError = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test/simulate-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorType: selectedErrorType,
          userEmail: `test-user-${Date.now()}@example.com`,
          orderId: `TEST-${Date.now()}`
        })
      });

      const result = await response.json();
      const testResult: TestResult = {
        ...result,
        timestamp: new Date().toLocaleString('ko-KR')
      };

      setResults(prev => [testResult, ...prev]);
    } catch (error) {
      setResults(prev => [{
        success: false,
        message: '테스트 API 호출 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류'),
        timestamp: new Date().toLocaleString('ko-KR')
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const checkAdminDashboard = () => {
    window.open('/admin', '_blank');
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      margin: '20px'
    }}>
      <h2 style={{ 
        color: '#e74c3c', 
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '1.5em'
      }}>
        🧪 오류 추적 시스템 테스트
      </h2>

      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '25px'
      }}>
        <h4 style={{ color: '#856404', margin: '0 0 10px' }}>⚠️ 테스트 안내</h4>
        <p style={{ color: '#856404', margin: 0, lineHeight: '1.5' }}>
          이 도구는 의도적으로 다양한 오류를 발생시켜 오류 추적 시스템이 
          제대로 작동하는지 확인합니다. 오류 발생 후 Admin 대시보드에서 
          실시간으로 오류가 기록되는지 확인하세요.
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '10px', 
          fontWeight: 'bold',
          color: '#2c3e50'
        }}>
          시뮬레이션할 오류 타입 선택:
        </label>
        <select
          value={selectedErrorType}
          onChange={(e) => setSelectedErrorType(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1em',
            background: '#fff'
          }}
        >
          {errorTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label} - {type.description}
            </option>
          ))}
        </select>
      </div>

      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={simulateError}
          disabled={isLoading}
          style={{
            background: isLoading ? '#95a5a6' : 'linear-gradient(45deg, #e74c3c, #c0392b)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            minWidth: '150px'
          }}
        >
          {isLoading ? '⏳ 오류 발생 중...' : '💥 오류 발생시키기'}
        </button>

        <button
          onClick={checkAdminDashboard}
          style={{
            background: 'linear-gradient(45deg, #3498db, #2980b9)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📊 Admin 대시보드 확인
        </button>

        <button
          onClick={clearResults}
          style={{
            background: 'linear-gradient(45deg, #95a5a6, #7f8c8d)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🗑️ 결과 초기화
        </button>
      </div>

      {/* 테스트 결과 표시 */}
      {results.length > 0 && (
        <div>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>📋 테스트 결과</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  background: result.success ? '#d4edda' : '#f8d7da',
                  border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '10px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    color: result.success ? '#155724' : '#721c24',
                    fontWeight: 'bold'
                  }}>
                    {result.success ? '✅ 성공' : '❌ 실패'}
                  </span>
                  <span style={{
                    color: '#6c757d',
                    fontSize: '0.9em'
                  }}>
                    {result.timestamp}
                  </span>
                </div>
                <p style={{
                  color: result.success ? '#155724' : '#721c24',
                  margin: '0 0 10px',
                  lineHeight: '1.4'
                }}>
                  {result.message}
                </p>
                {result.data && (
                  <details style={{ marginTop: '10px' }}>
                    <summary style={{
                      color: result.success ? '#155724' : '#721c24',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}>
                      상세 정보 보기
                    </summary>
                    <pre style={{
                      background: result.success ? '#c3e6cb' : '#f5c6cb',
                      padding: '10px',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      marginTop: '8px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: '#e8f4fd',
        border: '1px solid #bee5eb',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '25px'
      }}>
        <h4 style={{ color: '#0c5460', margin: '0 0 10px' }}>🔍 검증 방법</h4>
        <ol style={{ color: '#0c5460', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>위에서 오류 타입을 선택하고 "오류 발생시키기" 버튼 클릭</li>
          <li>"Admin 대시보드 확인" 버튼을 클릭하여 새 탭에서 관리자 패널 열기</li>
          <li>Admin 패널에서 로그인 (비밀번호: admin123!@#)</li>
          <li>"서비스 오류" 탭에서 방금 발생시킨 오류가 실시간으로 표시되는지 확인</li>
          <li>"통계 및 그래프" 탭에서 활성 오류 수가 증가했는지 확인</li>
        </ol>
      </div>
    </div>
  );
}