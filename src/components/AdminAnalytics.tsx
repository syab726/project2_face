'use client';

import { useState, useEffect } from 'react';
import { analyticsService, AnalyticsStats } from '@/services/analyticsService';

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ExtendedAnalyticsStats extends Omit<AnalyticsStats, 'period'> {
  period: {
    start: string;
    end: string;
    description: string;
  };
}

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [analyticsData, setAnalyticsData] = useState<ExtendedAnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);
  const [showCustomDate, setShowCustomDate] = useState(false);

  // 실시간 MAU/DAU/WAU 데이터
  const [userMetrics, setUserMetrics] = useState({
    dau: 0,
    wau: 0,
    mau: 0
  });

  // 기본 분석 데이터 로드
  const loadAnalyticsData = async (range: TimeRange): Promise<ExtendedAnalyticsStats> => {
    try {
      setLoading(true);
      
      // 현재 Analytics 데이터 조회
      const stats = analyticsService.getAnalyticsStats(range);
      
      // MAU/DAU/WAU 계산
      const now = new Date();
      const metrics = {
        dau: analyticsService.getDAU(now),
        wau: analyticsService.getWAU(now),
        mau: analyticsService.getMAU(now)
      };
      setUserMetrics(metrics);
      
      // 기간 정보 추가
      const periodInfo = getPeriodInfo(range, now);
      
      const extendedStats: ExtendedAnalyticsStats = {
        ...stats,
        period: periodInfo
      };
      
      console.log('📊 Analytics 데이터 로드 완료:', { stats: extendedStats, metrics });
      return extendedStats;
    } catch (error) {
      console.error('Analytics 데이터 로드 오류:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 사용자 정의 날짜 범위로 데이터 조회
  const loadCustomRangeData = async (dateRange: DateRange): Promise<ExtendedAnalyticsStats> => {
    try {
      setLoading(true);
      
      // 실제 구현시에는 API로 특정 날짜 범위 데이터 조회
      // const response = await fetch(`/api/admin/analytics?start=${dateRange.startDate}&end=${dateRange.endDate}`);
      
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // 커스텀 기간의 시뮬레이션 데이터 생성
      const totalUsers = Math.floor(Math.random() * 100 + 50) * diffDays;
      const newUsers = Math.floor(totalUsers * 0.3);
      const returningUsers = totalUsers - newUsers;
      const totalVisits = Math.floor(totalUsers * 1.2);
      
      // 메뉴 사용량 시뮬레이션
      const menuUsage = [
        {
          menuId: 'mbti-face',
          menuName: 'MBTI × 관상 분석',
          totalUsage: Math.floor(Math.random() * 200 + 100),
          uniqueUsers: Math.floor(Math.random() * 150 + 80),
          conversionRate: Math.floor(Math.random() * 20 + 10)
        },
        {
          menuId: 'face-analysis',
          menuName: '정통 관상 분석',
          totalUsage: Math.floor(Math.random() * 150 + 80),
          uniqueUsers: Math.floor(Math.random() * 120 + 60),
          conversionRate: Math.floor(Math.random() * 15 + 8)
        },
        {
          menuId: 'face-saju',
          menuName: '관상 + 사주 분석',
          totalUsage: Math.floor(Math.random() * 100 + 50),
          uniqueUsers: Math.floor(Math.random() * 80 + 40),
          conversionRate: Math.floor(Math.random() * 25 + 15)
        }
      ].sort((a, b) => b.totalUsage - a.totalUsage);
      
      // 사용자 정의 기간의 MAU/DAU/WAU 계산
      const customMetrics = {
        dau: Math.floor(totalUsers / diffDays),
        wau: Math.floor(totalUsers / Math.ceil(diffDays / 7)),
        mau: Math.floor(totalUsers / Math.ceil(diffDays / 30))
      };
      setUserMetrics(customMetrics);
      
      const extendedStats: ExtendedAnalyticsStats = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        totalUsers,
        newUsers,
        returningUsers,
        totalVisits,
        avgSessionDuration: 0,
        bounceRate: 0,
        menuUsage,
        period: {
          start: dateRange.startDate,
          end: dateRange.endDate,
          description: `${dateRange.startDate} ~ ${dateRange.endDate} (${diffDays}일간)`
        }
      };
      
      console.log('📊 커스텀 범위 Analytics 데이터 생성:', extendedStats);
      return extendedStats;
    } catch (error) {
      console.error('사용자 정의 범위 Analytics 데이터 로드 오류:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 기간 정보 생성 헬퍼
  const getPeriodInfo = (range: TimeRange, now: Date) => {
    let startDate: Date;
    let endDate: Date = new Date(now);
    let description: string;
    
    switch (range) {
      case 'daily':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 29);
        description = '최근 30일';
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 55); // 8주 전
        description = '최근 8주';
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 11);
        description = '최근 12개월';
        break;
      default:
        startDate = new Date(now);
        description = '기본 기간';
    }
    
    return {
      start: `${startDate.getMonth() + 1}/${startDate.getDate()}`,
      end: `${endDate.getMonth() + 1}/${endDate.getDate()}`,
      description
    };
  };

  useEffect(() => {
    if (customDateRange) {
      loadCustomRangeData(customDateRange).then(setAnalyticsData).catch(console.error);
    } else {
      loadAnalyticsData(timeRange).then(setAnalyticsData).catch(console.error);
    }
  }, [timeRange, customDateRange]);

  // 자동 새로고침 (5분마다) - 사용자 정의 범위가 아닐 때만
  useEffect(() => {
    if (customDateRange) return; // 사용자 정의 범위에서는 자동 새로고침 안함
    
    const interval = setInterval(() => {
      loadAnalyticsData(timeRange).then(setAnalyticsData).catch(console.error);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange, customDateRange]);

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    
    if (startDate && endDate) {
      // 최대 90일 제한
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 90) {
        alert('최대 90일 범위까지만 선택 가능합니다.');
        return;
      }
      
      if (start > end) {
        alert('시작 날짜는 종료 날짜보다 이전이어야 합니다.');
        return;
      }
      
      setCustomDateRange({ startDate, endDate });
      setShowCustomDate(false);
    }
  };

  const resetToPreset = (range: TimeRange) => {
    setCustomDateRange(null);
    setTimeRange(range);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#666'
      }}>
        <div style={{ fontSize: '2em', marginBottom: '10px' }}>📊</div>
        <div>사용자 분석 데이터를 불러오는 중...</div>
        <div style={{ fontSize: '0.9em', marginTop: '5px', color: '#999' }}>
          {customDateRange ? '사용자 정의 범위' : '기본 분석'} 데이터를 로드하고 있습니다
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#e74c3c'
      }}>
        <div style={{ fontSize: '2em', marginBottom: '10px' }}>⚠️</div>
        <div>분석 데이터를 불러올 수 없습니다</div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 새로고침
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px' }}>
      {/* 기간 선택 및 현재 조회 기간 표시 */}
      <div style={{ marginBottom: '30px' }}>
        {/* 현재 조회 기간 표시 */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '12px 12px 0 0',
          fontSize: '1.1em',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            👥 현재 분석 기간: {analyticsData?.period.description || '로딩중...'}
          </div>
          <div style={{ fontSize: '0.9em', opacity: '0.9' }}>
            {analyticsData && `${analyticsData.period.start} ~ ${analyticsData.period.end}`}
          </div>
        </div>
        
        {/* 기간 선택 탭 */}
        <div style={{ 
          display: 'flex', 
          gap: '5px', 
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '0 0 12px 12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {[
            { key: 'daily' as TimeRange, label: '최근 30일', period: '일별 사용자 분석' },
            { key: 'weekly' as TimeRange, label: '최근 8주', period: '주별 사용자 분석' },
            { key: 'monthly' as TimeRange, label: '최근 12개월', period: '월별 사용자 분석' }
          ].map(({ key, label, period }) => (
            <button
              key={key}
              onClick={() => resetToPreset(key)}
              style={{
                padding: '8px 16px',
                border: (timeRange === key && !customDateRange) ? '2px solid #4caf50' : '1px solid #ddd',
                borderRadius: '6px',
                background: (timeRange === key && !customDateRange) ? '#f0fff4' : '#fff',
                color: (timeRange === key && !customDateRange) ? '#4caf50' : '#666',
                cursor: 'pointer',
                fontSize: '0.85em',
                fontWeight: (timeRange === key && !customDateRange) ? 'bold' : 'normal',
                margin: '2px'
              }}
            >
              <div>{label}</div>
              <div style={{ fontSize: '0.75em', opacity: '0.8' }}>{period}</div>
            </button>
          ))}
          
          {/* 사용자 정의 날짜 선택 버튼 */}
          <button
            onClick={() => setShowCustomDate(!showCustomDate)}
            style={{
              padding: '8px 16px',
              border: customDateRange ? '2px solid #ff9800' : '1px solid #ff9800',
              borderRadius: '6px',
              background: customDateRange ? '#fff3e0' : '#fff',
              color: '#ff9800',
              cursor: 'pointer',
              fontSize: '0.85em',
              fontWeight: customDateRange ? 'bold' : 'normal',
              margin: '2px'
            }}
          >
            <div>📅 사용자 정의</div>
            <div style={{ fontSize: '0.75em', opacity: '0.8' }}>
              {customDateRange ? '범위 선택됨' : '날짜 직접 선택'}
            </div>
          </button>
          
          {/* 새로고침 버튼 */}
          <button
            onClick={() => {
              if (customDateRange) {
                loadCustomRangeData(customDateRange).then(setAnalyticsData);
              } else {
                loadAnalyticsData(timeRange).then(setAnalyticsData);
              }
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #2196f3',
              borderRadius: '6px',
              background: '#fff',
              color: '#2196f3',
              cursor: 'pointer',
              fontSize: '0.85em',
              margin: '2px',
              marginLeft: 'auto'
            }}
          >
            🔄 새로고침
          </button>
        </div>
        
        {/* 사용자 정의 날짜 선택 폼 */}
        {showCustomDate && (
          <div style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <form onSubmit={handleCustomDateSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#666' }}>시작 날짜</label>
                <input 
                  type="date" 
                  name="startDate"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.9em'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#666' }}>종료 날짜</label>
                <input 
                  type="date" 
                  name="endDate"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.9em'
                  }}
                />
              </div>
              <button 
                type="submit"
                style={{
                  padding: '8px 16px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9em'
                }}
              >
                👥 분석
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowCustomDate(false);
                  setCustomDateRange(null);
                  setTimeRange('daily');
                }}
                style={{
                  padding: '8px 16px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9em'
                }}
              >
                ✕ 취소
              </button>
            </form>
            <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}>
              💡 팁: 최대 90일 범위까지 선택 가능합니다. 사용자 정의 범위에서는 자동 새로고침이 비활성화됩니다.
            </div>
          </div>
        )}
      </div>

      {/* MAU/DAU/WAU 핵심 지표 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', marginBottom: '8px' }}>
            {userMetrics.dau}
          </div>
          <div style={{ fontSize: '1.1em', opacity: '0.9' }}>DAU</div>
          <div style={{ fontSize: '0.9em', opacity: '0.7' }}>Daily Active Users</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', marginBottom: '8px' }}>
            {userMetrics.wau}
          </div>
          <div style={{ fontSize: '1.1em', opacity: '0.9' }}>WAU</div>
          <div style={{ fontSize: '0.9em', opacity: '0.7' }}>Weekly Active Users</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', marginBottom: '8px' }}>
            {userMetrics.mau}
          </div>
          <div style={{ fontSize: '1.1em', opacity: '0.9' }}>MAU</div>
          <div style={{ fontSize: '0.9em', opacity: '0.7' }}>Monthly Active Users</div>
        </div>
      </div>

      {/* 기본 통계 카드들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2em', marginBottom: '10px' }}>👥</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#2196f3' }}>
            {analyticsData.totalUsers}
          </div>
          <div style={{ color: '#666', marginTop: '5px' }}>총 사용자</div>
          <div style={{ fontSize: '0.85em', color: '#999', marginTop: '5px' }}>
            신규: {analyticsData.newUsers} | 재방문: {analyticsData.returningUsers}
          </div>
        </div>
        
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2em', marginBottom: '10px' }}>📱</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#4caf50' }}>
            {analyticsData.totalVisits}
          </div>
          <div style={{ color: '#666', marginTop: '5px' }}>총 방문 수</div>
          <div style={{ fontSize: '0.85em', color: '#999', marginTop: '5px' }}>
            {customDateRange ? '사용자 정의 기간' : timeRange === 'daily' ? '오늘' : timeRange === 'weekly' ? '이번주' : '이번달'} 기준
          </div>
        </div>
      </div>

      {/* 메뉴별 사용량 통계 */}
      <div style={{
        background: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ 
          color: '#333', 
          marginBottom: '20px',
          fontSize: '1.3em',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📋 메뉴별 사용량 분석
          <span style={{ 
            fontSize: '0.7em', 
            background: customDateRange ? '#ff9800' : '#4caf50', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '12px' 
          }}>
            {customDateRange ? '사용자 정의' : '실시간'}
          </span>
        </h3>
        
        {analyticsData.menuUsage.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>메뉴명</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>사용횟수</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>고유사용자</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>결제완료율</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>인기도</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.menuUsage.map((menu, index) => (
                  <tr key={menu.menuId} style={{ 
                    backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      {menu.menuName}
                      <div style={{ fontSize: '0.8em', color: '#666', marginTop: '2px' }}>
                        {menu.menuId}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '1.1em', fontWeight: 'bold' }}>
                      {menu.totalUsage}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {menu.uniqueUsers}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: 'bold',
                        backgroundColor: menu.conversionRate >= 20 ? '#d4edda' : menu.conversionRate >= 10 ? '#fff3cd' : '#f8d7da',
                        color: menu.conversionRate >= 20 ? '#155724' : menu.conversionRate >= 10 ? '#856404' : '#721c24'
                      }}>
                        {menu.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{
                        width: '60px',
                        height: '8px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '4px',
                        margin: '0 auto',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(100, (menu.totalUsage / Math.max(...analyticsData.menuUsage.map(m => m.totalUsage))) * 100)}%`,
                          height: '100%',
                          backgroundColor: index === 0 ? '#4caf50' : index === 1 ? '#ff9800' : '#2196f3',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>📊</div>
            <div>메뉴 사용 데이터가 없습니다</div>
          </div>
        )}
      </div>

      {/* 요약 정보 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h3 style={{ marginBottom: '15px', color: 'white' }}>
          📈 {customDateRange ? '사용자 정의 기간' : timeRange === 'daily' ? '오늘' : timeRange === 'weekly' ? '이번주' : '이번달'} 분석 요약
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.9em', opacity: '0.9' }}>
              평균 {customDateRange ? '일일' : timeRange === 'daily' ? '일일' : timeRange === 'weekly' ? '주간' : '월간'} 사용자
            </div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold' }}>
              {Math.round(analyticsData.totalUsers / (timeRange === 'monthly' ? 30 : timeRange === 'weekly' ? 7 : 1))}명
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.9em', opacity: '0.9' }}>가장 인기 메뉴</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold' }}>
              {analyticsData.menuUsage[0]?.menuName.split(' ')[0] || 'N/A'}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.9em', opacity: '0.9' }}>전체 결제율</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold' }}>
              {analyticsData.menuUsage.length > 0 
                ? (analyticsData.menuUsage.reduce((sum, menu) => sum + menu.conversionRate, 0) / analyticsData.menuUsage.length).toFixed(1)
                : '0'
              }%
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.9em', opacity: '0.9' }}>신규 사용자 비율</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold' }}>
              {analyticsData.totalUsers > 0 ? Math.round((analyticsData.newUsers / analyticsData.totalUsers) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}