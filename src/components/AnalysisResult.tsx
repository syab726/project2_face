'use client';

import { useState } from 'react';
import ShareModal from './ShareModal';
import { type ShareData } from '@/lib/social-share';
import type { MBTIAnalysisResult } from '@/types/analysis';

interface AnalysisResultProps {
  result: MBTIAnalysisResult;
  onUpgradeClick: (tier: string) => void;
  onRestart: () => void;
}

export default function AnalysisResult({ 
  result, 
  onUpgradeClick, 
  onRestart 
}: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'traits' | 'compatibility'>('overview');
  const [shareModal, setShareModal] = useState(false);

  const getTraitLabel = (trait: keyof typeof result.traits) => {
    const labels = {
      extraversion: { label: '외향성', opposite: '내향성' },
      intuition: { label: '직감', opposite: '감각' },
      thinking: { label: '사고', opposite: '감정' },
      judging: { label: '판단', opposite: '인식' }
    };
    return labels[trait];
  };

  const getTraitBar = (value: number, trait: keyof typeof result.traits) => {
    const traitInfo = getTraitLabel(trait);
    const isLeft = value < 50;
    const percentage = isLeft ? (50 - value) : (value - 50);
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={isLeft ? 'font-semibold text-primary-600' : 'text-gray-500'}>
            {traitInfo.opposite}
          </span>
          <span className={!isLeft ? 'font-semibold text-primary-600' : 'text-gray-500'}>
            {traitInfo.label}
          </span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute inset-0 flex">
            <div 
              className={`bg-blue-400 transition-all duration-1000 ${isLeft ? '' : 'ml-auto'}`}
              style={{ width: `${percentage * 2}%` }}
            />
          </div>
          <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-400 transform -translate-x-0.5" />
        </div>
        <div className="text-center text-xs text-gray-600">
          {value}%
        </div>
      </div>
    );
  };

  const shareData: ShareData = {
    title: `내 얼굴 MBTI는 ${result.mbtiType}!`,
    text: `${result.description}\n\nAI가 분석한 나의 얼굴과 성격! 당신도 해보세요!`,
    url: typeof window !== 'undefined' ? window.location.href : '',
    hashtags: ['얼굴분석', 'MBTI', 'AI분석', '내얼굴탐구생활', result.mbtiType],
    imageUrl: '/images/og-mbti.png'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* MBTI 결과 헤더 */}
      <div className="card text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full text-white text-3xl font-bold">
            {result.mbtiType}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            당신의 얼굴 MBTI는 <span className="text-primary-600">{result.mbtiType}</span>
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-500">신뢰도</span>
            <div className="flex-1 max-w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-1000"
                style={{ width: `${result.confidence}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-green-600">{result.confidence}%</span>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: '요약', icon: '📋' },
          { id: 'traits', label: '성향 분석', icon: '📊' },
          { id: 'compatibility', label: '궁합', icon: '💕' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="card">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">성격 분석</h3>
            <p className="text-gray-700 leading-relaxed">{result.description}</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6">조언</h3>
            <p className="text-gray-700 leading-relaxed">{result.advice}</p>
          </div>
        )}

        {activeTab === 'traits' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">성향 상세 분석</h3>
            {Object.entries(result.traits).map(([trait, value]) => (
              <div key={trait}>
                {getTraitBar(value, trait as keyof typeof result.traits)}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'compatibility' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">잘 맞는 MBTI 유형</h3>
            <div className="grid grid-cols-2 gap-4">
              {result.compatibility.map((type) => (
                <div key={type} className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-2">{type}</div>
                  <div className="text-sm text-gray-600">
                    {type === 'INFJ' && '이상주의적이고 창의적'}
                    {type === 'INTJ' && '전략적이고 독립적'}
                    {type === 'ENFJ' && '카리스마 있고 영감을 주는'}
                    {type === 'ENTP' && '창의적이고 똑똑한'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 업그레이드 옵션 */}
      <div className="space-y-4">
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            🎭 더 자세한 분석을 원하시나요?
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => onUpgradeClick('premium')}
              className="btn-primary w-full"
            >
              이상형 이미지 생성 (9,900원)
            </button>
            <button
              onClick={() => onUpgradeClick('professional')}
              className="btn-outline w-full"
            >
              전문가 관상 분석 (9,900원)
            </button>
            <button
              onClick={() => onUpgradeClick('comprehensive')}
              className="btn-secondary w-full"
            >
              종합 분석 패키지 (19,900원)
            </button>
          </div>
        </div>

        {/* 공유 및 기타 액션 */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShareModal(true)}
            className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            📱 결과 공유하기
          </button>
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            🔄 다시 분석하기
          </button>
        </div>
      </div>

      {/* 공유 모달 */}
      <ShareModal
        isOpen={shareModal}
        onClose={() => setShareModal(false)}
        shareData={shareData}
      />
    </div>
  );
}