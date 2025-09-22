// 관리자 대시보드 관련 타입 정의

export interface ServiceError {
  id: string;
  type: 'payment_error' | 'analysis_error' | 'system_error' | 'api_error';
  title: string;
  message: string;
  userId?: string;
  userEmail?: string;
  orderId?: string;
  errorCode?: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  resolvedAt?: string;
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
}

export interface RefundRequestData {
  id: string;
  orderId: string;
  transactionId?: string;
  userEmail: string;
  userName: string;
  amount: number;
  productName: string;
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  adminNotes?: string;
  processedAt?: string;
  processedBy?: string;
  attachments?: string[];
}

export interface SystemStats {
  totalOrders: number;
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  pendingRefunds: number;
  resolvedRefunds: number;
  activeErrors: number;
  resolvedErrors: number;
  todayRevenue: number;
  todayOrders: number;
  conversionRate: number;
}

export interface DashboardData {
  stats: SystemStats;
  recentErrors: ServiceError[];
  pendingRefunds: RefundRequestData[];
  recentOrders: any[];
}

export interface AdminSession {
  isAuthenticated: boolean;
  sessionId: string;
  expiresAt: string;
  lastActivity: string;
}

// 관리자 액션 타입
export type AdminAction = 
  | { type: 'RESOLVE_ERROR'; errorId: string; notes?: string }
  | { type: 'APPROVE_REFUND'; refundId: string; notes?: string }
  | { type: 'REJECT_REFUND'; refundId: string; reason: string }
  | { type: 'PROCESS_REFUND'; refundId: string; transactionId: string }
  | { type: 'UPDATE_ORDER_STATUS'; orderId: string; status: string }
  | { type: 'SEND_EMAIL'; recipient: string; subject: string; body: string };

// 상수
export const ERROR_TYPES = {
  PAYMENT_ERROR: 'payment_error',
  ANALYSIS_ERROR: 'analysis_error', 
  SYSTEM_ERROR: 'system_error',
  API_ERROR: 'api_error'
} as const;

export const ERROR_STATUS = {
  NEW: 'new',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  IGNORED: 'ignored'
} as const;

export const REFUND_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PROCESSED: 'processed'
} as const;