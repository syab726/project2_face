import fs from 'fs';
import path from 'path';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  category: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
}

class LoggingService {
  private logsDir: string;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private maxFiles: number = 5;

  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.ensureLogsDirectory();
  }

  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const base = `[${entry.timestamp}] ${entry.level} [${entry.category}] ${entry.message}`;
    
    if (entry.metadata || entry.userId || entry.sessionId || entry.ip) {
      const context = {
        ...(entry.userId && { userId: entry.userId }),
        ...(entry.sessionId && { sessionId: entry.sessionId }),
        ...(entry.ip && { ip: entry.ip }),
        ...(entry.userAgent && { userAgent: entry.userAgent }),
        ...(entry.metadata && { metadata: entry.metadata })
      };
      return `${base} | Context: ${JSON.stringify(context)}`;
    }
    
    return base;
  }

  private getLogFileName(category: string, level?: LogLevel): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (level === LogLevel.ERROR) {
      return `error-${date}.log`;
    }
    return `${category}-${date}.log`;
  }

  private writeToFile(fileName: string, content: string): void {
    const filePath = path.join(this.logsDir, fileName);
    
    try {
      // 파일 크기 체크 및 로테이션
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > this.maxFileSize) {
          this.rotateLogFile(filePath);
        }
      }
      
      fs.appendFileSync(filePath, content + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private rotateLogFile(filePath: string): void {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);
    
    // 기존 로테이션 파일들 이동
    for (let i = this.maxFiles - 1; i > 0; i--) {
      const currentFile = path.join(dir, `${basename}.${i}${ext}`);
      const nextFile = path.join(dir, `${basename}.${i + 1}${ext}`);
      
      if (fs.existsSync(currentFile)) {
        if (i === this.maxFiles - 1) {
          fs.unlinkSync(currentFile); // 가장 오래된 파일 삭제
        } else {
          fs.renameSync(currentFile, nextFile);
        }
      }
    }
    
    // 현재 파일을 .1로 이동
    const rotatedFile = path.join(dir, `${basename}.1${ext}`);
    fs.renameSync(filePath, rotatedFile);
  }

  private log(level: LogLevel, category: string, message: string, options?: {
    metadata?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    ip?: string;
    userAgent?: string;
  }): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      ...options
    };

    const formattedEntry = this.formatLogEntry(entry);
    
    // 콘솔 출력 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      const colorMap = {
        [LogLevel.ERROR]: '\x1b[31m', // 빨간색
        [LogLevel.WARN]: '\x1b[33m',  // 노란색
        [LogLevel.INFO]: '\x1b[36m',  // 청록색
        [LogLevel.DEBUG]: '\x1b[37m'  // 흰색
      };
      const reset = '\x1b[0m';
      console.log(`${colorMap[level]}${formattedEntry}${reset}`);
    }

    // 파일에 기록
    const fileName = this.getLogFileName(category, level);
    this.writeToFile(fileName, formattedEntry);

    // 에러는 별도 파일에도 기록
    if (level === LogLevel.ERROR) {
      const errorFileName = this.getLogFileName('error', LogLevel.ERROR);
      this.writeToFile(errorFileName, formattedEntry);
    }
  }

  // 공개 메서드들
  error(category: string, message: string, options?: {
    metadata?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    ip?: string;
    userAgent?: string;
  }): void {
    this.log(LogLevel.ERROR, category, message, options);
  }

  warn(category: string, message: string, options?: {
    metadata?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    ip?: string;
    userAgent?: string;
  }): void {
    this.log(LogLevel.WARN, category, message, options);
  }

  info(category: string, message: string, options?: {
    metadata?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    ip?: string;
    userAgent?: string;
  }): void {
    this.log(LogLevel.INFO, category, message, options);
  }

  debug(category: string, message: string, options?: {
    metadata?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    ip?: string;
    userAgent?: string;
  }): void {
    this.log(LogLevel.DEBUG, category, message, options);
  }

  // 특화된 로깅 메서드들
  logApiCall(method: string, path: string, statusCode: number, duration: number, options?: {
    userId?: string;
    ip?: string;
    userAgent?: string;
  }): void {
    this.info('API', `${method} ${path} - ${statusCode} (${duration}ms)`, {
      metadata: { method, path, statusCode, duration },
      ...options
    });
  }

  logUserAction(action: string, userId: string, metadata?: Record<string, any>): void {
    this.info('USER_ACTION', `User ${userId} performed: ${action}`, {
      userId,
      metadata
    });
  }

  logPayment(event: string, orderId: string, amount: number, userId?: string, metadata?: Record<string, any>): void {
    this.info('PAYMENT', `Payment ${event}: Order ${orderId} - ₩${amount}`, {
      userId,
      metadata: { event, orderId, amount, ...metadata }
    });
  }

  logAIAnalysis(analysisType: string, duration: number, success: boolean, userId?: string, metadata?: Record<string, any>): void {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const status = success ? 'completed' : 'failed';
    
    this.log(level, 'AI_ANALYSIS', `${analysisType} analysis ${status} in ${duration}ms`, {
      userId,
      metadata: { analysisType, duration, success, ...metadata }
    });
  }

  // 로그 조회 메서드들
  getRecentLogs(category?: string, level?: LogLevel, limit: number = 100): LogEntry[] {
    // 구현 시 파일에서 최근 로그를 읽어 파싱하여 반환
    // 현재는 기본 구현만 제공
    return [];
  }

  clearOldLogs(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    try {
      const files = fs.readdirSync(this.logsDir);
      files.forEach(file => {
        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      this.error('SYSTEM', 'Failed to clear old logs', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }
}

// 싱글톤 인스턴스 생성
const loggingService = new LoggingService();

export default loggingService;