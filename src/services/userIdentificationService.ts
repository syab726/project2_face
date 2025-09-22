/**
 * 익명 사용자 식별 및 매칭 서비스
 * 
 * 회원가입 없는 서비스에서 오류 발생 시 사용자를 정확히 식별하기 위한 다중 접근 방식
 */

// import loggingService from './loggingService'; // 클라이언트 컴포넌트에서 사용되므로 제거

// 사용자 식별을 위한 데이터 타입
export interface UserIdentificationData {
  // 1차 식별자: 결제 정보
  paymentInfo: {
    transactionId?: string;      // 카드 결제 승인번호
    orderId?: string;            // 주문번호
    paymentAmount: number;       // 결제 금액
    paymentTime: string;         // 결제 시간 (ISO string)
    cardLastFour?: string;       // 카드 마지막 4자리
    bankCode?: string;           // 은행 코드
  };
  
  // 2차 식별자: 연락처 정보
  contactInfo: {
    phone?: string;              // 전화번호 (주 연락 방법)
    email?: string;              // 이메일 (선택사항)
    preferredContact: 'phone' | 'email';
  };
  
  // 3차 식별자: 서비스 사용 정보
  serviceInfo: {
    serviceType: string;         // 이용한 서비스 유형
    serviceTime: string;         // 서비스 이용 시간
    deviceFingerprint: string;   // 디바이스 고유 식별자
    sessionId: string;           // 세션 ID
  };
  
  // 4차 식별자: 기술적 정보
  technicalInfo: {
    ipAddress: string;           // IP 주소
    userAgent: string;           // 브라우저 정보
    screenResolution: string;    // 화면 해상도
    timezone: string;            // 시간대
  };
}

// 사용자 매칭 결과
export interface UserMatchResult {
  confidence: 'high' | 'medium' | 'low';
  matchedFactors: string[];
  sessionId: string;
  userId: string;
  contactMethod: 'phone' | 'email';
  contactValue: string;
}

class UserIdentificationService {
  /**
   * 사용자 신고/문의 시 해당 사용자를 식별하는 메인 함수
   */
  identifyUser(userProvidedInfo: {
    // 사용자가 제공한 정보
    transactionTime?: string;    // "2025년 8월 19일 오후 3시 30분경"
    transactionAmount?: number;  // 2900원
    cardLastFour?: string;       // "1234"
    phoneNumber?: string;        // "010-1234-5678"
    email?: string;              // "user@example.com"
    serviceType?: string;        // "관상분석", "MBTI분석" 등
    problemDescription: string;  // 사용자 문제 설명
    reportTime: string;          // 신고 시간
  }): UserMatchResult[] {
    
    // loggingService는 서버에서만 사용 가능
    if (typeof window === 'undefined') {
      console.log('USER_IDENTIFICATION_REQUEST', '사용자 식별 요청', {
        hasTransactionTime: !!userProvidedInfo.transactionTime,
        hasAmount: !!userProvidedInfo.transactionAmount,
        hasCardInfo: !!userProvidedInfo.cardLastFour,
        hasPhone: !!userProvidedInfo.phoneNumber,
        hasEmail: !!userProvidedInfo.email,
        serviceType: userProvidedInfo.serviceType,
        reportTime: userProvidedInfo.reportTime
      });
    }

    const potentialMatches: UserMatchResult[] = [];

    // 1. 정확한 결제 정보 매칭 (가장 높은 신뢰도)
    const exactPaymentMatches = this.matchByExactPayment(userProvidedInfo);
    potentialMatches.push(...exactPaymentMatches);

    // 2. 시간대 + 금액 매칭 (높은 신뢰도)
    const timeAmountMatches = this.matchByTimeAndAmount(userProvidedInfo);
    potentialMatches.push(...timeAmountMatches);

    // 3. 연락처 매칭 (중간 신뢰도)
    const contactMatches = this.matchByContact(userProvidedInfo);
    potentialMatches.push(...contactMatches);

    // 4. 중복 제거 및 신뢰도 순 정렬
    const uniqueMatches = this.deduplicateAndSort(potentialMatches);

    if (typeof window === 'undefined') {
      console.log('USER_IDENTIFICATION_RESULT', '사용자 식별 결과', {
        totalMatches: uniqueMatches.length,
        highConfidenceMatches: uniqueMatches.filter(m => m.confidence === 'high').length,
        mediumConfidenceMatches: uniqueMatches.filter(m => m.confidence === 'medium').length,
        lowConfidenceMatches: uniqueMatches.filter(m => m.confidence === 'low').length
      });
    }

    return uniqueMatches;
  }

