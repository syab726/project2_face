'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Next.js dynamic import 사용 (SSR 안전)
const FaceAnalyzer = dynamic(() => import('@/components/FaceAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>로딩 중...</div>
});

type AnalysisType = 'home' | 'face' | 'face-saju' | 'mbti-face' | 'interview' | 'about' | 'terms';

function OriginalPageContent() {
  const [currentView] = useState<AnalysisType>('face');

  const handleNavigate = (view: AnalysisType) => {
    // 네비게이션 처리
    if (view === 'home') {
      window.location.href = '/gwansang';
    } else if (view === 'mbti-face') {
      window.location.href = '/gwansang/mbti';
    } else if (view === 'face-saju') {
      window.location.href = '/gwansang/saju';
    } else if (view === 'interview') {
      window.location.href = '/gwansang/interview';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '0',
      fontFamily: "'Gowun Dodum', sans-serif",
      background: 'linear-gradient(180deg, #fefcea 0%, #f1daff 100%)',
      color: '#333'
    }}>
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 16px' }}>
        <Link
          href="/gwansang"
          style={{
            display: 'inline-block',
            background: '#f5f5f5',
            color: '#666',
            border: 'none',
            padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
            borderRadius: '20px',
            cursor: 'pointer',
            marginBottom: '16px',
            fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
            marginTop: '16px',
            textDecoration: 'none',
            transition: 'background 0.3s ease'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = '#f5f5f5';
          }}
        >
          ← 돌아가기
        </Link>

        <FaceAnalyzer onNavigate={handleNavigate} />
      </div>
    </div>
  );
}

export default function OriginalPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>}>
      <OriginalPageContent />
    </Suspense>
  );
}