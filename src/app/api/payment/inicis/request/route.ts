import { NextRequest, NextResponse } from 'next/server';
import inicisPaymentService from '@/services/inicisPaymentService';
import type { InicisPaymentRequest } from '@/services/inicisPaymentService';
import type { APIResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceType,
      amount,
      buyerName,
      buyerPhone,
      buyerEmail,
      sessionId,
      isMobile = false
    } = body;

    // 입력값 검증
    if (!serviceType || !amount || !buyerName || !buyerPhone) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: '필수 입력값이 누락되었습니다.'
        }
      }, { status: 400 });
    }

    // 주문번호 생성 (유일값) - 40자 이내로 제한
    // 서비스 타입 약어 매핑
    const serviceAbbr: { [key: string]: string } = {
      'professional-physiognomy': 'PP',
      'mbti-face': 'MF',
      'fortune': 'FT',
      'face-saju': 'FS',
      'ideal-type': 'IT',
      'interview': 'IV'
    };

    const abbr = serviceAbbr[serviceType] || 'FA';
    const timestamp = Date.now().toString().substring(2); // 타임스탬프 짧게
    const random = Math.random().toString(36).substring(2, 8); // 랜덤 문자열 6자
    const orderId = `${abbr}_${timestamp}_${random}`; // 예: PP_1234567890_abc123
    
    // 서비스별 상품명 매핑
    const productNames: { [key: string]: string } = {
      'professional-physiognomy': '전문 관상 분석',
      'mbti-face': 'MBTI 얼굴 분석',
      'fortune': '운세 분석',
      'face-saju': '얼굴+사주 종합 분석',
      'ideal-type': '이상형 분석',
      'interview': '면접 관상 분석'
    };

    const productName = productNames[serviceType] || '페이스 분석';

    // 이니시스 결제 요청 데이터 생성
    const paymentRequest: InicisPaymentRequest = {
      oid: orderId,
      price: amount,
      buyername: buyerName,
      buyertel: buyerPhone,
      buyeremail: buyerEmail,
      goodname: productName,
      gopaymethod: 'Card' // 카드결제 우선
    };

    const paymentData = inicisPaymentService.createPaymentData(paymentRequest);

    console.log('💳 결제 요청 생성됨:', {
      orderId,
      serviceType,
      amount,
      buyerName,
      sessionId: sessionId?.substring(0, 10) + '...'
    });

    // MID에 따라 JavaScript URL 결정
    const isRealMid = paymentData.mid === 'facewisd39';
    const inicisJsUrl = isRealMid
      ? 'https://stdpay.inicis.com/stdjs/INIStdPay.js'      // 실제 MID용 상용 JS
      : 'https://stgstdpay.inicis.com/stdjs/INIStdPay.js'; // 테스트 MID용 스테이징 JS

    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: {
        orderId,
        paymentData,
        inicisJsUrl,
        isMobile,
        serviceInfo: {
          serviceType,
          productName,
          amount
        }
      }
    });

  } catch (error) {
    console.error('결제 요청 생성 오류:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'PAYMENT_REQUEST_ERROR',
        message: '결제 요청 생성 중 오류가 발생했습니다.'
      }
    }, { status: 500 });
  }
}