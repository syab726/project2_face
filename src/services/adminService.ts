// crypto는 서버사이드에서만 사용 가능
import {
  ServiceError,
  RefundRequestData,
  SystemStats,
  DashboardData,
  AdminSession,
  AdminAction,
  ERROR_TYPES,
  ERROR_STATUS,
  REFUND_STATUS
} from '@/types/admin';
import { orderService } from './orderService';
import loggingService from './loggingService';

export class AdminService {
  private readonly ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
  private readonly SESSION_DURATION = 4 * 60 * 60 * 1000; // 4시간
  private sessions: Map<string, AdminSession> = new Map();
  private serviceErrors: ServiceError[] = []; // 실제 오류 저장소 (메모리, 향후 DB 연동)

  constructor() {
    // 실제 운영환경에서는 더미 데이터 생성하지 않음
    // this.initializeTestErrors(); // QA 검토: 더미 데이터 생성 금지
  }

  /**
   * QA 검토: 더미 데이터 생성 함수 완전 제거
   * 실제 운영 환경에서는 실제 오류만 기록
   */
  // private initializeTestErrors(): void {
  //   // QA 전문가 수정: 더미 테스트 데이터 생성 금지
  //   // 실제 AI 분석과 오류 추적을 방해하는 가짜 데이터 제거
  // }

  /**
   * 관리자 인증
   */
  async authenticate(password: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      console.log('인증 시도:', { password: password.slice(0, 3) + '*****' });
      
      // 개발 환경에서는 간단한 패스워드 허용
      const isValidPassword = password === 'admin123!@#';
      console.log('비밀번호 검증:', isValidPassword);

      if (!isValidPassword) {
        loggingService.warn('ADMIN_AUTH', 'Failed login attempt with invalid password');
        return { success: false, error: '잘못된 비밀번호입니다.' };
      }

      // 세션 생성 (클라이언트 사이드용 간단한 UUID)
      const sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION).toISOString();
      
      const session: AdminSession = {
        isAuthenticated: true,
        sessionId,
        expiresAt,
        lastActivity: new Date().toISOString()
      };

      this.sessions.set(sessionId, session);
      loggingService.info('ADMIN_AUTH', 'Admin login successful', {
        sessionId,
        metadata: { expiresAt }
      });

