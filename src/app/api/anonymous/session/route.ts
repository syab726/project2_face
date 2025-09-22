import { NextRequest, NextResponse } from 'next/server';
import { anonymousUserService } from '@/services/anonymousUserService';

/**
 * 익명 사용자 세션 관리 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceInfo, serviceType, contactInfo } = body;
    
    // 새 익명 세션 생성
    const session = anonymousUserService.createAnonymousSession(deviceInfo || {
      userAgent: request.headers.get('user-agent') || 'Unknown',
      platform: 'web',
      screen: '1920x1080',
      timezone: 'Asia/Seoul'
    });
    
    // 서비스 시작 기록
    let serviceId;
    if (serviceType) {
      serviceId = anonymousUserService.startServiceUsage(
        session.sessionId, 
        serviceType, 
        contactInfo
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        userId: session.userId,
        serviceId: serviceId || null,
        message: '익명 사용자 세션이 생성되었습니다.'
      }
    });
  } catch (error) {
    console.error('Anonymous session creation error:', error);
    return NextResponse.json(
      { success: false, error: '세션 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const session = anonymousUserService.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        session: {
          sessionId: session.sessionId,
          userId: session.userId,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          services: session.services,
          errors: session.errors
        }
      }
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { success: false, error: '세션 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}