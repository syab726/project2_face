'use client';

import React, { useState } from 'react';
import InicisPayment from '@/components/InicisPayment';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestPaymentPage() {
  const [selectedService, setSelectedService] = useState('professional-physiognomy');
  const [paymentMode, setPaymentMode] = useState<'test' | 'production'>('test');

  const services = [
    {
      id: 'professional-physiognomy',
      name: '전문 관상 분석',
      price: 9900,
      description: '전문적인 관상학 분석 서비스',
      features: ['얼굴 특징 상세 분석', '성격 및 운세 해석', 'PDF 결과 제공']
    },
    {
      id: 'mbti-face',
      name: 'MBTI 얼굴 분석',
      price: 2900,
      description: '얼굴로 알아보는 MBTI 성격 분석',
      features: ['얼굴 기반 MBTI 예측', '성격 특성 분석', '호환성 정보']
    },
    {
      id: 'fortune',
      name: '운세 분석',
      price: 4900,
      description: '오늘의 운세와 미래 예측',
      features: ['오늘의 운세', '월간/연간 운세', '조언 및 팁']
    },
    {
      id: 'face-saju',
      name: '얼굴+사주 종합 분석',
      price: 7900,
      description: '얼굴과 사주를 결합한 종합 분석',
      features: ['얼굴 + 사주 종합', '상세 운세 분석', '인생 가이드']
    },
    {
      id: 'ideal-type',
      name: '이상형 분석',
      price: 3900,
      description: '당신의 이상형 찾기 서비스',
      features: ['이상형 특징 분석', '매칭 조건 제시', '연애 조언']
    },
    {
      id: 'interview',
      name: '면접 관상 분석',
      price: 5900,
      description: '면접에 최적화된 관상 분석 서비스',
      features: ['면접 적합도 분석', '첫인상 평가', '면접 조언 제공']
    }
  ];

  const handlePaymentComplete = (result: any) => {
    console.log('✅ 결제 완료:', result);

    // 결제 성공 후 분석 페이지로 리다이렉트
    const serviceType = selectedService;
    const analysisPageMap: { [key: string]: string } = {
      'professional-physiognomy': '/gwansang/original',
      'mbti-face': '/gwansang/mbti',
      'fortune': '/fortune',
      'face-saju': '/gwansang/saju',
      'ideal-type': '/gwansang',
      'interview': '/gwansang/interview'
    };

    const analysisPage = analysisPageMap[serviceType] || '/gwansang';

    // 결제 정보와 함께 분석 페이지로 이동
    const paymentParams = new URLSearchParams({
      payment: 'success',
      tid: result.tid || '',
      oid: result.oid || '',
      amount: result.amount?.toString() || '',
      service: serviceType
    });

    alert('결제가 성공적으로 완료되었습니다! 분석 페이지로 이동합니다.');

    // 1초 후 분석 페이지로 이동
    setTimeout(() => {
      window.location.href = `${analysisPage}?${paymentParams.toString()}`;
    }, 1000);
  };

  const handlePaymentError = (error: any) => {
    console.error('❌ 결제 오류:', error);
    alert(`결제에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              얼굴 분석 서비스 결제
            </h1>
            <p className="text-gray-600">
              AI 기반 얼굴 분석 서비스를 선택하고 결제해보세요.
            </p>

            {/* 결제 모드 전환 */}
            <div className="mt-6 flex justify-center">
              <div className="bg-white border border-gray-300 rounded-lg p-1 inline-flex">
                <button
                  onClick={() => setPaymentMode('test')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    paymentMode === 'test'
                      ? 'bg-yellow-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  테스트 모드
                </button>
                <button
                  onClick={() => setPaymentMode('production')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    paymentMode === 'production'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  운영 모드
                </button>
              </div>
            </div>

            <div className={`mt-4 p-4 border rounded-lg ${
              paymentMode === 'test'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <p className={`text-sm ${
                paymentMode === 'test' ? 'text-yellow-800' : 'text-green-800'
              }`}>
                <strong>
                  {paymentMode === 'test' ? '⚠️ 테스트 환경:' : '✅ 운영 환경:'}
                </strong>
                {paymentMode === 'test'
                  ? ' 실제 결제가 이루어지지 않습니다. 개발/테스트용입니다.'
                  : ' 실제 결제가 진행됩니다. 계약 완료 후 사용 가능합니다.'
                }
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 서비스 선택 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                서비스 선택
              </h2>
              
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedService === service.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-800">
                            {service.name}
                          </h3>
                          <input
                            type="radio"
                            checked={selectedService === service.id}
                            onChange={() => setSelectedService(service.id)}
                            className="ml-3 text-blue-600"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {service.description}
                        </p>

                        {/* 기능 목록 */}
                        <div className="mt-3">
                          <ul className="text-xs text-gray-500 space-y-1">
                            {service.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-blue-600">
                          {service.price.toLocaleString()}원
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          부가세 포함
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 결제 컴포넌트 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                결제 정보 입력
              </h2>
              
              {selectedServiceData && (
                <InicisPayment
                  serviceType={selectedServiceData.id}
                  amount={selectedServiceData.price}
                  productName={selectedServiceData.name}
                  onPaymentComplete={handlePaymentComplete}
                  onPaymentError={handlePaymentError}
                />
              )}
            </div>
          </div>

          {/* 테스트 정보 */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">
              📋 테스트 카드 정보
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-blue-700 mb-2">신용카드 테스트</p>
                <ul className="space-y-1 text-blue-600">
                  <li>• 카드번호: 4000-0000-0000-0002</li>
                  <li>• 유효기간: 12/25</li>
                  <li>• CVC: 123</li>
                  <li>• 비밀번호: 00</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-blue-700 mb-2">계좌이체 테스트</p>
                <ul className="space-y-1 text-blue-600">
                  <li>• 은행: 국민은행</li>
                  <li>• 계좌번호: 123456-78-123456</li>
                  <li>• 예금주: 홍길동</li>
                  <li>• 비밀번호: 123456</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border border-blue-200">
              <p className="text-blue-700 text-sm">
                <strong>참고:</strong> 위 정보는 이니시스 테스트 환경용 더미 데이터입니다. 
                실제 결제가 이루어지지 않으며, 테스트 목적으로만 사용됩니다.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}