/**
 * 미인증(익명) 사용자 트래킹 및 관리 서비스
 * 
 * 가입 없는 사용자도 결제와 오류를 정확히 추적하기 위한 시스템
 * - 세션 기반 사용자 식별
 * - 결제 정보와 연계된 트래킹
 * - 오류 발생 시 보상 처리를 위한 연락 방법 관리
 */

import { v4 as uuidv4 } from 'uuid';

// 익명 사용자 세션 정보
export interface AnonymousUserSession {
  sessionId: string;
  userId: string; // 내부 추적용 고유 ID
  createdAt: string;
  lastActivity: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    screen: string;
    timezone: string;
  };
  // 결제 및 서비스 이용 기록
  services: {
    serviceId: string;
    serviceType: string;
    orderId?: string;
    paymentId?: string;
    status: 'started' | 'payment_pending' | 'paid' | 'completed' | 'error';
    timestamp: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      preferredContact: 'email' | 'phone';
    };
  }[];
  // 오류 이력
  errors: {
    errorId: string;
    serviceId: string;
    errorType: string;
    severity: string;
    compensationRequired: boolean;
    compensationAmount?: number;
    contactAttempted: boolean;
    resolved: boolean;
    timestamp: string;
  }[];
}

// 결제 정보와 연계된 사용자 추적
export interface PaymentUserTracker {
  paymentId: string;
  orderId: string;
  sessionId: string;
  userId: string;
  serviceType: string;
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  contactInfo: {
    email?: string;
    phone?: string;
    name?: string;
    preferredContact: 'email' | 'phone';
  };
  createdAt: string;
  updatedAt: string;
}

class AnonymousUserService {
  private sessions: Map<string, AnonymousUserSession> = new Map();
  private paymentTrackers: Map<string, PaymentUserTracker> = new Map();
  private sessionCleanupInterval: NodeJS.Timeout;

