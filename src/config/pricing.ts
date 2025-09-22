/**
 * 서비스별 가격 설정
 */

export interface ServicePricing {
  id: string;
  name: string;
  price: number;
  description: string;
  isPaymentRequired: boolean;
  category: 'basic' | 'premium' | 'professional';
}

export const SERVICE_PRICING: Record<string, ServicePricing> = {
  'professional-physiognomy': {
    id: 'professional-physiognomy',
    name: '전문 관상 분석',
    price: 9900,
    description: '전문적인 관상학 기반 심화 분석',
    isPaymentRequired: true,
    category: 'professional'
  },
  'mbti-face': {
    id: 'mbti-face',
    name: 'MBTI 얼굴 분석',
    price: 3900,
    description: '얼굴로 알아보는 MBTI 성격 유형',
    isPaymentRequired: true,
    category: 'basic'
  },
  'fortune': {
    id: 'fortune',
    name: '운세 분석',
    price: 4900,
    description: '오늘의 운세와 미래 전망',
    isPaymentRequired: true,
    category: 'premium'
  },
  'face-saju': {
    id: 'face-saju',
    name: '얼굴+사주 종합 분석',
    price: 19900,
    description: '얼굴과 사주를 결합한 종합 운명 분석',
    isPaymentRequired: true,
    category: 'premium'
  },
  'ideal-type': {
    id: 'ideal-type',
    name: '이상형 분석',
    price: 3900,
    description: '당신의 이상형 찾기',
    isPaymentRequired: true,
    category: 'basic'
  },
  'interview-face': {
    id: 'interview-face',
    name: '면접용 관상 분석',
    price: 900,
    description: '면접에 도움이 되는 기본 관상 분석',
    isPaymentRequired: true,
    category: 'basic'
  }
};

// 서비스별 가격 조회
export function getServicePricing(serviceId: string): ServicePricing | null {
  return SERVICE_PRICING[serviceId] || null;
}

// 결제 필요 여부 확인
export function isPaymentRequired(serviceId: string): boolean {
  const pricing = getServicePricing(serviceId);
  return pricing?.isPaymentRequired || false;
}

// 가격 포맷팅
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price);
}

// 할인가 계산 (필요시 사용)
export function calculateDiscountPrice(originalPrice: number, discountRate: number): number {
  return Math.floor(originalPrice * (1 - discountRate / 100));
}