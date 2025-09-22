// crypto 모듈은 서버사이드에서만 사용
import {
  PaymentRequest,
  PaymentResponse,
  KGInitisPayment,
  RefundRequest,
  RefundResponse,
  PaymentConfig,
  PaymentMethod,
  PAYMENT_STATUS
} from '@/types/payment';

export class PaymentService {
  private config: PaymentConfig;

  constructor() {
    this.config = {
      kgInitisMid: process.env.KG_INICIS_MID || '',
      kgInitisSignKey: process.env.KG_INICIS_SIGNKEY || '',
      kgInitisApiUrl: process.env.KG_INICIS_API_URL || 'https://api.inicis.com',
      testMode: process.env.KG_INICIS_TEST_MODE === 'true',
      defaultCurrency: 'KRW',
      maxAmount: 10000000, // 1천만원
      minAmount: 100, // 100원
      supportedMethods: [
        {
          id: 'kg_inicis_card',
          name: '신용카드',
          type: 'card',
          provider: 'kg_inicis',
          enabled: true
        },
        {
          id: 'kg_inicis_bank',
          name: '계좌이체',
          type: 'bank', 
          provider: 'kg_inicis',
          enabled: false // 신용카드만 사용
        },
        {
          id: 'naver_pay',
          name: '네이버페이',
          type: 'wallet',
          provider: 'naver_pay',
          enabled: false // 추후 구현
        },
        {
          id: 'kakao_pay',
          name: '카카오페이',
          type: 'wallet',
          provider: 'kakao_pay', 
          enabled: false // 추후 구현
        },
        {
          id: 'toss_pay',
          name: '토스페이',
          type: 'wallet',
          provider: 'toss_pay',
          enabled: false // 추후 구현
        }
      ]
    };
  }

  /**
   * 결제 가능한 방법 목록 반환
   */
  getSupportedPaymentMethods(): PaymentMethod[] {
    return this.config.supportedMethods.filter(method => method.enabled);
  }

