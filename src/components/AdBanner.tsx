'use client';

import { useEffect } from 'react';

interface AdBannerProps {
  adSlot: string;
  width?: number;
  height?: number;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
}

export default function AdBanner({ 
  adSlot, 
  width = 320, 
  height = 100, 
  format = 'auto',
  style = {} 
}: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense 광고 로드 오류:', error);
    }
  }, []);

  if (!clientId) {
    // Production에서는 AdSense Client ID가 없으면 아무것도 표시하지 않음
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    
    // 개발 환경에서만 플레이스홀더 표시
    return (
      <div 
        style={{
          width: format === 'auto' ? '100%' : `${width}px`,
          height: `${height}px`,
          maxWidth: '100%',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          border: '2px dashed #ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          color: '#666',
          fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
          textAlign: 'center',
          ...style
        }}
      >
        <div>
          <div style={{ marginBottom: '5px' }}>📢 광고 영역</div>
          <div style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', opacity: '0.7' }}>
            {width}×{height} • AdSense 승인 후 광고 표시
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      textAlign: 'center', 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      ...style 
    }}>
      <ins
        className="adsbygoogle"
        style={{
          display: format === 'auto' ? 'block' : 'inline-block',
          width: format === 'auto' ? '100%' : `${width}px`,
          height: `${height}px`,
          maxWidth: '100%'
        }}
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={format === 'auto' ? 'true' : 'false'}
      />
    </div>
  );
}