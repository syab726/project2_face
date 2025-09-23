import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'face-wisdom-jwt-secret-key-default';
const TOKEN_EXPIRY = '2h'; // 2시간 유효

export interface PaymentTokenPayload {
  tid: string;
  oid: string;
  amount: number;
  serviceType: string;
  timestamp: number;
  ip?: string;
}

/**
 * 결제 완료 후 분석 페이지 접근용 JWT 토큰 생성
 */
export function generatePaymentToken(payload: PaymentTokenPayload): string {
  const tokenData = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2시간 후 만료
  };

  return jwt.sign(tokenData, JWT_SECRET, { algorithm: 'HS256' });
}

/**
 * JWT 토큰 검증 및 페이로드 반환
 */
export function verifyPaymentToken(token: string): PaymentTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // 필수 필드 검증
    if (!decoded.tid || !decoded.oid || !decoded.serviceType) {
      console.error('JWT 토큰에 필수 필드가 누락됨:', decoded);
      return null;
    }

    return {
      tid: decoded.tid,
      oid: decoded.oid,
      amount: decoded.amount,
      serviceType: decoded.serviceType,
      timestamp: decoded.timestamp,
      ip: decoded.ip
    };
  } catch (error) {
    console.error('JWT 토큰 검증 실패:', error);
    return null;
  }
}

/**
 * 보안 강화를 위한 추가 해시 생성
 */
export function generateSecurityHash(tid: string, oid: string, timestamp: number): string {
  const data = `${tid}:${oid}:${timestamp}:${JWT_SECRET}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * 보안 해시 검증
 */
export function verifySecurityHash(hash: string, tid: string, oid: string, timestamp: number): boolean {
  const expectedHash = generateSecurityHash(tid, oid, timestamp);
  return hash === expectedHash;
}