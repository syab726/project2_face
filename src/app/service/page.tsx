import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: '서비스 소개 - 내 얼굴 탐구생활',
  description: 'AI를 활용한 얼굴 관상, MBTI, 사주 분석 서비스를 소개합니다',
};

export default function ServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🎭 서비스 소개
          </h1>
          
          {/* 서비스 개요 */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🤖✨</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">내 얼굴 탐구생활</h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                AI 기술을 활용하여 얼굴 사진을 분석하고 관상, 사주, MBTI, 이상형 등의 정보를 제공하는 
                <strong className="text-indigo-600"> 디지털 콘텐츠 서비스</strong>입니다.
              </p>
            </div>
          </section>

          {/* 주요 특징 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">🌟 주요 특징</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">개인정보 즉시 삭제</h3>
                <p className="text-blue-700 text-sm">
                  회원가입 없이 이용 가능하며, 업로드된 사진과 개인정보는 분석 완료 후 즉시 삭제됩니다.
                </p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">빠른 AI 분석</h3>
                <p className="text-green-700 text-sm">
                  최신 AI 기술을 활용하여 몇 초 만에 정확하고 재미있는 분석 결과를 제공합니다.
                </p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="text-3xl mb-3">📄</div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">PDF 리포트 제공</h3>
                <p className="text-purple-700 text-sm">
                  분석 결과를 예쁘게 정리한 PDF 파일로 다운로드하여 언제든 확인할 수 있습니다.
                </p>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <div className="text-3xl mb-3">🎮</div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">엔터테인먼트 목적</h3>
                <p className="text-orange-700 text-sm">
                  재미를 위한 콘텐츠로, 과학적 근거보다는 즐거운 경험에 중점을 둔 서비스입니다.
                </p>
              </div>
            </div>
          </section>

          {/* 제공 서비스 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">🎯 제공 서비스</h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg border border-pink-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🧠</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">MBTI × 관상 분석</h3>
                    <p className="text-sm text-gray-600">3,900원</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  얼굴 특징을 분석하여 MBTI 성향을 예측하고, 성격적 특성과 장단점을 분석해드립니다.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">👁️</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">정통 관상 분석</h3>
                    <p className="text-sm text-gray-600">9,900원</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  전통 관상학을 바탕으로 이마, 눈, 코, 입 등 얼굴 각 부위를 세밀하게 분석하여 성격과 운세를 해석합니다.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🔮</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">관상 + 사주 분석</h3>
                    <p className="text-sm text-gray-600">19,900원</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  얼굴 관상 분석과 생년월일시 기반 사주 분석을 결합하여 종합적인 성격 분석과 운세를 제공합니다.
                </p>
              </div>
            </div>
          </section>

          {/* 이용 방법 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">📝 이용 방법</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">사진 업로드</h4>
                <p className="text-sm text-gray-600">얼굴이 선명한 사진을 업로드합니다</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">서비스 선택</h4>
                <p className="text-sm text-gray-600">원하는 분석 서비스를 선택합니다</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">결제 진행</h4>
                <p className="text-sm text-gray-600">간편 결제로 서비스를 이용합니다</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">4</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">결과 확인</h4>
                <p className="text-sm text-gray-600">분석 결과를 확인하고 PDF를 다운로드합니다</p>
              </div>
            </div>
          </section>

          {/* 중요 안내 */}
          <section className="mb-8">
            <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">⚠️ 중요 안내사항</h3>
              <div className="space-y-2 text-amber-700 text-sm">
                <p>• 본 서비스는 <strong>엔터테인먼트 목적</strong>으로 제공되며, 과학적 근거를 바탕으로 하지 않습니다.</p>
                <p>• 분석 결과는 <strong>재미를 위한 콘텐츠</strong>이며, 실제 성격이나 운세와 다를 수 있습니다.</p>
                <p className="text-red-800">• <strong>개인정보 보호: 업로드한 사진은 AI 분석 처리 중에만 메모리에 임시로 존재하며, 분석 완료 즉시 자동으로 완전 삭제됩니다. 서버나 데이터베이스에 저장되지 않습니다.</strong></p>
                <p className="text-red-800">• <strong>회원가입 불필요: 별도의 회원가입 절차 없이 서비스를 이용할 수 있으며, 어떠한 개인정보도 수집하거나 저장하지 않습니다.</strong></p>
                <p>• 디지털 콘텐츠 특성상 <strong>결제 후 환불이 제한</strong>될 수 있습니다.</p>
              </div>
            </div>
          </section>

          {/* 서비스 시작 버튼 */}
          <section className="text-center mb-8">
            <Link 
              href="/"
              className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              🎭 서비스 이용하기
            </Link>
          </section>

          {/* 링크 섹션 */}
          <section className="text-center pt-6 border-t border-gray-200">
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="/agree" className="text-indigo-600 hover:text-indigo-800 underline">
                이용약관
              </Link>
              <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800 underline">
                개인정보 처리방침
              </Link>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              궁금한 점이 있으시면 syab726@gmail.com으로 문의해주세요.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}