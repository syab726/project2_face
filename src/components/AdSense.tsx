'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style = {}
}: AdSenseProps) {
  useEffect(() => {
    // AdSense 스크립트가 로드되었는지 확인
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  // 환경변수에서 AdSense 클라이언트 ID 가져오기
  const adClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  if (!adClient) {
    console.warn('Google AdSense client ID not configured');
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
}

// 특정 위치용 AdSense 컴포넌트들
export function AdSenseBanner({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="1234567890" // 실제 배너 광고 슬롯 ID
      adFormat="horizontal"
      className={`w-full h-24 ${className || ''}`}
    />
  );
}

export function AdSenseSquare({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="0987654321" // 실제 정사각형 광고 슬롯 ID
      adFormat="rectangle"
      className={`w-64 h-64 mx-auto ${className || ''}`}
    />
  );
}

export function AdSenseVertical({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="1122334455" // 실제 세로형 광고 슬롯 ID
      adFormat="vertical"
      className={`w-48 h-96 ${className || ''}`}
    />
  );
}

// 모바일 전용 AdSense
export function AdSenseMobile({ className }: { className?: string }) {
  return (
    <div className={`block md:hidden ${className || ''}`}>
      <AdSense
        adSlot="5544332211" // 실제 모바일 광고 슬롯 ID
        adFormat="fluid"
        className="w-full h-20"
      />
    </div>
  );
}

// 데스크톱 전용 AdSense
export function AdSenseDesktop({ className }: { className?: string }) {
  return (
    <div className={`hidden md:block ${className || ''}`}>
      <AdSense
        adSlot="6677889900" // 실제 데스크톱 광고 슬롯 ID
        adFormat="horizontal"
        className="w-full h-32"
      />
    </div>
  );
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}