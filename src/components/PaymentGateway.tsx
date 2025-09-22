'use client';

import React, { useState, useEffect } from 'react';
import { getServicePricing, formatPrice } from '@/config/pricing';
import usePaymentFlow, { type BuyerInfo } from '@/hooks/usePaymentFlow';

interface PaymentGatewayProps {
  serviceId: string;
  onPaymentComplete?: () => void;
  onPaymentSkip?: () => void; // 무료 서비스의 경우
  className?: string;
}

export default function PaymentGateway({ 
  serviceId, 
  onPaymentComplete,
  onPaymentSkip,
  className = ''
}: PaymentGatewayProps) {
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    name: '',
    phone: '',
    email: ''
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const {
    paymentState,
    checkPaymentRequired,
    initiatePayment,
    handlePaymentSuccess,
    handlePaymentError,
    resetPayment
  } = usePaymentFlow();

  const servicePricing = getServicePricing(serviceId);

  useEffect(() => {
    if (!servicePricing) return;

    const paymentRequired = checkPaymentRequired(serviceId);
    
    if (!paymentRequired) {
      // 무료 서비스인 경우 즉시 진행
      onPaymentSkip?.();
    }
  }, [serviceId, servicePricing, checkPaymentRequired, onPaymentSkip]);

  useEffect(() => {
    // 결제 성공시 콜백 호출
    if (paymentState.isPaid && onPaymentComplete) {
      onPaymentComplete();
    }
  }, [paymentState.isPaid, onPaymentComplete]);

  // 결제창 메시지 수신 처리
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'PAYMENT_SUCCESS':
            handlePaymentSuccess(event.data.data);
            break;
          case 'PAYMENT_FAILED':
          case 'PAYMENT_CANCELLED':
            handlePaymentError(event.data.data || { message: '결제가 취소되었습니다.' });
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handlePaymentSuccess, handlePaymentError]);

  const handleStartPayment = async () => {
    if (!buyerInfo.name || !buyerInfo.phone) {
      alert('구매자 정보를 모두 입력해주세요.');
      return;
    }

    try {
      await initiatePayment(serviceId, buyerInfo);
    } catch (error) {
      console.error('결제 시작 실패:', error);
    }
  };

  const handleRetry = () => {
    resetPayment();
    setShowPaymentForm(false);
    checkPaymentRequired(serviceId);
  };

  if (!servicePricing) {
    return <div className="text-red-500">서비스 정보를 찾을 수 없습니다.</div>;
  }

  if (!paymentState.isPaymentRequired) {
    return null; // 무료 서비스는 컴포넌트 표시 안함
  }

  if (paymentState.isPaid) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-800 font-semibold">결제가 완료되었습니다</span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          이제 {servicePricing.name} 서비스를 이용하실 수 있습니다.
        </p>
      </div>
    );
  }

  if (paymentState.paymentError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-red-800 font-semibold">결제 실패</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{paymentState.paymentError}</p>
          </div>
          <button
            onClick={handleRetry}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      {!showPaymentForm ? (
        /* 결제 정보 표시 */
        <div className="text-center">
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{servicePricing.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{servicePricing.description}</p>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(servicePricing.price)}원
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ 이 서비스는 유료입니다. 결제 후 분석을 진행합니다.
            </p>
          </div>

          <button
            onClick={() => setShowPaymentForm(true)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            결제하고 분석 시작하기
          </button>
        </div>
      ) : (
        /* 구매자 정보 입력 폼 */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">구매자 정보</h4>
            <button
              onClick={() => setShowPaymentForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 뒤로
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 *
              </label>
              <input
                type="text"
                value={buyerInfo.name}
                onChange={(e) => setBuyerInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="구매자 성함을 입력하세요"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연락처 *
              </label>
              <input
                type="tel"
                value={buyerInfo.phone}
                onChange={(e) => setBuyerInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="010-1234-5678"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 (선택)
              </label>
              <input
                type="email"
                value={buyerInfo.email}
                onChange={(e) => setBuyerInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@email.com"
                maxLength={100}
              />
            </div>
          </div>

          <button
            onClick={handleStartPayment}
            disabled={paymentState.isProcessingPayment || !buyerInfo.name || !buyerInfo.phone}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
              paymentState.isProcessingPayment || !buyerInfo.name || !buyerInfo.phone
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {paymentState.isProcessingPayment ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                결제 진행 중...
              </div>
            ) : (
              `${formatPrice(servicePricing.price)}원 결제하기`
            )}
          </button>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>안전한 KG이니시스 결제 시스템을 이용합니다.</p>
            <p>결제 정보는 암호화되어 전송됩니다.</p>
          </div>
        </div>
      )}
    </div>
  );
}