import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/adminService';
import { orderService } from '@/services/orderService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const orderId = searchParams.get('orderId');
    const userEmail = searchParams.get('userEmail');

    // 관리자 세션 검증
    if (!sessionId || !adminService.validateSession(sessionId)) {
      return NextResponse.json(
        { success: false, error: '세션이 만료되었습니다.' },
        { status: 401 }
      );
    }

    if (orderId) {
      // 특정 주문 상세 조회
      const order = orderService.getOrder(orderId);
      if (!order) {
        return NextResponse.json(
          { success: false, error: '해당 주문을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          ...order,
          hasServiceErrors: order.errorLogs.length > 0,
          isServiceSuccessful: orderService.isServiceSuccessful(orderId)
        }
      });
    }

    if (userEmail) {
      // 특정 사용자의 모든 주문 조회
      const userOrders = orderService.getUserOrders(userEmail);
      
      return NextResponse.json({
        success: true,
        data: userOrders.map(order => ({
          ...order,
          hasServiceErrors: order.errorLogs.length > 0,
          isServiceSuccessful: orderService.isServiceSuccessful(order.orderId)
        }))
      });
    }

    // 전체 주문 통계 및 최근 주문 조회
    const orderStats = orderService.getOrderStats();
    const allOrders = Array.from((orderService as any).orders.values())
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50); // 최근 50개만

    return NextResponse.json({
      success: true,
      data: {
        stats: orderStats,
        recentOrders: allOrders.map((order: any) => ({
          ...order,
          hasServiceErrors: order.errorLogs.length > 0,
          isServiceSuccessful: orderService.isServiceSuccessful(order.orderId)
        }))
      }
    });

  } catch (error) {
    console.error('주문 이력 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '주문 이력 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}