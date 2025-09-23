import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import inicisPaymentService from '@/services/inicisPaymentService';
import realMetricsStore from '@/services/realMetricsStore';

/**
 * KG이니시스 결제 승인 API (표준 파라미터 기준)
 * 결제창에서 인증 완료 후 P_TID와 P_AUTH_TOKEN을 이용하여 실제 결제를 승인하는 단계
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
      timestamp,
      // KG이니시스 표준 파라미터
      P_AUTH_TOKEN,
      P_NEXT_URL,
      P_MID,
      P_OID,
      P_AMT
    } = data;

    // 표준 파라미터 우선 사용, 레거시 파라미터는 폴백으로 사용
    const finalAuthToken = P_AUTH_TOKEN || authToken;
    const finalAuthUrl = P_NEXT_URL || authUrl;
    const finalMid = P_MID || mid;
    const finalOid = P_OID || oid;
    const finalPrice = P_AMT || price;

    console.log('💳 KG이니시스 표준 결제 승인 요청:', {
      P_AUTH_TOKEN: finalAuthToken?.substring(0, 20) + '...',
      P_OID: finalOid,
      P_AMT: finalPrice,
      P_MID: finalMid,
      P_NEXT_URL: finalAuthUrl ? '있음' : '없음'
    });

    // KG이니시스 표준 필수값 검증
    if (!finalAuthToken || !finalAuthUrl) {
      return NextResponse.json({
        success: false,
        message: 'KG이니시스 인증 정보(P_AUTH_TOKEN, P_NEXT_URL)가 누락되었습니다.'
      }, { status: 400 });
    }

    // KG이니시스 표준 승인 요청 데이터 생성
    const signKey = process.env.INICIS_TEST_MODE === 'true'
      ? (process.env.INICIS_TEST_SIGNKEY || 'SU5JTElURV9UUklQTEVERVNfS0VZU1RS')
      : (process.env.INICIS_SIGNKEY || 'eThnMG5BV1EvVm93UWZMcUR2dmxCQT09');

    const hashData = finalAuthToken + signKey;
    const signature = crypto.createHash('sha512').update(hashData, 'utf8').digest('hex');

    const approveData = new URLSearchParams({
      P_MID: finalMid || (process.env.INICIS_TEST_MODE === 'true' ? 'INIpayTest' : 'facewisd39'),
      P_AUTH_TOKEN: finalAuthToken,
      P_HASH: signature,
      P_TIMESTAMP: timestamp || Date.now().toString(),
      P_CHARSET: 'UTF-8',
      P_FORMAT: 'JSON'
    });

    console.log('🔐 KG이니시스 표준 승인 요청 시작:', finalAuthUrl);

    // KG이니시스 서버로 승인 요청 전송
    const response = await fetch(finalAuthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; KG-INICIS-API)'
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

    console.log('📊 KG이니시스 표준 승인 응답:', {
      P_RCODE: result.P_RCODE || result.resultCode,
      P_RMESG: result.P_RMESG || result.resultMsg,
      P_TID: result.P_TID || result.tid,
      P_TYPE: result.P_TYPE || result.payMethod
    });

    // KG이니시스 표준 승인 성공 처리
    const resultCode = result.P_RCODE || result.resultCode;
    if (resultCode === '0000') {
      // 메트릭스 기록
      const extractedServiceType = extractServiceTypeFromOid(result.P_OID || result.MOID || finalOid);
      realMetricsStore.trackPayment(
        result.P_OID || result.MOID || finalOid,
        extractedServiceType,
        parseInt(result.P_AMT || result.TotPrice || finalPrice)
      );

      return NextResponse.json({
        success: true,
        message: 'KG이니시스 결제가 성공적으로 승인되었습니다.',
        data: {
          tid: result.P_TID || result.tid,
          oid: result.P_OID || result.MOID || finalOid,
          price: result.P_AMT || result.TotPrice || finalPrice,
          payMethod: result.P_TYPE || result.payMethod,
          applDate: result.P_AUTH_DT || result.applDate,
          applTime: result.P_AUTH_TM || result.applTime,
          CARD_Code: result.P_CARD_ISSUER_CODE || result.CARD_Code,
          CARD_Num: result.P_CARD_NUM || result.CARD_Num
        }
      });
    } else {
      // 승인 실패
      return NextResponse.json({
        success: false,
        message: (result.P_RMESG || result.resultMsg) || 'KG이니시스 결제 승인에 실패했습니다.',
        resultCode: resultCode
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

/**
 * 주문번호에서 서비스 타입 추출
 */
function extractServiceTypeFromOid(oid: string): string {
  if (!oid) {
    return 'unknown';
  }

  const match = oid.match(/^([^_]+)_/);
  if (match) {
    const abbr = match[1];
    // 약어를 원래 서비스 타입으로 매핑
    const serviceTypeMap: { [key: string]: string } = {
      'PP': 'professional-physiognomy',
      'MF': 'mbti-face',
      'FT': 'fortune',
      'FS': 'face-saju',
      'IV': 'interview',
      'IT': 'ideal-type'
    };

    return serviceTypeMap[abbr] || 'unknown';
  }
  return 'unknown';
}