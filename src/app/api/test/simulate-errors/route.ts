import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/adminService';
import { anonymousUserService } from '@/services/anonymousUserService';

/**
 * 오류 트래킹 테스트를 위한 API
 * 실제 오류 상황을 시뮬레이션하여 보상 시스템을 테스트
 */
export async function POST(request: NextRequest) {
  try {
    const { errorType, orderId, serviceType } = await request.json();
    
    // 익명 사용자 세션 생성
    const deviceInfo = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0',
      platform: 'Win32',
      screen: '1920x1080',
      timezone: 'Asia/Seoul'
    };
    
    const session = anonymousUserService.createAnonymousSession(deviceInfo);
    const serviceId = anonymousUserService.startServiceUsage(session.sessionId, serviceType || 'professional-physiognomy');
    
    // 실제같은 연락처 정보 생성 (선택적 이메일, 필수 전화번호)
    const contactVariations = [
      { phone: '010-1234-5678', preferredContact: 'phone' as const },
      { phone: '010-9876-5432', email: 'kim@naver.com', preferredContact: 'email' as const },
      { phone: '010-5555-1234', preferredContact: 'phone' as const },
      { phone: '010-7777-8888', email: 'lee@gmail.com', preferredContact: 'phone' as const },
      { phone: '010-3333-4444', preferredContact: 'phone' as const }
    ];
    
    const contactInfo = contactVariations[Math.floor(Math.random() * contactVariations.length)];
    
    // 결제 정보 연계
    const paymentOrderId = orderId || `TEST-${Date.now()}`;
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amount = calculateCompensation(serviceType || 'professional-physiognomy');
    
    try {
      anonymousUserService.linkPayment(session.sessionId, serviceId, {
        orderId: paymentOrderId,
        paymentId,
        amount,
        contactInfo: {
          ...contactInfo,
          name: contactInfo.email ? contactInfo.email.split('@')[0] : undefined
        }
      });
      
      // 결제 완료 처리
      anonymousUserService.completePayment(paymentId);
    } catch (linkError) {
      console.error('Payment linking error:', linkError);
    }
    
    // 테스트용 오류 시나리오들
    const errorScenarios = {
      'payment_success_content_fail': {
        type: 'content_delivery_failure' as const,
        title: '결제 완료 후 AI 분석 결과 미전달',
        message: `OpenAI API 타임아웃으로 인해 ${serviceType} 분석 결과를 사용자에게 전달하지 못했습니다.`,
        serviceType: serviceType || 'professional-physiognomy',
        analysisStep: 'ai_response_delivery',
        sessionId: session.sessionId,
        serviceId,
        orderId: paymentOrderId,
        metadata: {
          paymentStatus: 'completed',
          apiError: 'OpenAI API timeout after 30 seconds',
          retryAttempts: 3,
          lastRetryAt: new Date().toISOString(),
          businessImpact: 'HIGH_PRIORITY_REFUND'
        }
      },
      
      'gemini_api_failure': {
        type: 'gemini_api_error' as const,
        title: 'Gemini API 완전 실패',
        message: 'Gemini API 연결 실패로 관상 분석을 수행할 수 없습니다.',
        serviceType: serviceType || 'face-saju',
        analysisStep: 'gemini_face_analysis',
        sessionId: session.sessionId,
        serviceId,
        orderId: paymentOrderId,
        metadata: {
          apiError: 'HTTP 503 Service Unavailable',
          quotaExceeded: false,
          imageProcessed: true,
          retryScheduled: true
        }
      },
      
      'json_parsing_error': {
        type: 'json_parse_error' as const,
        title: 'AI 응답 JSON 파싱 실패',
        message: 'AI가 반환한 분석 결과를 올바른 형식으로 파싱하지 못했습니다.',
        serviceType: serviceType || 'mbti-face',
        analysisStep: 'response_parsing',
        sessionId: session.sessionId,
        serviceId,
        orderId: paymentOrderId,
        metadata: {
          rawResponse: '올바르지 않은 JSON 형식의 응답',
          expectedFormat: 'structured_analysis_result',
          parsingAttempts: 2,
          fallbackUsed: false
        }
      },
      
      'interview_analysis_crash': {
        type: 'ai_service_error' as const,
        title: '면접관상 분석 시스템 크래시',
        message: '면접관상 분석 중 시스템 오류로 분석을 완료하지 못했습니다.',
        serviceType: 'analyze-interview-face',
        analysisStep: 'interview_face_analysis',
        sessionId: session.sessionId,
        serviceId,
        orderId: paymentOrderId,
        metadata: {
          crashType: 'memory_overflow',
          imageSize: '2.4MB',
          processingTime: '45 seconds',
          systemLoad: 'HIGH'
        }
      },
      
      'prompt_quality_degraded': {
        type: 'prompt_quality_issue' as const,
        title: '프롬프트 품질 저하 감지',
        message: 'AI 분석 결과의 품질이 기준치 이하로 떨어졌습니다.',
        serviceType: serviceType || 'professional-physiognomy',
        analysisStep: 'quality_assessment',
        sessionId: session.sessionId,
        serviceId,
        orderId: paymentOrderId,
        metadata: {
          qualityScore: 0.34,
          threshold: 0.7,
          analysisLength: 156,
          expectedLength: 500,
          coherenceScore: 0.41
        }
      }
    };

    // 지정된 오류 타입 또는 랜덤 선택
    const selectedErrorType = errorType || Object.keys(errorScenarios)[Math.floor(Math.random() * Object.keys(errorScenarios).length)];
    const errorData = errorScenarios[selectedErrorType as keyof typeof errorScenarios];

    if (!errorData) {
      return NextResponse.json(
        { success: false, error: '지원하지 않는 오류 타입입니다.' },
        { status: 400 }
      );
    }

    // 익명 사용자 세션에 오류 기록
    const errorId = anonymousUserService.recordServiceError(
      session.sessionId,
      serviceId,
      {
        errorType: errorData.type,
        severity: 'critical',
        message: errorData.message,
        // 실제 결과를 못 받은 모든 경우 환불
      compensationRequired: ['content_delivery_failure', 'ai_service_error', 'gemini_api_error', 'json_parse_error'].includes(errorData.type),
        compensationAmount: ['content_delivery_failure', 'ai_service_error', 'gemini_api_error', 'json_parse_error'].includes(errorData.type) ? amount : undefined
      }
    );
    
    // AdminService에도 오류 로깅 (호환성 유지)
    await adminService.recordAnonymousUserError(
      session.sessionId,
      serviceId,
      errorData.type,
      errorData.message,
      paymentOrderId,
      errorData.serviceType
    );

    // 통계용 추가 정보 생성
    const errorStats = {
      errorType: errorData.type,
      severity: 'critical', // 대부분 심각한 오류로 분류
      // 실제 결과를 못 받은 모든 경우 환불
      compensationRequired: ['content_delivery_failure', 'ai_service_error', 'gemini_api_error', 'json_parse_error'].includes(errorData.type),
      estimatedCompensation: errorData.orderId ? calculateCompensation(errorData.serviceType) : 0,
      businessImpact: {
        customerSatisfactionRisk: 'HIGH',
        revenueImpact: calculateCompensation(errorData.serviceType),
        reputationRisk: ['content_delivery_failure', 'gemini_api_error', 'ai_service_error', 'json_parse_error'].includes(errorData.type) ? 'CRITICAL' : 'MEDIUM'
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        message: `${errorData.title} 오류가 시뮬레이션되었습니다.`,
        errorId: `ERR-${Date.now()}`,
        errorType: errorData.type,
        severity: errorStats.severity,
        compensationRequired: errorStats.compensationRequired,
        estimatedCompensation: errorStats.estimatedCompensation,
        businessImpact: errorStats.businessImpact,
        refundPolicy: {
          reason: errorStats.compensationRequired ? '서비스 결과 미전달' : '부분적 서비스 품질 문제',
          action: errorStats.compensationRequired ? '즉시 전액 환불' : '품질 개선 및 무료 재분석 제공'
        },
        testData: {
          sessionId: session.sessionId,
          userId: session.userId,
          orderId: paymentOrderId,
          paymentId,
          serviceType: errorData.serviceType,
          contactInfo: {
            method: contactInfo.preferredContact,
            phone: contactInfo.phone,
            email: contactInfo.email || 'N/A'
          },
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error simulation failed:', error);
    return NextResponse.json(
      { success: false, error: '오류 시뮬레이션 중 문제가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 여러 오류를 연속으로 시뮬레이션 (부하 테스트용)
 */
export async function PUT(request: NextRequest) {
  try {
    const { count = 5, interval = 1000 } = await request.json();
    
    const results = [];
    
    for (let i = 0; i < count; i++) {
      // 다양한 오류 타입을 순환하며 생성
      const errorTypes = [
        'payment_success_content_fail',
        'gemini_api_failure', 
        'json_parsing_error',
        'interview_analysis_crash',
        'prompt_quality_degraded'
      ];
      
      const selectedType = errorTypes[i % errorTypes.length];
      const orderId = `BATCH-TEST-${Date.now()}-${i + 1}`;
      
      // POST 메소드 로직 재사용
      const simulateResponse = await fetch(request.nextUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType: selectedType,
          orderId,
          serviceType: ['professional-physiognomy', 'mbti-face', 'face-saju', 'analyze-interview-face'][i % 4]
        })
      });
      
      const result = await simulateResponse.json();
      results.push(result);
      
      // 간격 조절 (마지막 요청 후에는 대기하지 않음)
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `${count}개의 오류가 성공적으로 시뮬레이션되었습니다.`,
        totalErrors: results.length,
        compensationRequired: results.filter(r => r.data?.compensationRequired).length,
        totalEstimatedCompensation: results.reduce((sum, r) => sum + (r.data?.estimatedCompensation || 0), 0),
        results: results
      },
      batchInfo: {
        startTime: new Date().toISOString(),
        interval: `${interval}ms`,
        count
      }
    });

  } catch (error) {
    console.error('Batch error simulation failed:', error);
    return NextResponse.json(
      { success: false, error: '배치 오류 시뮬레이션 중 문제가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 서비스별 보상 금액 계산
function calculateCompensation(serviceType: string): number {
  const servicePrices: { [key: string]: number } = {
    'professional-physiognomy': 2900,
    'mbti-face': 1900,
    'face-saju': 3900,
    'analyze-interview-face': 2400
  };
  
  return servicePrices[serviceType] || 2900;
}