import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import loggingService from './loggingService';
import db from '@/lib/database';

const execAsync = promisify(exec);

export interface BackupConfig {
  enabled: boolean;
  schedule: {
    database: string; // cron format
    logs: string;
    files: string;
  };
  retention: {
    database: number; // days
    logs: number;
    files: number;
  };
  storage: {
    local: {
      enabled: boolean;
      path: string;
    };
    s3?: {
      enabled: boolean;
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  compression: boolean;
  encryption: boolean;
}

export interface BackupResult {
  success: boolean;
  type: 'database' | 'logs' | 'files' | 'full';
  filename: string;
  size: number;
  duration: number;
  timestamp: string;
  error?: string;
}

class BackupService {
  private config: BackupConfig;
  private backupDir: string;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.config = this.loadConfig();
    this.ensureBackupDirectory();
  }

  private loadConfig(): BackupConfig {
    return {
      enabled: process.env.BACKUP_ENABLED === 'true',
      schedule: {
        database: process.env.BACKUP_DB_SCHEDULE || '0 2 * * *', // 매일 새벽 2시
        logs: process.env.BACKUP_LOGS_SCHEDULE || '0 3 * * 0', // 매주 일요일 새벽 3시
        files: process.env.BACKUP_FILES_SCHEDULE || '0 4 * * 0' // 매주 일요일 새벽 4시
      },
      retention: {
        database: parseInt(process.env.BACKUP_DB_RETENTION || '30'),
        logs: parseInt(process.env.BACKUP_LOGS_RETENTION || '14'),
        files: parseInt(process.env.BACKUP_FILES_RETENTION || '7')
      },
      storage: {
        local: {
          enabled: true,
          path: this.backupDir
        }
      },
      compression: process.env.BACKUP_COMPRESSION !== 'false',
      encryption: process.env.BACKUP_ENCRYPTION === 'true'
    };
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // 백업 타입별 하위 디렉토리 생성
    const subDirs = ['database', 'logs', 'files'];
    subDirs.forEach(dir => {
      const fullPath = path.join(this.backupDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  private generateFilename(type: string, extension: string = 'sql'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let filename = `${type}_${timestamp}.${extension}`;
    
    if (this.config.compression) {
      filename += '.gz';
    }
    
    return filename;
  }

  private async compressFile(filePath: string): Promise<string> {
    if (!this.config.compression) {
      return filePath;
    }

    try {
      const compressedPath = `${filePath}.gz`;
      await execAsync(`gzip -c "${filePath}" > "${compressedPath}"`);
      
      // 원본 파일 삭제
      fs.unlinkSync(filePath);
      
      return compressedPath;
    } catch (error) {
      loggingService.error('BACKUP_SERVICE', 'File compression failed', {
        metadata: { filePath, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return filePath;
    }
  }

  private async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  async backupDatabase(): Promise<BackupResult> {
    const startTime = Date.now();
    const filename = this.generateFilename('database', 'sql');
    const filePath = path.join(this.backupDir, 'database', filename);

    try {
      loggingService.info('BACKUP_SERVICE', 'Database backup started');

      // MySQL 데이터베이스 백업 명령어 생성
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'face_analysis_db',
        port: process.env.DB_PORT || '3306'
      };

      // mysqldump 명령어 실행
      const dumpCommand = [
        'mysqldump',
        `-h${dbConfig.host}`,
        `-P${dbConfig.port}`,
        `-u${dbConfig.user}`,
        dbConfig.password ? `-p${dbConfig.password}` : '',
        '--single-transaction',
        '--routines',
        '--triggers',
        '--events',
        '--hex-blob',
        '--default-character-set=utf8mb4',
        dbConfig.database
      ].filter(Boolean).join(' ');

      const { stdout } = await execAsync(`${dumpCommand} > "${filePath}"`);

      // 파일 압축 (설정에 따라)
      const finalPath = await this.compressFile(filePath);
      const fileSize = await this.getFileSize(finalPath);
      const duration = Date.now() - startTime;

      const result: BackupResult = {
        success: true,
        type: 'database',
        filename: path.basename(finalPath),
        size: fileSize,
        duration,
        timestamp: new Date().toISOString()
      };

      loggingService.info('BACKUP_SERVICE', 'Database backup completed successfully', {
        metadata: {
          filename: result.filename,
          size: result.size,
          duration: result.duration
        }
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      loggingService.error('BACKUP_SERVICE', 'Database backup failed', {
        metadata: { error: errorMessage, duration }
      });

      return {
        success: false,
        type: 'database',
        filename,
        size: 0,
        duration,
        timestamp: new Date().toISOString(),
        error: errorMessage
      };
    }
  }

  async backupLogs(): Promise<BackupResult> {
    const startTime = Date.now();
    const filename = this.generateFilename('logs', 'tar');
    const filePath = path.join(this.backupDir, 'logs', filename);

    try {
      loggingService.info('BACKUP_SERVICE', 'Logs backup started');

      const logsDir = path.join(process.cwd(), 'logs');
      
      if (!fs.existsSync(logsDir)) {
        throw new Error('Logs directory does not exist');
      }

      // tar 명령어로 로그 파일들 압축
      const tarCommand = `tar -czf "${filePath}" -C "${path.dirname(logsDir)}" "${path.basename(logsDir)}"`;
      await execAsync(tarCommand);

      const fileSize = await this.getFileSize(filePath);
      const duration = Date.now() - startTime;

      const result: BackupResult = {
        success: true,
        type: 'logs',
        filename: path.basename(filePath),
        size: fileSize,
        duration,
        timestamp: new Date().toISOString()
      };

      loggingService.info('BACKUP_SERVICE', 'Logs backup completed successfully', {
        metadata: {
          filename: result.filename,
          size: result.size,
          duration: result.duration
        }
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      loggingService.error('BACKUP_SERVICE', 'Logs backup failed', {
        metadata: { error: errorMessage, duration }
      });

      return {
        success: false,
        type: 'logs',
        filename,
        size: 0,
        duration,
        timestamp: new Date().toISOString(),
        error: errorMessage
      };
    }
  }

  async backupFiles(): Promise<BackupResult> {
    const startTime = Date.now();
    const filename = this.generateFilename('files', 'tar');
    const filePath = path.join(this.backupDir, 'files', filename);

    try {
      loggingService.info('BACKUP_SERVICE', 'Files backup started');

      // 중요한 설정 파일들과 업로드된 파일들 백업
      const filesToBackup = [
        '.env.local',
        '.env.production',
        'package.json',
        'package-lock.json',
        'next.config.js',
        'tailwind.config.js',
        'tsconfig.json',
        'database/schema.sql',
        'public', // public 폴더 전체
        'uploads' // 업로드 폴더 (존재한다면)
      ];

      const existingFiles = filesToBackup.filter(file => {
        const fullPath = path.join(process.cwd(), file);
        return fs.existsSync(fullPath);
      });

      if (existingFiles.length === 0) {
        throw new Error('No files to backup');
      }

      // tar 명령어로 파일들 압축
      const fileList = existingFiles.map(file => `"${file}"`).join(' ');
      const tarCommand = `tar -czf "${filePath}" -C "${process.cwd()}" ${fileList}`;
      await execAsync(tarCommand);

      const fileSize = await this.getFileSize(filePath);
      const duration = Date.now() - startTime;

      const result: BackupResult = {
        success: true,
        type: 'files',
        filename: path.basename(filePath),
        size: fileSize,
        duration,
        timestamp: new Date().toISOString()
      };

      loggingService.info('BACKUP_SERVICE', 'Files backup completed successfully', {
        metadata: {
          filename: result.filename,
          size: result.size,
          duration: result.duration,
          filesBackedUp: existingFiles.length
        }
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      loggingService.error('BACKUP_SERVICE', 'Files backup failed', {
        metadata: { error: errorMessage, duration }
      });

      return {
        success: false,
        type: 'files',
        filename,
        size: 0,
        duration,
        timestamp: new Date().toISOString(),
        error: errorMessage
      };
    }
  }

  async performFullBackup(): Promise<BackupResult[]> {
    loggingService.info('BACKUP_SERVICE', 'Full backup started');
    const startTime = Date.now();

    const results: BackupResult[] = [];

    try {
      // 순차적으로 모든 백업 실행
      const dbResult = await this.backupDatabase();
      results.push(dbResult);

      const logsResult = await this.backupLogs();
      results.push(logsResult);

      const filesResult = await this.backupFiles();
      results.push(filesResult);

      const totalDuration = Date.now() - startTime;
      const successCount = results.filter(r => r.success).length;
      const totalSize = results.reduce((sum, r) => sum + r.size, 0);

      loggingService.info('BACKUP_SERVICE', 'Full backup completed', {
        metadata: {
          totalBackups: results.length,
          successfulBackups: successCount,
          totalSize,
          totalDuration
        }
      });

      return results;
    } catch (error) {
      loggingService.error('BACKUP_SERVICE', 'Full backup failed', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return results;
    }
  }

  async cleanupOldBackups(): Promise<void> {
    const types = ['database', 'logs', 'files'];
    
    for (const type of types) {
      try {
        const backupTypeDir = path.join(this.backupDir, type);
        
        if (!fs.existsSync(backupTypeDir)) {
          continue;
        }

        const files = fs.readdirSync(backupTypeDir);
        const retention = this.config.retention[type as keyof typeof this.config.retention];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retention);

        let deletedCount = 0;
        for (const file of files) {
          const filePath = path.join(backupTypeDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }

        if (deletedCount > 0) {
          loggingService.info('BACKUP_SERVICE', `Cleaned up old ${type} backups`, {
            metadata: { deletedCount, retentionDays: retention }
          });
        }
      } catch (error) {
        loggingService.error('BACKUP_SERVICE', `Failed to cleanup ${type} backups`, {
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }
  }

  async getBackupHistory(type?: 'database' | 'logs' | 'files'): Promise<{
    type: string;
    filename: string;
    size: number;
    created: Date;
  }[]> {
    const history: { type: string; filename: string; size: number; created: Date; }[] = [];
    const types = type ? [type] : ['database', 'logs', 'files'];

    for (const backupType of types) {
      try {
        const backupTypeDir = path.join(this.backupDir, backupType);
        
        if (!fs.existsSync(backupTypeDir)) {
          continue;
        }

        const files = fs.readdirSync(backupTypeDir);
        
        for (const file of files) {
          const filePath = path.join(backupTypeDir, file);
          const stats = fs.statSync(filePath);
          
          history.push({
            type: backupType,
            filename: file,
            size: stats.size,
            created: stats.mtime
          });
        }
      } catch (error) {
        loggingService.error('BACKUP_SERVICE', `Failed to get ${backupType} backup history`, {
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }

    return history.sort((a, b) => b.created.getTime() - a.created.getTime());
  }

  async restoreDatabase(backupFilename: string): Promise<{ success: boolean; error?: string }> {
    try {
      loggingService.info('BACKUP_SERVICE', 'Database restore started', {
        metadata: { backupFilename }
      });

      const backupPath = path.join(this.backupDir, 'database', backupFilename);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'face_analysis_db',
        port: process.env.DB_PORT || '3306'
      };

      // 압축된 파일인지 확인
      let restoreCommand: string;
      if (backupFilename.endsWith('.gz')) {
        restoreCommand = `gunzip -c "${backupPath}" | mysql -h${dbConfig.host} -P${dbConfig.port} -u${dbConfig.user}`;
      } else {
        restoreCommand = `mysql -h${dbConfig.host} -P${dbConfig.port} -u${dbConfig.user}`;
      }

      if (dbConfig.password) {
        restoreCommand += ` -p${dbConfig.password}`;
      }
      
      restoreCommand += ` ${dbConfig.database}`;
      
      if (!backupFilename.endsWith('.gz')) {
        restoreCommand += ` < "${backupPath}"`;
      }

      await execAsync(restoreCommand);

      loggingService.info('BACKUP_SERVICE', 'Database restore completed successfully', {
        metadata: { backupFilename }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      loggingService.error('BACKUP_SERVICE', 'Database restore failed', {
        metadata: { backupFilename, error: errorMessage }
      });

      return { success: false, error: errorMessage };
    }
  }

  getConfig(): BackupConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// 싱글톤 인스턴스 생성
const backupService = new BackupService();

export default backupService;