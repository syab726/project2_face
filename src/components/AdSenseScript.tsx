'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

interface AdSenseScriptProps {
  adClient?: string;
}

export default function AdSenseScript({ adClient }: AdSenseScriptProps) {
  const pathname = usePathname();
  const clientId = adClient || process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  // 결제 관련 페이지에서는 AdSense 스크립트를 로드하지 않음
  const isPaymentPage = pathname?.includes('purchase') ||
                       pathname?.includes('payment') ||
                       pathname?.includes('inicis');

  if (!clientId) {
    console.warn('Google AdSense client ID not configured');
    return null;
  }

  if (isPaymentPage) {
    console.log('AdSense script disabled on payment page:', pathname);
    return null;
  }

  return (
    <Script
      id="google-adsense"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        console.log('Google AdSense script loaded');
      }}
      onError={(error) => {
        console.error('Google AdSense script failed to load:', error);
      }}
    />
  );
}