import { NextRequest, NextResponse } from 'next/server';
import backupService from '@/services/backupService';
import loggingService from '@/services/loggingService';

// POST: 오래된 백업 파일 정리
export async function POST(request: NextRequest) {
  try {
    loggingService.info('BACKUP_API', 'Manual backup cleanup requested');

    await backupService.cleanupOldBackups();

    return NextResponse.json({
      success: true,
      message: 'Backup cleanup completed successfully'
    });
  } catch (error) {
    loggingService.error('BACKUP_API', 'Backup cleanup failed', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    return NextResponse.json({
      success: false,
      error: 'Backup cleanup failed'
    }, { status: 500 });
  }
}