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
   * 결제 요청용 signature 생성 (이니시스 공식 가이드 방식)
   */
  generateSignature(oid: string, price: number, timestamp: string): string {
    // 이니시스 공식: oid=값&price=값&timestamp=값
    const hashData = `oid=${oid}&price=${price}&timestamp=${timestamp}`;

    console.log('🔐 Signature 생성 데이터:', {
      oid,
      price,
      timestamp,
      hashData
    });

    const signature = crypto
      .createHash('sha256')
      .update(hashData, 'utf8')
      .digest('hex');

    console.log('🔐 생성된 Signature:', signature.substring(0, 20) + '...');

    return signature;
  }

  /**
   * verification 값 생성 (이니시스 공식 가이드 방식)
   */
  generateVerification(oid: string, price: number, signKey: string, timestamp: string): string {
    // 이니시스 공식: oid=값&price=값&signKey=값&timestamp=값
    const hashData = `oid=${oid}&price=${price}&signKey=${signKey}&timestamp=${timestamp}`;

    console.log('🔐 Verification 생성 데이터:', {
      hashData: hashData.substring(0, 50) + '...'
    });

    return crypto
      .createHash('sha256')
      .update(hashData, 'utf8')
      .digest('hex');
  }

  /**
   * mKey 생성 (SHA256 해시값)
   */
  generateMKey(): string {
    return crypto
      .createHash('sha256')
      .update(this.SIGNKEY, 'utf8')
      .digest('hex');
  }

  /**
   * 결제 요청 데이터 생성 (이니시스 공식 가이드 기반)
   */
  createPaymentData(request: InicisPaymentRequest, isMobile: boolean = false) {
    const timestamp = Date.now().toString();
    const mKey = this.generateMKey();
    const verification = this.generateVerification(request.oid, request.price, this.SIGNKEY, timestamp);

    // 이니시스 공식 가이드 기준 필수 파라미터 구성
    const paymentData: any = {
      // 필수 파라미터 (공식 샘플 기준)
      version: '1.0',                        // 버전
      mid: this.MID,                         // 상점아이디
      oid: request.oid,                      // 주문번호
      price: request.price.toString(),       // 결제금액
      timestamp: timestamp,                  // 타임스탬프 (필수!)
      signature: this.generateSignature(request.oid, request.price, timestamp), // 서명값
      verification: verification,            // 검증값
      mKey: mKey,                           // 상점키 해시값

      // 상품 및 구매자 정보
      goodname: request.goodname,            // 상품명
      buyername: request.buyername,          // 구매자명
      buyertel: request.buyertel,            // 구매자연락처
      buyeremail: request.buyeremail || '',  // 구매자이메일

      // 결제 방법 설정
      gopaymethod: request.gopaymethod || 'Card', // 결제방법 (Card, DirectBank, VBank 등)

      // URL 설정 (공식 가이드 기준)
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/inicis/return`,   // 결과수신URL
      closeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/inicis/close`,     // 결제창닫기URL
      acceptmethod: 'below1000:card',        // 결제 수단 제한

      // 기본 설정
      currency: 'WON',                       // 통화코드
      charset: 'UTF-8'                       // 인코딩
    };

    // 모바일 결제시 추가 파라미터
    if (isMobile) {
      paymentData.P_RESERVED = 'below1000=Y'; // 모바일 1000원 이하 간편결제
      paymentData.P_NOTI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/inicis/noti`; // 노티URL
    }

    console.log('💳 결제 데이터 생성됨 (공식 가이드 기준):', {
      oid: paymentData.oid,
      price: paymentData.price,
      timestamp: paymentData.timestamp,
      buyername: paymentData.buyername,
      isMobile: isMobile,
      mode: this.IS_TEST ? 'TEST' : 'PRODUCTION',
      hasSignature: !!paymentData.signature,
      hasVerification: !!paymentData.verification,
      hasMKey: !!paymentData.mKey
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