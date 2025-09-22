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
    alert('결제 시작 - 디버그 모드'); // 디버그용
    setIsLoading(true);
    setError(null);

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
          isMobile: false
        }),
      });

      const result: APIResponse<any> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || '결제 요청 생성에 실패했습니다.');
      }

      console.log('💳 결제 데이터 생성 완료:', result.data);
      alert(`API 응답 성공: MID=${result.data.paymentData.mid}`);

      // 2. INIStdPay.js 로드
      const isTestMode = result.data.paymentData.mid === 'INIpayTest';
      const scriptUrl = isTestMode
        ? 'https://stgstdpay.inicis.com/stdjs/INIStdPay.js'
        : 'https://stdpay.inicis.com/stdjs/INIStdPay.js';

      console.log('📜 스크립트 로딩:', scriptUrl, '| 테스트 모드:', isTestMode);

      // 기존 INIStdPay 객체와 스크립트 정리
      if (window.INIStdPay) {
        console.log('🧹 기존 INIStdPay 객체 정리');
        delete window.INIStdPay;
      }

      // 기존 스크립트들 모두 제거
      const existingScripts = document.querySelectorAll('script[src*="INIStdPay.js"]');
      existingScripts.forEach(script => script.remove());

      // 스크립트 로드 (더 안전한 방법)
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.type = 'text/javascript';
        script.charset = 'utf-8';

        script.onload = () => {
          console.log('✅ INIStdPay.js 로드 성공');
          alert('스크립트 로드 성공');
          // 스크립트 로드 후 잠시 대기
          setTimeout(() => {
            if (window.INIStdPay && typeof window.INIStdPay.pay === 'function') {
              console.log('✅ INIStdPay 객체 확인됨');
              alert('INIStdPay 객체 확인됨');
              resolve(true);
            } else {
              console.error('❌ INIStdPay 객체를 찾을 수 없음');
              alert('INIStdPay 객체 없음');
              reject(new Error('INIStdPay 객체 초기화 실패'));
            }
          }, 500);
        };

        script.onerror = (error) => {
          console.error('❌ INIStdPay.js 로드 실패:', error);
          reject(new Error('결제 스크립트 로드 실패'));
        };

        document.head.appendChild(script);
      });

      // 3. 결제 폼 생성
      const formId = 'inicis-payment-form-' + Date.now();
      const existingForm = document.getElementById(formId);
      if (existingForm) {
        existingForm.remove();
      }

      const form = document.createElement('form');
      form.id = formId;
      form.method = 'POST';
      form.style.display = 'none';

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

      // 4. 결제창 호출
      console.log('🚀 INIStdPay.pay() 호출 준비');
      console.log('📋 INIStdPay 객체 상태:', {
        exists: !!window.INIStdPay,
        hasPayMethod: !!(window.INIStdPay && window.INIStdPay.pay),
        type: typeof window.INIStdPay?.pay
      });

      if (window.INIStdPay && typeof window.INIStdPay.pay === 'function') {
        try {
          console.log('🎯 INIStdPay.pay 실행...');
          console.log('📝 폼 요소:', form);
          console.log('📝 폼 파라미터 수:', form.children.length);

          // 직접 호출 (팝업 차단 방지를 위해 setTimeout 제거)
          alert('INIStdPay.pay() 호출 시작');
          window.INIStdPay.pay(form);

          console.log('✅ 결제창 호출 명령 완료');
          console.log('⏳ 결제창이 열렸는지 확인해주세요');
          alert('INIStdPay.pay() 호출 완료');

          // 10초 후 로딩 상태 해제 (타임아웃 방지)
          setTimeout(() => {
            if (isLoading) {
              console.log('⚠️ 10초 경과 - 로딩 상태 해제');
              setIsLoading(false);
              setError('결제창이 열리지 않았다면 팝업 차단을 해제하고 다시 시도해주세요.');
            }
          }, 10000);

        } catch (popupError) {
          console.error('❌ 팝업 호출 오류:', popupError);
          setError('결제창을 열 수 없습니다. 팝업 차단을 해제하고 다시 시도해주세요.');
          setIsLoading(false);
        }
      } else {
        console.error('❌ INIStdPay 객체 또는 pay 함수를 찾을 수 없음');
        throw new Error('INIStdPay 객체를 찾을 수 없습니다');
      }

      // 폼 정리
      setTimeout(() => {
        const formElement = document.getElementById(formId);
        if (formElement && formElement.parentNode) {
          formElement.parentNode.removeChild(formElement);
        }
      }, 5000);

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
              <p>• 새 창에서 카드 정보를 안전하게 입력하게 됩니다</p>
              <p>• 신용카드, 체크카드, 계좌이체 결제 가능</p>
              <p>• 팝업 차단이 설정된 경우 결제창이 열리지 않을 수 있습니다</p>
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
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">팝업 차단 해제 필요</h4>
            <div className="text-sm text-yellow-700">
              <p className="font-medium text-red-600">중요: 결제창이 팝업으로 열립니다</p>
              <p>• 브라우저 주소창 옆 팝업 차단 아이콘을 클릭하여 허용</p>
              <p>• Chrome: 설정 → 개인정보 및 보안 → 사이트 설정 → 팝업</p>
              <p>• 결제 버튼 클릭 후 새 창이 열리지 않으면 팝업이 차단된 것입니다</p>
            </div>
          </div>
        </div>
      </div>

      {/* 디버그 정보 */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-600">
          <p className="font-semibold">디버그 정보:</p>
          <p>• 테스트 모드: 활성 (INIpayTest)</p>
          <p>• 결제 버튼 클릭 후 브라우저 개발자 도구 콘솔을 확인하세요 (F12)</p>
          <p>• 문제 발생시 콘솔 로그를 캡처하여 개발팀에 전달해주세요</p>
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