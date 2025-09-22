import mysql from 'mysql2/promise';
import { ConnectionOptions } from 'mysql2';

interface DatabaseConfig extends ConnectionOptions {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

class DatabaseConnection {
  private pool: mysql.Pool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'face_analysis_db',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+09:00', // 한국 시간
      charset: 'utf8mb4'
    };
  }

  private createPool(): mysql.Pool {
    if (!this.pool) {
      this.pool = mysql.createPool(this.config);
      
      // 연결 상태 모니터링
      (this.pool as any).on('connection', (connection: any) => {
        console.log(`새 데이터베이스 연결 생성: ${connection.threadId}`);
      });

      (this.pool as any).on('error', (err: any) => {
        console.error('데이터베이스 풀 오류:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          this.reconnect();
        }
      });
    }
    return this.pool;
  }

  private reconnect(): void {
    console.log('데이터베이스 재연결 시도...');
    this.pool = null;
    this.createPool();
  }

  async getConnection(): Promise<mysql.PoolConnection> {
    const pool = this.createPool();
    return await pool.getConnection();
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      return rows as T[];
    } finally {
      connection.release();
    }
  }

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async insert<T = any>(sql: string, params?: any[]): Promise<{ insertId: number; affectedRows: number }> {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute(sql, params);
      const insertResult = result as mysql.ResultSetHeader;
      return {
        insertId: insertResult.insertId,
        affectedRows: insertResult.affectedRows
      };
    } finally {
      connection.release();
    }
  }

  async update(sql: string, params?: any[]): Promise<number> {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute(sql, params);
      const updateResult = result as mysql.ResultSetHeader;
      return updateResult.affectedRows;
    } finally {
      connection.release();
    }
  }

  async delete(sql: string, params?: any[]): Promise<number> {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute(sql, params);
      const deleteResult = result as mysql.ResultSetHeader;
      return deleteResult.affectedRows;
    } finally {
      connection.release();
    }
  }

  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      await connection.ping();
      connection.release();
      console.log('데이터베이스 연결 성공');
      return true;
    } catch (error) {
      console.error('데이터베이스 연결 실패:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('데이터베이스 연결 풀 종료');
    }
  }

  // 개발 환경에서 스키마 초기화
  async initializeSchema(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('스키마 초기화는 개발 환경에서만 가능합니다.');
    }

    const fs = await import('fs');
    const path = await import('path');
    
    try {
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // SQL을 개별 문장으로 분리하여 실행
      const statements = schemaSql
        .split(/;\s*$/gm)
        .filter(statement => statement.trim().length > 0)
        .filter(statement => !statement.trim().startsWith('--'));

      const connection = await this.getConnection();
      try {
        for (const statement of statements) {
          if (statement.trim()) {
            await connection.execute(statement);
          }
        }
        console.log('데이터베이스 스키마 초기화 완료');
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('스키마 초기화 실패:', error);
      throw error;
    }
  }

  // 헬스 체크
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      connection: boolean;
      activeConnections?: number;
      totalConnections?: number;
    };
  }> {
    try {
      const isConnected = await this.testConnection();
      const pool = this.createPool();
      
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        details: {
          connection: isConnected,
          activeConnections: (pool as any)._allConnections?.length,
          totalConnections: this.config.connectionLimit
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connection: false
        }
      };
    }
  }
}

// 싱글톤 인스턴스 생성
const db = new DatabaseConnection();

export default db;

// 타입 정의
export interface UserSession {
  id: string;
  fingerprint: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  last_activity: Date;
}

export interface Order {
  id: string;
  session_id?: string;
  service_type: 'mbti-face' | 'face' | 'face-saju';
  amount: number;
  currency: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  payment_provider: string;
  transaction_id?: string;
  created_at: Date;
  completed_at?: Date;
  refunded_at?: Date;
  refund_reason?: string;
}

export interface AnalysisResult {
  id: string;
  order_id: string;
  session_id?: string;
  service_type: 'mbti-face' | 'face' | 'face-saju';
  analysis_data: Record<string, any>;
  image_processed: boolean;
  created_at: Date;
  expires_at: Date;
}

export interface ServiceError {
  id: string;
  error_type: 'payment_error' | 'analysis_error' | 'system_error' | 'validation_error' | 'network_error';
  title: string;
  message: string;
  order_id?: string;
  session_id?: string;
  user_email?: string;
  stack_trace?: string;
  metadata?: Record<string, any>;
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  created_at: Date;
  resolved_at?: Date;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface RefundRequest {
  id: string;
  order_id: string;
  session_id?: string;
  user_email?: string;
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  admin_notes?: string;
  requested_at: Date;
  processed_at?: Date;
  processed_by?: string;
}