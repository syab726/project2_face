import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from "@/lib/ai-service-helper";
import { adminService } from '@/services/adminService';
import { orderService } from '@/services/orderService';
import type { APIResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const faceImage = formData.get('faceImage') as File;
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

    // 주문 생성 및 서비스 시작 추적
    const order = orderService.createOrder({
      orderId: orderId,
      userEmail: userEmail,
      serviceType: 'face-analysis',
      amount: 0, // 기본 얼굴 분석은 무료
      paymentStatus: 'completed',
      serviceStatus: 'in_progress'
    });

    // AI 서비스로 얼굴 분석 (Gemini + Fine-tuned GPT)
    const imageBuffer = Buffer.from(await faceImage.arrayBuffer());
    
    console.log('Gemini 얼굴 특징 추출 시작...');
    const faceFeatures = await getAIService().analyzeFaceFeatures(imageBuffer);
    
    console.log('Fine-tuned GPT 관상 분석 시작...');
    const faceAnalysisResult = await getAIService().analyzeFaceReading(faceFeatures);
    
    // 분석 성공 시 주문 상태 업데이트
    orderService.updateOrderStatus(orderId, { serviceStatus: 'completed' });
    
    // 성공 응답
    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: {
        ...faceAnalysisResult,
        detectedFeatures: faceFeatures,
        processingInfo: {
          imageRecognition: 'Gemini 2.0 Flash',
          fortuneAnalysis: 'Fine-tuned GPT-4.1-nano',
          processingTime: Date.now()
        }
      }
    });

  } catch (error) {
    console.error('Face Analysis API Error:', error);
    
    // 오류 발생 시 주문 상태 업데이트 및 Admin 대시보드에 로깅
    try {
      const formData = await request.formData();
      const userEmail = formData.get('userEmail') as string || 'anonymous@unknown.com';
      const orderId = formData.get('orderId') as string || `ORDER-${Date.now()}`;
      
      // 주문에 오류 로그 추가 및 실패 상태로 변경
      if (orderId) {
        orderService.addErrorLog(orderId, error instanceof Error ? error.message : '얼굴 분석 중 오류 발생');
      }
      
      await adminService.logServiceError({
        title: '얼굴 분석 오류',
        message: `ANALYSIS_FAILED: ${error instanceof Error ? error.message : '얼굴 분석 중 오류가 발생했습니다.'}`,
        type: 'analysis_error',
        userEmail: userEmail,
        orderId: orderId,
        metadata: {
          apiEndpoint: '/api/analysis/face',
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
        message: error instanceof Error ? error.message : '얼굴 분석 중 오류가 발생했습니다.'
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