'use client';

import { useState } from 'react';
import type { FortuneAnalysis, APIResponse } from '@/types/analysis';

interface FortuneAnalyzerProps {
  onBack: () => void;
}

export default function FortuneAnalyzer({ onBack }: FortuneAnalyzerProps) {
  const [step, setStep] = useState<'input' | 'analyzing' | 'result' | 'error'>('input');
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    gender: '' as 'male' | 'female' | '',
    name: ''
  });
  const [result, setResult] = useState<FortuneAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.birthDate) {
      alert('생년월일을 입력해주세요.');
      return;
    }

    try {
      setStep('analyzing');
      setError(null);

      const response = await fetch('/api/analysis/fortune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          gender: formData.gender
        }),
      });

      const data: APIResponse<FortuneAnalysis> = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || '사주 분석에 실패했습니다.');
      }

      if (!data.data) {
        throw new Error('분석 결과를 받을 수 없습니다.');
      }

      setResult(data.data);
      setStep('result');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      setStep('error');
    }
  };

  const resetAnalysis = () => {
    setStep('input');
    setResult(null);
    setError(null);
  };

  const shareResult = async () => {
    if (!result) return;
    
    const shareText = `내 사주 분석 결과! 🔮\n\n성격: ${result.saju.personality}\n직업: ${result.saju.career}\n\n올해 운세: ${result.timing.currentYear}\n\n#사주 #운세 #내얼굴탐구생활`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '내 사주 분석 결과',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            돌아가기
          </button>
          <div className="text-sm text-gray-500">
            🔮 사주 분석
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🌟 사주명리로 보는 당신의 운명
        </h2>
        <p className="text-gray-600">
          생년월일시를 바탕으로 오행 분석과 함께 성격, 직업, 연애, 건강운을 알아보세요
        </p>
      </div>

      {step === 'input' && (
        <div className="space-y-6">
          {/* 정보 입력 폼 */}
          <form onSubmit={handleSubmit} className="card">
            <h3 className="text-xl font-semibold mb-6">생년월일시 정보 입력</h3>
            
            <div className="space-y-6">
              {/* 생년월일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생년월일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="input-field"
                  max={new Date().toISOString().split('T')[0]} // 오늘 이후 날짜 방지
                />
              </div>

              {/* 출생시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출생시간 (시:분 형태로 입력) 
                </label>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                  className="input-field"
                  placeholder="예: 14:30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * 정확한 시간(시:분)을 입력하면 더 정밀한 사주 분석이 가능합니다
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  * 모르시면 비워두셔도 됩니다 (정오 12:00으로 계산)
                </p>
              </div>

              {/* 성별 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">성별</label>
                <div className="flex space-x-4">
                  {[
                    { value: 'male', label: '남성', icon: '👨' },
                    { value: 'female', label: '여성', icon: '👩' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: option.value as any }))}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        formData.gender === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 이름 (선택사항) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 (선택사항)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="이름을 입력하시면 더 개인화된 분석을 받을 수 있어요"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-6">
              🔮 사주 분석 시작하기
            </button>
          </form>

          {/* 사주 분석 안내 */}
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <h3 className="text-lg font-semibold mb-3 text-purple-900">📖 사주명리란?</h3>
            <div className="text-sm text-purple-800 space-y-2">
              <p>
                사주명리는 태어난 연, 월, 일, 시의 간지(干支)를 바탕으로 
                개인의 성격과 운명을 분석하는 동양의 전통 점술입니다.
              </p>
              <p>
                오행(목, 화, 토, 금, 수)의 조화를 통해 성향을 파악하고, 
                대운과 세운을 통해 인생의 흐름을 예측합니다.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[
                { element: '목', color: 'bg-green-100 text-green-800', desc: '성장' },
                { element: '화', color: 'bg-red-100 text-red-800', desc: '열정' },
                { element: '토', color: 'bg-yellow-100 text-yellow-800', desc: '안정' },
                { element: '금', color: 'bg-gray-100 text-gray-800', desc: '결단' },
                { element: '수', color: 'bg-blue-100 text-blue-800', desc: '지혜' }
              ].map((item) => (
                <div key={item.element} className={`p-2 rounded text-center text-xs ${item.color}`}>
                  <div className="font-bold">{item.element}</div>
                  <div>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'analyzing' && (
        <div className="card text-center">
          <div className="loading-spinner w-16 h-16 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            🔮 사주를 분석하고 있습니다...
          </h2>
          <p className="text-gray-600">
            생년월일시를 바탕으로 오행과 간지를 계산하고 있어요
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {formData.name ? `${formData.name}님의` : '고객님의'} 인생 전반을 살펴보는 중...
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-6">
          {/* 오행 분석 */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">🌟 오행 분석</h3>
            <div className="flex justify-center space-x-2 mb-4">
              {result.saju.elements.map((element, index) => (
                <div 
                  key={index}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    element === '목' ? 'bg-green-500' :
                    element === '화' ? 'bg-red-500' :
                    element === '토' ? 'bg-yellow-500' :
                    element === '금' ? 'bg-gray-500' :
                    'bg-blue-500'
                  }`}
                >
                  {element}
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600">
              주요 오행: {result.saju.elements.join(', ')}
            </p>
          </div>

          {/* 성격 분석 */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">👤 성격 분석</h3>
            <p className="text-gray-700 leading-relaxed">{result.saju.personality}</p>
          </div>

          {/* 운세 분석 */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">🔮 분야별 운세</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💼 직업운</h4>
                <p className="text-blue-800 text-sm">{result.saju.career}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <h4 className="font-semibold text-pink-900 mb-2">💕 연애/결혼운</h4>
                <p className="text-pink-800 text-sm">{result.saju.relationship}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">🏥 건강운</h4>
                <p className="text-green-800 text-sm">{result.saju.health}</p>
              </div>
            </div>
          </div>

          {/* 시기별 운세 */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">📅 시기별 운세</h3>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🌟 올해 운세</h4>
                <p className="text-purple-800 text-sm">{result.timing.currentYear}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">🌙 다음 달 운세</h4>
                <p className="text-indigo-800 text-sm">{result.timing.nextMonth}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">💡 조언</h4>
                <p className="text-orange-800 text-sm">{result.timing.advice}</p>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-3">
            <button
              onClick={shareResult}
              className="flex-1 btn-primary"
            >
              📱 결과 공유하기
            </button>
            <button
              onClick={resetAnalysis}
              className="flex-1 btn-outline"
            >
              🔄 다시 분석하기
            </button>
          </div>
        </div>
      )}

      {step === 'error' && (
        <div className="card text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            사주 분석 중 오류가 발생했습니다
          </h2>
          <p className="text-gray-600 mb-6">
            {error || '알 수 없는 오류가 발생했습니다.'}
          </p>
          <button 
            onClick={resetAnalysis}
            className="btn-primary"
          >
            다시 시도하기
          </button>
        </div>
      )}
    </div>
  );
}