import React from 'react';
import Header from '@/components/Header';
import FreeTestAnalyzer from '@/components/FreeTestAnalyzer';

export const metadata = {
  title: '내게 어울리는 명품 - 무료 재미 테스트',
  description: 'AI가 분석하는 당신의 얼굴에 어울리는 명품 브랜드를 알아보세요. 무료 얼굴 분석 테스트!',
};

export default function LuxuryTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <FreeTestAnalyzer category="luxury" />
      </main>
    </div>
  );
}