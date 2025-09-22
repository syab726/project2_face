/**
 * 이니시스 결제 서비스
 * KG이니시스 표준결제 및 취소/환불 처리
 */

import crypto from 'crypto';

export interface InicisPaymentRequest {
  oid: string;           // 주문번호 (유일값)
  price: number;         // 결제 금액
  buyername: string;     // 구매자명
  buyertel: string;      // 구매자 연락처
  buyeremail?: string;   // 구매자 이메일
  goodname: string;      // 상품명
  gopaymethod?: string;  // 결제 방법 (Card, DirectBank, VBank, HPP)
}

export interface InicisPaymentResult {
  resultCode: string;    // 결과 코드
  resultMsg: string;     // 결과 메시지
  tid: string;          // 거래 ID
  mid: string;          // 상점 ID
  oid: string;          // 주문번호
  price: number;        // 결제 금액
  CARD_Num?: string;    // 카드번호
  applDate?: string;    // 승인일시
  applTime?: string;    // 승인시간
}

export interface InicisCancelRequest {
  tid: string;          // 취소할 거래 ID
  msg: string;          // 취소 사유
  price?: number;       // 부분취소 금액 (전체취소시 생략)
}

class InicisPaymentService {
  private readonly MID: string;
  private readonly SIGNKEY: string;
  private readonly API_KEY: string;
  private readonly IV: string;
  private readonly MOBILE_HASHKEY: string;
  private readonly IS_TEST: boolean;

  constructor() {
    this.IS_TEST = process.env.INICIS_TEST_MODE === 'true';

    // 테스트 모드에 따라 다른 MID 사용
    this.MID = this.IS_TEST
      ? (process.env.INICIS_TEST_MID || 'INIpayTest')  // 테스트 MID
      : (process.env.INICIS_MID || 'facewisd39');      // 실제 MID

    // 테스트 모드에 따라 다른 SIGNKEY 사용
    this.SIGNKEY = this.IS_TEST
      ? (process.env.INICIS_TEST_SIGNKEY || 'SU5JcGF5VGVzdA==')  // 테스트 SIGNKEY
      : (process.env.INICIS_SIGNKEY || 'eThnMG5BV1EvVm93UWZMcUR2dmxCQT09');  // 실제 SIGNKEY

    console.log('🔐 SIGNKEY 설정:', this.IS_TEST ? '테스트용' : '실제용');

    this.API_KEY = process.env.INICIS_API_KEY || 'Odfn0ZqiA2ChnoDN';
    this.IV = process.env.INICIS_IV || 'Q2iahlYn3UTALi==';
    this.MOBILE_HASHKEY = process.env.INICIS_MOBILE_HASHKEY || '5A0D5E28D04A909AF94803D09025122F';

    console.log('🏦 이니시스 결제 서비스 초기화됨:', {
      MID: this.MID,
      IS_TEST: this.IS_TEST,
      SIGNKEY_LENGTH: this.SIGNKEY.length,
      MODE: this.IS_TEST ? 'TEST' : 'PRODUCTION'
    });
  }

  /**
   * 결제 요청용 signature 생성 (가이드에 따른 방식)
   */
  generateSignature(oid: string, price: number, timestamp: string): string {
    // 이니시스 표준: oid + price + timestamp + signKey
    const hashData = `${oid}${price}${timestamp}${this.SIGNKEY}`;

    console.log('🔐 Signature 생성 데이터:', {
      oid,
      price,
      timestamp,
      signKey: this.SIGNKEY.substring(0, 10) + '...',
      hashData: hashData.substring(0, 50) + '...'
    });

    const signature = crypto
      .createHash('sha256')
      .update(hashData, 'utf8')
      .digest('hex');

    console.log('🔐 생성된 Signature:', signature.substring(0, 20) + '...');

    return signature;
  }

  /**
   * verification 값 생성
   */
  generateVerification(price: number): string {
    const hashData = `${this.MID}${price}${this.SIGNKEY}`;

    return crypto
      .createHash('sha256')
      .update(hashData, 'utf8')
      .digest('hex');
  }