  constructor() {
    // 24시간마다 만료된 세션 정리
    this.sessionCleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * 새 익명 사용자 세션 생성
   */
  createAnonymousSession(deviceInfo: any): AnonymousUserSession {
    const sessionId = `sess_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: AnonymousUserSession = {
      sessionId,
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      deviceInfo: {
        userAgent: deviceInfo.userAgent || 'Unknown',
        platform: deviceInfo.platform || 'Unknown',
        screen: deviceInfo.screen || 'Unknown',
        timezone: deviceInfo.timezone || 'Asia/Seoul'
      },
      services: [],
      errors: []
    };

    this.sessions.set(sessionId, session);
    
    console.log('ANONYMOUS_USER: 익명 사용자 세션 생성', {
      metadata: {
        sessionId,
        userId,
        deviceInfo: session.deviceInfo
      }
    });

    return session;
  }

  /**
   * 세션 조회 및 업데이트
   */
  getSession(sessionId: string): AnonymousUserSession | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date().toISOString();
      return session;
    }
    return null;
  }

  /**
   * 서비스 이용 시작 기록
   */
  startServiceUsage(sessionId: string, serviceType: string, contactInfo?: any): string {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    const serviceId = `svc_${Date.now()}_${uuidv4().slice(0, 8)}`;
    
    session.services.push({
      serviceId,
      serviceType,
      status: 'started',
      timestamp: new Date().toISOString(),
      contactInfo
    });

    console.log('SERVICE_START', '익명 사용자 서비스 시작', {
      metadata: {
        sessionId,
        userId: session.userId,
        serviceId,
        serviceType,
        hasContactInfo: !!contactInfo
      }
    });

    return serviceId;
  }

  /**
   * 결제 정보 연계 및 추적
   */
  linkPayment(sessionId: string, serviceId: string, paymentInfo: {
    orderId: string;
    paymentId: string;
    amount: number;
    contactInfo: {
      email?: string;
      phone?: string;
      name?: string;
      preferredContact: 'email' | 'phone';
    };
  }): void {
    console.log('PAYMENT_LINK_ATTEMPT', '결제 연계 시도', {
      metadata: {
        sessionId,
        serviceId,
        orderId: paymentInfo.orderId,
        paymentId: paymentInfo.paymentId,
        totalSessions: this.sessions.size,
        sessionExists: this.sessions.has(sessionId)
      }
    });

    const session = this.getSession(sessionId);
    if (!session) {
      console.error('PAYMENT_LINK_FAILED', '세션을 찾을 수 없음', {
        metadata: {
          requestedSessionId: sessionId,
          existingSessions: Array.from(this.sessions.keys()),
          totalSessions: this.sessions.size
        }
      });
      throw new Error('세션을 찾을 수 없습니다.');
    }

    // 서비스 정보 업데이트
    const service = session.services.find(s => s.serviceId === serviceId);
    if (service) {
      service.orderId = paymentInfo.orderId;
      service.paymentId = paymentInfo.paymentId;
      service.status = 'payment_pending';
      service.contactInfo = paymentInfo.contactInfo;
    }

    // 결제 추적기 생성
    const paymentTracker: PaymentUserTracker = {
      paymentId: paymentInfo.paymentId,
      orderId: paymentInfo.orderId,
      sessionId,
      userId: session.userId,
      serviceType: service?.serviceType || 'unknown',
      amount: paymentInfo.amount,
      paymentStatus: 'pending',
      contactInfo: paymentInfo.contactInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.paymentTrackers.set(paymentInfo.paymentId, paymentTracker);

    console.log('PAYMENT_LINKED', '익명 사용자 결제 연계', {
      metadata: {
        sessionId,
        userId: session.userId,
        serviceId,
        orderId: paymentInfo.orderId,
        paymentId: paymentInfo.paymentId,
        amount: paymentInfo.amount,
        contactMethod: paymentInfo.contactInfo.preferredContact
      }
    });
  }

  /**
   * 결제 완료 처리
   */
  completePayment(paymentId: string): void {
    const tracker = this.paymentTrackers.get(paymentId);
    if (!tracker) {
      throw new Error('결제 추적 정보를 찾을 수 없습니다.');
    }

    tracker.paymentStatus = 'completed';
    tracker.updatedAt = new Date().toISOString();

    // 세션의 서비스 상태도 업데이트
    const session = this.getSession(tracker.sessionId);
    if (session) {
      const service = session.services.find(s => s.paymentId === paymentId);
      if (service) {
        service.status = 'paid';
      }
    }

    console.log('PAYMENT_COMPLETED', '익명 사용자 결제 완료', {
      metadata: {
        paymentId,
        orderId: tracker.orderId,
        userId: tracker.userId,
        serviceType: tracker.serviceType,
        amount: tracker.amount
      }
    });
  }

  /**
   * 서비스 완료 처리
   */
  completeService(sessionId: string, serviceId: string, result?: any): void {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    const service = session.services.find(s => s.serviceId === serviceId);
    if (service) {
      service.status = 'completed';
    }

    console.log('SERVICE_COMPLETED', '익명 사용자 서비스 완료', {
      metadata: {
        sessionId,
        userId: session.userId,
        serviceId,
        serviceType: service?.serviceType,
        hasResult: !!result
      }
    });
  }

  /**
   * 오류 발생 기록 및 보상 처리
   */
  recordServiceError(sessionId: string, serviceId: string, error: {
    errorType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    compensationRequired: boolean;
    compensationAmount?: number;
  }): string {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    const errorId = `err_${Date.now()}_${uuidv4().slice(0, 8)}`;
    
    session.errors.push({
      errorId,
      serviceId,
      errorType: error.errorType,
      severity: error.severity,
      compensationRequired: error.compensationRequired,
      compensationAmount: error.compensationAmount,
      contactAttempted: false,
      resolved: false,
      timestamp: new Date().toISOString()
    });

    // 해당 서비스 상태를 오류로 변경
    const service = session.services.find(s => s.serviceId === serviceId);
    if (service) {
      service.status = 'error';
    }

    // Critical 오류이고 보상이 필요한 경우 즉시 연락 시도
    if (error.severity === 'critical' && error.compensationRequired) {
      this.attemptUserContact(sessionId, serviceId, errorId);
    }

    console.error('SERVICE_ERROR_ANONYMOUS', '익명 사용자 서비스 오류 발생', {
      metadata: {
        sessionId,
        userId: session.userId,
        serviceId,
        errorId,
        errorType: error.errorType,
        severity: error.severity,
        compensationRequired: error.compensationRequired,
        compensationAmount: error.compensationAmount
      }
    });

    return errorId;
  }

  /**
   * 사용자 연락 시도
   */
  private attemptUserContact(sessionId: string, serviceId: string, errorId: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const service = session.services.find(s => s.serviceId === serviceId);
    const error = session.errors.find(e => e.errorId === errorId);
    
    if (!service || !error || !service.contactInfo) {
      console.warn('USER_CONTACT_FAILED', '익명 사용자 연락 정보 없음', {
        metadata: {
          sessionId,
          serviceId,
          errorId,
          hasContactInfo: !!service?.contactInfo
        }
      });
      return;
    }

    // 실제 구현에서는 이메일/SMS 발송
    error.contactAttempted = true;
    
    console.log('USER_CONTACT_ATTEMPTED', '익명 사용자 연락 시도', {
      metadata: {
        sessionId,
        userId: session.userId,
        serviceId,
        errorId,
        contactMethod: service.contactInfo.preferredContact,
        compensationAmount: error.compensationAmount
      }
    });
  }

  /**
   * 주문 ID로 사용자 정보 조회
   */
  getUserByOrderId(orderId: string): { session: AnonymousUserSession; tracker: PaymentUserTracker } | null {
    for (const [paymentId, tracker] of this.paymentTrackers) {
      if (tracker.orderId === orderId) {
        const session = this.getSession(tracker.sessionId);
        if (session) {
          return { session, tracker };
        }
      }
    }
    return null;
  }

  /**
   * 결제 ID로 사용자 정보 조회
   */
  getUserByPaymentId(paymentId: string): { session: AnonymousUserSession; tracker: PaymentUserTracker } | null {
    const tracker = this.paymentTrackers.get(paymentId);
    if (tracker) {
      const session = this.getSession(tracker.sessionId);
      if (session) {
        return { session, tracker };
      }
    }
    return null;
  }

  /**
   * 보상 처리용 사용자 연락처 조회
   */
  getContactInfoForCompensation(orderId: string): {
    contactInfo: any;
    userId: string;
    serviceType: string;
    amount: number;
  } | null {
    const userInfo = this.getUserByOrderId(orderId);
    if (!userInfo) return null;

    const { session, tracker } = userInfo;
    
    return {
      contactInfo: tracker.contactInfo,
      userId: session.userId,
      serviceType: tracker.serviceType,
      amount: tracker.amount
    };
  }

  /**
   * 만료된 세션 정리 (24시간 이상 비활성)
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredThreshold = 24 * 60 * 60 * 1000; // 24시간
    
    let cleanedCount = 0;
    
    for (const [sessionId, session] of this.sessions) {
      const lastActivity = new Date(session.lastActivity).getTime();
      
      if (now - lastActivity > expiredThreshold) {
        // 미해결 오류나 진행 중인 결제가 있으면 보관
        const hasUnresolvedIssues = session.errors.some(e => !e.resolved && e.compensationRequired) ||
                                   session.services.some(s => s.status === 'payment_pending' || s.status === 'paid');
        
        if (!hasUnresolvedIssues) {
          this.sessions.delete(sessionId);
          cleanedCount++;
        }
      }
    }
    
    if (cleanedCount > 0) {
      console.log('SESSION_CLEANUP', `만료된 세션 정리 완료: ${cleanedCount}개`, {
        metadata: {
          cleanedSessions: cleanedCount,
          remainingSessions: this.sessions.size
        }
      });
    }
  }

  /**
   * 결제 시간과 금액으로 사용자 찾기 (고객센터용)
   */
  findUsersByPaymentTimeAndAmount(
    startTime: Date, 
    endTime: Date, 
    amount: number
  ): { session: AnonymousUserSession; tracker: PaymentUserTracker }[] {
    const matches: { session: AnonymousUserSession; tracker: PaymentUserTracker }[] = [];
    
    for (const [paymentId, tracker] of this.paymentTrackers) {
      const createdTime = new Date(tracker.createdAt);
      
      if (createdTime >= startTime && 
          createdTime <= endTime && 
          tracker.amount === amount) {
        
        const session = this.getSession(tracker.sessionId);
        if (session) {
          matches.push({ session, tracker });
        }
      }
    }
    
    console.log('PAYMENT_TIME_AMOUNT_SEARCH', '결제 시간+금액 검색', {
      metadata: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        amount,
        matchCount: matches.length
      }
    });
    
    return matches;
  }

  /**
   * 전화번호로 사용자 찾기
   */
  findUsersByPhone(phone: string): { session: AnonymousUserSession; tracker: PaymentUserTracker }[] {
    const matches: { session: AnonymousUserSession; tracker: PaymentUserTracker }[] = [];
    
    for (const [paymentId, tracker] of this.paymentTrackers) {
      if (tracker.contactInfo.phone === phone) {
        const session = this.getSession(tracker.sessionId);
        if (session) {
          matches.push({ session, tracker });
        }
      }
    }
    
    console.log('PHONE_SEARCH', '전화번호 검색', {
      metadata: {
        phone: phone.replace(/\d{4}$/, '****'), // 마지막 4자리 마스킹
        matchCount: matches.length
      }
    });
    
    return matches;
  }

  /**
   * 이메일로 사용자 찾기
   */
  findUsersByEmail(email: string): { session: AnonymousUserSession; tracker: PaymentUserTracker }[] {
    const matches: { session: AnonymousUserSession; tracker: PaymentUserTracker }[] = [];
    
    for (const [paymentId, tracker] of this.paymentTrackers) {
      if (tracker.contactInfo.email === email) {
        const session = this.getSession(tracker.sessionId);
        if (session) {
          matches.push({ session, tracker });
        }
      }
    }
    
    console.log('EMAIL_SEARCH', '이메일 검색', {
      metadata: {
        email: email.replace(/^.{3}/, '***'), // 앞 3자리 마스킹
        matchCount: matches.length
      }
    });
    
    return matches;
  }

  /**
   * 복합 검색: 여러 조건으로 사용자 찾기
   */
  findUsersByMultipleConditions(conditions: {
    timeRange?: { start: Date; end: Date };
    amount?: number;
    phone?: string;
    email?: string;
    cardLastFour?: string;
  }): { session: AnonymousUserSession; tracker: PaymentUserTracker; matchScore: number }[] {
    const allMatches = new Map<string, { session: AnonymousUserSession; tracker: PaymentUserTracker; matchScore: number }>();
    
    // 각 조건별로 점수 부여
    const scoreWeights = {
      timeAndAmount: 30,
      phone: 25,
      email: 20,
      cardLastFour: 15
    };

    // 시간+금액 매칭
    if (conditions.timeRange && conditions.amount) {
      const timeMatches = this.findUsersByPaymentTimeAndAmount(
        conditions.timeRange.start, 
        conditions.timeRange.end, 
        conditions.amount
      );
      
      timeMatches.forEach(match => {
        const key = match.tracker.sessionId;
        const existing = allMatches.get(key);
        const newScore = (existing?.matchScore || 0) + scoreWeights.timeAndAmount;
        allMatches.set(key, { ...match, matchScore: newScore });
      });
    }

    // 전화번호 매칭
    if (conditions.phone) {
      const phoneMatches = this.findUsersByPhone(conditions.phone);
      phoneMatches.forEach(match => {
        const key = match.tracker.sessionId;
        const existing = allMatches.get(key);
        const newScore = (existing?.matchScore || 0) + scoreWeights.phone;
        allMatches.set(key, { ...match, matchScore: newScore });
      });
    }

    // 이메일 매칭
    if (conditions.email) {
      const emailMatches = this.findUsersByEmail(conditions.email);
      emailMatches.forEach(match => {
        const key = match.tracker.sessionId;
        const existing = allMatches.get(key);
        const newScore = (existing?.matchScore || 0) + scoreWeights.email;
        allMatches.set(key, { ...match, matchScore: newScore });
      });
    }

    // 카드 마지막 4자리 매칭 (실제 구현에서는 결제 시스템과 연동)
    // TODO: 카드 정보 검색 구현

    const results = Array.from(allMatches.values())
      .sort((a, b) => b.matchScore - a.matchScore);

    console.log('MULTI_CONDITION_SEARCH', '복합 조건 검색', {
      metadata: {
        conditions: {
          hasTimeRange: !!conditions.timeRange,
          hasAmount: !!conditions.amount,
          hasPhone: !!conditions.phone,
          hasEmail: !!conditions.email,
          hasCardInfo: !!conditions.cardLastFour
        },
        resultCount: results.length,
        topScore: results[0]?.matchScore || 0
      }
    });

    return results;
  }

  /**
   * 통계 조회
   */
  getAnonymousUserStats(): {
    totalSessions: number;
    activeSessions: number;
    totalPayments: number;
    totalErrors: number;
    uncontactedErrors: number;
  } {
    const now = Date.now();
    const activeThreshold = 60 * 60 * 1000; // 1시간
    
    let activeSessions = 0;
    let totalErrors = 0;
    let uncontactedErrors = 0;
    
    for (const session of this.sessions.values()) {
      const lastActivity = new Date(session.lastActivity).getTime();
      if (now - lastActivity < activeThreshold) {
        activeSessions++;
      }
      
      totalErrors += session.errors.length;
      uncontactedErrors += session.errors.filter(e => 
        e.compensationRequired && !e.contactAttempted
      ).length;
    }
    
    return {
      totalSessions: this.sessions.size,
      activeSessions,
      totalPayments: this.paymentTrackers.size,
      totalErrors,
      uncontactedErrors
    };
  }
}

export const anonymousUserService = new AnonymousUserService();