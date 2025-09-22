'use client';

import React, { useState, useEffect } from 'react';
import type { APIResponse } from '@/types/analysis';

// 이니시스 전역 객체 타입 선언
declare global {
  interface Window {
    INIStdPay: {
      pay: (form: HTMLFormElement) => void;
    };
  }
}

interface PaymentProps {
  serviceType: string;
  amount: number;
  productName: string;
  onPaymentComplete?: (result: any) => void;
  onPaymentError?: (error: any) => void;
}

interface InicisPaymentData {
  orderId: string;
  paymentData: any;
  inicisJsUrl: string;
  isMobile: boolean;
  serviceInfo: {
    serviceType: string;
    productName: string;
    amount: number;
  };
}

export default function InicisPayment({
  serviceType,
  amount,
  productName,
  onPaymentComplete,
  onPaymentError
}: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buyerInfo = {
    name: '구매자',
    phone: '01000000000',
    email: 'anonymous@facewisdom-ai.xyz'
  };

  // 모바일 기기 감지 (SSR 안전)
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // 결제창에서 메시지 수신 처리
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 PostMessage 수신됨:', event.data);

      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'PAYMENT_SUCCESS':
            console.log('✅ 결제 성공 메시지 수신:', event.data.data);
            if (onPaymentComplete) {
              onPaymentComplete(event.data.data);
            }
            break;
          case 'PAYMENT_FAILED':
            console.log('❌ 결제 실패:', event.data.data);
            if (onPaymentError) {
              onPaymentError(event.data.data);
            }
            break;
          case 'PAYMENT_CANCELLED':
            console.log('🔴 결제 취소:', event.data.data);
            if (onPaymentError) {
              onPaymentError({ message: '결제가 취소되었습니다.' });
            }
            break;
          default:
            console.log('🤷 알 수 없는 메시지 타입:', event.data.type);
        }
      }
    };

    console.log('👂 PostMessage 리스너 등록됨');
    window.addEventListener('message', handleMessage);
    return () => {
      console.log('👋 PostMessage 리스너 제거됨');
      window.removeEventListener('message', handleMessage);
    };
  }, [onPaymentComplete, onPaymentError]);

  const handlePayment = async () => {
    console.log('🔷 결제 버튼 클릭됨', { buyerInfo });


    setIsLoading(true);
    setError(null);

    console.log('💳 결제 프로세스 시작');

    try {
      // 결제 요청 데이터 생성
      const response = await fetch('/api/payment/inicis/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType,
          amount,
          buyerName: buyerInfo.name,
          buyerPhone: buyerInfo.phone,
          buyerEmail: buyerInfo.email,
          sessionId: generateSessionId(),
          isMobile: isMobile()
        }),
      });

      const result: APIResponse<InicisPaymentData> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || '결제 요청 생성에 실패했습니다.');
      }

      console.log('💳 결제 요청 생성 성공:', result.data);

      // 이니시스 공식 가이드에 따른 결제창 열기
      await openInicisPayment(result.data);

    } catch (error: any) {
      console.error('결제 요청 오류:', error);
      setError(error.message || '결제 요청 중 오류가 발생했습니다.');
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openInicisPayment = async (paymentData: InicisPaymentData) => {
    try {
      console.log('🔷 이니시스 결제창 열기 시작');
      console.log('📋 결제 데이터:', paymentData.paymentData);

      // 기존 form 제거
      const existingForm = document.getElementById('inicis-payment-form');
      if (existingForm) {
        existingForm.remove();
      }

      // 이니시스 공식 가이드에 따른 폼 생성
      const form = document.createElement('form');
      form.id = 'inicis-payment-form';
      form.method = 'POST';
      form.style.display = 'none';

      // 테스트/운영 환경 구분
      const isTestMode = paymentData.paymentData.mid === 'INIpayTest';

      // 서버에서 전달받은 모바일 여부와 클라이언트 검사 병행
      const isMobileDevice = paymentData.isMobile || isMobile();

      if (isMobileDevice) {
        // 모바일 결제 URL (이니시스 공식 가이드)
        form.action = isTestMode
          ? 'https://mobile.inicis.com/smart/payment/'
          : 'https://mobile.inicis.com/smart/payment/';
      } else {
        // PC 결제는 JS 팝업 방식 사용 (form action 불필요)
        form.action = '';
      }

      // 이니시스 공식 가이드 필수 파라미터들
      const requiredParams = [
        'version',       // 버전 (1.0 고정)
        'mid',          // 상점아이디
        'oid',          // 주문번호
        'price',        // 결제금액
        'timestamp',    // 타임스탬프
        'signature',    // 전자서명
        'mKey',         // 암호화키 (필수)
        'returnUrl',    // 결과수신 URL
        'closeUrl',     // 결제창 닫기 URL
        'goodname',     // 상품명
        'buyername',    // 구매자명
        'buyertel',     // 구매자연락처
        'buyeremail',   // 구매자이메일
        'currency',     // 통화코드
        'gopaymethod',  // 결제방법
        'acceptmethod', // 결제옵션
        'languageView', // 언어설정
        'charset',      // 인코딩
        'verification'  // 검증데이터
      ];

      // 모바일 추가 파라미터
      if (isMobileDevice) {
        requiredParams.push('P_RESERVED'); // 모바일 앱 스킴 등
      }

      console.log('📋 폼 파라미터 추가:');
      requiredParams.forEach(key => {
        const value = paymentData.paymentData[key];
        if (value !== undefined && value !== null) {
          console.log(`  ${key}: ${value}`);
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);

      // 결제창 열기 (PC/모바일 구분)
      if (isMobileDevice) {
        // 모바일: 현재 창에서 결제
        form.target = '_self';
        form.submit();
        console.log('✅ 모바일 결제창 이동 완료');
      } else {
        // PC: INIStdPay JS 팝업 방식
        console.log('🖥️ PC 결제 JS 팝업 진행');

        try {
          // INIStdPay JS 스크립트 동적 로드
          const loadINIStdPay = () => {
            return new Promise((resolve, reject) => {
              if (window.INIStdPay) {
                resolve(window.INIStdPay);
                return;
              }

              const script = document.createElement('script');
              script.src = isTestMode
                ? 'https://stgstdpay.inicis.com/stdjs/INIStdPay.js'
                : 'https://stdpay.inicis.com/stdjs/INIStdPay.js';

              script.onload = () => {
                console.log('✅ INIStdPay JS 로드 완료');
                resolve(window.INIStdPay);
              };

              script.onerror = () => {
                reject(new Error('이니시스 결제 스크립트를 로드할 수 없습니다.'));
              };

              document.head.appendChild(script);
            });
          };

          await loadINIStdPay();

          // INIStdPay.pay() 호출
          window.INIStdPay.pay(form);
          console.log('✅ PC 결제 팝업 열기 완료');

        } catch (popupError) {
          console.error('❌ 팝업 열기 실패:', popupError);
          throw new Error('결제창을 열 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
      }

      // form 정리
      setTimeout(() => {
        if (form.parentNode) {
          form.parentNode.removeChild(form);
        }
      }, 1000);

    } catch (error: any) {
      console.error('❌ 결제 오류:', error);
      setError(error.message || '결제창을 열 수 없습니다. 잠시 후 다시 시도해주세요.');
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

      {/* 이니시스 공식 가이드 기반 결제 안내 */}
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
              <p>• {isMobile() ? '결제 페이지로 이동' : '새 창'}에서 카드 정보를 안전하게 입력하게 됩니다</p>
              <p>• 신용카드, 체크카드, 계좌이체, 가상계좌 결제 가능</p>
              <p>• 모든 결제 정보는 암호화되어 안전하게 처리됩니다</p>
              {!isMobile() && <p>• 팝업 차단이 설정된 경우 결제창이 열리지 않을 수 있습니다</p>}
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

      {/* 테스트 결제 시뮬레이션 버튼 */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700 mb-2">
          💳 테스트용: 실제 결제 없이 완료 시뮬레이션
        </p>
        <button
          onClick={() => {
            console.log('🧪 테스트 결제 완료 시뮬레이션');
            if (onPaymentComplete) {
              onPaymentComplete({
                tid: 'TEST_' + Date.now(),
                oid: 'TEST_ORDER_' + Date.now(),
                amount: amount,
                resultCode: '0000',
                resultMsg: '정상처리',
                payMethod: '카드',
                applDate: new Date().toISOString().slice(0, 8),
                applTime: new Date().toTimeString().slice(0, 8)
              });
            }
          }}
          className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg"
        >
          [개발용] 결제 완료 시뮬레이션
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p className="flex items-center justify-center space-x-1">
          <span>안전한</span>
          <span className="font-semibold text-blue-600">KG이니시스</span>
          <span>결제 시스템</span>
        </p>
        <p>이니시스 공식 가이드 기반 구현</p>
      </div>
    </div>
  );
}