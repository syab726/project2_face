// 결제 관련 타입 정의

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'wallet';
  provider: 'kg_inicis' | 'naver_pay' | 'kakao_pay' | 'toss_pay';
  icon?: string;
  enabled: boolean;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  buyerTel?: string;
  method: PaymentMethod;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  message?: string;
  errorCode?: string;
  paymentMethod?: string;
  approvedAt?: string;
}

export interface KGInitisPayment {
  mid: string; // 상점ID
  oid: string; // 주문번호
  price: number; // 결제금액
  goodname: string; // 상품명
  buyername: string; // 구매자명
  buyeremail: string; // 구매자 이메일
  buyertel?: string; // 구매자 전화번호
  returnUrl: string; // 결제완료 후 리턴 URL
  closeUrl: string; // 결제창 닫기 URL
  acceptmethod?: string; // 결제수단 제한
  quotabase?: string; // 할부개월 제한
  ini_encfield?: string; // 암호화 필드
  ini_certid?: string; // 인증서 ID
  timestamp: string; // 타임스탬프
  signature: string; // 서명값
}

export interface RefundRequest {
  transactionId: string;
  orderId: string;
  amount: number;
  reason: string;
  requestedBy: string;
  requestedAt: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  transactionId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  message?: string;
  processedAt?: string;
}

export interface PaymentConfig {
  kgInitisMid: string;
  kgInitisSignKey: string;
  kgInitisApiUrl: string;
  testMode: boolean;
  supportedMethods: PaymentMethod[];
  defaultCurrency: string;
  maxAmount: number;
  minAmount: number;
}

export interface DigitalContent {
  id: string;
  name: string;
  type: 'face_analysis' | 'saju_analysis' | 'palmistry' | 'comprehensive_report';
  price: number;
  description: string;
  features: string[];
  downloadable: boolean;
  processingTime: number; // 처리 시간 (분)
}

export interface PurchaseOrder {
  id: string;
  userId?: string;
  email: string;
  content: DigitalContent;
  amount: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  downloadExpiresAt?: string;
}

// 결제 상태 관리를 위한 상수
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed', 
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

export const REFUND_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
} as const;

export const DIGITAL_CONTENT_TYPES = {
  FACE_ANALYSIS: 'face_analysis',
  SAJU_ANALYSIS: 'saju_analysis', 
  PALMISTRY: 'palmistry',
  COMPREHENSIVE_REPORT: 'comprehensive_report'
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid', 
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;