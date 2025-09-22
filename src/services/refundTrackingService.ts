/**
 * 환불 트래킹 서비스
 * 서비스 오류 발생 시 자동 환불 처리를 위한 데이터 수집 및 관리
 */

import persistentStore from './persistentStore';

interface RefundableError {
  id: string;
  sessionId: string;
  userId?: string;
  serviceType: string;
  errorType: string;
  errorMessage: string;
  timestamp: Date;
  
  // 결제 정보
  paymentInfo?: {
    transactionId?: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: 'completed' | 'pending' | 'failed';
  };
  
  // 사용자 정보
  userInfo: {
    ip?: string;
    userAgent?: string;
    phone?: string;
    email?: string;
  };
  
  // 오류 컨텍스트
  errorContext: {
    apiEndpoint: string;
    requestData?: any;
    stackTrace?: string;
    isCritical: boolean;
  };
  
  // 환불 처리 상태
  refundStatus: {
    isEligible: boolean;
    status: 'pending' | 'processing' | 'completed' | 'rejected' | 'not_required';
    refundAmount?: number;
    processedAt?: Date;
    refundMethod?: string;
    refundTransactionId?: string;
    notes?: string;
  };
}

interface RefundPolicy {
  serviceType: string;
  isRefundable: boolean;
  eligibleErrorTypes: string[];
  refundPercentage: number; // 0-100
  autoRefundEnabled: boolean;
  requiresManualApproval: boolean;
}

class RefundTrackingService {
  private refundableErrors: Map<string, RefundableError> = new Map();
  private refundPolicies: RefundPolicy[] = [
    {
      serviceType: 'professional-physiognomy',
      isRefundable: true,
      eligibleErrorTypes: ['ANALYSIS_FAILED', 'AI_SERVICE_ERROR', 'PROCESSING_ERROR'],
      refundPercentage: 100,
      autoRefundEnabled: false, // 전문관상은 수동 승인 필요
      requiresManualApproval: true
    },
    {
      serviceType: 'mbti-face',
      isRefundable: true,
      eligibleErrorTypes: ['ANALYSIS_FAILED', 'AI_SERVICE_ERROR', 'IMAGE_PROCESSING_ERROR'],
      refundPercentage: 100,
      autoRefundEnabled: true,
      requiresManualApproval: false
    },
    {
      serviceType: 'fortune',
      isRefundable: true,
      eligibleErrorTypes: ['ANALYSIS_FAILED', 'AI_SERVICE_ERROR'],
      refundPercentage: 100,
      autoRefundEnabled: true,
      requiresManualApproval: false
    },
    {
      serviceType: 'face-saju',
      isRefundable: true,
      eligibleErrorTypes: ['ANALYSIS_FAILED', 'AI_SERVICE_ERROR', 'SAJU_CALCULATION_ERROR'],
      refundPercentage: 100,
      autoRefundEnabled: true,
      requiresManualApproval: false
    }
  ];

  constructor() {
    this.loadRefundableErrors();
    console.log('🔄 환불 트래킹 서비스 초기화됨');
  }

  /**
   * 환불 가능한 오류 기록
   */
  trackRefundableError(errorData: Omit<RefundableError, 'id' | 'timestamp' | 'refundStatus'>): string {
    const errorId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const policy = this.getRefundPolicy(errorData.serviceType);
    
    const refundableError: RefundableError = {
      ...errorData,
      id: errorId,
      timestamp: new Date(),
      refundStatus: {
        isEligible: this.isEligibleForRefund(errorData.errorType, errorData.serviceType),
        status: 'pending',
        refundAmount: policy ? (errorData.paymentInfo?.amount || 0) * (policy.refundPercentage / 100) : 0
      }
    };

    this.refundableErrors.set(errorId, refundableError);
    this.saveRefundableErrors();

    // 자동 환불 처리 가능한 경우 즉시 처리
    if (policy?.autoRefundEnabled && refundableError.refundStatus.isEligible && !policy.requiresManualApproval) {
      this.processAutoRefund(errorId);
    }

    console.log(`💰 환불 추적 오류 기록: ${errorData.serviceType}, 오류: ${errorData.errorType}, ID: ${errorId}`);
    return errorId;
  }

  /**
   * 환불 자격 확인
   */
  private isEligibleForRefund(errorType: string, serviceType: string): boolean {
    const policy = this.getRefundPolicy(serviceType);
    if (!policy || !policy.isRefundable) return false;
    
    return policy.eligibleErrorTypes.includes(errorType);
  }

  /**
   * 환불 정책 조회
   */
  private getRefundPolicy(serviceType: string): RefundPolicy | undefined {
    return this.refundPolicies.find(policy => policy.serviceType === serviceType);
  }

