'use client';

import Link from 'next/link';
import SimpleInicisPayment from '@/components/SimpleInicisPayment';
import Header from '@/components/Header';

export default function OriginalPurchasePage() {

  const handlePaymentComplete = (result: any) => {
    console.log('✅ 정통관상 결제 완료:', result);

    // 보안 강화: JWT 토큰 기반 결제 인증
    if (result.securityToken && result.securityHash) {
      const secureParams = new URLSearchParams({
        token: result.securityToken,
        hash: result.securityHash,
        timestamp: result.timestamp?.toString() || Date.now().toString()
      });

      alert('결제가 성공적으로 완료되었습니다! 정통 관상 분석을 시작해보세요.');

      // 보안 토큰을 사용하여 분석 페이지로 이동
      setTimeout(() => {
        window.location.href = `/gwansang?view=face&${secureParams.toString()}`;
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
              정통 관상 분석
            </h1>
            <p className="text-lg text-gray-600">
              전통 관상학의 정수로 풀어내는 정확한 얼굴 분석
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 서비스 소개 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  전통 정통 관상 분석
                </h2>
                <p className="text-gray-600">
                  수천 년 전해 내려오는 정통 관상학으로 정확한 성격 분석
                </p>
              </div>

              {/* 필요한 정보 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  📝 입력이 필요한 정보
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    얼굴 사진 (정면, 밝은 조명)
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    나이
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    성별
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
                    전통 관상학 기반 성격 분석
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    얼굴 각 부위별 상세 해석
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    타고난 성향 및 장단점 분석
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    인생 운세 및 주의사항
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    대인관계 및 직업 적성
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    PDF 분석 결과 다운로드
                  </li>
                </ul>
              </div>

              {/* 특징 */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">
                  ✨ 특별한 기능
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 수천 년 전통의 정통 관상학 적용</li>
                  <li>• 얼굴 각 부위의 상세한 의미 해석</li>
                  <li>• 타고난 기질과 후천적 변화 분석</li>
                  <li>• 실생활 적용 가능한 구체적 조언</li>
                </ul>
              </div>
            </div>

            {/* 가격 및 결제 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  9,900원
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
                    serviceType="professional-physiognomy"
                    amount={9900}
                    productName="정통 관상 분석"
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