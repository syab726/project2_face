'use client';

import { useState, useCallback } from 'react';
import type { MBTIAnalysisResult, APIResponse } from '@/types/analysis';

export type AnalysisStep = 'upload' | 'analyzing' | 'result' | 'error';

interface UseAnalysisReturn {
  step: AnalysisStep;
  isLoading: boolean;
  result: MBTIAnalysisResult | null;
  error: string | null;
  uploadedImage: File | null;
  analyzeImage: (file: File) => Promise<void>;
  resetAnalysis: () => void;
  setStep: (step: AnalysisStep) => void;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [step, setStep] = useState<AnalysisStep>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MBTIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const analyzeImage = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setUploadedImage(file);
      setStep('analyzing');

      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);

      // API 호출
      const response = await fetch('/api/analysis/mbti', {
        method: 'POST',
        body: formData,
      });

      const data: APIResponse<MBTIAnalysisResult> = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || '분석에 실패했습니다.');
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
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setStep('upload');
    setIsLoading(false);
    setResult(null);
    setError(null);
    setUploadedImage(null);
  }, []);

  return {
    step,
    isLoading,
    result,
    error,
    uploadedImage,
    analyzeImage,
    resetAnalysis,
    setStep,
  };
};