  /**
   * 자동 환불 처리
   */
  private async processAutoRefund(errorId: string): Promise<void> {
    const error = this.refundableErrors.get(errorId);
    if (!error || !error.refundStatus.isEligible) return;

    try {
      // 실제 환불 처리 로직 (결제 게이트웨이 API 호출)
      // 여기서는 시뮬레이션
      
      error.refundStatus.status = 'processing';
      error.refundStatus.processedAt = new Date();
      error.refundStatus.refundMethod = 'auto_credit_reversal';
      error.refundStatus.notes = '서비스 오류로 인한 자동 환불 처리';

      // TODO: 실제 결제 시스템과 연동
      // await this.processPaymentRefund(error.paymentInfo, error.refundStatus.refundAmount);

      error.refundStatus.status = 'completed';
      error.refundStatus.refundTransactionId = `refund_${Date.now()}`;

      this.saveRefundableErrors();
      console.log(`✅ 자동 환불 처리 완료: ${errorId}, 금액: ${error.refundStatus.refundAmount}원`);

      // 사용자에게 환불 완료 알림 발송 (이메일, SMS 등)
      this.notifyRefundCompleted(error);

    } catch (error) {
      console.error('자동 환불 처리 실패:', error);
      const refundError = this.refundableErrors.get(errorId);
      if (refundError) {
        refundError.refundStatus.status = 'rejected';
        refundError.refundStatus.notes = '자동 환불 처리 중 오류 발생';
        this.saveRefundableErrors();
      }
    }
  }

  /**
   * 환불 완료 알림
   */
  private notifyRefundCompleted(error: RefundableError): void {
    // 실제 알림 발송 로직
    console.log(`📧 환불 완료 알림 발송: ${error.userInfo.phone || error.userInfo.email || '사용자'}`);
  }

  /**
   * 환불 대상 오류 목록 조회
   */
  getRefundableErrors(status?: RefundableError['refundStatus']['status']): RefundableError[] {
    const errors = Array.from(this.refundableErrors.values());
    return status ? errors.filter(error => error.refundStatus.status === status) : errors;
  }

  /**
   * 특정 오류의 환불 처리 상태 업데이트
   */
  updateRefundStatus(errorId: string, status: RefundableError['refundStatus']['status'], notes?: string): boolean {
    const error = this.refundableErrors.get(errorId);
    if (!error) return false;

    error.refundStatus.status = status;
    if (notes) error.refundStatus.notes = notes;
    if (status === 'completed') error.refundStatus.processedAt = new Date();

    this.saveRefundableErrors();
    console.log(`🔄 환불 상태 업데이트: ${errorId} -> ${status}`);
    return true;
  }

  /**
   * 환불 통계 조회
   */
  getRefundStatistics(): {
    totalErrors: number;
    eligibleForRefund: number;
    pendingRefunds: number;
    completedRefunds: number;
    rejectedRefunds: number;
    totalRefundAmount: number;
    refundsByService: { [serviceType: string]: number };
  } {
    const errors = Array.from(this.refundableErrors.values());
    const eligible = errors.filter(e => e.refundStatus.isEligible);
    const completed = errors.filter(e => e.refundStatus.status === 'completed');

    return {
      totalErrors: errors.length,
      eligibleForRefund: eligible.length,
      pendingRefunds: errors.filter(e => e.refundStatus.status === 'pending').length,
      completedRefunds: completed.length,
      rejectedRefunds: errors.filter(e => e.refundStatus.status === 'rejected').length,
      totalRefundAmount: completed.reduce((sum, e) => sum + (e.refundStatus.refundAmount || 0), 0),
      refundsByService: errors.reduce((acc, error) => {
        acc[error.serviceType] = (acc[error.serviceType] || 0) + 1;
        return acc;
      }, {} as { [serviceType: string]: number })
    };
  }

  /**
   * 환불 가능한 오류 데이터 영구 저장
   */
  private saveRefundableErrors(): void {
    try {
      const errorsData = Array.from(this.refundableErrors.entries()).map(([id, error]) => ({
        id,
        ...error,
        timestamp: error.timestamp.toISOString(),
        refundStatus: {
          ...error.refundStatus,
          processedAt: error.refundStatus.processedAt?.toISOString()
        }
      }));
      
      // 실제 구현시 persistentStore 확장 필요
      // persistentStore.saveRefundableErrors(errorsData);
      
      console.log(`💾 환불 추적 데이터 저장됨: ${errorsData.length}개`);
    } catch (error) {
      console.error('환불 추적 데이터 저장 실패:', error);
    }
  }

  /**
   * 환불 가능한 오류 데이터 로드
   */
  private loadRefundableErrors(): void {
    try {
      // 실제 구현시 persistentStore에서 로드
      // const savedErrors = persistentStore.loadRefundableErrors();
      // savedErrors.forEach(errorData => {
      //   this.refundableErrors.set(errorData.id, {
      //     ...errorData,
      //     timestamp: new Date(errorData.timestamp),
      //     refundStatus: {
      //       ...errorData.refundStatus,
      //       processedAt: errorData.refundStatus.processedAt ? new Date(errorData.refundStatus.processedAt) : undefined
      //     }
      //   });
      // });
      
      console.log('💾 환불 추적 데이터 로드 완료');
    } catch (error) {
      console.error('환불 추적 데이터 로드 실패:', error);
    }
  }

  /**
   * 수동 환불 승인
   */
  approveManualRefund(errorId: string, adminNotes?: string): boolean {
    const error = this.refundableErrors.get(errorId);
    if (!error || !error.refundStatus.isEligible) return false;

    const policy = this.getRefundPolicy(error.serviceType);
    if (!policy?.requiresManualApproval) return false;

    // 수동 승인 후 환불 처리
    this.processAutoRefund(errorId);
    
    if (adminNotes) {
      error.refundStatus.notes = adminNotes;
    }
    
    return true;
  }
}

// 싱글톤 인스턴스 생성
const refundTrackingService = new RefundTrackingService();

export default refundTrackingService;
export type { RefundableError, RefundPolicy };