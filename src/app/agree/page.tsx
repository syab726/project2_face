import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: '이용약관 - 내 얼굴 탐구생활',
  description: '내 얼굴 탐구생활 서비스 이용약관 및 환불정책',
};

export default function AgreePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            이용약관 및 환불정책
          </h1>
          
          {/* 서비스 개요 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">서비스 개요</h2>
            <p className="text-gray-600 leading-relaxed">
              "내 얼굴 탐구생활"은 AI 기술을 활용하여 얼굴 사진을 분석하고 관상, 사주, MBTI, 이상형 등의 정보를 제공하는 디지털 콘텐츠 서비스입니다.
            </p>
          </section>

          {/* 이용약관 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">이용약관</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">1. 서비스 이용</h3>
                <p className="leading-relaxed">
                  본 서비스는 엔터테인먼트 목적의 AI 분석 서비스로, 제공되는 결과는 과학적 근거가 아닌 재미를 위한 콘텐츠입니다.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">2. 개인정보 보호</h3>
                <p className="leading-relaxed">
                  업로드된 사진은 분석 완료 후 즉시 삭제되며, 개인정보는 안전하게 보호됩니다.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">3. 결과물 이용</h3>
                <p className="leading-relaxed">
                  분석 결과 및 생성된 PDF는 개인적 용도로만 사용 가능하며, 상업적 이용은 금지됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* 환불정책 - 중요 섹션 */}
          <section className="mb-8 bg-red-50 p-6 rounded-lg border-2 border-red-200">
            <h2 className="text-2xl font-semibold text-red-800 mb-4">🔴 환불정책 (중요)</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-700 mb-2">디지털 콘텐츠 특성</h3>
                <p className="text-gray-700 leading-relaxed">
                  본 서비스는 <strong>디지털 콘텐츠</strong>를 제공하는 서비스입니다. 
                  디지털 콘텐츠의 특성상 <strong>결제 완료 후에는 원칙적으로 환불이 불가능</strong>합니다.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-700 mb-2">환불 가능 경우</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  다음과 같은 <strong>서비스 오류</strong>가 발생한 경우에만 환불이 가능합니다:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>결제는 완료되었으나 서비스가 제공되지 않은 경우</li>
                  <li>시스템 오류로 인해 분석 결과를 받을 수 없는 경우</li>
                  <li>기술적 문제로 PDF 다운로드가 불가능한 경우</li>
                  <li>중복 결제가 발생한 경우</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-700 mb-2">환불 절차</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="bg-red-600 text-white text-sm font-medium px-2 py-1 rounded">1단계</span>
                    <div>
                      <p className="font-medium text-gray-800">환불 요청</p>
                      <p className="text-gray-600 text-sm">
                        이메일 주소: <strong>syab726@gmail.com</strong><br/>
                        요청 시 포함사항: 결제일시, 결제금액, 오류 상황 설명
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-red-600 text-white text-sm font-medium px-2 py-1 rounded">2단계</span>
                    <div>
                      <p className="font-medium text-gray-800">환불 검토</p>
                      <p className="text-gray-600 text-sm">
                        요청 접수 후 <strong>3영업일 이내</strong> 검토 및 답변
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-red-600 text-white text-sm font-medium px-2 py-1 rounded">3단계</span>
                    <div>
                      <p className="font-medium text-gray-800">환불 처리</p>
                      <p className="text-gray-600 text-sm">
                        승인 시 영업일 기준 <strong>3-5일 내</strong> 환불 처리
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">⚠️ 환불 불가 사유</h3>
                <ul className="list-disc list-inside text-yellow-700 space-y-1 ml-4">
                  <li>단순 변심 또는 개인적 사정</li>
                  <li>분석 결과에 대한 불만족</li>
                  <li>이미 정상적으로 서비스를 제공받은 경우</li>
                  <li>PDF 다운로드를 완료한 경우</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 연락처 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">고객지원</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>이메일:</strong> syab726@gmail.com
              </p>
              <p className="text-gray-700 mb-2">
                <strong>운영시간:</strong> 평일 09:00 - 18:00 (주말 및 공휴일 제외)
              </p>
              <p className="text-gray-600 text-sm">
                문의사항이나 기술적 문제가 있으시면 언제든 연락주세요.
              </p>
            </div>
          </section>

          {/* 최종 동의 */}
          <section className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-4">
              본 약관은 2025년 8월 1일부터 적용됩니다.<br/>
              서비스 이용 시 위 약관에 동의한 것으로 간주됩니다.
            </p>
            
            {/* 링크 섹션 */}
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="/service" className="text-indigo-600 hover:text-indigo-800 underline">
                서비스 소개
              </Link>
              <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800 underline">
                개인정보 처리방침
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}