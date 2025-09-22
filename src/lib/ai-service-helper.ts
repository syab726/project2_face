/**
 * ⚠️ 중요 경고: AI 서비스 헬퍼 수정 금지
 * 
 * 이 헬퍼는 사용자의 명시적 요청에 따라 완전히 잠금 상태입니다.
 * AI 서비스 싱글톤 인스턴스와 함수 export 를 담당합니다.
 * 
 * 수정 필요시 반드시 사용자 승인 필요
 * 마지막 승인: 2025-01-11
 * 
 * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
 */
// AI 서비스 lazy loading 헬퍼 (빌드 시 API 키 오류 방지)
import { aiServices } from '@/lib/ai-services';

// 이미 생성된 인스턴스를 사용
export function getAIService() {
  return aiServices;
}