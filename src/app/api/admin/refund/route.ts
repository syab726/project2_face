import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/adminService';
import { orderService } from '@/services/orderService';

interface RefundRequest {
  orderId: string;
  reason: string;
  adminNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, reason, adminNotes, sessionId } = await request.json() as RefundRequest & { sessionId: string };

    // 관리자 세션 검증
    if (!adminService.validateSession(sessionId)) {
      return NextResponse.json(
        { success: false, error: '세션이 만료되었습니다.' },
        { status: 401 }
      );
    }

    if (!orderId || !reason) {
      return NextResponse.json(
        { success: false, error: '주문ID와 환불 사유가 필요합니다.' },
        { status: 400 }
      );
    }

    // 주문 정보 조회
    const order = orderService.getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: '해당 주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 환불 처리된 주문인지 확인
    if (order.paymentStatus === 'refunded') {
      return NextResponse.json(
        { success: false, error: '이미 환불 처리된 주문입니다.' },
        { status: 400 }
      );
    }

    // 환불 요청 처리
    const refundSuccess = orderService.requestRefund(orderId, reason);
    if (!refundSuccess) {
      return NextResponse.json(
        { success: false, error: '환불 요청 처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 환불 처리 완료
    const processSuccess = orderService.processRefund(orderId);
    if (!processSuccess) {
      return NextResponse.json(
        { success: false, error: '환불 처리 완료에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 관리자 액션 로그 (향후 구현)
    console.log(`환불 처리 완료: ${orderId}, 사유: ${reason}, 관리자 메모: ${adminNotes}`);

    return NextResponse.json({
      success: true,
      message: '환불 처리가 완료되었습니다.',
      data: {
        orderId,
        reason,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('환불 처리 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '환불 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 환불 요청 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // 관리자 세션 검증
    if (!sessionId || !adminService.validateSession(sessionId)) {
      return NextResponse.json(
        { success: false, error: '세션이 만료되었습니다.' },
        { status: 401 }
      );
    }

    // 환불 요청된 주문들 조회
    const refundRequests = orderService.getRefundRequests();
    
    return NextResponse.json({
      success: true,
      data: refundRequests.map(order => ({
        orderId: order.orderId,
        userEmail: order.userEmail,
        serviceType: order.serviceType,
        amount: order.amount,
        reason: order.refundReason,
        requestedAt: order.createdAt,
        errorLogs: order.errorLogs,
        hasServiceErrors: order.errorLogs.length > 0
      }))
    });

  } catch (error) {
    console.error('환불 요청 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '환불 요청 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}