  /**
   * 1. 정확한 결제 정보로 매칭 (카드 승인번호, 주문번호 등)
   */
  private matchByExactPayment(userInfo: any): UserMatchResult[] {
    // 실제 구현에서는 anonymousUserService나 결제 시스템에서 조회
    const matches: UserMatchResult[] = [];
    
    // 카드 마지막 4자리 + 금액 + 시간대 매칭
    if (userInfo.cardLastFour && userInfo.transactionAmount) {
      // TODO: 실제 결제 데이터와 비교
      // const paymentRecords = paymentService.searchByCardAndAmount(...)
    }
    
    return matches;
  }

  /**
   * 2. 시간대 + 금액으로 매칭
   */
  private matchByTimeAndAmount(userInfo: any): UserMatchResult[] {
    const matches: UserMatchResult[] = [];
    
    if (userInfo.transactionTime && userInfo.transactionAmount) {
      const timeWindow = this.parseUserTimeDescription(userInfo.transactionTime);
      
      // 해당 시간대 ±30분 내의 동일 금액 결제 찾기
      // TODO: 실제 구현
      /*
      const candidates = anonymousUserService.findPaymentsByTimeAndAmount(
        timeWindow.start,
        timeWindow.end,
        userInfo.transactionAmount
      );
      */
    }
    
    return matches;
  }

  /**
   * 3. 연락처로 매칭
   */
  private matchByContact(userInfo: any): UserMatchResult[] {
    const matches: UserMatchResult[] = [];
    
    // 전화번호 매칭
    if (userInfo.phoneNumber) {
      // TODO: anonymousUserService에서 전화번호로 검색
    }
    
    // 이메일 매칭  
    if (userInfo.email) {
      // TODO: anonymousUserService에서 이메일로 검색
    }
    
    return matches;
  }

  /**
   * 사용자가 제공한 시간 설명을 파싱 (예: "오늘 오후 3시 30분경")
   */
  private parseUserTimeDescription(timeDesc: string): { start: Date; end: Date } {
    const now = new Date();
    
    // 간단한 파싱 로직 (실제로는 더 정교해야 함)
    if (timeDesc.includes('오늘')) {
      // "오늘 오후 3시 30분경" -> 오늘 15:00 ~ 16:00
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return {
        start: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 15:00
        end: new Date(today.getTime() + 16 * 60 * 60 * 1000)    // 16:00
      };
    }
    
    // 더 많은 패턴 처리 필요
    return {
      start: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24시간 전
      end: now
    };
  }

  /**
   * 중복 제거 및 신뢰도 순 정렬
   */
  private deduplicateAndSort(matches: UserMatchResult[]): UserMatchResult[] {
    const uniqueMatches = new Map<string, UserMatchResult>();
    
    matches.forEach(match => {
      const key = match.sessionId;
      const existing = uniqueMatches.get(key);
      
      if (!existing || this.getConfidenceScore(match) > this.getConfidenceScore(existing)) {
        uniqueMatches.set(key, match);
      }
    });
    
    return Array.from(uniqueMatches.values()).sort((a, b) => 
      this.getConfidenceScore(b) - this.getConfidenceScore(a)
    );
  }

