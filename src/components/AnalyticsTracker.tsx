'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initializeAnalytics, trackPageView } from '@/utils/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 초기화
    initializeAnalytics();
  }, []);

  useEffect(() => {
    // 페이지 변경시 추적
    trackPageView(pathname);
  }, [pathname]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}