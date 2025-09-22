'use client';

import { useState } from 'react';

interface ProcessingStep {
  name: string;
  description: string;
}

interface ImageProcessingStepsProps {
  steps: ProcessingStep[];
  confidence: number;
}

export default function ImageProcessingSteps({ 
  steps, 
  confidence 
}: ImageProcessingStepsProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return '매우 좋음';
    if (confidence >= 60) return '양호';
    if (confidence >= 40) return '보통';
    return '개선 필요';
  };

  return (
    <div className="card bg-blue-50 border-blue-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="text-2xl mr-2">🔬</span>
        이미지 전처리 분석
      </h3>
      
      {/* 전처리 신뢰도 */}
      <div className="mb-6 p-4 bg-white rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">손금선 검출 신뢰도</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(confidence)}`}>
            {confidence.toFixed(1)}% ({getConfidenceText(confidence)})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${
              confidence >= 80 ? 'bg-green-500' : 
              confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {confidence >= 80 ? '손금선이 매우 선명하게 검출되었습니다.' :
           confidence >= 60 ? '손금선이 적절하게 검출되었습니다.' :
           '손금선 검출이 다소 어려웠습니다. 더 밝은 조명에서 재촬영을 권장합니다.'}
        </p>
      </div>

      {/* 전처리 단계들 */}
      <div className="space-y-3">
        <h4 className="font-medium text-blue-900 mb-3">
          📋 적용된 이미지 전처리 기법 (plan2.md 기반)
        </h4>
        
        {steps.map((step, index) => (
          <div key={index} className="border border-blue-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedStep(expandedStep === index ? null : index)}
              className="w-full p-3 text-left bg-white hover:bg-blue-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 ${
                  index < 3 ? 'bg-blue-500' : 
                  index < 5 ? 'bg-green-500' : 'bg-purple-500'
                }`}>
                  {index + 1}
                </div>
                <span className="font-medium">{step.name}</span>
              </div>
              <svg 
                className={`w-5 h-5 transition-transform ${expandedStep === index ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedStep === index && (
              <div className="p-3 bg-blue-25 border-t border-blue-200">
                <p className="text-sm text-blue-800">{step.description}</p>
                
                {/* 단계별 설명 */}
                <div className="mt-3 text-xs text-blue-700">
                  {index === 0 && (
                    <div>
                      <strong>목적:</strong> 불필요한 색 정보를 제거하여 손금선에만 집중<br/>
                      <strong>효과:</strong> 처리 속도 향상 및 노이즈 감소
                    </div>
                  )}
                  {index === 1 && (
                    <div>
                      <strong>목적:</strong> 피부 노이즈와 소금-후추 노이즈 억제<br/>
                      <strong>효과:</strong> 손금선이 아닌 잡음 제거로 정확도 향상
                    </div>
                  )}
                  {index === 2 && (
                    <div>
                      <strong>목적:</strong> 지역별 대비 향상으로 흐릿한 손금선 강화<br/>
                      <strong>효과:</strong> 조명이 불균일해도 모든 영역의 손금선 선명화
                    </div>
                  )}
                  {index === 3 && (
                    <div>
                      <strong>목적:</strong> 어두운 손바닥 영역을 밝게 조정 (감마 &lt; 1.0)<br/>
                      <strong>효과:</strong> 그림자 영역의 손금선도 명확하게 표시
                    </div>
                  )}
                  {index === 4 && (
                    <div>
                      <strong>목적:</strong> 조명 불균일을 극복하고 손금선 강조<br/>
                      <strong>효과:</strong> 각 영역별로 최적의 임계값 적용하여 손금선 분리
                    </div>
                  )}
                  {index === 5 && (
                    <div>
                      <strong>목적:</strong> 끊긴 손금선을 자연스럽게 연결<br/>
                      <strong>효과:</strong> 노화나 피부 상태로 인한 선의 단절 보완
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 기술 정보 */}
      <div className="mt-6 p-3 bg-white rounded-lg border border-blue-200">
        <h5 className="font-medium text-blue-900 mb-2">🔧 적용 기술</h5>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
          <div>• Grayscale 변환</div>
          <div>• Median Blur</div>
          <div>• CLAHE 대비 향상</div>
          <div>• Gamma Correction</div>
          <div>• Adaptive Thresholding</div>
          <div>• Morphological Closing</div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          ✨ 전통적인 컴퓨터 비전 기법과 AI 분석을 결합하여 정확도를 크게 향상시켰습니다.
        </p>
      </div>
    </div>
  );
}