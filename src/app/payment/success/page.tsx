'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const tid = searchParams.get('tid');
  const oid = searchParams.get('oid');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // 결제 완료 메시지 전송
    if (window.opener) {
      window.opener.postMessage({
        type: 'PAYMENT_SUCCESS',
        data: { tid, oid, amount }
      }, '*');

      // 3초 후 창 닫기
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, [tid, oid, amount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            결제가 완료되었습니다
          </h2>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            {tid && (
              <p>거래번호: <span className="font-medium">{tid}</span></p>
            )}
            {oid && (
              <p>주문번호: <span className="font-medium">{oid}</span></p>
            )}
            {amount && (
              <p>결제금액: <span className="font-medium">{parseInt(amount).toLocaleString()}원</span></p>
            )}
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500">
              잠시 후 자동으로 창이 닫힙니다...
            </p>
          </div>

          <div className="mt-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic import로 SSR 방지
const DynamicPaymentSuccessContent = dynamic(() => Promise.resolve(PaymentSuccessContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">결제 결과를 확인하고 있습니다...</p>
      </div>
    </div>
  )
});

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">결제 결과를 확인하고 있습니다...</p>
        </div>
      </div>
    }>
      <DynamicPaymentSuccessContent />
    </Suspense>
  );
}