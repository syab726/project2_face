import type { Metadata } from 'next';
import './globals.css';
import AdSenseScript from '@/components/AdSenseScript';

export const metadata: Metadata = {
  title: '내 얼굴 탐구생활 - AI로 알아보는 관상, MBTI, 사주 분석',
  description: 'AI를 활용한 얼굴 관상, MBTI, 사주 분석 서비스. 개인정보 즉시 삭제, 빠른 AI 분석, PDF 리포트 제공. face-wisdom.ai',
  keywords: ['AI 관상', '얼굴 분석', 'MBTI 테스트', '사주 분석', '관상학', 'face-wisdom', '얼굴 관상', 'AI 분석', '성격 분석'],
  openGraph: {
    title: '내 얼굴 탐구생활 - AI 관상 분석',
    description: 'AI로 알아보는 관상, MBTI, 사주 분석 서비스',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://facewisdom-ai.xyz',
    siteName: '내 얼굴 탐구생활',
  },
  alternates: {
    canonical: 'https://facewisdom-ai.xyz',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Pretendard:wght@400;500;600;700&family=Gowun+Dodum&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-korean antialiased bg-gray-50 min-h-screen">
        <AdSenseScript />
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}