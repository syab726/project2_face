import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentToken, verifySecurityHash } from '@/lib/auth';

/**
 * 결제 완료 후 보안 토큰 검증 API
 * JWT 토큰과 보안 해시를 검증하여 분석 페이지 접근 권한을 확인합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const { token, hash, timestamp } = await request.json();

    // 필수 파라미터 검증
    if (!token || !hash || !timestamp) {
      return NextResponse.json({
        success: false,
        message: '필수 파라미터가 누락되었습니다.',
        error: 'MISSING_PARAMETERS'
      }, { status: 400 });
    }

    console.log('🔐 보안 토큰 검증 시작:', {
      tokenLength: token.length,
      hashLength: hash.length,
      timestamp: new Date(parseInt(timestamp)).toISOString()
    });

    // JWT 토큰 검증
    const tokenPayload = verifyPaymentToken(token);
    if (!tokenPayload) {
      console.error('❌ JWT 토큰 검증 실패');
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 결제 토큰입니다.',
        error: 'INVALID_TOKEN'
      }, { status: 401 });
    }

    // 보안 해시 검증
    const isHashValid = verifySecurityHash(
      hash,
      tokenPayload.tid,
      tokenPayload.oid,
      parseInt(timestamp)
    );

    if (!isHashValid) {
      console.error('❌ 보안 해시 검증 실패');
      return NextResponse.json({
        success: false,
        message: '보안 검증에 실패했습니다.',
        error: 'INVALID_HASH'
      }, { status: 401 });
    }

    // 토큰 만료 시간 검증 (2시간)
    const tokenAge = Date.now() - tokenPayload.timestamp;
    const maxAge = 2 * 60 * 60 * 1000; // 2시간

    if (tokenAge > maxAge) {
      console.error('❌ 토큰 만료:', {
        tokenAge: Math.round(tokenAge / 1000 / 60),
        maxAgeMinutes: maxAge / 1000 / 60
      });
      return NextResponse.json({
        success: false,
        message: '결제 토큰이 만료되었습니다. 다시 결제해주세요.',
        error: 'TOKEN_EXPIRED'
      }, { status: 401 });
    }

    // IP 주소 검증 (선택적)
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    if (tokenPayload.ip && tokenPayload.ip !== 'unknown' && tokenPayload.ip !== clientIP) {
      console.warn('⚠️ IP 주소 불일치:', {
        tokenIP: tokenPayload.ip,
        clientIP: clientIP
      });
      // IP 불일치는 경고만 하고 통과 (모바일 환경에서 IP가 자주 변경됨)
    }

    console.log('✅ 보안 토큰 검증 성공:', {
      tid: tokenPayload.tid,
      oid: tokenPayload.oid,
      serviceType: tokenPayload.serviceType,
      amount: tokenPayload.amount
    });

    // 검증 성공 시 결제 정보 반환
    return NextResponse.json({
      success: true,
      message: '토큰 검증이 완료되었습니다.',
      data: {
        tid: tokenPayload.tid,
        oid: tokenPayload.oid,
        serviceType: tokenPayload.serviceType,
        amount: tokenPayload.amount,
        timestamp: tokenPayload.timestamp,
        isValid: true
      }
    });

  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return NextResponse.json({
      success: false,
      message: '토큰 검증 처리 중 오류가 발생했습니다.',
      error: 'VERIFICATION_ERROR'
    }, { status: 500 });
  }
}

/**
 * GET 요청으로도 토큰 검증 가능 (URL 파라미터 사용)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const hash = searchParams.get('hash');
    const timestamp = searchParams.get('timestamp');

    if (!token || !hash || !timestamp) {
      return NextResponse.json({
        success: false,
        message: '필수 파라미터가 누락되었습니다.',
        error: 'MISSING_PARAMETERS'
      }, { status: 400 });
    }

    // POST 요청과 동일한 검증 로직 사용
    return POST(new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ token, hash, timestamp })
    }));

  } catch (error) {
    console.error('GET 토큰 검증 오류:', error);
    return NextResponse.json({
      success: false,
      message: '토큰 검증 처리 중 오류가 발생했습니다.',
      error: 'VERIFICATION_ERROR'
    }, { status: 500 });
  }
}