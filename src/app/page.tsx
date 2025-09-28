/**
 * ⚠️ 중요 경고: 메인 페이지 수정 금지
 * 
 * 이 페이지는 사용자의 명시적 요청에 따라 완전히 잠금 상태입니다.
 * 모든 기능과 레이아웃은 최종 승인된 상태로 고정되었습니다.
 * 
 * 수정 필요시 반드시 사용자 승인 필요
 * 마지막 승인: 2025-01-11
 * 
 * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
 */
import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export const metadata = {
  title: '내 얼굴 탐구생활 - AI로 알아보는 관상, MBTI, 사주 분석',
  description: 'AI를 활용한 얼굴 관상, MBTI, 사주 분석 서비스. 개인정보 즉시 삭제, 빠른 AI 분석, PDF 리포트 제공',
  keywords: 'AI 관상, 얼굴 분석, MBTI 테스트, 사주 분석, 관상학, face-wisdom',
  openGraph: {
    title: '내 얼굴 탐구생활 - AI 관상 분석',
    description: 'AI로 알아보는 관상, MBTI, 사주 분석 서비스',
    url: 'https://facewisdom-ai.xyz',
  }
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🎭 내 얼굴 탐구생활
          </h1>
          
          {/* 서비스 개요 */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">AI로 알아보는 관상, MBTI, 사주</h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                AI 기술을 활용하여 얼굴 사진을 분석하고 관상, 사주, MBTI 정보를 제공하는<br/>
                <strong className="text-indigo-600">디지털 콘텐츠 서비스</strong>입니다.
              </p>
            </div>
          </section>

          {/* 제공 서비스 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">🎯 제공 서비스</h2>
            <div className="space-y-6">
              <Link href="/gwansang/mbti-purchase" className="block bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg border border-pink-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🧠</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">MBTI × 관상 분석</h3>
                    <p className="text-sm text-gray-600">7,900원</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  얼굴 특징을 분석하여 MBTI 성향을 예측하고, 성격적 특성과 장단점을 분석해드립니다.
                </p>
              </Link>
              
              <Link href="/gwansang/original-purchase" className="block bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">👁️</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">정통 관상 분석</h3>
                    <p className="text-sm text-gray-600">4,900원</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  전통 관상학을 바탕으로 이마, 눈, 코, 입 등 얼굴 각 부위를 세밀하게 분석하여 성격과 운세를 해석합니다.
                </p>
              </Link>
              
              <Link href="/gwansang/interview-purchase" className="block bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">💼</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">면접 관상 분석</h3>
                    <p className="text-sm text-gray-600">5,900원</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  취준생 특가! 면접에서 주는 인상, 관상학적 강점, 메이크업 팁까지 맞춤형 면접 준비 조언을 제공합니다.
                </p>
              </Link>
              
              <Link href="/gwansang/saju-purchase" className="block bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border border-yellow-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🔮</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">관상 + 사주 분석</h3>
                    <p className="text-sm text-gray-600">9,900원</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  얼굴 관상 분석과 생년월일시 기반 사주 분석을 결합하여 종합적인 성격 분석과 운세를 제공합니다.
                </p>
              </Link>
            </div>
          </section>


          {/* 중요 안내 */}
          <section className="mb-8">
            <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">⚠️ 중요 안내사항</h3>
              <div className="space-y-2 text-amber-700 text-sm">
                <p>• 본 서비스는 <strong>엔터테인먼트 목적</strong>으로 제공되며, 과학적 근거를 바탕으로 하지 않습니다.</p>
                <p>• 분석 결과는 <strong>재미를 위한 콘텐츠</strong>이며, 실제 성격이나 운세와 다를 수 있습니다.</p>
                <p>• 업로드된 사진과 개인정보는 <strong>분석 완료 즉시 삭제</strong>됩니다.</p>
                <p>• 디지털 콘텐츠 특성상 <strong>결제 후 환불이 제한</strong>될 수 있습니다.</p>
              </div>
            </div>
          </section>

          {/* 서비스 시작 버튼 */}
          <section className="text-center mb-8">
            <Link 
              href="/gwansang"
              className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              🎭 서비스 이용하기
            </Link>
          </section>

        </div>
      </main>
    </div>
  );
}