  private getConfidenceScore(match: UserMatchResult): number {
    switch (match.confidence) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  /**
   * 고객센터용: 사용자 신고 접수 및 식별
   */
  receiveUserReport(report: {
    customerName?: string;
    phone?: string;
    email?: string;
    transactionInfo: string;  // "오늘 오후 3시경 2900원 결제"
    problemDescription: string;
    urgency: 'low' | 'medium' | 'high';
  }) {
    if (typeof window === 'undefined') {
      console.log('CUSTOMER_REPORT_RECEIVED', '고객 신고 접수', {
        hasName: !!report.customerName,
        hasPhone: !!report.phone,
        hasEmail: !!report.email,
        urgency: report.urgency,
        transactionInfo: report.transactionInfo
      });
    }

    // 사용자 식별 시도
    const matches = this.identifyUser({
      phoneNumber: report.phone,
      email: report.email,
      transactionTime: report.transactionInfo,
      problemDescription: report.problemDescription,
      reportTime: new Date().toISOString()
    });

    // 고신뢰도 매치가 1개인 경우 자동 처리
    const highConfidenceMatches = matches.filter(m => m.confidence === 'high');
    
    if (highConfidenceMatches.length === 1) {
      const match = highConfidenceMatches[0];
      
      if (typeof window === 'undefined') {
        console.log('AUTO_USER_MATCHED', '사용자 자동 매칭 성공', {
          sessionId: match.sessionId,
          userId: match.userId,
          matchedFactors: match.matchedFactors,
          contactMethod: match.contactMethod
        });
      }

      // 해당 사용자의 오류 이력 조회 및 보상 처리
      return {
        status: 'auto_matched',
        user: match,
        recommendedAction: 'immediate_compensation'
      };
    }

    // 애매한 경우 수동 검토 필요
    return {
      status: 'manual_review_needed',
      potentialMatches: matches,
      recommendedAction: 'customer_service_contact'
    };
  }
}

export const userIdentificationService = new UserIdentificationService();

/**
 * 고객센터 가이드라인
 */
export const CUSTOMER_SERVICE_GUIDELINES = {
  IDENTIFICATION_QUESTIONS: [
    "결제하신 정확한 시간을 알려주세요 (예: 오늘 오후 3시 30분경)",
    "결제 금액이 얼마였나요?",
    "사용하신 카드의 마지막 4자리 번호를 알려주세요",
    "어떤 서비스를 이용하려고 하셨나요? (관상분석, MBTI분석 등)",
    "연락 가능한 전화번호를 알려주세요",
    "결제 시 입력하신 이메일이 있다면 알려주세요"
  ],
  
  COMPENSATION_CRITERIA: {
    IMMEDIATE: "결제 완료 후 서비스 미제공 확인 시 즉시 보상",
    REVIEW: "부분적 서비스 제공 또는 품질 이슈 시 검토 후 보상",
    DENY: "서비스 정상 제공 확인 시 보상 불가 안내"
  },
  
  RESPONSE_TEMPLATES: {
    IDENTIFICATION_SUCCESS: "결제 정보를 확인했습니다. 서비스 이용 중 불편을 끼쳐드려 죄송합니다.",
    IDENTIFICATION_FAILED: "결제 정보를 찾을 수 없습니다. 추가 정보를 제공해 주시겠습니까?",
    COMPENSATION_APPROVED: "보상 처리가 승인되었습니다. 영업일 기준 1-2일 내 환불 처리됩니다.",
    NO_ISSUE_FOUND: "결제 및 서비스 제공이 정상적으로 완료된 것으로 확인됩니다."
  }
};

/**
 * 사용 예시:
 * 
 * // 고객이 문의 전화를 걸었을 때
 * const report = await userIdentificationService.receiveUserReport({
 *   phone: "010-1234-5678",
 *   transactionInfo: "오늘 오후 3시 30분경 2900원 관상분석 결제했는데 결과가 안나와요",
 *   problemDescription: "분석 버튼을 눌렀는데 계속 로딩만 되고 결과가 안나옵니다",
 *   urgency: "high"
 * });
 * 
 * if (report.status === 'auto_matched') {
 *   // 즉시 보상 처리
 *   await processCompensation(report.user);
 * } else {
 *   // 수동 검토 필요
 *   await escalateToCustomerService(report);
 * }
 */