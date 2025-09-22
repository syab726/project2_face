import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '결제 취소 - 내 얼굴 탐구생활',
  description: '결제가 취소되었습니다.',
};

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* 취소 아이콘 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* 메시지 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            결제가 취소되었습니다
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            결제 과정에서 취소하셨거나 오류가 발생했습니다.<br/>
            다시 시도하거나 다른 결제 방법을 이용해보세요.
          </p>

          {/* 가능한 원인 */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
            <h2 className="font-semibold text-gray-800 mb-3">🤔 결제 취소 가능한 원인</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                사용자가 직접 결제를 취소한 경우
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                카드 한도 초과 또는 잔액 부족
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                인터넷 연결 문제 또는 시스템 오류
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                결제 시간 초과 (타임아웃)
              </li>
            </ul>
          </div>

          {/* 해결 방법 */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8 text-left">
            <h2 className="font-semibold text-blue-800 mb-3">💡 해결 방법</h2>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                카드 잔액이나 한도를 확인해주세요
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                다른 카드나 결제 방법을 시도해보세요
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                브라우저를 새로고침하고 다시 시도해주세요
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                문제가 지속되면 고객지원팀으로 연락해주세요
              </li>
            </ul>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              다시 시도하기
            </Link>
            
            <Link 
              href="/contact" 
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              고객지원 문의
            </Link>
          </div>

          {/* 고객지원 정보 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-2">
              결제 관련 문제가 지속되면 고객지원팀으로 연락주세요
            </p>
            <p className="text-primary-600 font-medium">
              📧 syab726@gmail.com
            </p>
            <p className="text-gray-500 text-xs mt-2">
              운영시간: 평일 09:00 - 18:00 (주말 및 공휴일 제외)
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}