      return { success: true, sessionId };
    } catch (error) {
      loggingService.error('ADMIN_AUTH', 'Admin authentication error', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return { success: false, error: '인증 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 세션 검증
   */
  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (now > expiresAt) {
      this.sessions.delete(sessionId);
      return false;
    }

    // 활동 시간 업데이트
    session.lastActivity = now.toISOString();
    return true;
  }

  /**
   * 세션 종료
   */
  logout(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * 대시보드 데이터 조회
   */
  async getDashboardData(): Promise<DashboardData> {
    const startTime = Date.now();
    
    try {
      loggingService.info('ADMIN_DASHBOARD', 'Dashboard data request started');
      
      // 실제 통계 데이터 생성 (orderService 연동)
      const stats = this.updateSystemStats();

      // 실제 서비스 오류 로그 조회 (최근 10개)
      const recentErrors: ServiceError[] = this.serviceErrors.slice(-10).reverse();

      // 환불 요청 조회 (orderService에서 가져오기)
      const pendingRefunds: RefundRequestData[] = orderService.getRefundRequests().map(order => ({
        id: order.orderId,
        orderId: order.orderId,
        userEmail: order.userEmail,
        userName: '익명 사용자',
        productName: order.serviceType,
        amount: order.amount,
        reason: order.refundReason || '',
        requestedAt: order.createdAt,
        status: 'pending' as const
      }));

      // 최근 주문 (orderService에서 실제 데이터 가져오기)
      const allOrders = Array.from((orderService as any).orders.values()).slice(-10);
      const recentOrders = allOrders.map((order: any) => ({
        id: order.orderId,
        userEmail: order.userEmail,
        productName: this.getProductName(order.serviceType),
        amount: order.amount,
        status: order.paymentStatus,
        createdAt: order.createdAt
      }));

      const dashboardData = {
        stats,
        recentErrors,
        pendingRefunds,
        recentOrders
      };
      
      const duration = Date.now() - startTime;
      loggingService.info('ADMIN_DASHBOARD', 'Dashboard data loaded successfully', {
        metadata: {
          errorCount: recentErrors.length,
          refundCount: pendingRefunds.length,
          orderCount: recentOrders.length,
          duration
        }
      });
      
      return dashboardData;
    } catch (error) {
      const duration = Date.now() - startTime;
      loggingService.error('ADMIN_DASHBOARD', 'Failed to load dashboard data', {
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          duration
        }
      });
      throw new Error('대시보드 데이터를 불러올 수 없습니다.');
    }
  }

  /**
   * 서비스 오류 목록 조회
   */
  async getServiceErrors(status?: string): Promise<ServiceError[]> {
    try {
      let errors = [...this.serviceErrors];

      if (status) {
        errors = errors.filter(error => error.status === status);
      }

      return errors.reverse(); // 최신순
    } catch (error) {
      console.error('서비스 오류 조회 오류:', error);
      throw new Error('서비스 오류 목록을 불러올 수 없습니다.');
    }
  }


  /**
   * 관리자 액션 처리
   */
  async performAction(action: AdminAction, sessionId: string): Promise<{ success: boolean; message: string }> {
    if (!this.validateSession(sessionId)) {
      return { success: false, message: '세션이 만료되었습니다.' };
    }

    try {
      switch (action.type) {
        case 'RESOLVE_ERROR':
          // 실제 오류 상태 업데이트
          const errorIndex = this.serviceErrors.findIndex(e => e.id === action.errorId);
          if (errorIndex !== -1) {
            this.serviceErrors[errorIndex].status = 'resolved';
            this.serviceErrors[errorIndex].resolvedAt = new Date().toISOString();
            console.log(`오류 해결: ${action.errorId}`, action.notes);
            return { success: true, message: '오류가 해결로 표시되었습니다.' };
          } else {
            return { success: false, message: '해당 오류를 찾을 수 없습니다.' };
          }


        default:
          return { success: false, message: '알 수 없는 액션입니다.' };
      }
    } catch (error) {
      console.error('관리자 액션 처리 오류:', error);
      return { success: false, message: '액션 처리 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 새 서비스 오류 추가 (시스템에서 자동 호출)
   */
  async logServiceError(error: Omit<ServiceError, 'id' | 'createdAt' | 'status'>): Promise<void> {
    try {
      const serviceError: ServiceError = {
        ...error,
        id: `ERR-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'new'
      };

      // 메모리에 오류 저장 (향후 데이터베이스 연동)
      this.serviceErrors.push(serviceError);
      
      // 최대 1000개까지만 보관 (메모리 절약)
      if (this.serviceErrors.length > 1000) {
        this.serviceErrors = this.serviceErrors.slice(-1000);
      }
      
      // 구조화된 로깅으로 서비스 오류 기록
      loggingService.error('SERVICE_ERROR', `${error.title}: ${error.message}`, {
        metadata: {
          errorId: serviceError.id,
          errorType: error.type,
          orderId: error.orderId,
          userEmail: error.userEmail,
          totalErrors: this.serviceErrors.length
        }
      });
      
      // 중요한 오류의 경우 별도 로깅 및 알림
      if (error.type === 'payment_error' || error.type === 'system_error') {
        loggingService.error('CRITICAL_ERROR', `Critical service error detected: ${error.type}`, {
          metadata: {
            errorId: serviceError.id,
            orderId: error.orderId,
            userEmail: error.userEmail,
            requiresImmedateAttention: true
          }
        });
      }
    } catch (err) {
      loggingService.error('ADMIN_SERVICE', 'Failed to log service error', {
        metadata: {
          originalError: error,
          systemError: err instanceof Error ? err.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 서비스 타입에 따른 상품명 반환
   */
  private getProductName(serviceType: string): string {
    const productNames: { [key: string]: string } = {
      'mbti-face': 'MBTI × 관상 분석',
      'face-saju': '관상 + 사주 분석',
      'face-analysis': '전문 관상 분석'
    };
    return productNames[serviceType] || serviceType;
  }

  /**
   * orderService와 연동된 실제 시스템 통계
   */
  private updateSystemStats(): SystemStats {
    const orderStats = orderService.getOrderStats();
    
    return {
      totalOrders: orderStats.total,
      totalRevenue: orderStats.totalRevenue,
      successfulPayments: orderStats.completed,
      failedPayments: orderStats.failed,
      pendingRefunds: orderStats.pendingRefunds,
      resolvedRefunds: 0, // TODO: 환불 완료된 주문 수 계산
      activeErrors: this.serviceErrors.filter(e => e.status === 'new').length,
      resolvedErrors: this.serviceErrors.filter(e => e.status === 'resolved').length,
      todayRevenue: orderStats.totalRevenue, // TODO: 오늘 매출만 계산
      todayOrders: orderStats.today,
      conversionRate: orderStats.successRate
    };
  }
}

// 싱글톤 인스턴스
export const adminService = new AdminService();