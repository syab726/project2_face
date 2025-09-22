'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const FaceSajuAnalyzer = dynamic(() => import('@/components/FaceSajuAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>관상+사주 로딩 중...</div>
});

export default function SajuPage() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '0',
      fontFamily: "'Gowun Dodum', sans-serif",
      background: 'linear-gradient(180deg, #fefcea 0%, #f1daff 100%)',
      color: '#333'
    }}>
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>관상+사주 로딩 중...</div>}>
        <FaceSajuAnalyzer />
      </Suspense>
    </div>
  );
}