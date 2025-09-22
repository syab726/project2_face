'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AdBanner from '@/components/AdBanner';

// Next.js dynamic import 사용 (SSR 안전)
const FaceSajuAnalyzer = dynamic(() => import('@/components/FaceSajuAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>관상+사주 분석 로딩 중...</div>
});

export default function FaceSajuPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '0',
      fontFamily: "'Gowun Dodum', sans-serif",
      background: 'linear-gradient(180deg, #fefcea 0%, #f1daff 100%)',
      color: '#333'
    }}>
      <header style={{ 
        textAlign: 'center', 
        padding: '40px 16px 20px'
      }}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
          marginBottom: '8px',
          color: '#5e2b97',
          textAlign: 'center',
          fontWeight: 'bold',
          lineHeight: '1.2'
        }}>
          🔮 관상+사주 종합 분석
        </h1>
        <p style={{ 
          fontSize: '1.1em', 
          color: '#666',
          marginTop: '10px'
        }}>
          AI가 당신의 얼굴과 사주를 함께 분석하여<br/>
          운명의 비밀을 밝혀드립니다
        </p>
      </header>

      <main style={{ 
        padding: '0 16px 40px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* 상단 광고 */}
        <AdBanner 
          adSlot="face-saju-top"
          width={728}
          height={90}
          format="horizontal"
          style={{ margin: '20px auto' }}
        />

        {/* 메인 분석 컴포넌트 */}
        <FaceSajuAnalyzer />

        {/* 하단 광고 */}
        <AdBanner 
          adSlot="face-saju-bottom"
          width={728}
          height={90}
          format="horizontal"
          style={{ margin: '40px auto 20px' }}
        />
      </main>
    </div>
  );
}