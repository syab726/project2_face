/**
 * ⚠️ 중요 경고: 관상+사주 분석 API 수정 금지
 * 
 * 이 API는 사용자의 명시적 요청에 따라 완전히 잠금 상태입니다.
 * 특히 다음 사항들은 절대 수정하지 마세요:
 * - AI 분석 로직 및 API 호출
 * - 타임아웃 처리 및 에러 핸들링
 * - 파일 업로드 및 데이터 검증
 * - 주문 생성 및 상태 관리
 * 
 * 수정 필요시 반드시 사용자 승인 필요
 * 마지막 승인: 2025-01-11
 * 
 * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai-service-helper';
import { adminService } from '@/services/adminService';
import { orderService } from '@/services/orderService';
import type { APIResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  // 타임아웃 설정 (300초 - 더 여유롭게 설정)
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), 300000)
  );

  try {
    // Promise.race로 타임아웃 처리
    const result = await Promise.race([
      (async () => {
    const formData = await request.formData();
    const faceImage = formData.get('faceImage') as File;
    const age = formData.get('age') as string;
    const birthDataStr = formData.get('birthData') as string;
    const selectedTopicsStr = formData.get('selectedTopics') as string;
    const selectedTopics: string[] = selectedTopicsStr ? JSON.parse(selectedTopicsStr) : [];
    const userEmail = formData.get('userEmail') as string || 'anonymous@unknown.com';
    const orderId = formData.get('orderId') as string || `ORDER-${Date.now()}`;

    if (!faceImage) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_FACE_IMAGE',
          message: '얼굴 이미지가 필요합니다.'
        }
      }, { status: 400 });
    }

    if (!birthDataStr) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_BIRTH_DATA',
          message: '사주 정보가 필요합니다.'
        }
      }, { status: 400 });
    }

    const birthData = JSON.parse(birthDataStr);
    
    // 생년월일 검증
    if (!birthData.year || !birthData.month || !birthData.day || !birthData.hour || !birthData.gender) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_BIRTH_DATA',
          message: '생년월일, 시간, 성별 정보가 모두 필요합니다.'
        }
      }, { status: 400 });
    }

    console.log(`관상+사주 주제별 분석 요청: 나이 ${age}, 생년월일 ${birthData.year}-${birthData.month}-${birthData.day}`);
    console.log('선택된 주제들:', selectedTopics);
    if (!selectedTopics || selectedTopics.length === 0) {
      console.error('❌ 선택된 주제가 없습니다!');
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_TOPICS',
          message: '분석을 위한 주제가 선택되지 않았습니다.'
        }
      }, { status: 400 });
    }

    // 가격 계산: 종합 분석 19900원, 개별 분야 2개 선택시 6900원
    const FIELD_PRICES = {
      comprehensive: 19900,
      individual: 6900 // 개별 분야 총액 (개수 상관없이)
    };
    
    const totalAmount = selectedTopics.includes('comprehensive') 
      ? FIELD_PRICES.comprehensive
      : FIELD_PRICES.individual; // 개별 분야는 개수와 무관하게 6900원
    
    // 주문 생성 및 서비스 시작 추적
    const order = orderService.createOrder({
      orderId: orderId,
      userEmail: userEmail,
      serviceType: 'face-saju',
      amount: totalAmount,
      paymentStatus: 'completed', // 실제로는 결제 완료 후 설정
      serviceStatus: 'in_progress'
    });

    // 얼굴 이미지를 Buffer로 변환
    const imageBuffer = Buffer.from(await faceImage.arrayBuffer());

    // AI 서비스를 통한 관상+사주 통합 분석
    const analysisResult = await getAIService().performCompleteAnalysis({
      faceImage: imageBuffer,
      birthData: {
        year: parseInt(birthData.year),
        month: parseInt(birthData.month),
        day: parseInt(birthData.day),
        hour: parseInt(birthData.hour),
        gender: birthData.gender as 'male' | 'female'
      },
      analysisType: selectedTopics.includes('comprehensive') ? 'comprehensive' : 'selective',
      selectedTopics: selectedTopics
    });

    // performCompleteAnalysis가 이미 success/data 구조로 반환하므로, data 부분만 사용
    if (analysisResult.success) {
      // 분석 성공 시 주문 상태 업데이트
      orderService.updateOrderStatus(orderId, { serviceStatus: 'completed' });
      
      return NextResponse.json<APIResponse<any>>({
        success: true,
        data: analysisResult.data
      });
    } else {
      // 분석 실패 시 주문에 오류 로그 추가
      orderService.addErrorLog(orderId, analysisResult.error || '관상+사주 분석 중 오류 발생');
      
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: analysisResult.error || '분석 중 오류가 발생했습니다.'
        }
      }, { status: 500 });
    }
      })(),
      timeout
    ]);

    return result as NextResponse;
  } catch (error) {
    console.error('Face-Saju Analysis API Error:', error);
    
    const errorMessage = error instanceof Error && error.message === 'Request timeout' 
      ? '분석 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
      : error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.';
    
    const errorCode = error instanceof Error && error.message === 'Request timeout' ? 'TIMEOUT' : 'ANALYSIS_FAILED';
    
    // 오류 발생 시 주문 상태 업데이트 및 Admin 대시보드에 로깅
    try {
      const formData = await request.formData();
      const userEmail = formData.get('userEmail') as string || 'anonymous@unknown.com';
      const orderId = formData.get('orderId') as string || `ORDER-${Date.now()}`;
      
      // 주문에 오류 로그 추가 및 실패 상태로 변경
      if (orderId) {
        orderService.addErrorLog(orderId, errorMessage);
      }
      
      await adminService.logServiceError({
        title: '관상+사주 분석 오류',
        message: `${errorCode}: ${errorMessage}`,
        type: errorCode === 'TIMEOUT' ? 'system_error' : 'analysis_error',
        userEmail: userEmail,
        orderId: orderId,
        metadata: {
          apiEndpoint: '/api/analysis/face-saju',
          errorStack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        }
      });
    } catch (loggingError) {
      console.error('오류 로깅 실패:', loggingError);
    }
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      }
    }, { status: error instanceof Error && error.message === 'Request timeout' ? 408 : 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}