  /**
   * 결제 요청 데이터 생성 (이니시스 공식 가이드 기반)
   */
  createPaymentData(request: InicisPaymentRequest, isMobile: boolean = false) {
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(request.oid, request.price, timestamp);
    const verification = this.generateVerification(request.price);

    // 이니시스 공식 가이드 표준결제 파라미터 구성
    const paymentData: any = {
      // 이니시스 공식 가이드 필수 파라미터
      version: '1.0',                         // 버전 (고정값)
      mid: this.MID,                         // 상점아이디
      oid: request.oid,                      // 주문번호
      price: request.price.toString(),       // 결제금액
      timestamp,                             // 타임스탬프
      signature,                             // 전자서명
      verification,                          // 검증데이터
      mKey: crypto.createHash('sha256').update(this.SIGNKEY, 'utf8').digest('hex'), // 암호화키
      currency: 'WON',                       // 통화코드

      // 상품/구매자 정보
      goodname: request.goodname,            // 상품명
      buyername: request.buyername,          // 구매자명
      buyertel: request.buyertel,            // 구매자연락처
      buyeremail: request.buyeremail || '',  // 구매자이메일

      // 결제 방법 설정 (공식 가이드 기준)
      gopaymethod: request.gopaymethod || 'Card:DirectBank:VBank', // 결제방법

      // URL 설정 (공식 가이드 기준)
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/inicis/return`,   // 결과수신URL
      closeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/inicis/close`,     // 결제창닫기URL

      // 결제 옵션 (공식 가이드 기준)
      acceptmethod: 'HPP(1):below1000:va_receipt', // 결제옵션
      languageView: 'ko',                    // 언어설정
      charset: 'UTF-8'                       // 인코딩
    };

    // 모바일 결제시 추가 파라미터 (공식 가이드 기준)
    if (isMobile) {
      // 모바일 앱 스킴 설정 (앱 복귀용)
      paymentData.P_RESERVED = 'iosapp=Y&app_scheme=facewisdom://';
      paymentData.P_NOTI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/inicis/noti`; // 모바일 노티URL

      // 모바일 전용 파라미터
      paymentData.device = 'mobile';
    }

    console.log('💳 결제 데이터 생성됨 (공식 가이드 기준):', {
      oid: paymentData.oid,
      price: paymentData.price,
      buyername: paymentData.buyername,
      timestamp: paymentData.timestamp,
      isMobile: isMobile,
      mode: this.IS_TEST ? 'TEST' : 'PRODUCTION'
    });

    return paymentData;
  }

  /**
   * 결제 취소/환불 요청
   */
  async cancelPayment(request: InicisCancelRequest): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const clientIp = '127.0.0.1'; // 실제 서버 IP로 변경 필요
      
      // 해시 데이터 생성
      const hashData = this.generateCancelHash({
        tid: request.tid,
        mid: this.MID,
        price: request.price,
        timestamp,
        clientIp
      });

      const cancelData = {
        type: 'Refund',
        timestamp,
        clientIp,
        mid: this.MID,
        tid: request.tid,
        msg: request.msg,
        hashData
      };

      // 부분 취소인 경우 price 추가
      if (request.price) {
        (cancelData as any).price = request.price.toString();
      }

      const apiUrl = this.IS_TEST 
        ? 'https://iniapi.inicis.com/api/v1/refund'
        : 'https://iniapi.inicis.com/api/v1/refund';

      console.log('🔄 결제 취소 요청:', {
        tid: request.tid,
        price: request.price,
        msg: request.msg
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify(cancelData)
      });

      const result = await response.json();
      
      console.log('💰 결제 취소 결과:', result);
      
      return result;

    } catch (error) {
      console.error('❌ 결제 취소 오류:', error);
      throw new Error('결제 취소 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 취소 요청용 해시 생성
   */
  private generateCancelHash(data: {
    tid: string;
    mid: string;
    price?: number;
    timestamp: string;
    clientIp: string;
  }): string {
    let hashString = `${data.tid}${data.mid}`;
    
    if (data.price) {
      hashString += data.price.toString();
    }
    
    hashString += `${data.timestamp}${data.clientIp}${this.API_KEY}`;
    
    return crypto
      .createHash('sha512')
      .update(hashString, 'utf8')
      .digest('hex');
  }

  /**
   * 결제 결과 검증
   */
  verifyPaymentResult(result: InicisPaymentResult): boolean {
    try {
      // 기본 검증
      if (!result.tid || !result.oid || !result.price) {
        console.error('❌ 결제 결과 필수값 누락');
        return false;
      }

      // 상점 ID 검증
      if (result.mid !== this.MID) {
        console.error('❌ 상점 ID 불일치');
        return false;
      }

      // 결제 성공 여부 검증
      if (result.resultCode !== '0000') {
        console.error('❌ 결제 실패:', result.resultMsg);
        return false;
      }

      console.log('✅ 결제 결과 검증 성공:', {
        tid: result.tid,
        oid: result.oid,
        price: result.price
      });

      return true;
    } catch (error) {
      console.error('❌ 결제 결과 검증 오류:', error);
      return false;
    }
  }

  /**
   * 거래 ID로 결제 정보 조회 (실제 구현시 이니시스 조회 API 사용)
   */
  async getPaymentInfo(tid: string): Promise<any> {
    // 실제 구현시 이니시스 거래 조회 API 호출
    console.log('🔍 결제 정보 조회:', tid);
    
    // 임시 더미 데이터 (실제 구현시 API 호출로 대체)
    return {
      tid,
      status: 'paid',
      amount: 0,
      paymentMethod: 'card'
    };
  }
}

// 싱글톤 인스턴스 생성
const inicisPaymentService = new InicisPaymentService();

export default inicisPaymentService;
export type { InicisPaymentRequest, InicisPaymentResult, InicisCancelRequest };