import { NextRequest, NextResponse } from 'next/server';
import inicisPaymentService from '@/services/inicisPaymentService';
import realMetricsStore from '@/services/realMetricsStore';
import type { InicisCancelRequest } from '@/services/inicisPaymentService';
import type { APIResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tid,
      reason,
      amount, // 부분환불 금액 (선택사항)
      refundType = 'full' // 'full' or 'partial'
    } = body;

    // 입력값 검증
    if (!tid || !reason) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: '거래 ID와 환불 사유가 필요합니다.'
        }
      }, { status: 400 });
    }

    console.log('🔄 환불 요청 수신됨:', {
      tid,
      reason,
      amount,
      refundType
    });

    // 환불 요청 데이터 준비
    const cancelRequest: InicisCancelRequest = {
      tid,
      msg: reason,
      price: refundType === 'partial' ? amount : undefined
    };

    // 이니시스 환불 API 호출
    const refundResult = await inicisPaymentService.cancelPayment(cancelRequest);

    if (refundResult && refundResult.resultCode === '0000') {
      // 환불 성공
      console.log('✅ 환불 성공:', {
        tid: refundResult.tid,
        cancelAmount: refundResult.cancelAmt || amount,
        resultMsg: refundResult.resultMsg
      });

      // 환불 완료 메트릭스 기록
      realMetricsStore.trackRefundComplete({
        transactionId: tid,
        refundAmount: refundResult.cancelAmt || amount || 0,
        reason: reason,
        refundMethod: 'inicis_api'
      });

      return NextResponse.json<APIResponse<any>>({
        success: true,
        data: {
          refundResult: {
            tid: refundResult.tid,
            originalTid: tid,
            refundAmount: refundResult.cancelAmt || amount,
            refundDate: new Date().toISOString(),
            reason: reason,
            status: 'completed'
          },
          message: '환불이 성공적으로 처리되었습니다.'
        }
      });

    } else {
      // 환불 실패
      const errorMessage = refundResult?.resultMsg || '환불 처리에 실패했습니다.';
      
      console.error('❌ 환불 실패:', {
        tid,
        resultCode: refundResult?.resultCode,
        resultMsg: errorMessage
      });

      // 환불 실패 메트릭스 기록
      realMetricsStore.trackRefundFailure({
        transactionId: tid,
        reason: reason,
        errorMessage: errorMessage
      });

      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'REFUND_FAILED',
          message: errorMessage
        }
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('환불 처리 오류:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'REFUND_PROCESSING_ERROR',
        message: '환불 처리 중 시스템 오류가 발생했습니다.'
      }
    }, { status: 500 });
  }
}

/**
 * 환불 가능 여부 확인 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tid = searchParams.get('tid');

    if (!tid) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_TID',
          message: '거래 ID가 필요합니다.'
        }
      }, { status: 400 });
    }

    // 결제 정보 조회 (실제 구현시 이니시스 조회 API 사용)
    const paymentInfo = await inicisPaymentService.getPaymentInfo(tid);

    console.log('🔍 환불 가능 여부 조회:', {
      tid,
      paymentInfo
    });

    // 환불 가능 여부 판단
    const canRefund = paymentInfo?.status === 'paid';
    
    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: {
        tid,
        canRefund,
        paymentInfo: {
          status: paymentInfo?.status,
          amount: paymentInfo?.amount,
          paymentMethod: paymentInfo?.paymentMethod,
          refundableAmount: canRefund ? paymentInfo?.amount : 0
        },
        refundPolicy: {
          fullRefundAvailable: canRefund,
          partialRefundAvailable: canRefund,
          refundTimeLimit: '결제 후 7일 이내',
          processingTime: '영업일 기준 3-5일'
        }
      }
    });

  } catch (error: any) {
    console.error('환불 조회 오류:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'REFUND_INQUIRY_ERROR',
        message: '환불 조회 중 오류가 발생했습니다.'
      }
    }, { status: 500 });
  }
}