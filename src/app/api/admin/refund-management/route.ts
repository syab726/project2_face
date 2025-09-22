import { NextRequest, NextResponse } from 'next/server';
import refundTrackingService from '@/services/refundTrackingService';
import type { APIResponse } from '@/types/analysis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const status = searchParams.get('status');

    switch (action) {
      case 'list':
        const refundableErrors = refundTrackingService.getRefundableErrors(
          status as any
        );
        
        return NextResponse.json<APIResponse<any>>({
          success: true,
          data: {
            errors: refundableErrors,
            total: refundableErrors.length
          }
        });

      case 'statistics':
        const stats = refundTrackingService.getRefundStatistics();
        
        return NextResponse.json<APIResponse<any>>({
          success: true,
          data: {
            statistics: stats,
            summary: {
              refundRate: stats.totalErrors > 0 ? Math.round((stats.completedRefunds / stats.totalErrors) * 100) : 0,
              averageRefundAmount: stats.completedRefunds > 0 ? Math.round(stats.totalRefundAmount / stats.completedRefunds) : 0,
              pendingRefunds: stats.pendingRefunds,
              eligibilityRate: stats.totalErrors > 0 ? Math.round((stats.eligibleForRefund / stats.totalErrors) * 100) : 0
            }
          }
        });

      default:
        return NextResponse.json<APIResponse<null>>({
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: '지원하지 않는 액션입니다.'
          }
        }, { status: 400 });
    }

  } catch (error) {
    console.error('환불 관리 API 오류:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '환불 관리 처리 중 오류가 발생했습니다.'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, errorId, notes } = body;

    switch (action) {
      case 'approve_manual_refund':
        if (!errorId) {
          return NextResponse.json<APIResponse<null>>({
            success: false,
            error: {
              code: 'MISSING_ERROR_ID',
              message: '오류 ID가 필요합니다.'
            }
          }, { status: 400 });
        }

        const approved = refundTrackingService.approveManualRefund(errorId, notes);
        
        return NextResponse.json<APIResponse<any>>({
          success: approved,
          data: {
            errorId,
            approved,
            message: approved ? '수동 환불이 승인되었습니다.' : '환불 승인에 실패했습니다.'
          }
        });

      case 'update_status':
        if (!errorId || !body.status) {
          return NextResponse.json<APIResponse<null>>({
            success: false,
            error: {
              code: 'MISSING_PARAMETERS',
              message: '오류 ID와 상태가 필요합니다.'
            }
          }, { status: 400 });
        }

        const updated = refundTrackingService.updateRefundStatus(errorId, body.status, notes);
        
        return NextResponse.json<APIResponse<any>>({
          success: updated,
          data: {
            errorId,
            status: body.status,
            updated,
            message: updated ? '환불 상태가 업데이트되었습니다.' : '상태 업데이트에 실패했습니다.'
          }
        });

      default:
        return NextResponse.json<APIResponse<null>>({
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: '지원하지 않는 액션입니다.'
          }
        }, { status: 400 });
    }

  } catch (error) {
    console.error('환불 관리 POST API 오류:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '환불 관리 처리 중 오류가 발생했습니다.'
      }
    }, { status: 500 });
  }
}