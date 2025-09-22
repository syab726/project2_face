'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TermsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // /terms 페이지는 이제 /agree 페이지로 리디렉션됩니다
    router.replace('/agree');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔄</div>
        <p className="text-gray-600">페이지를 이동하고 있습니다...</p>
        <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}