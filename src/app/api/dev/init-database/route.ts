import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import loggingService from '@/services/loggingService';

export async function POST(request: NextRequest) {
  // 개발 환경에서만 허용
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({
      success: false,
      error: 'Database initialization is only allowed in development environment'
    }, { status: 403 });
  }

  const startTime = Date.now();
  
  try {
    loggingService.info('DATABASE_INIT', 'Database initialization started');
    
    await db.initializeSchema();
    
    const duration = Date.now() - startTime;
    
    loggingService.info('DATABASE_INIT', 'Database initialization completed', {
      metadata: { duration }
    });

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
      duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    loggingService.error('DATABASE_INIT', 'Database initialization failed', {
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      }
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database initialization error',
      duration,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}