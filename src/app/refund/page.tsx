import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '환불정책 - 내 얼굴 탐구생활',
  description: '디지털 콘텐츠 환불정책 및 절차 안내',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">환불정책</h1>
            <p className="text-gray-600">디지털 콘텐츠 서비스 환불 규정</p>
          </div>

          {/* 핵심 안내 */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-800 mb-2">🔴 중요 안내사항</h2>
                <p className="text-red-700 font-medium">
                  본 서비스는 <span className="font-bold">디지털 콘텐츠</span>를 제공합니다. 
                  디지털 콘텐츠의 특성상 <span className="font-bold">결제 완료 후에는 원칙적으로 환불이 불가능</span>합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 환불 가능한 경우 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
              환불 가능한 경우
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">🔧 기술적 오류</h3>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    결제는 완료되었으나 서비스가 제공되지 않은 경우
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시스템 오류로 분석 결과를 받을 수 없는 경우
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    PDF 다운로드가 기술적으로 불가능한 경우
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">💳 결제 오류</h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    중복 결제가 발생한 경우
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    결제 승인 오류로 인한 문제
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    허가되지 않은 결제가 이루어진 경우
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 환불 불가능한 경우 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">✕</span>
              환불 불가능한 경우
            </h2>
            
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <ul className="space-y-3 text-red-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>단순 변심</strong> 또는 개인적 사정으로 인한 취소 요청</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>분석 결과에 대한 불만족</strong> (서비스는 엔터테인먼트 목적)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>이미 <strong>정상적으로 서비스를 제공받은 경우</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>PDF 다운로드를 완료한 경우</strong> (디지털 콘텐츠 특성)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>결제 완료 후 <strong>7일이 경과한 경우</strong></span>
                </li>
              </ul>
            </div>
          </section>

          {/* 환불 절차 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">환불 신청 절차</h2>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">환불 요청 이메일 발송</h3>
                  <div className="bg-blue-50 p-4 rounded-lg mb-3">
                    <p className="font-medium text-blue-800 mb-2">📧 이메일 주소</p>
                    <p className="text-2xl font-bold text-blue-600">syab726@gmail.com</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800 mb-2">📝 이메일 작성 시 포함사항</p>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• 결제 일시 및 금액</li>
                      <li>• 사용한 이메일 주소 또는 전화번호</li>
                      <li>• 발생한 오류 상황의 구체적 설명</li>
                      <li>• 스크린샷 또는 증빙 자료 (가능한 경우)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">환불 요청 검토</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800">
                      <span className="font-bold">3영업일 이내</span>에 요청 내용을 검토하여 이메일로 답변드립니다.
                    </p>
                    <p className="text-yellow-700 text-sm mt-2">
                      * 영업일: 평일 (월~금, 공휴일 제외)
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">환불 처리</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800">
                      환불이 승인되면 <span className="font-bold">영업일 기준 3-5일 내</span>에 
                      결제하신 카드로 환불 처리됩니다.
                    </p>
                    <p className="text-green-700 text-sm mt-2">
                      * 카드사별로 실제 환불 반영까지 추가 시일이 소요될 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 연락처 정보 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">고객지원 연락처</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">📧 이메일 문의</h3>
                  <p className="text-gray-700 mb-1">
                    <strong>syab726@gmail.com</strong>
                  </p>
                  <p className="text-gray-600 text-sm">
                    환불 요청 및 기술 지원
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">🕐 운영시간</h3>
                  <p className="text-gray-700 mb-1">
                    <strong>평일 09:00 - 18:00</strong>
                  </p>
                  <p className="text-gray-600 text-sm">
                    주말 및 공휴일 제외
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 주의사항 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 유의사항</h3>
                <ul className="space-y-1 text-yellow-700 text-sm">
                  <li>• 환불 요청 전에 고객지원을 통해 문제 해결을 먼저 시도해 주세요.</li>
                  <li>• 허위 또는 악의적인 환불 요청은 법적 조치를 받을 수 있습니다.</li>
                  <li>• 본 환불정책은 관련 법령에 따라 변경될 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-gray-200 mt-8">
            <p className="text-gray-600 text-sm">
              본 환불정책은 2025년 8월 1일부터 적용됩니다.<br/>
              문의사항이 있으시면 언제든 고객지원팀으로 연락주세요.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}