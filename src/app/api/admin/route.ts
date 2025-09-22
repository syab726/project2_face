import { NextRequest, NextResponse } from 'next/server';
import { anonymousUserService } from '@/services/anonymousUserService';

/**
 * 관리자용 익명 사용자 식별 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phone,
      email,
      transactionTime,
      transactionAmount,
      cardLastFour,
      serviceType,
      problemDescription,
      urgency
    } = body;

    // 시간 파싱 (간단한 구현)
    let timeRange: { start: Date; end: Date } | undefined;
    if (transactionTime) {
      const now = new Date();
      
      if (transactionTime.includes('오늘')) {
        // "오늘 오후 3시"와 같은 패턴
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (transactionTime.includes('오후') && transactionTime.includes('3')) {
          timeRange = {
            start: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 15:00
            end: new Date(today.getTime() + 16 * 60 * 60 * 1000)    // 16:00
          };
        } else {
          // 기본값: 오늘 전체
          timeRange = {
            start: today,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
        }
      } else {
        // 기본값: 최근 24시간
        timeRange = {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: now
        };
      }
    }

    // 복합 검색 실행
    const searchResults = anonymousUserService.findUsersByMultipleConditions({
      timeRange,
      amount: transactionAmount,
      phone,
      email,
      cardLastFour
    });

    // 결과 분석 및 신뢰도 계산
    const analyzedResults = searchResults.map(result => {
      const { session, tracker, matchScore } = result;
      
      // 신뢰도 계산
      let confidence: 'high' | 'medium' | 'low' = 'low';
      if (matchScore >= 50) confidence = 'high';
      else if (matchScore >= 30) confidence = 'medium';

      // 매칭 요소 식별
      const matchedFactors: string[] = [];
      if (timeRange && transactionAmount && 
          new Date(tracker.createdAt) >= timeRange.start && 
          new Date(tracker.createdAt) <= timeRange.end &&
          tracker.amount === transactionAmount) {
        matchedFactors.push('결제시간+금액');
      }
      if (phone && tracker.contactInfo.phone === phone) {
        matchedFactors.push('전화번호');
      }
      if (email && tracker.contactInfo.email === email) {
        matchedFactors.push('이메일');
      }

      return {
        sessionId: session.sessionId,
        userId: session.userId,
        confidence,
        matchScore,
        matchedFactors,
        contactMethod: tracker.contactInfo.preferredContact,
        contactValue: tracker.contactInfo.preferredContact === 'phone' ? 
          tracker.contactInfo.phone : tracker.contactInfo.email,
        paymentInfo: {
          orderId: tracker.orderId,
          paymentId: tracker.paymentId,
          amount: tracker.amount,
          paymentTime: tracker.createdAt,
          serviceType: tracker.serviceType
        },
        errorHistory: session.errors.map(error => ({
          errorId: error.errorId,
          errorType: error.errorType,
          severity: error.severity,
          compensationRequired: error.compensationRequired,
          compensationAmount: error.compensationAmount,
          resolved: error.resolved,
          timestamp: error.timestamp
        }))
      };
    });

    // 결과에 따른 상태 결정
    const highConfidenceMatches = analyzedResults.filter(r => r.confidence === 'high');
    
    let status: string;
    let recommendedAction: string;
    
    if (highConfidenceMatches.length === 1) {
      status = 'auto_matched';
      recommendedAction = 'immediate_compensation';
    } else if (highConfidenceMatches.length > 1) {
      status = 'multiple_high_matches';
      recommendedAction = 'manual_review_select';
    } else if (analyzedResults.length > 0) {
      status = 'manual_review_needed';
      recommendedAction = 'customer_service_contact';
    } else {
      status = 'no_matches';
      recommendedAction = 'request_additional_info';
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        recommendedAction,
        potentialMatches: analyzedResults.slice(0, 5), // 최대 5개 결과만
        searchCriteria: {
          hasTimeRange: !!timeRange,
          hasAmount: !!transactionAmount,
          hasPhone: !!phone,
          hasEmail: !!email,
          hasCardInfo: !!cardLastFour
        },
        user: highConfidenceMatches.length === 1 ? highConfidenceMatches[0] : null
      }
    });

  } catch (error) {
    console.error('User identification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '사용자 식별 중 오류가 발생했습니다.',
        status: 'error'
      },
      { status: 500 }
    );
  }
}