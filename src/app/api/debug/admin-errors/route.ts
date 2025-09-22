import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/adminService';

/**
 * 디버깅용 API - adminService에 저장된 오류 목록 직접 조회
 */
export async function GET(request: NextRequest) {
  try {
    // adminService에 저장된 모든 오류 조회
    const errors = await adminService.getServiceErrors();
    
    return NextResponse.json({
      success: true,
      data: {
        totalErrors: errors.length,
        errors: errors.slice(0, 10), // 최근 10개만
        summary: {
          new: errors.filter(e => e.status === 'new').length,
          investigating: errors.filter(e => e.status === 'investigating').length,
          resolved: errors.filter(e => e.status === 'resolved').length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin 오류 디버깅 실패:', error);
    return NextResponse.json(
      { success: false, error: '오류 조회 실패' },
      { status: 500 }
    );
  }
}