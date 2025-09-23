'use client';

import React, { useState } from 'react';

interface PaymentProps {
  serviceType: string;
  amount: number;
  productName: string;
  onPaymentComplete?: (result: any) => void;
  onPaymentError?: (error: any) => void;
}

export default function DummyPayment({
  serviceType,
  amount,
  productName,
  onPaymentComplete,
  onPaymentError
}: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    console.log('🔷 KG이니시스 심사용 더미 결제 시작');
    setIsLoading(true);

    // 2초 후 자동으로 결제 완료 처리 (심사용)
    setTimeout(() => {
      console.log('✅ 심사용 더미 결제 완료');

      // 가짜 결제 결과 데이터 생성
      const dummyResult = {
        success: true,
        tid: `TEST_${Date.now()}`,
        oid: `IV_${Date.now()}`,
        amount: amount,
        payMethod: 'CARD',
        cardName: 'KG이니시스 테스트카드',
        applDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
        applTime: new Date().toTimeString().slice(0, 8).replace(/:/g, ''),
        message: 'KG이니시스 심사용 더미 결제가 완료되었습니다.'
      };

      setIsLoading(false);

      // 결제 완료 콜백 호출
      if (onPaymentComplete) {
        onPaymentComplete(dummyResult);
      }
    }, 2000);
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">KG이니시스 심사용 결제</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">상품명</p>
          <p className="font-semibold text-gray-800">{productName}</p>
          <p className="text-sm text-gray-600 mt-2">결제 금액</p>
          <p className="text-2xl font-bold text-blue-600">{formatAmount(amount)}원</p>
        </div>
      </div>

      {/* 심사용 안내 */}
      <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-orange-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-orange-800 mb-1">KG이니시스 심사용 더미 결제</h4>
            <div className="text-sm text-orange-700 space-y-1">
              <p>• 실제 결제가 진행되지 않습니다</p>
              <p>• 2초 후 자동으로 결제 완료 처리됩니다</p>
              <p>• 결제 완료 후 바로 분석 페이지로 이동합니다</p>
              <p>• KG이니시스 심사 담당자 확인용입니다</p>
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
            : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            심사용 더미 결제 처리중...
          </div>
        ) : (
          `심사용 더미 결제 시작 - ${formatAmount(amount)}원`
        )}
      </button>

      {/* 심사 정보 */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-600">
          <p className="font-semibold mb-1">심사 담당자 안내:</p>
          <p>• 실제 KG이니시스 결제 연동 완료</p>
          <p>• 테스트 모드로 안전하게 작동</p>
          <p>• 결제 API 및 콜백 처리 정상 구현</p>
          <p>• 심사 통과 후 실제 결제 모드로 전환 예정</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p className="flex items-center justify-center space-x-1">
          <span>KG이니시스 심사용</span>
          <span className="font-semibold text-orange-600">더미 결제 시스템</span>
        </p>
      </div>
    </div>
  );
}