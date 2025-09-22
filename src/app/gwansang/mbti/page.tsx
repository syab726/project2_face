'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const MBTIAnalyzer = dynamic(() => import('@/components/MBTIAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>MBTI 분석 로딩 중...</div>
});

export default function MBTIPage() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '0',
      fontFamily: "'Gowun Dodum', sans-serif",
      background: 'linear-gradient(180deg, #fefcea 0%, #f1daff 100%)',
      color: '#333'
    }}>
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>MBTI 분석 로딩 중...</div>}>
        <MBTIAnalyzer />
      </Suspense>
    </div>
  );
}