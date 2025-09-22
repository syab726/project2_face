import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import inicisPaymentService from '@/services/inicisPaymentService';
import realMetricsStore from '@/services/realMetricsStore';

/**
 * 이니시스 결제 승인 API
 * 결제창에서 인증 완료 후 실제 결제를 승인하는 단계
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      authToken,
      authUrl,
      mid,
      oid,
      price,
      timestamp
    } = data;

    console.log('💳 결제 승인 요청:', {
      authToken: authToken?.substring(0, 20) + '...',
      oid,
      price,
      mid
    });

    // 필수값 검증
    if (!authToken || !authUrl) {
      return NextResponse.json({
        success: false,
        message: '인증 정보가 누락되었습니다.'
      }, { status: 400 });
    }

    // 승인 요청 데이터 생성
    const signKey = process.env.INICIS_SIGNKEY || 'eThnMG5BV1EvVm93UWZMcUR2dmxCQT09';
    const hashData = authToken + signKey;
    const signature = crypto.createHash('sha512').update(hashData, 'utf8').digest('hex');

    const approveData = new URLSearchParams({
      mid: mid || 'facewisd39',
      authToken,
      signature,
      timestamp: timestamp || Date.now().toString(),
      charset: 'UTF-8',
      format: 'JSON'
    });

    console.log('🔐 승인 요청 시작:', authUrl);

    // 승인 요청 전송
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: approveData.toString()
    });

    const resultText = await response.text();
    let result;

    try {
      result = JSON.parse(resultText);
    } catch (e) {
      console.error('승인 응답 파싱 실패:', resultText);
      result = { resultCode: 'FAIL', resultMsg: '승인 응답 처리 실패' };
    }

    console.log('📊 승인 응답:', {
      resultCode: result.resultCode,
      resultMsg: result.resultMsg,
      tid: result.tid
    });

    // 승인 성공 처리
    if (result.resultCode === '0000') {
      // 메트릭스 기록
      realMetricsStore.trackPayment(
        result.MOID || oid,
        'professional-physiognomy',
        parseInt(result.TotPrice || price)
      );

      return NextResponse.json({
        success: true,
        message: '결제가 성공적으로 완료되었습니다.',
        data: {
          tid: result.tid,
          oid: result.MOID || oid,
          price: result.TotPrice || price,
          payMethod: result.payMethod,
          applDate: result.applDate,
          applTime: result.applTime,
          CARD_Code: result.CARD_Code,
          CARD_Num: result.CARD_Num
        }
      });
    } else {
      // 승인 실패
      return NextResponse.json({
        success: false,
        message: result.resultMsg || '결제 승인에 실패했습니다.',
        resultCode: result.resultCode
      });
    }

  } catch (error) {
    console.error('결제 승인 오류:', error);
    return NextResponse.json({
      success: false,
      message: '결제 승인 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}