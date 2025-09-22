/**
 * 클라이언트 측 오류 추적 유틸리티
 * API 호출 실패시 자동으로 서버에 오류를 보고
 */

export async function reportApiError(
  serviceType: string,
  errorMessage: string,
  statusCode?: number
): Promise<void> {
  try {
    // 세션 ID 생성 또는 가져오기
    const sessionId = typeof window !== 'undefined' 
      ? window.sessionStorage.getItem('sessionId') || `client-${Date.now()}`
      : 'unknown';
    
    // 오류를 서버에 보고
    await fetch('/api/track-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        serviceType,
        errorType: statusCode === 500 ? 'server-error' : 'api-error',
        errorMessage: `${statusCode ? `${statusCode} - ` : ''}${errorMessage}`,
        isCritical: statusCode === 500,
      }),
    });
    
    console.log(`🚨 오류 보고 완료: ${serviceType} - ${errorMessage}`);
  } catch (error) {
    console.error('오류 보고 실패:', error);
  }
}

/**
 * API 응답 처리 헬퍼
 * JSON 파싱 오류 방지 및 자동 오류 추적
 */
export async function handleApiResponse(
  response: Response,
  serviceType: string
): Promise<any> {
  // 응답이 성공적이지 않으면 오류 처리
  if (!response.ok) {
    const errorMessage = `API 호출 실패: ${response.statusText}`;
    
    // 오류를 서버에 보고
    await reportApiError(serviceType, errorMessage, response.status);
    
    // HTML 응답인 경우 JSON 파싱하지 않음
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error(`서버 오류 (${response.status}): HTML 응답 받음`);
    }
    
    // JSON 응답 시도
    try {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || errorMessage);
    } catch {
      throw new Error(errorMessage);
    }
  }
  
  // 정상 응답 처리
  try {
    return await response.json();
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    throw new Error('응답 데이터 파싱 실패');
  }
}

// 서비스별 오류 보고 헬퍼
export const errorReporters = {
  mbti: (error: string, status?: number) => reportApiError('mbti-face', error, status),
  physiognomy: (error: string, status?: number) => reportApiError('professional-physiognomy', error, status),
  faceSaju: (error: string, status?: number) => reportApiError('face-saju', error, status),
  interview: (error: string, status?: number) => reportApiError('interview-face', error, status),
  fortune: (error: string, status?: number) => reportApiError('fortune', error, status),
};