/**
 * 클라이언트 사이드 분석 추적 유틸리티
 */

// 세션 ID 관리
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }
  }
  return sessionId;
}

// 기본 트래킹 함수
async function trackEvent(action: string, data: any = {}) {
  try {
    console.log('📊 trackEvent 호출:', action, data);
    const requestBody = {
      action,
      sessionId: getSessionId(),
      data
    };
    console.log('📤 Track API로 전송할 데이터:', requestBody);
    
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('📥 Track API 응답:', response.status, responseText);

    if (!response.ok) {
      console.error('Failed to track event:', action, 'Response:', responseText);
    } else {
      console.log('✅ Event tracked successfully:', action);
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

// 페이지 방문 추적
export function trackPageView(page: string = window.location.pathname) {
  // admin 페이지는 제외
  if (page.includes('/admin')) {
    console.log('🚫 Admin 페이지는 추적하지 않음:', page);
    return;
  }
  trackEvent('page_view', { page });
}

// 분석 요청 추적
export function trackAnalysisRequest(serviceType: string) {
  console.log('🎯 trackAnalysisRequest 호출됨:', serviceType);
  trackEvent('analysis_request', { serviceType });
}

// 결제 완료 추적
export function trackPaymentCompleted(serviceType: string, amount: number) {
  trackEvent('payment_completed', { serviceType, amount });
}

// 오류 발생 추적
export function trackError(errorType: string, isCritical: boolean = false) {
  trackEvent('error_occurred', { errorType, isCritical });
}

// 세션 종료 추적
export function trackSessionEnd() {
  trackEvent('session_end');
}

// 초기화 중복 방지
let isInitialized = false;

// 페이지 로드시 자동 추적 설정
export function initializeAnalytics() {
  if (isInitialized) return;
  isInitialized = true;
  
  // admin 페이지는 완전히 제외
  if (window.location.pathname.includes('/admin')) {
    console.log('🚫 Admin 페이지에서는 Analytics 초기화하지 않음');
    return;
  }
  
  // 페이지 로드시 방문 추적
  trackPageView();
  
  // 페이지 언로드시 세션 종료
  window.addEventListener('beforeunload', () => {
    trackSessionEnd();
  });
  
  // 페이지 가시성 변경시 추적
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      trackSessionEnd();
    }
  });
  
  console.log('📊 Analytics initialized for session:', getSessionId());
}