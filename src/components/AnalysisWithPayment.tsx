'use client';

import React, { useState } from 'react';
import PaymentGateway from '@/components/PaymentGateway';
import { isPaymentRequired } from '@/config/pricing';

interface AnalysisWithPaymentProps {
  serviceId: string;
  children: React.ReactNode;
  className?: string;
}

export default function AnalysisWithPayment({ 
  serviceId, 
  children, 
  className = '' 
}: AnalysisWithPaymentProps) {
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const paymentNeeded = isPaymentRequired(serviceId);

  const handlePaymentComplete = () => {
    console.log(`✅ ${serviceId} 서비스 결제 완료`);
    setIsPaymentCompleted(true);
  };

  const handlePaymentSkip = () => {
    console.log(`🆓 ${serviceId} 서비스는 무료로 제공됩니다`);
    setIsPaymentCompleted(true);
  };

  // 결제가 필요하지만 아직 완료되지 않은 경우
  if (paymentNeeded && !isPaymentCompleted) {
    return (
      <div className={`max-w-4xl mx-auto p-4 ${className}`}>
        <PaymentGateway
          serviceId={serviceId}
          onPaymentComplete={handlePaymentComplete}
          onPaymentSkip={handlePaymentSkip}
          className="mb-6"
        />
      </div>
    );
  }

  // 결제 완료 또는 무료 서비스인 경우 실제 분석 컴포넌트 렌더링
  return (
    <div className={className}>
      {children}
    </div>
  );
}