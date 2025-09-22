/**
 * 사용자 분석 및 통계 서비스
 * MAU/DAU/WAU 및 메뉴 사용량 추적
 */

export interface UserVisit {
  userId: string; // 익명 사용자 ID (브라우저 fingerprint 기반)
  visitDate: string; // YYYY-MM-DD 형식
  visitTime: string; // ISO timestamp
  userAgent: string;
  referrer: string;
  sessionId: string;
}

export interface MenuUsage {
  menuId: string; // mbti-face, face-saju, face-analysis 등
  menuName: string;
  userId: string;
  usageDate: string; // YYYY-MM-DD 형식
  usageTime: string; // ISO timestamp
  sessionId: string;
  completed: boolean; // 결제까지 완료했는지
}

export interface AnalyticsStats {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  
  // 사용자 지표
  totalUsers: number;
  newUsers: number;
  returningUsers: number;
  
  // 활동 지표
  totalVisits: number;
  avgSessionDuration: number;
  bounceRate: number;
  
  // 메뉴별 사용량
  menuUsage: Array<{
    menuId: string;
    menuName: string;
    totalUsage: number;
    uniqueUsers: number;
    conversionRate: number; // 결제 완료율
  }>;
}

export class AnalyticsService {
  private visits: UserVisit[] = [];
  private menuUsages: MenuUsage[] = [];

  constructor() {
    this.initializeTestData();
  }

  /**
   * 테스트용 초기 데이터 생성
   */
  private initializeTestData(): void {
    const now = new Date();
    const testVisits: UserVisit[] = [];
    const testMenuUsages: MenuUsage[] = [];

    // 지난 30일간의 방문 데이터 생성
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // 일별 방문자 수 (평균 50-200명)
      const dailyVisitors = Math.floor(Math.random() * 150) + 50;
      
      for (let j = 0; j < dailyVisitors; j++) {
        const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
        const visitTime = new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        
        testVisits.push({
          userId,
          visitDate: dateStr,
          visitTime: visitTime.toISOString(),
          userAgent: 'Mozilla/5.0 (compatible; TestBot)',
          referrer: Math.random() > 0.5 ? 'https://google.com' : 'direct',
          sessionId: `session_${Math.random().toString(36).substr(2, 9)}`
        });
        
        // 30% 확률로 메뉴 사용
        if (Math.random() < 0.3) {
          const menus = [
            { id: 'mbti-face', name: 'MBTI × 관상 분석' },
            { id: 'face-analysis', name: '정통 관상 분석' },
            { id: 'face-saju', name: '관상 + 사주 분석' }
          ];
          
          const selectedMenu = menus[Math.floor(Math.random() * menus.length)];
          const usageTime = new Date(visitTime.getTime() + Math.random() * 30 * 60 * 1000);
          
          testMenuUsages.push({
            menuId: selectedMenu.id,
            menuName: selectedMenu.name,
            userId,
            usageDate: dateStr,
            usageTime: usageTime.toISOString(),
            sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
            completed: Math.random() < 0.15 // 15% 결제 완료율
          });
        }
      }
    }
    
    this.visits = testVisits;
    this.menuUsages = testMenuUsages;
    
