import { useState } from 'react';
import { CUSTOMER_SERVICE_GUIDELINES } from '@/services/userIdentificationService';

/**
 * 고객센터 직원을 위한 사용자 식별 도구
 */
export default function UserIdentificationTool() {
  const [searchData, setSearchData] = useState({
    transactionTime: '',
    transactionAmount: '',
    cardLastFour: '',
    phoneNumber: '',
    email: '',
    serviceType: '',
    problemDescription: ''
  });
  
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // API를 통해 서버에서 사용자 식별 처리
      const response = await fetch('/api/admin/identify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: searchData.phoneNumber || undefined,
          email: searchData.email || undefined,
          transactionTime: searchData.transactionTime,
          transactionAmount: searchData.transactionAmount ? parseInt(searchData.transactionAmount) : undefined,
          cardLastFour: searchData.cardLastFour || undefined,
          serviceType: searchData.serviceType || undefined,
          problemDescription: searchData.problemDescription,
          urgency: 'high'
        })
      });

      const result = await response.json();
      setSearchResult(result);
    } catch (error) {
      setSearchResult({
        status: 'error',
        message: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setSearchData({
      transactionTime: '',
      transactionAmount: '',
      cardLastFour: '',
      phoneNumber: '',
      email: '',
      serviceType: '',
      problemDescription: ''
    });
    setSearchResult(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">🔍 익명 사용자 식별 도구</h2>
        <p className="text-gray-600 mt-2">
          고객 문의 시 결제 정보와 연락처를 바탕으로 해당 사용자를 식별합니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 검색 폼 */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">고객 제공 정보</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결제 시간 (고객 설명)
            </label>
            <input
              type="text"
              value={searchData.transactionTime}
              onChange={(e) => setSearchData(prev => ({ ...prev, transactionTime: e.target.value }))}
              placeholder="예: 오늘 오후 3시 30분경"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                결제 금액
              </label>
              <input
                type="number"
                value={searchData.transactionAmount}
                onChange={(e) => setSearchData(prev => ({ ...prev, transactionAmount: e.target.value }))}
                placeholder="2900"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카드 마지막 4자리
              </label>
              <input
                type="text"
                maxLength={4}
                value={searchData.cardLastFour}
                onChange={(e) => setSearchData(prev => ({ ...prev, cardLastFour: e.target.value }))}
                placeholder="1234"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={searchData.phoneNumber}
                onChange={(e) => setSearchData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="010-1234-5678"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 (선택)
              </label>
              <input
                type="email"
                value={searchData.email}
                onChange={(e) => setSearchData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              서비스 유형
            </label>
            <select
              value={searchData.serviceType}
              onChange={(e) => setSearchData(prev => ({ ...prev, serviceType: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">선택하세요</option>
              <option value="professional-physiognomy">전문관상 분석</option>
              <option value="mbti-face">MBTI 얼굴 분석</option>
              <option value="face-saju">관상+사주 분석</option>
              <option value="analyze-interview-face">면접관상 분석</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문제 설명
            </label>
            <textarea
              value={searchData.problemDescription}
              onChange={(e) => setSearchData(prev => ({ ...prev, problemDescription: e.target.value }))}
              placeholder="고객이 설명한 문제 상황을 입력하세요"
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSearch}
              disabled={loading || !searchData.problemDescription}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '검색 중...' : '🔍 사용자 식별'}
            </button>
            
            <button
              onClick={clearForm}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              초기화
            </button>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">식별 결과</h3>
          
          {searchResult ? (
            <div className="border border-gray-200 rounded-lg p-4">
              {searchResult.status === 'auto_matched' && (
                <div className="text-green-800 bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">✅</span>
                    <h4 className="font-semibold">사용자 자동 식별 성공!</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>사용자 ID: {searchResult.user?.userId}</div>
                    <div>세션 ID: {searchResult.user?.sessionId}</div>
                    <div>연락 방법: {searchResult.user?.contactMethod} - {searchResult.user?.contactValue}</div>
                    <div>매칭 요소: {searchResult.user?.matchedFactors?.join(', ')}</div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded border">
                    <strong>권장 조치:</strong> 즉시 보상 처리
                  </div>
                </div>
              )}

              {searchResult.status === 'manual_review_needed' && (
                <div className="text-yellow-800 bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">⚠️</span>
                    <h4 className="font-semibold">수동 검토 필요</h4>
                  </div>
                  <div className="text-sm mb-4">
                    여러 사용자가 매칭되거나 정확한 매칭을 찾을 수 없습니다.
                  </div>
                  
                  {searchResult.potentialMatches?.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium">가능한 매칭 후보:</div>
                      {searchResult.potentialMatches.slice(0, 3).map((match: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">후보 #{index + 1}</div>
                              <div className="text-sm text-gray-600">
                                세션: {match.sessionId}<br/>
                                신뢰도: {match.confidence}<br/>
                                매칭 요소: {match.matchedFactors?.join(', ')}
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded ${
                              match.confidence === 'high' ? 'bg-green-100 text-green-700' :
                              match.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {match.confidence}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-white rounded border">
                    <strong>권장 조치:</strong> 추가 정보 요청 후 수동 매칭
                  </div>
                </div>
              )}

              {searchResult.status === 'error' && (
                <div className="text-red-800 bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">❌</span>
                    <h4 className="font-semibold">검색 오류</h4>
                  </div>
                  <div className="text-sm">
                    {searchResult.message}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <div>고객 정보를 입력하고 검색 버튼을 클릭하세요</div>
            </div>
          )}
        </div>
      </div>

      {/* 고객센터 가이드라인 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">📋 고객센터 가이드라인</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">필수 확인 질문</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {CUSTOMER_SERVICE_GUIDELINES.IDENTIFICATION_QUESTIONS.map((question, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">보상 기준</h4>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-green-50 rounded">
                <strong className="text-green-800">즉시 보상:</strong>
                <div className="text-green-700">{CUSTOMER_SERVICE_GUIDELINES.COMPENSATION_CRITERIA.IMMEDIATE}</div>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <strong className="text-yellow-800">검토 후 보상:</strong>
                <div className="text-yellow-700">{CUSTOMER_SERVICE_GUIDELINES.COMPENSATION_CRITERIA.REVIEW}</div>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <strong className="text-red-800">보상 불가:</strong>
                <div className="text-red-700">{CUSTOMER_SERVICE_GUIDELINES.COMPENSATION_CRITERIA.DENY}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}