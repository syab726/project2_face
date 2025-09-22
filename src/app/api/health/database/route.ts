import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import loggingService from '@/services/loggingService';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const healthCheck = await db.healthCheck();
    const duration = Date.now() - startTime;
    
    loggingService.info('DATABASE_HEALTH', 'Database health check completed', {
      metadata: {
        status: healthCheck.status,
        duration,
        ...healthCheck.details
      }
    });

    if (healthCheck.status === 'healthy') {
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        duration,
        database: healthCheck.details
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        duration,
        database: healthCheck.details,
        error: 'Database connection failed'
      }, { status: 503 });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    
    loggingService.error('DATABASE_HEALTH', 'Database health check failed', {
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      }
    });

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      duration,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }, { status: 503 });
  }
}