'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const InterviewFaceAnalyzer = dynamic(() => import('@/components/InterviewFaceAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>면접 관상 로딩 중...</div>
});

function InterviewPageContent() {
  const searchParams = useSearchParams();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    const payment = searchParams?.get('payment');
    const service = searchParams?.get('service');
    const tid = searchParams?.get('tid');

    // 결제 완료 후 성공 메시지 표시
    if (payment === 'success' && service === 'interview' && tid) {
      console.log('면접관상 결제 완료');
      setShowPaymentSuccess(true);

      // URL에서 결제 파라미터 제거
      const newUrl = '/gwansang/interview';
      window.history.replaceState({}, '', newUrl);

      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 3000);
    }
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '0',
      fontFamily: "'Gowun Dodum', sans-serif",
      background: 'linear-gradient(180deg, #fefcea 0%, #f1daff 100%)',
      color: '#333'
    }}>
      {showPaymentSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10B981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          ✅ 결제가 완료되었습니다! 면접관상 분석을 시작해보세요.
        </div>
      )}
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>면접 관상 로딩 중...</div>}>
        <InterviewFaceAnalyzer />
      </Suspense>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>페이지 로딩 중...</div>}>
      <InterviewPageContent />
    </Suspense>
  );
}