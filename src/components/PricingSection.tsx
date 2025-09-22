'use client';

import { useState } from 'react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  badge?: string;
  ctaText: string;
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'basic',
    name: '얼굴 MBTI',
    price: 900,
    description: '기본 얼굴 분석으로 성향 파악',
    features: [
      '얼굴 인식 및 특징 분석',
      'MBTI 성향 추정',
      '기본 성격 해석',
      '간단한 조언 제공'
    ],
    ctaText: '900원으로 시작하기'
  },
  {
    id: 'premium',
    name: '관상 + 이상형',
    price: 9900,
    originalPrice: 12800,
    description: '관상 분석 + AI 이상형 이미지 생성',
    features: [
      '위 기본 분석 모두 포함',
      'AI 이상형 얼굴 이미지 1장',
      '궁합 분석 및 설명',
      '관계 조언 포함'
    ],
    badge: '인기',
    ctaText: '9,900원으로 업그레이드',
    popular: true
  },
  {
    id: 'professional',
    name: '전문가 관상',
    price: 9900,
    description: '상세한 관상 부위별 전문 분석',
    features: [
      '이마, 눈, 코, 입, 턱 부위별 분석',
      '성격, 운세, 건강 종합 해석',
      '상세한 조언 및 주의사항',
      '전문가급 관상 리포트'
    ],
    ctaText: '전문 분석 받기'
  },
  {
    id: 'comprehensive',
    name: '올인원 패키지',
    price: 19900,
    originalPrice: 29700,
    description: '관상 + 손금 + 사주 종합 분석',
    features: [
      '모든 기본/프리미엄 분석 포함',
      '손금 분석 (건강/재물/연애운)',
      '사주 분석 (대운/세운 포함)',
      '종합 운세 리포트',
      'PDF 다운로드 제공'
    ],
    badge: '최고가치',
    ctaText: '완전 분석 받기'
  }
];

export default function PricingSection() {
  const [selectedTier, setSelectedTier] = useState<string>('premium');

  const handleSelectPlan = (tierId: string) => {
    setSelectedTier(tierId);
    // 실제로는 결제 플로우로 이동
    console.log(`Selected plan: ${tierId}`);
  };

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            💎 분석 패키지 선택
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            기본 분석부터 종합 리포트까지, 원하는 수준의 분석을 선택하세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`
                relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl cursor-pointer
                ${selectedTier === tier.id 
                  ? 'border-primary-500 transform scale-105' 
                  : 'border-gray-200 hover:border-primary-300'
                }
                ${tier.popular ? 'ring-2 ring-primary-200' : ''}
              `}
              onClick={() => setSelectedTier(tier.id)}
            >
              {/* Badge */}
              {tier.badge && (
                <div className={`
                  absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium text-white
                  ${tier.popular ? 'bg-primary-500' : 'bg-secondary-500'}
                `}>
                  {tier.badge}
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {tier.description}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {tier.price.toLocaleString()}원
                      </span>
                    </div>
                    {tier.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        원가 {tier.originalPrice.toLocaleString()}원
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(tier.id);
                  }}
                  className={`
                    w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                    ${selectedTier === tier.id
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {tier.ctaText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            💳 카카오페이, 네이버페이, 카드결제 지원
          </p>
          <p className="text-sm text-gray-500">
            ✨ 모든 분석 결과는 SNS 공유 가능 | 📱 모바일 최적화 완료
          </p>
        </div>
      </div>
    </section>
  );
}