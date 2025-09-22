import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/adminService';
import { orderService } from '@/services/orderService';

/**
 * 오류 추적 시스템 테스트용 API
 * 다양한 유형의 오류를 의도적으로 발생시켜 추적 시스템 검증
 */
export async function POST(request: NextRequest) {
  try {
    const { errorType, userEmail, orderId } = await request.json();

    // 테스트용 주문 생성 (존재하지 않는 경우만)
    const testOrderId = orderId || `TEST-ORDER-${Date.now()}`;
    const testUserEmail = userEmail || 'test@example.com';

    if (!orderService.getOrder(testOrderId)) {
      orderService.createOrder({
        orderId: testOrderId,
        userEmail: testUserEmail,
        serviceType: 'mbti-face',
        amount: 4900,
        paymentStatus: 'completed',
        serviceStatus: 'in_progress'
      });
    }

    // 다양한 오류 타입 시뮬레이션
    switch (errorType) {
      case 'ai_timeout':
        // AI 분석 타임아웃 시뮬레이션
        orderService.addErrorLog(testOrderId, 'AI 분석 시간 초과 - Gemini API 응답 지연');
        await adminService.logServiceError({
          title: 'AI 분석 타임아웃 (테스트)',
          message: 'TIMEOUT: Gemini API 응답이 30초를 초과했습니다.',
          type: 'system_error',
          userEmail: testUserEmail,
          orderId: testOrderId,
          metadata: {
            apiEndpoint: '/api/analysis/mbti-face',
            timeout: '30000ms',
            timestamp: new Date().toISOString()
          }
        });
        break;

      case 'payment_failure':
        // 결제 실패 시뮬레이션
        orderService.updateOrderStatus(testOrderId, { paymentStatus: 'failed' });
        orderService.addErrorLog(testOrderId, '결제 처리 실패 - KG이니시스 API 오류');
        await adminService.logServiceError({
          title: '결제 처리 실패 (테스트)',
          message: 'PAYMENT_FAILED: KG이니시스 결제 게이트웨이 오류',
          type: 'payment_error',
          userEmail: testUserEmail,
          orderId: testOrderId,
          metadata: {
            apiEndpoint: '/api/payment/process',
            paymentMethod: 'card',
            errorCode: 'KG_ERROR_001',
            timestamp: new Date().toISOString()
          }
        });
        break;

      case 'image_processing_error':
        // 이미지 처리 오류 시뮬레이션
        orderService.addErrorLog(testOrderId, '이미지 처리 실패 - 얼굴 인식 불가');
        await adminService.logServiceError({
          title: '이미지 처리 오류 (테스트)',
          message: 'IMAGE_PROCESSING_FAILED: 업로드된 이미지에서 얼굴을 찾을 수 없습니다.',
          type: 'analysis_error',
          userEmail: testUserEmail,
          orderId: testOrderId,
          metadata: {
            apiEndpoint: '/api/analysis/face',
            imageSize: '2.3MB',
            imageFormat: 'JPEG',
            timestamp: new Date().toISOString()
          }
        });
        break;

      case 'system_overload':
        // 시스템 과부하 시뮬레이션
        orderService.addErrorLog(testOrderId, '시스템 과부하 - 동시 요청 수 초과');
        await adminService.logServiceError({
          title: '시스템 과부하 (테스트)',
          message: 'SYSTEM_OVERLOAD: 동시 처리 가능한 요청 수를 초과했습니다.',
          type: 'system_error',
          userEmail: testUserEmail,
          orderId: testOrderId,
          metadata: {
            apiEndpoint: '/api/analysis/face-saju',
            currentLoad: '95%',
            maxConcurrentRequests: '50',
            timestamp: new Date().toISOString()
          }
        });
        break;

      case 'database_connection':
        // 데이터베이스 연결 오류 시뮬레이션
        orderService.addErrorLog(testOrderId, '데이터베이스 연결 실패');
        await adminService.logServiceError({
          title: '데이터베이스 연결 오류 (테스트)',
          message: 'DB_CONNECTION_FAILED: 데이터베이스 서버에 연결할 수 없습니다.',
          type: 'system_error',
          userEmail: testUserEmail,
          orderId: testOrderId,
          metadata: {
            apiEndpoint: '/api/user/profile',
            dbHost: 'db.example.com',
            connectionTimeout: '5000ms',
            timestamp: new Date().toISOString()
          }
        });
        break;

      case 'validation_error':
        // 입력 검증 오류 시뮬레이션
        await adminService.logServiceError({
          title: '입력 검증 오류 (테스트)',
          message: 'VALIDATION_ERROR: 필수 입력 필드가 누락되었습니다.',
          type: 'system_error',
          userEmail: testUserEmail,
          orderId: testOrderId,
          metadata: {
            apiEndpoint: '/api/analysis/mbti-face',
            missingFields: ['mbtiType', 'age'],
            timestamp: new Date().toISOString()
          }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: '알 수 없는 오류 타입입니다.' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${errorType} 오류가 시뮬레이션되었습니다.`,
      data: {
        errorType,
        orderId: testOrderId,
        userEmail: testUserEmail,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('오류 시뮬레이션 실패:', error);
    return NextResponse.json(
      { success: false, error: '오류 시뮬레이션 중 문제가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: '오류 추적 시스템 테스트 API',
    availableErrorTypes: [
      'ai_timeout',
      'payment_failure', 
      'image_processing_error',
      'system_overload',
      'database_connection',
      'validation_error'
    ],
    usage: {
      method: 'POST',
      body: {
        errorType: 'ai_timeout',
        userEmail: 'test@example.com',
        orderId: 'TEST-ORDER-123'
      }
    }
  });
}