'use client';

import Script from 'next/script';

interface AdSenseScriptProps {
  adClient?: string;
}

export default function AdSenseScript({ adClient }: AdSenseScriptProps) {
  const clientId = adClient || process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  if (!clientId) {
    console.warn('Google AdSense client ID not configured');
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