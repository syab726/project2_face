import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export const metadata = {
  title: '무료 재미 테스트 - 내 얼굴 탐구생활',
  description: 'AI로 알아보는 재미있는 얼굴 분석! 나에게 어울리는 명품, 자동차, 도시, 직업, 음식을 찾아보세요.',
};

export default function FreeTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            재미있는 얼굴 분석 테스트
          </h1>

          {/* 서비스 소개 */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">AI가 분석하는 나만의 매력</h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                얼굴 사진을 업로드하면 AI가 당신의 얼굴 특징을 분석하여<br/>
                <strong className="text-indigo-600">나에게 어울리는 것들</strong>을 알려드립니다!
              </p>
            </div>
          </section>

          {/* 무료 테스트 목록 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">무료로 즐기는 5가지 테스트</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/free-test/luxury" className="block bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg border border-pink-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-center">
                  <div className="text-4xl mb-4">💎</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">내게 어울리는 명품</h3>
                  <p className="text-gray-600 text-sm">
                    당신의 얼굴에 맞는 명품 브랜드를 찾아보세요
                  </p>
                </div>
              </Link>

              <Link href="/free-test/car" className="block bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-center">
                  <div className="text-4xl mb-4">🚗</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">내게 어울리는 자동차</h3>
                  <p className="text-gray-600 text-sm">
                    당신의 이미지에 맞는 자동차를 찾아보세요
                  </p>
                </div>
              </Link>

              <Link href="/free-test/city" className="block bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-center">
                  <div className="text-4xl mb-4">🌍</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">내게 어울리는 도시</h3>
                  <p className="text-gray-600 text-sm">
                    당신과 잘 맞는 세계의 도시를 찾아보세요
                  </p>
                </div>
              </Link>

              <Link href="/free-test/job" className="block bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-center">
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">내게 어울리는 직업</h3>
                  <p className="text-gray-600 text-sm">
                    당신에게 어울리는 직업을 찾아보세요
                  </p>
                </div>
              </Link>

              <Link href="/free-test/food" className="block bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border border-yellow-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-center">
                  <div className="text-4xl mb-4">🍽️</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">내게 어울리는 음식</h3>
                  <p className="text-gray-600 text-sm">
                    당신의 취향에 맞는 음식을 찾아보세요
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* 유료 서비스 안내 */}
          <section className="mb-8">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200">
              <h3 className="text-lg font-semibold text-indigo-800 mb-4 text-center">더 정확한 분석을 원하신다면?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/gwansang/mbti-purchase" className="block bg-white p-4 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">🧠</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">MBTI × 관상 분석</h4>
                      <p className="text-sm text-gray-600">7,900원</p>
                    </div>
                  </div>
                </Link>

                <Link href="/gwansang/saju-purchase" className="block bg-white p-4 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">🔮</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">관상 + 사주 분석</h4>
                      <p className="text-sm text-gray-600">9,900원</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* 중요 안내 */}
          <section className="mb-8">
            <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">안내사항</h3>
              <div className="space-y-2 text-amber-700 text-sm">
                <p>• 본 테스트는 <strong>재미 목적</strong>으로 제공됩니다.</p>
                <p>• 업로드한 사진은 <strong>분석 완료 즉시 삭제</strong>됩니다.</p>
                <p>• 회원가입 없이 이용 가능합니다.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}