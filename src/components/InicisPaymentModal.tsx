'use client';

import React, { useState } from 'react';
import InicisPayment from './InicisPayment';

interface InicisPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: string;
  serviceName: string;
  amount: number;
  description?: string;
  onPaymentComplete?: (result: any) => void;
  onPaymentError?: (error: any) => void;
}

export default function InicisPaymentModal({
  isOpen,
  onClose,
  serviceType,
  serviceName,
  amount,
  description,
  onPaymentComplete,
  onPaymentError
}: InicisPaymentModalProps) {
  const handlePaymentComplete = (result: any) => {
    console.log('✅ 결제 완료:', result);
    if (onPaymentComplete) {
      onPaymentComplete(result);
    } else {
      alert(`${serviceName} 결제가 성공적으로 완료되었습니다!`);
      onClose();
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('❌ 결제 오류:', error);
    if (onPaymentError) {
      onPaymentError(error);
    } else {
      alert(`결제에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{ fontFamily: "'Gowun Dodum', sans-serif" }}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{serviceName} 결제</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 서비스 정보 */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {serviceName}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mb-3">
              {description}
            </p>
          )}
          <div className="text-2xl font-bold text-blue-600">
            {amount.toLocaleString()}원
          </div>
          <div className="text-xs text-gray-500 mt-1">
            부가세 포함
          </div>

          {/* 테스트 환경 안내 */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ 테스트 환경:</strong> 실제 결제가 이루어지지 않습니다. 개발/테스트용입니다.
            </p>
          </div>
        </div>

        {/* 결제 컴포넌트 */}
        <div className="p-6">
          <InicisPayment
            serviceType={serviceType}
            amount={amount}
            productName={serviceName}
            onPaymentComplete={handlePaymentComplete}
            onPaymentError={handlePaymentError}
          />
        </div>
      </div>
    </div>
  );
}