'use client';

import { useState } from 'react';
import { SocialShareService, type ShareData } from '@/lib/social-share';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
}

export default function ShareModal({ isOpen, onClose, shareData }: ShareModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const handleShare = async (platform: string) => {
    try {
      await SocialShareService.share(platform, shareData);
      
      if (platform === 'copy') {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const shareOptions = [
    {
      id: 'native',
      name: '기본 공유',
      icon: '📱',
      color: 'bg-gray-500',
      available: typeof navigator !== 'undefined' && navigator.share
    },
    {
      id: 'kakao',
      name: '카카오톡',
      icon: '💬',
      color: 'bg-yellow-400'
    },
    {
      id: 'facebook',
      name: '페이스북',
      icon: '📘',
      color: 'bg-blue-600'
    },
    {
      id: 'twitter',
      name: '트위터',
      icon: '🐦',
      color: 'bg-sky-500'
    },
    {
      id: 'instagram',
      name: '인스타그램',
      icon: '📷',
      color: 'bg-pink-500'
    },
    {
      id: 'line',
      name: '라인',
      icon: '💚',
      color: 'bg-green-500'
    },
    {
      id: 'band',
      name: '밴드',
      icon: '🎵',
      color: 'bg-blue-500'
    },
    {
      id: 'naver',
      name: '네이버 블로그',
      icon: '📝',
      color: 'bg-green-600'
    },
    {
      id: 'telegram',
      name: '텔레그램',
      icon: '✈️',
      color: 'bg-blue-400'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '📞',
      color: 'bg-green-400'
    },
    {
      id: 'copy',
      name: '링크 복사',
      icon: copySuccess ? '✅' : '🔗',
      color: copySuccess ? 'bg-green-500' : 'bg-gray-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">결과 공유하기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 공유 내용 미리보기 */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-2">{shareData.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{shareData.text}</p>
          <div className="text-xs text-gray-500">
            {shareData.url}
          </div>
          {shareData.hashtags && (
            <div className="mt-2 flex flex-wrap gap-1">
              {shareData.hashtags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 공유 옵션 */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">공유할 플랫폼을 선택하세요</h3>
          <div className="grid grid-cols-3 gap-3">
            {shareOptions
              .filter(option => option.available !== false)
              .map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleShare(option.id)}
                  className={`p-4 rounded-xl text-white text-center transition-all hover:scale-105 ${option.color}`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-xs font-medium">{option.name}</div>
                </button>
              ))}
          </div>
          
          {/* 추가 안내 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 공유 팁</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 모바일에서는 "기본 공유"를 사용하면 더 많은 앱으로 공유할 수 있어요</li>
              <li>• 인스타그램은 텍스트가 자동 복사되어 스토리에 붙여넣기할 수 있어요</li>
              <li>• 링크 복사로 메신저나 이메일로도 공유 가능해요</li>
            </ul>
          </div>
        </div>

        {/* 바이럴 유도 */}
        <div className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-t border-gray-200">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-2">🎉 친구들도 궁금해할거예요!</h4>
            <p className="text-sm text-gray-600 mb-3">
              결과를 공유하면 친구들도 자신의 얼굴을 분석해볼 수 있어요
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <span>⭐</span>
              <span>AI 얼굴 분석</span>
              <span>⭐</span>
              <span>관상 · 손금 · 사주</span>
              <span>⭐</span>
              <span>이상형 생성</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}