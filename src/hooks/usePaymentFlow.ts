'use client';

import { useState, useCallback } from 'react';
import { getServicePricing, isPaymentRequired } from '@/config/pricing';
import type { APIResponse } from '@/types/analysis';

export interface PaymentState {
  isPaymentRequired: boolean;
  isPaid: boolean;
  isProcessingPayment: boolean;
  paymentError: string | null;
  orderId: string | null;
  transactionId: string | null;
}

export interface PaymentFlowHookReturn {
  paymentState: PaymentState;
  checkPaymentRequired: (serviceId: string) => boolean;
  initiatePayment: (serviceId: string, buyerInfo: BuyerInfo) => Promise<void>;
  handlePaymentSuccess: (paymentResult: any) => void;
  handlePaymentError: (error: any) => void;
  resetPayment: () => void;
}

export interface BuyerInfo {
  name: string;
  phone: string;
  email?: string;
}

export default function usePaymentFlow(): PaymentFlowHookReturn {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isPaymentRequired: false,
    isPaid: false,
    isProcessingPayment: false,
    paymentError: null,
    orderId: null,
    transactionId: null
  });

  // 결제 필요 여부 확인
  const checkPaymentRequired = useCallback((serviceId: string): boolean => {
    const required = isPaymentRequired(serviceId);
    setPaymentState(prev => ({
      ...prev,
      isPaymentRequired: required,
      isPaid: !required // 무료 서비스인 경우 즉시 paid 상태로
    }));
    return required;
  }, []);

  // 결제 시작
  const initiatePayment = useCallback(async (serviceId: string, buyerInfo: BuyerInfo) => {
    const pricing = getServicePricing(serviceId);
    if (!pricing || !pricing.isPaymentRequired) {
      console.warn('결제가 필요하지 않은 서비스입니다:', serviceId);
      return;
    }

    setPaymentState(prev => ({
      ...prev,
      isProcessingPayment: true,
      paymentError: null
    }));

    try {
      // 결제 요청 API 호출
      const response = await fetch('/api/payment/inicis/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType: serviceId,
          amount: pricing.price,
          buyerName: buyerInfo.name,
          buyerPhone: buyerInfo.phone,
          buyerEmail: buyerInfo.email,
          sessionId: generateSessionId()
        }),
      });

      const result: APIResponse<any> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || '결제 요청 생성에 실패했습니다.');
      }

      console.log('💳 결제 요청 생성 성공:', result.data);

      // 주문번호 저장
      setPaymentState(prev => ({
        ...prev,
        orderId: result.data.orderId
      }));

      // 이니시스 결제창 열기
      openInicisPaymentWindow(result.data);

    } catch (error: any) {
      console.error('결제 시작 오류:', error);
      setPaymentState(prev => ({
        ...prev,
        isProcessingPayment: false,
        paymentError: error.message || '결제 시작 중 오류가 발생했습니다.'
      }));
    }
  }, []);

  // 이니시스 결제창 열기
  const openInicisPaymentWindow = (paymentData: any) => {
    try {
      // 전역 INIStdPay 함수 확인
      if (typeof (window as any).INIStdPay === 'undefined') {
        // 스크립트가 로드되지 않은 경우 동적 로드
        loadInicisScript().then(() => {
          (window as any).INIStdPay.pay(paymentData.paymentData);
        });
      } else {
        (window as any).INIStdPay.pay(paymentData.paymentData);
      }
    } catch (error) {
      console.error('결제창 열기 오류:', error);
      setPaymentState(prev => ({
        ...prev,
        isProcessingPayment: false,
        paymentError: '결제창을 열 수 없습니다.'
      }));
    }
  };

  // 이니시스 스크립트 동적 로드
  const loadInicisScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('inicis-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'inicis-script';
      script.src = 'https://stgstdpay.inicis.com/stdjs/INIStdPay.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('이니시스 스크립트 로드 실패'));
      
      document.head.appendChild(script);
    });
  };

  // 결제 성공 처리
  const handlePaymentSuccess = useCallback((paymentResult: any) => {
    console.log('✅ 결제 성공:', paymentResult);
    
    setPaymentState(prev => ({
      ...prev,
      isPaid: true,
      isProcessingPayment: false,
      paymentError: null,
      transactionId: paymentResult.tid || paymentResult.transactionId
    }));
  }, []);

  // 결제 실패 처리
  const handlePaymentError = useCallback((error: any) => {
    console.error('❌ 결제 실패:', error);
    
    setPaymentState(prev => ({
      ...prev,
      isPaid: false,
      isProcessingPayment: false,
      paymentError: error.message || '결제에 실패했습니다.'
    }));
  }, []);

  // 결제 상태 리셋
  const resetPayment = useCallback(() => {
    setPaymentState({
      isPaymentRequired: false,
      isPaid: false,
      isProcessingPayment: false,
      paymentError: null,
      orderId: null,
      transactionId: null
    });
  }, []);

  return {
    paymentState,
    checkPaymentRequired,
    initiatePayment,
    handlePaymentSuccess,
    handlePaymentError,
    resetPayment
  };
}

// 세션 ID 생성
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}