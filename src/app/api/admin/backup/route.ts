import { NextRequest, NextResponse } from 'next/server';
import backupService from '@/services/backupService';
import loggingService from '@/services/loggingService';

// GET: 백업 히스토리 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'database' | 'logs' | 'files' | null;
    
    const history = await backupService.getBackupHistory(type || undefined);
    const config = backupService.getConfig();
    
    return NextResponse.json({
      success: true,
      data: {
        history,
        config: {
          enabled: config.enabled,
          retention: config.retention,
          schedule: config.schedule
        }
      }
    });
  } catch (error) {
    loggingService.error('BACKUP_API', 'Failed to get backup history', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve backup history'
    }, { status: 500 });
  }
}

// POST: 백업 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!['database', 'logs', 'files', 'full'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid backup type. Must be: database, logs, files, or full'
      }, { status: 400 });
    }

    loggingService.info('BACKUP_API', `Manual backup requested: ${type}`);

    let result;
    switch (type) {
      case 'database':
        result = await backupService.backupDatabase();
        break;
      case 'logs':
        result = await backupService.backupLogs();
        break;
      case 'files':
        result = await backupService.backupFiles();
        break;
      case 'full':
        const results = await backupService.performFullBackup();
        return NextResponse.json({
          success: true,
          data: results
        });
      default:
        throw new Error('Invalid backup type');
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    loggingService.error('BACKUP_API', 'Backup execution failed', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    return NextResponse.json({
      success: false,
      error: 'Backup execution failed'
    }, { status: 500 });
  }
}