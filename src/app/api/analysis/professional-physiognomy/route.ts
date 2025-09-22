/**
 * ⚠️ 중요 경고: 정통 관상 분석 API 수정 금지
 * 
 * 이 API는 사용자의 명시적 요청에 따라 완전히 잠금 상태입니다.
 * 특히 다음 사항들은 절대 수정하지 마세요:
 * - AI 분석 로직 및 API 호출
 * - 주제별 분석 및 비용 계산
 * - 파일 업로드 및 데이터 검증
 * - 주문 생성 및 상태 관리
 * 
 * 수정 필요시 반드시 사용자 승인 필요
 * 마지막 승인: 2025-01-11
 * 
 * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from "@/lib/ai-service-helper";
import { adminService } from '@/services/adminService';
import { orderService } from '@/services/orderService';
import type { APIResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const faceImage = formData.get('faceImage') as File;
    const age = formData.get('age') as string;
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

    if (!age) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_AGE',
          message: '나이 정보가 필요합니다.'
        }
      }, { status: 400 });
    }

    if (!selectedTopics || selectedTopics.length === 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_TOPICS',
          message: '분석 주제를 선택해주세요.'
        }
      }, { status: 400 });
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024;
    if (faceImage.size > maxSize) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: '파일 크기는 10MB를 초과할 수 없습니다.'
        }
      }, { status: 400 });
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(faceImage.type)) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'JPG, PNG, WEBP 파일만 지원됩니다.'
        }
      }, { status: 400 });
    }

    // 가격 계산: 종합 분석 9900원, 개별 분야 2개 선택시 6900원
    const FIELD_PRICES = {
      comprehensive: 9900,
      individual: 6900 // 개별 분야 총액 (개수 상관없이)
    };
    
    const totalAmount = selectedTopics.includes('comprehensive') 
      ? FIELD_PRICES.comprehensive
      : FIELD_PRICES.individual; // 개별 분야는 개수와 무관하게 6900원
    
    // 주문 생성 및 서비스 시작 추적
    const order = orderService.createOrder({
      orderId: orderId,
      userEmail: userEmail,
      serviceType: 'face-analysis',
      amount: totalAmount,
      paymentStatus: 'completed', // 실제로는 결제 완료 후 설정
      serviceStatus: 'in_progress'
    });

    const imageBuffer = Buffer.from(await faceImage.arrayBuffer());
    
    console.log('=== Professional Physiognomy API ===');
    console.log('Selected Topics:', selectedTopics);
    console.log('Is Comprehensive:', selectedTopics.includes('comprehensive'));
    console.log('Total Amount:', totalAmount);
    console.log('Image MIME Type:', faceImage.type);
    console.log('Image Size:', faceImage.size, 'bytes');

    // 1. 얼굴 특징 추출 (MIME 타입 정보와 함께 전달)
    const faceFeatures = await getAIService().analyzeFaceFeatures(imageBuffer, faceImage.type);
    
    // 2. 마의상법 기반 전문 관상 분석 (선택된 주제들 또는 종합분석)
    const topicsToAnalyze = selectedTopics.includes('comprehensive') 
      ? ['career', 'wealth', 'love', 'children', 'health', 'life', 'luck']
      : selectedTopics.map(topic => {
          // 전체 topic ID를 짧은 키로 매핑
          const topicMap: { [key: string]: string } = {
            'job': 'career',
            'business': 'career', 
            'wealth': 'wealth',
            'love': 'love',
            'children': 'children',
            'health': 'health',
            'life': 'life',
            'luck': 'luck'
          };
          return topicMap[topic] || topic;
        });
    
    console.log('Topics to analyze:', topicsToAnalyze);
    
    const professionalAnalysis = await getAIService().analyzeProfessionalPhysiognomy(faceFeatures, parseInt(age), topicsToAnalyze);
    
    // 분석 성공 시 주문 상태 업데이트
    orderService.updateOrderStatus(orderId, { serviceStatus: 'completed' });
    
    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: professionalAnalysis
    });

  } catch (error) {
    console.error('Professional Physiognomy Analysis API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // 오류 발생 시 주문 상태 업데이트 및 Admin 대시보드에 로깅
    try {
      const formData = await request.formData();
      const userEmail = formData.get('userEmail') as string || 'anonymous@unknown.com';
      const orderId = formData.get('orderId') as string || `ORDER-${Date.now()}`;
      const selectedTopicsStr = formData.get('selectedTopics') as string;
      const selectedTopics = selectedTopicsStr ? JSON.parse(selectedTopicsStr) : [];
      
      // 주문에 오류 로그 추가 및 실패 상태로 변경
      if (orderId) {
        orderService.addErrorLog(orderId, error instanceof Error ? error.message : '전문 관상 분석 중 오류 발생');
      }
      
      await adminService.logServiceError({
        title: '전문 관상 분석 오류',
        message: `ANALYSIS_FAILED: ${error instanceof Error ? error.message : '전문 관상 분석 중 오류가 발생했습니다.'}`,
        type: 'analysis_error',
        userEmail: userEmail,
        orderId: orderId,
        metadata: {
          apiEndpoint: '/api/analysis/professional-physiognomy',
          selectedTopics: selectedTopics,
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
        code: 'ANALYSIS_FAILED',
        message: error instanceof Error ? `전문 관상 분석 실패: ${error.message}` : '전문 관상 분석 중 오류가 발생했습니다.'
      }
    }, { status: 500 });
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