  /**
   * 주문번호 생성
   */
  generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORDER-${timestamp}-${random}`;
  }

  /**
   * KG이니시스 서명 생성 (클라이언트 사이드용 임시 구현)
   */
  private generateKGInitisSignature(data: Partial<KGInitisPayment>): string {
    if (!this.config.kgInitisSignKey) {
      throw new Error('KG이니시스 SignKey가 설정되지 않았습니다.');
    }

    // 임시 서명 (실제 환경에서는 서버 API로 처리해야 함)
    const signData = `${data.oid}${data.price}${data.timestamp}${this.config.kgInitisSignKey}`;
    
    // 클라이언트 사이드용 간단한 해시 (개발용)
    let hash = 0;
    for (let i = 0; i < signData.length; i++) {
      const char = signData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit로 변환
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * KG이니시스 결제 요청 데이터 생성
   */
  async createKGInitisPayment(request: PaymentRequest): Promise<KGInitisPayment> {
    if (!this.config.kgInitisMid) {
      throw new Error('KG이니시스 MID가 설정되지 않았습니다.');
    }

    // 금액 유효성 검사
    if (request.amount < this.config.minAmount || request.amount > this.config.maxAmount) {
      throw new Error(`결제 금액은 ${this.config.minAmount.toLocaleString()}원 ~ ${this.config.maxAmount.toLocaleString()}원 사이여야 합니다.`);
    }

    const timestamp = Date.now().toString();
    
    const kgPayment: Partial<KGInitisPayment> = {
      mid: this.config.kgInitisMid,
      oid: request.orderId,
      price: request.amount,
      goodname: request.productName,
      buyername: request.buyerName,
      buyeremail: request.buyerEmail,
      buyertel: request.buyerTel,
      returnUrl: request.returnUrl,
      closeUrl: request.cancelUrl,
      timestamp
    };

    // 서명 생성
    const signature = this.generateKGInitisSignature(kgPayment);

    return {
      ...kgPayment,
      signature,
      acceptmethod: this.getAcceptMethod(request.method),
      quotabase: '2:3:4:5:6' // 기본 할부 설정
    } as KGInitisPayment;
  }

  /**
   * 결제 방법에 따른 acceptmethod 설정
   */
  private getAcceptMethod(method: PaymentMethod): string {
    switch (method.id) {
      case 'kg_inicis_card':
        return 'CARD'; // 신용카드만
      case 'kg_inicis_bank':
        return 'BANK'; // 계좌이체만
      default:
        return 'CARD'; // 기본값: 신용카드만
    }
  }

  /**
   * 결제 결과 검증
   */
  async verifyPayment(
    orderId: string,
    amount: number,
    transactionId: string,
    signature: string
  ): Promise<PaymentResponse> {
    try {
      // 서명 검증
      const expectedSignature = this.generateKGInitisSignature({
        oid: orderId,
        price: amount,
        timestamp: Date.now().toString()
      });

      // 실제 환경에서는 이니시스 API를 호출하여 결제 상태 확인
      // 현재는 기본 구조만 구현
      if (this.config.testMode) {
        return {
          success: true,
          transactionId,
          orderId,
          amount,
          status: PAYMENT_STATUS.COMPLETED,
          message: '결제가 완료되었습니다.',
          paymentMethod: 'KG이니시스',
          approvedAt: new Date().toISOString()
        };
      }

      // TODO: 실제 KG이니시스 API 호출 구현
      return {
        success: false,
        orderId,
        amount,
        status: PAYMENT_STATUS.FAILED,
        message: '결제 검증 실패'
      };

    } catch (error) {
      console.error('결제 검증 오류:', error);
      return {
        success: false,
        orderId,
        amount,
        status: PAYMENT_STATUS.FAILED,
        message: '결제 검증 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 환불 요청
   */
  async requestRefund(refundRequest: RefundRequest): Promise<RefundResponse> {
    try {
      // TODO: 실제 KG이니시스 환불 API 호출 구현
      if (this.config.testMode) {
        return {
          success: true,
          refundId: `REFUND-${Date.now()}`,
          transactionId: refundRequest.transactionId,
          orderId: refundRequest.orderId,
          amount: refundRequest.amount,
          status: 'completed',
          message: '환불이 완료되었습니다.',
          processedAt: new Date().toISOString()
        };
      }

      return {
        success: false,
        transactionId: refundRequest.transactionId,
        orderId: refundRequest.orderId,
        amount: refundRequest.amount,
        status: 'rejected',
        message: '환불 처리 실패'
      };

    } catch (error) {
      console.error('환불 요청 오류:', error);
      return {
        success: false,
        transactionId: refundRequest.transactionId,
        orderId: refundRequest.orderId,
        amount: refundRequest.amount,
        status: 'rejected',
        message: '환불 요청 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 설정 유효성 검사
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.kgInitisMid) {
      errors.push('KG이니시스 MID가 설정되지 않았습니다.');
    }

    if (!this.config.kgInitisSignKey) {
      errors.push('KG이니시스 SignKey가 설정되지 않았습니다.');  
    }

    if (!this.config.kgInitisApiUrl) {
      errors.push('KG이니시스 API URL이 설정되지 않았습니다.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 디지털 콘텐츠별 가격 정보
   */
  getDigitalContentPrices() {
    return {
      face_analysis: {
        name: '얼굴 분석',
        price: 2900,
        description: 'AI 얼굴 분석 + MBTI 추천'
      },
      saju_analysis: {
        name: '사주 분석', 
        price: 4900,
        description: '생년월일 기반 사주 분석'
      },
      palmistry: {
        name: '손금 분석',
        price: 3900,
        description: '손금 사진 기반 운세 분석'
      },
      comprehensive_report: {
        name: '종합 리포트',
        price: 9900,
        description: '얼굴 + 사주 + 손금 종합 분석'
      }
    };
  }
}

// 싱글톤 인스턴스 export
export const paymentService = new PaymentService();