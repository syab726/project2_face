/**
 * 영구 저장소 서비스
 * 파일 시스템을 이용해 데이터를 영구 보관
 */

import fs from 'fs';
import path from 'path';

interface StorageData {
  metrics: any;
  adminErrors: any[];
  lastUpdate: string;
}

class PersistentStore {
  private dataPath: string;
  private cacheData: StorageData | null = null;

  constructor() {
    // 프로젝트 루트의 temp 폴더에 저장
    this.dataPath = path.join(process.cwd(), 'temp', 'app-data.json');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): StorageData {
    if (this.cacheData) {
      return this.cacheData;
    }

    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        this.cacheData = JSON.parse(data);
        return this.cacheData!;
      }
    } catch (error) {
      console.warn('Failed to load persistent data:', error);
    }

    // 기본 데이터 구조
    this.cacheData = {
      metrics: {
        totalPageViews: 0,
        totalAnalyses: 0,
        totalPayments: 0,
        totalRevenue: 0,
        totalErrors: 0,
        todayErrors: 0
      },
      adminErrors: [],
      lastUpdate: new Date().toISOString()
    };

    return this.cacheData;
  }

  private saveData(data: StorageData): void {
    try {
      this.cacheData = data;
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save persistent data:', error);
    }
  }

  // 메트릭스 데이터 저장
  saveMetrics(metrics: any): void {
    const data = this.loadData();
    data.metrics = metrics;
    data.lastUpdate = new Date().toISOString();
    this.saveData(data);
  }

  // 메트릭스 데이터 로드
  loadMetrics(): any {
    const data = this.loadData();
    return data.metrics;
  }

  // 관리자 오류 추가
  addAdminError(error: any): void {
    const data = this.loadData();
    data.adminErrors.unshift(error); // 최신 오류를 맨 앞에 추가
    
    // 최대 100개까지만 보관
    if (data.adminErrors.length > 100) {
      data.adminErrors = data.adminErrors.slice(0, 100);
    }
    
    data.lastUpdate = new Date().toISOString();
    this.saveData(data);
  }

  // 관리자 오류 리스트 조회
  getAdminErrors(): any[] {
    const data = this.loadData();
    return data.adminErrors;
  }

  // 오류 카운트 증가
  incrementErrorCount(): void {
    const data = this.loadData();
    data.metrics.totalErrors = (data.metrics.totalErrors || 0) + 1;
    data.metrics.todayErrors = (data.metrics.todayErrors || 0) + 1;
    data.lastUpdate = new Date().toISOString();
    this.saveData(data);
  }

  // 데이터 클리어 (개발용)
  clearAll(): void {
    this.cacheData = null;
    if (fs.existsSync(this.dataPath)) {
      fs.unlinkSync(this.dataPath);
    }
  }

  // 통계 정보
  getStats(): { totalErrors: number; todayErrors: number; adminErrorsCount: number } {
    const data = this.loadData();
    return {
      totalErrors: data.metrics.totalErrors || 0,
      todayErrors: data.metrics.todayErrors || 0,
      adminErrorsCount: data.adminErrors.length
    };
  }
}

// 싱글톤 인스턴스
export const persistentStore = new PersistentStore();
export default persistentStore;