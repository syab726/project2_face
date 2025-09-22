import { NextRequest, NextResponse } from 'next/server';
import backupService from '@/services/backupService';
import loggingService from '@/services/loggingService';

// POST: 데이터베이스 복원
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json({
        success: false,
        error: 'Backup filename is required'
      }, { status: 400 });
    }

    // 개발 환경에서만 복원 허용
    if (process.env.NODE_ENV === 'production') {
      loggingService.warn('BACKUP_API', 'Database restore attempted in production', {
        metadata: { filename }
      });
      
      return NextResponse.json({
        success: false,
        error: 'Database restore is not allowed in production environment'
      }, { status: 403 });
    }

    loggingService.info('BACKUP_API', `Database restore requested: ${filename}`);

    const result = await backupService.restoreDatabase(filename);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Database restored successfully',
        filename
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Database restore failed'
      }, { status: 500 });
    }
  } catch (error) {
    loggingService.error('BACKUP_API', 'Database restore failed', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    return NextResponse.json({
      success: false,
      error: 'Database restore failed'
    }, { status: 500 });
  }
}