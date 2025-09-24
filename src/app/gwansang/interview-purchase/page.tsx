'use client';

import Link from 'next/link';
import SimpleInicisPayment from '@/components/SimpleInicisPayment';
import Header from '@/components/Header';

export default function InterviewInfoPage() {

  const handlePaymentComplete = (result: any) => {
    console.log('✅ 면접관상 결제 완료:', result);

    // 보안 강화: JWT 토큰 기반 결제 인증
    if (result.securityToken && result.securityHash) {
      const secureParams = new URLSearchParams({
        token: result.securityToken,
        hash: result.securityHash,
        timestamp: result.timestamp?.toString() || Date.now().toString()
      });

      alert('결제가 성공적으로 완료되었습니다! 면접관상 분석을 시작해보세요.');

      // 보안 토큰을 사용하여 분석 페이지로 이동
      setTimeout(() => {
        window.location.href = `/gwansang/interview?${secureParams.toString()}`;
      }, 1000);
    } else {
      // 보안 토큰이 없으면 오류 처리
      console.error('보안 토큰이 없습니다:', result);
      alert('결제 처리 중 보안 오류가 발생했습니다. 고객센터로 문의해주세요.');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('❌ 결제 오류:', error);
    alert(`결제에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '0',
      fontFamily: "'Gowun Dodum', sans-serif",
      background: 'linear-gradient(180deg, #fefcea 0%, #f1daff 100%)',
      color: '#333'
    }}>
      <Header />

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 20px 40px'
      }}>
        <div className="max-w-4xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              면접 관상 분석
            </h1>
            <p className="text-lg text-gray-600">
              면접에 최적화된 AI 얼굴 분석으로 성공적인 면접을 준비하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 서비스 소개 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  전문 면접관상 서비스
                </h2>
                <p className="text-gray-600">
                  면접에서 좋은 인상을 남기는 방법을 알려드립니다
                </p>
              </div>

              {/* 필요한 정보 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  📝 입력이 필요한 정보
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    얼굴 사진 (정면, 밝은 조명)
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    나이
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    성별
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    희망 직군/분야
                  </li>
                </ul>
              </div>

              {/* 제공 내용 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  📊 제공되는 분석 내용
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    면접 적합도 종합 평가
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    첫인상 및 신뢰도 분석
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    리더십 및 소통 능력 평가
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    면접 성공을 위한 맞춤 조언
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    PDF 분석 결과 다운로드
                  </li>
                </ul>
              </div>

              {/* 특징 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  ✨ 특별한 기능
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 직군별 맞춤 분석 (IT, 금융, 서비스업 등)</li>
                  <li>• 면접관 시각에서의 객관적 평가</li>
                  <li>• 구체적이고 실용적인 개선 방법 제시</li>
                  <li>• 면접 당일 활용 가능한 실전 팁</li>
                </ul>
              </div>
            </div>

            {/* 가격 및 결제 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  900원
                </div>
                <p className="text-gray-600">부가세 포함</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">분석 시간</span>
                  <span className="font-semibold">약 2-3분</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">결과 제공</span>
                  <span className="font-semibold">즉시 확인</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">PDF 다운로드</span>
                  <span className="font-semibold">영구 보관</span>
                </div>
              </div>

              {/* 결제 버튼 */}
              <div className="space-y-4">
                <div className="w-full">
                  <SimpleInicisPayment
                    serviceType="interview"
                    amount={900}
                    productName="면접 관상 분석"
                    onPaymentComplete={handlePaymentComplete}
                    onPaymentError={handlePaymentError}
                  />
                </div>

                <Link
                  href="/gwansang"
                  className="block w-full text-center bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  다른 서비스 보기
                </Link>
              </div>

              {/* 보안 및 개인정보 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  🔒 개인정보 보호
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 업로드된 사진은 분석 완료 후 자동 삭제</li>
                  <li>• 개인정보는 암호화하여 안전하게 처리</li>
                  <li>• 분석 결과 외 정보는 저장하지 않음</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}