    console.log(`📊 Analytics 초기 데이터 생성 완료:`, {
      visits: this.visits.length,
      menuUsages: this.menuUsages.length
    });
  }

  /**
   * 사용자 방문 기록
   */
  trackVisit(visit: Omit<UserVisit, 'visitDate' | 'visitTime'>): void {
    const now = new Date();
    const fullVisit: UserVisit = {
      ...visit,
      visitDate: now.toISOString().split('T')[0],
      visitTime: now.toISOString()
    };
    
    this.visits.push(fullVisit);
    
    // 최대 10,000개까지만 보관
    if (this.visits.length > 10000) {
      this.visits = this.visits.slice(-10000);
    }
    
    console.log('📊 사용자 방문 기록:', fullVisit);
  }

  /**
   * 메뉴 사용량 기록
   */
  trackMenuUsage(usage: Omit<MenuUsage, 'usageDate' | 'usageTime'>): void {
    const now = new Date();
    const fullUsage: MenuUsage = {
      ...usage,
      usageDate: now.toISOString().split('T')[0],
      usageTime: now.toISOString()
    };
    
    this.menuUsages.push(fullUsage);
    
    // 최대 10,000개까지만 보관
    if (this.menuUsages.length > 10000) {
      this.menuUsages = this.menuUsages.slice(-10000);
    }
    
    console.log('📊 메뉴 사용량 기록:', fullUsage);
  }

  /**
   * MAU (Monthly Active Users) 계산
   */
  getMAU(date: Date = new Date()): number {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return this.getUniqueUsersInPeriod(startDate, endDate);
  }

  /**
   * WAU (Weekly Active Users) 계산
   */
  getWAU(date: Date = new Date()): number {
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - 6); // 7일 전부터
    
    return this.getUniqueUsersInPeriod(startDate, date);
  }

  /**
   * DAU (Daily Active Users) 계산
   */
  getDAU(date: Date = new Date()): number {
    const dateStr = date.toISOString().split('T')[0];
    const uniqueUsers = new Set(
      this.visits
        .filter(visit => visit.visitDate === dateStr)
        .map(visit => visit.userId)
    );
    
    return uniqueUsers.size;
  }

  /**
   * 기간별 고유 사용자 수 계산
   */
  private getUniqueUsersInPeriod(startDate: Date, endDate: Date): number {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const uniqueUsers = new Set(
      this.visits
        .filter(visit => visit.visitDate >= startStr && visit.visitDate <= endStr)
        .map(visit => visit.userId)
    );
    
    return uniqueUsers.size;
  }

  /**
   * 메뉴별 사용량 통계
   */
  getMenuUsageStats(days: number = 30): Array<{
    menuId: string;
    menuName: string;
    totalUsage: number;
    uniqueUsers: number;
    conversionRate: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    
    const recentUsages = this.menuUsages.filter(usage => usage.usageDate >= cutoffStr);
    
    // 메뉴별로 그룹화
    const menuGroups: { [key: string]: MenuUsage[] } = {};
    recentUsages.forEach(usage => {
      if (!menuGroups[usage.menuId]) {
        menuGroups[usage.menuId] = [];
      }
      menuGroups[usage.menuId].push(usage);
    });
    
    return Object.entries(menuGroups).map(([menuId, usages]) => {
      const uniqueUsers = new Set(usages.map(u => u.userId)).size;
      const completedUsages = usages.filter(u => u.completed).length;
      
      return {
        menuId,
        menuName: usages[0].menuName,
        totalUsage: usages.length,
        uniqueUsers,
        conversionRate: usages.length > 0 ? (completedUsages / usages.length) * 100 : 0
      };
    }).sort((a, b) => b.totalUsage - a.totalUsage);
  }

  /**
   * 통합 분석 통계
   */
  getAnalyticsStats(period: 'daily' | 'weekly' | 'monthly' = 'daily'): AnalyticsStats {
    const now = new Date();
    let startDate: Date, endDate: Date;
    
    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
        endDate = now;
        break;
      case 'daily':
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
    }
    
    const periodVisits = this.getVisitsInPeriod(startDate, endDate);
    const uniqueUsers = new Set(periodVisits.map(v => v.userId));
    
    // 신규/재방문 사용자 구분 (간단한 로직)
    const allUserIds = new Set(this.visits.map(v => v.userId));
    const newUsers = Array.from(uniqueUsers).filter(userId => {
      const userVisits = this.visits.filter(v => v.userId === userId);
      const firstVisit = userVisits.sort((a, b) => a.visitTime.localeCompare(b.visitTime))[0];
      return firstVisit && firstVisit.visitTime >= startDate.toISOString();
    });
    
    return {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalUsers: uniqueUsers.size,
      newUsers: newUsers.length,
      returningUsers: uniqueUsers.size - newUsers.length,
      totalVisits: periodVisits.length,
      avgSessionDuration: 0, // TODO: 세션 지속시간 계산
      bounceRate: 0, // TODO: 이탈률 계산
      menuUsage: this.getMenuUsageStats(period === 'monthly' ? 30 : period === 'weekly' ? 7 : 1)
    };
  }

  /**
   * 기간별 방문 데이터 조회
   */
  private getVisitsInPeriod(startDate: Date, endDate: Date): UserVisit[] {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    return this.visits.filter(visit => 
      visit.visitDate >= startStr && visit.visitDate <= endStr
    );
  }

  /**
   * 브라우저 fingerprint 기반 익명 사용자 ID 생성
   */
  static generateAnonymousUserId(): string {
    // 클라이언트 사이드에서 사용할 간단한 fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint test', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // 간단한 해시 생성
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    
    return 'anon_' + Math.abs(hash).toString(36);
  }
}

// 싱글톤 인스턴스
export const analyticsService = new AnalyticsService();