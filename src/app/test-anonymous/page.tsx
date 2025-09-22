'use client';

import { useState } from 'react';
import { AnonymousUserHelper } from '@/utils/anonymousUserHelper';

/**
 * 익명 사용자 기능 테스트 페이지
 */
export default function TestAnonymousPage() {
  const [sessionId, setSessionId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    setLoading(true);
    try {
      const session = await AnonymousUserHelper.startAnonymousSession(
        'professional-physiognomy',
        {
          email: 'test@example.com',
          phone: '010-1234-5678',
          preferredContact: 'email'
        }
      );
      
      setSessionId(session.sessionId);
      setServiceId(session.serviceId || '');
      setResult(`✅ 익명 세션 시작 성공!\n세션 ID: ${session.sessionId}\n사용자 ID: ${session.userId}\n서비스 ID: ${session.serviceId}`);
    } catch (error) {
      setResult(`❌ 세션 시작 실패: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const linkPayment = async () => {
    if (!sessionId || !serviceId) {
      setResult('❌ 먼저 세션을 시작하세요.');
      return;
    }

    setLoading(true);
    try {
      const orderId = `ORDER-${Date.now()}`;
      const paymentId = `PAY-${Date.now()}`;
      
      const result = await AnonymousUserHelper.linkPayment(serviceId, {
        orderId,
        paymentId,
        amount: 2900,
        email: 'test@example.com',
        phone: '010-1234-5678',
        name: '테스트 사용자',
        preferredContact: 'email'
      });
      
      setResult(`✅ 결제 연계 성공!\n주문 ID: ${orderId}\n결제 ID: ${paymentId}`);
      
      // 결제 완료 처리
      await AnonymousUserHelper.completePayment(paymentId);
      setResult(prev => prev + `\n✅ 결제 완료 처리됨`);
      
    } catch (error) {
      setResult(`❌ 결제 연계 실패: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const simulateError = async () => {
    if (!sessionId || !serviceId) {
      setResult('❌ 먼저 세션을 시작하고 결제를 연계하세요.');
      return;
    }

    setLoading(true);
    try {
      const errorResult = await AnonymousUserHelper.recordError(
        serviceId,
        'content_delivery_failure',
        'OpenAI API 타임아웃으로 인한 분석 결과 미전달',
        `ORDER-${Date.now()}`,
        'professional-physiognomy'
      );
      
      setResult(`🚨 오류 기록 성공!\n오류 ID: ${errorResult.errorId}\n관리자 알림: ${errorResult.adminNotified ? '완료' : '실패'}\n보상 평가: ${errorResult.compensationEvaluated ? '완료' : '미완료'}`);
    } catch (error) {
      setResult(`❌ 오류 기록 실패: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const completeService = async () => {
    if (!sessionId || !serviceId) {
      setResult('❌ 먼저 세션을 시작하세요.');
      return;
    }

    setLoading(true);
    try {
      await AnonymousUserHelper.completeService(serviceId, {
        analysis: '관상 분석 완료',
        recommendation: '추천 사항'
      });
      
      setResult(`✅ 서비스 완료 처리됨!`);
    } catch (error) {
      setResult(`❌ 서비스 완료 실패: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSessionInfo = async () => {
    setLoading(true);
    try {
      const info = await AnonymousUserHelper.getSessionInfo();
      if (info) {
        setResult(`📊 세션 정보:\n${JSON.stringify(info, null, 2)}`);
      } else {
        setResult('❌ 세션 정보가 없습니다.');
      }
    } catch (error) {
      setResult(`❌ 세션 조회 실패: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-width-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 익명 사용자 시스템 테스트
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 컨트롤 패널 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">테스트 액션</h2>
              
              <div className="space-y-3">
                <button
                  onClick={startSession}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '처리 중...' : '1️⃣ 익명 세션 시작'}
                </button>
                
                <button
                  onClick={linkPayment}
                  disabled={loading || !sessionId}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? '처리 중...' : '2️⃣ 결제 연계 및 완료'}
                </button>
                
                <button
                  onClick={simulateError}
                  disabled={loading || !sessionId}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? '처리 중...' : '3️⃣ 오류 시뮬레이션'}
                </button>
                
                <button
                  onClick={completeService}
                  disabled={loading || !sessionId}
                  className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {loading ? '처리 중...' : '4️⃣ 서비스 완료'}
                </button>
                
                <button
                  onClick={getSessionInfo}
                  disabled={loading}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                  {loading ? '처리 중...' : '📊 세션 정보 조회'}
                </button>
                
                <button
                  onClick={() => {
                    AnonymousUserHelper.clearSession();
                    setSessionId('');
                    setServiceId('');
                    setResult('🧹 세션이 정리되었습니다.');
                  }}
                  className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg hover:bg-gray-500"
                >
                  🧹 세션 정리
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900">현재 상태</h3>
                <div className="text-sm text-blue-800 mt-2">
                  <div>세션 ID: {sessionId || '없음'}</div>
                  <div>서비스 ID: {serviceId || '없음'}</div>
                  <div>활성 세션: {AnonymousUserHelper.hasActiveSession() ? '있음' : '없음'}</div>
                </div>
              </div>
            </div>
            
            {/* 결과 표시 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">실행 결과</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-96 whitespace-pre-wrap">
                {result || '테스트를 시작하려면 "익명 세션 시작" 버튼을 클릭하세요.'}
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 테스트 시나리오</h3>
            <ol className="list-decimal list-inside space-y-2 text-yellow-800">
              <li><strong>익명 세션 시작</strong>: 사용자 방문 시 세션 생성</li>
              <li><strong>결제 연계 및 완료</strong>: 결제 정보와 연락처 등록</li>
              <li><strong>오류 시뮬레이션</strong>: AI 분석 실패 상황 재현</li>
              <li><strong>서비스 완료</strong>: 정상적인 서비스 완료</li>
              <li><strong>Admin 페이지 확인</strong>: <a href="/admin" target="_blank" className="text-blue-600 underline">/admin</a>에서 결과 확인</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}