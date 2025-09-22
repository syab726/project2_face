import { NextRequest, NextResponse } from 'next/server';
import { anonymousUserService } from '@/services/anonymousUserService';

/**
 * 익명 사용자 결제 연계 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, serviceId, paymentInfo } = body;
    
    if (!sessionId || !serviceId || !paymentInfo) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // 결제 정보 연계
    anonymousUserService.linkPayment(sessionId, serviceId, {
      orderId: paymentInfo.orderId,
      paymentId: paymentInfo.paymentId,
      amount: paymentInfo.amount,
      contactInfo: {
        email: paymentInfo.email,
        phone: paymentInfo.phone,
        name: paymentInfo.name,
        preferredContact: paymentInfo.preferredContact || 'email'
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        message: '결제 정보가 연계되었습니다.',
        paymentId: paymentInfo.paymentId,
        orderId: paymentInfo.orderId
      }
    });
  } catch (error) {
    console.error('Payment linking error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '결제 연계 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 결제 완료 처리
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, status } = body;
    
    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: '결제 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    if (status === 'completed') {
      anonymousUserService.completePayment(paymentId);
      
      return NextResponse.json({
        success: true,
        data: {
          message: '결제가 완료되었습니다.',
          paymentId
        }
      });
    }
    
    return NextResponse.json(
      { success: false, error: '지원하지 않는 상태입니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment completion error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '결제 완료 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 주문 ID로 사용자 정보 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    
    if (!orderId && !paymentId) {
      return NextResponse.json(
        { success: false, error: '주문 ID 또는 결제 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    let userInfo;
    if (orderId) {
      userInfo = anonymousUserService.getUserByOrderId(orderId);
    } else if (paymentId) {
      userInfo = anonymousUserService.getUserByPaymentId(paymentId);
    }
    
    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        session: {
          sessionId: userInfo.session.sessionId,
          userId: userInfo.session.userId,
          services: userInfo.session.services,
          errors: userInfo.session.errors
        },
        payment: {
          paymentId: userInfo.tracker.paymentId,
          orderId: userInfo.tracker.orderId,
          serviceType: userInfo.tracker.serviceType,
          amount: userInfo.tracker.amount,
          paymentStatus: userInfo.tracker.paymentStatus,
          contactInfo: userInfo.tracker.contactInfo
        }
      }
    });
  } catch (error) {
    console.error('User info retrieval error:', error);
    return NextResponse.json(
      { success: false, error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}