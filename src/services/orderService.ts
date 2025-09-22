// 주문 및 서비스 이용 흐름 추적 서비스

export interface OrderData {
  orderId: string;
  userEmail: string;
  serviceType: 'mbti-face' | 'face-saju' | 'face-analysis';
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  serviceStatus: 'not_started' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  errorLogs: string[]; // 서비스 이용 중 발생한 오류들
  refundRequested: boolean;
  refundReason?: string;
  refundProcessedAt?: string;
}

export class OrderService {
  private orders: Map<string, OrderData> = new Map();

  /**
   * 새 주문 생성
   */
  createOrder(orderData: Omit<OrderData, 'createdAt' | 'errorLogs' | 'refundRequested'>): OrderData {
    const order: OrderData = {
      ...orderData,
      createdAt: new Date().toISOString(),
      errorLogs: [],
      refundRequested: false
    };
    
    this.orders.set(order.orderId, order);
    return order;
  }

  /**
   * 주문 상태 업데이트
   */
  updateOrderStatus(orderId: string, updates: Partial<OrderData>): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;

    const updatedOrder = { ...order, ...updates };
    if (updates.serviceStatus === 'completed') {
      updatedOrder.completedAt = new Date().toISOString();
    }

    this.orders.set(orderId, updatedOrder);
    return true;
  }

  /**
   * 주문에 오류 로그 추가
   */
  addErrorLog(orderId: string, errorMessage: string): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;

    order.errorLogs.push(`${new Date().toISOString()}: ${errorMessage}`);
    order.serviceStatus = 'failed';
    this.orders.set(orderId, order);
    return true;
  }

  /**
   * 환불 요청 처리
   */
  requestRefund(orderId: string, reason: string): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;

    order.refundRequested = true;
    order.refundReason = reason;
    this.orders.set(orderId, order);
    return true;
  }

  /**
   * 환불 처리 완료
   */
  processRefund(orderId: string): boolean {
    const order = this.orders.get(orderId);
    if (!order || !order.refundRequested) return false;

    order.paymentStatus = 'refunded';
    order.refundProcessedAt = new Date().toISOString();
    this.orders.set(orderId, order);
    return true;
  }

  /**
   * 주문 정보 조회
   */
  getOrder(orderId: string): OrderData | null {
    return this.orders.get(orderId) || null;
  }

  /**
   * 사용자의 모든 주문 조회
   */
  getUserOrders(userEmail: string): OrderData[] {
    return Array.from(this.orders.values()).filter(order => order.userEmail === userEmail);
  }

  /**
   * 환불이 필요한 주문들 (서비스 이용 실패)
   */
  getOrdersNeedingRefund(): OrderData[] {
    return Array.from(this.orders.values()).filter(order => 
      order.paymentStatus === 'completed' && 
      order.serviceStatus === 'failed' && 
      !order.refundRequested
    );
  }

  /**
   * 환불 요청된 주문들
   */
  getRefundRequests(): OrderData[] {
    return Array.from(this.orders.values()).filter(order => 
      order.refundRequested && order.paymentStatus !== 'refunded'
    );
  }

  /**
   * 주문 통계
   */
  getOrderStats() {
    const orders = Array.from(this.orders.values());
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      total: orders.length,
      today: orders.filter(o => new Date(o.createdAt) >= todayStart).length,
      completed: orders.filter(o => o.serviceStatus === 'completed').length,
      failed: orders.filter(o => o.serviceStatus === 'failed').length,
      pendingRefunds: orders.filter(o => o.refundRequested && o.paymentStatus !== 'refunded').length,
      totalRevenue: orders
        .filter(o => o.paymentStatus === 'completed' && !o.refundRequested)
        .reduce((sum, o) => sum + o.amount, 0),
      successRate: orders.length > 0 
        ? Math.round((orders.filter(o => o.serviceStatus === 'completed').length / orders.length) * 100)
        : 100
    };
  }

  /**
   * 오류 이력 확인 (환불 처리 시 사용)
   */
  hasServiceErrors(orderId: string): boolean {
    const order = this.orders.get(orderId);
    return order ? order.errorLogs.length > 0 : false;
  }

  /**
   * 서비스 이용 성공 여부 확인
   */
  isServiceSuccessful(orderId: string): boolean {
    const order = this.orders.get(orderId);
    return order ? order.serviceStatus === 'completed' && order.errorLogs.length === 0 : false;
  }
}

// 싱글톤 인스턴스
export const orderService = new OrderService();