'use client';

import React, { useState } from 'react';
import type { APIResponse } from '@/types/analysis';

// 이니시스 전역 객체 타입 선언
declare global {
  interface Window {
    INIStdPay: {
      pay: (form: HTMLFormElement) => void;
    };
    // 결제 완료 콜백 함수
    paymentCompleteCallback?: (result: any) => void;
    paymentErrorCallback?: (error: any) => void;
  }
}

interface PaymentProps {
  serviceType: string;
  amount: number;
  productName: string;
  onPaymentComplete?: (result: any) => void;
  onPaymentError?: (error: any) => void;
}

export default function SimpleInicisPayment({
  serviceType,
  amount,
  productName,
  onPaymentComplete,
  onPaymentError
}: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    console.log('🔷 결제 시작');
    setIsLoading(true);
    setError(null);

    // AdSense 스크립트 간섭 방지
    try {
      // 기존 AdSense 관련 요소들 임시 제거
      const adsenseElements = document.querySelectorAll('.adsbygoogle, script[src*="adsbygoogle"]');
      adsenseElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    } catch (cleanupError) {
      console.warn('AdSense cleanup failed:', cleanupError);
    }

    // 전역 콜백 함수 설정
    window.paymentCompleteCallback = (result: any) => {
      console.log('✅ 전역 결제 완료 콜백 호출:', result);
      setIsLoading(false);
      if (onPaymentComplete) {
        onPaymentComplete(result);
      }
    };

    window.paymentErrorCallback = (error: any) => {
      console.log('❌ 전역 결제 오류 콜백 호출:', error);
      setIsLoading(false);
      if (onPaymentError) {
        onPaymentError(error);
      }
    };

    try {
      // 1. 결제 요청 데이터 생성
      const response = await fetch('/api/payment/inicis/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType,
          amount,
          buyerName: '구매자',
          buyerPhone: '01000000000',
          buyerEmail: 'anonymous@facewisdom-ai.xyz',
          sessionId: `session_${Date.now()}`,
          isMobile: true
        }),
      });

      const result: APIResponse<any> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || '결제 요청 생성에 실패했습니다.');
      }

      console.log('💳 결제 데이터 생성 완료:', result.data);

      // KG이니시스 JavaScript SDK 사용 방식
      const isTestMode = result.data.paymentData.mid === 'INIpayTest';

      // 이니시스 JavaScript SDK 동적 로드
      const loadINIStdPay = () => {
        return new Promise((resolve, reject) => {
          // 기존 스크립트 제거
          const existingScript = document.querySelector('script[src*="INIStdPay.js"]');
          if (existingScript) {
            existingScript.remove();
          }

          const script = document.createElement('script');
          // 검색 결과에서 확인된 올바른 URL 사용
          script.src = 'https://stdpay.inicis.com/stdjs/INIStdPay.js';
          script.charset = 'UTF-8';

          script.onload = () => {
            console.log('✅ INIStdPay 스크립트 로드 완료');
            resolve(window.INIStdPay);
          };

          script.onerror = () => {
            reject(new Error('이니시스 결제 스크립트 로드 실패'));
          };

          document.head.appendChild(script);
        });
      };

      // INIStdPay 로드 후 폼 처리
      await loadINIStdPay();

      const form = document.createElement('form');
      form.method = 'POST';
      form.style.display = 'none';
      form.name = 'StdPayForm';

      // 모든 파라미터 추가
      Object.keys(result.data.paymentData).forEach(key => {
        const value = result.data.paymentData[key];
        if (value !== undefined && value !== null) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
          console.log(`📝 ${key}: ${value}`);
        }
      });

      document.body.appendChild(form);

      console.log('🚀 INIStdPay.pay() 호출');

      // INIStdPay.pay() 호출로 결제창 열기
      try {
        if (window.INIStdPay && window.INIStdPay.pay) {
          window.INIStdPay.pay(form);
          console.log('✅ INIStdPay.pay() 호출 완료');
        } else {
          throw new Error('INIStdPay 객체를 찾을 수 없습니다.');
        }
      } catch (payError) {
        console.error('INIStdPay.pay() 호출 오류:', payError);
        setError('결제창을 열 수 없습니다. 잠시 후 다시 시도해주세요.');
        setIsLoading(false);
      }

    } catch (error: any) {
      console.error('❌ 결제 오류:', error);
      setError(error.message || '결제 처리 중 오류가 발생했습니다.');
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">결제 정보</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">상품명</p>
          <p className="font-semibold text-gray-800">{productName}</p>
          <p className="text-sm text-gray-600 mt-2">결제 금액</p>
          <p className="text-2xl font-bold text-blue-600">{formatAmount(amount)}원</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">KG이니시스 안전결제</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• 이니시스 결제 페이지로 이동하여 카드 정보를 입력합니다</p>
              <p>• 신용카드, 체크카드, 계좌이체 결제 가능</p>
              <p>• 결제 완료 후 자동으로 분석 페이지로 돌아옵니다</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            결제창 준비중...
          </div>
        ) : (
          `결제 및 분석 시작하기 - ${formatAmount(amount)}원`
        )}
      </button>

      {/* 팝업 차단 해제 안내 */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">결제 프로세스 안내</h4>
            <div className="text-sm text-yellow-700">
              <p className="font-medium text-blue-600">결제 페이지로 이동합니다</p>
              <p>• 결제 버튼 클릭 시 이니시스 결제 페이지로 이동</p>
              <p>• 카드 정보를 입력하여 결제 진행</p>
              <p>• 결제 완료 후 자동으로 분석 페이지로 돌아옵니다</p>
            </div>
          </div>
        </div>
      </div>

      {/* 디버그 정보 */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-600">
          <p className="font-semibold">결제 방식:</p>
          <p>• 테스트 모드: 활성 (실제 결제 없음)</p>
          <p>• 결제 페이지 직접 이동 방식 사용</p>
          <p>• 테스트용 카드로 결제 프로세스 체험 가능</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p className="flex items-center justify-center space-x-1">
          <span>안전한</span>
          <span className="font-semibold text-blue-600">KG이니시스</span>
          <span>결제 시스템</span>
        </p>
      </div>
    </div>
  );
}