'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { paymentService } from '@/services/paymentService';
import { PaymentMethod, PaymentRequest } from '@/types/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (orderId: string, transactionId: string) => void;
  amount: number;
  productName: string;
  description?: string;
  buyerEmail: string;
  buyerName?: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  productName,
  description,
  buyerEmail,
  buyerName = '구매자'
}: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [supportedMethods, setSupportedMethods] = useState<PaymentMethod[]>([]);

  // 컴포넌트 마운트 시 지원되는 결제 방법 로드
  React.useEffect(() => {
    const methods = paymentService.getSupportedPaymentMethods();
    setSupportedMethods(methods);
    if (methods.length > 0) {
      setSelectedPaymentMethod(methods[0]);
    }
  }, []);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert('결제 방법을 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // 주문번호 생성
      const orderId = paymentService.generateOrderId();
      
      // 결제 요청 데이터 생성
      const paymentRequest: PaymentRequest = {
        orderId,
        amount,
        productName,
        buyerName,
        buyerEmail,
        method: selectedPaymentMethod,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      };

      if (selectedPaymentMethod.provider === 'kg_inicis') {
        // KG이니시스 결제 처리
        const kgPayment = await paymentService.createKGInitisPayment(paymentRequest);
        
        // TODO: 실제 환경에서는 KG이니시스 결제창을 띄우는 로직 구현
        // 현재는 테스트용 검증 로직
        const paymentResult = await paymentService.verifyPayment(
          orderId,
          amount,
          `TXN-${Date.now()}`,
          kgPayment.signature
        );

        if (paymentResult.success) {
          onPaymentSuccess(orderId, paymentResult.transactionId || '');
          onClose();
        } else {
          throw new Error(paymentResult.message || '결제 처리 실패');
        }
      } else {
        // 다른 결제 수단 (추후 구현)
        throw new Error('해당 결제 수단은 아직 지원되지 않습니다.');
      }
      
    } catch (error) {
      console.error('결제 오류:', error);
      alert(error instanceof Error ? error.message : '결제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 결제 방법별 아이콘 반환
  const getPaymentMethodIcon = (method: PaymentMethod): string => {
    switch (method.id) {
      case 'kg_inicis_card':
        return '💳';
      case 'kg_inicis_bank':
        return '🏦';
      case 'naver_pay':
        return '🟢';
      case 'kakao_pay':
        return '💛';
      case 'toss_pay':
        return '🔵';
      default:
        return '💳';
    }
  };

  // 결제 방법별 설명 반환
  const getPaymentMethodDescription = (method: PaymentMethod): string => {
    switch (method.id) {
      case 'kg_inicis_card':
        return '모든 신용카드 및 체크카드 사용 가능';
      case 'kg_inicis_bank':
        return '실시간 계좌이체로 안전한 결제';
      case 'naver_pay':
        return '네이버페이로 간편하고 빠른 결제';
      case 'kakao_pay':
        return '카카오페이로 간편한 결제';
      case 'toss_pay':
        return '토스페이로 간편한 결제';
      default:
        return '안전하고 간편한 결제';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">결제하기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isProcessing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{productName}</h3>
            {description && (
              <p className="text-gray-600 text-sm mb-4">{description}</p>
            )}
            <div className="text-3xl font-bold text-primary-600">
              {amount.toLocaleString()}원
            </div>
          </div>
        </div>

        {/* 결제 수단 선택 */}
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">결제 수단 선택</h4>
          <div className="space-y-3">
            {supportedMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPaymentMethod(method)}
                disabled={isProcessing || !method.enabled}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPaymentMethod?.id === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isProcessing || !method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {getPaymentMethodIcon(method)}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-600">
                      {getPaymentMethodDescription(method)}
                    </div>
                    {!method.enabled && (
                      <div className="text-xs text-red-500 mt-1">
                        준비 중인 결제 수단입니다
                      </div>
                    )}
                  </div>
                  {selectedPaymentMethod?.id === method.id && method.enabled && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="px-6 pb-4">
          <div className="text-xs text-gray-500 leading-relaxed">
            결제를 진행하시면{' '}
            <Link href="/terms" className="text-primary-600 underline" target="_blank">
              이용약관
            </Link>{' '}
            및{' '}
            <Link href="/refund" className="text-primary-600 underline" target="_blank">
              환불정책
            </Link>
            에 동의하는 것으로 간주됩니다.
          </div>
        </div>

        {/* 결제 버튼 */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-all ${
              isProcessing
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner w-5 h-5 mr-2"></div>
                결제 처리 중...
              </div>
            ) : (
              `${amount.toLocaleString()}원 결제하기`
            )}
          </button>
        </div>

        {/* 보안 정보 */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              SSL 보안
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              안전한 결제
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}