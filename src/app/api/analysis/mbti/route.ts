import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai-service-helper';
import type { APIResponse, MBTIAnalysisResult } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_IMAGE',
          message: '이미지 파일이 필요합니다.'
        }
      }, { status: 400 });
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
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
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'JPG, PNG, WEBP 파일만 지원됩니다.'
        }
      }, { status: 400 });
    }

    
    // 1단계: 얼굴 특징 추출 (Gemini Vision)
    const faceFeatures = await getAIService().extractFaceFeatures(imageFile);
    
    // 2단계: MBTI 분석 (GPT)
    const mbtiResult = await getAIService().analyzeMBTI(faceFeatures);
    
    // 성공 응답
    return NextResponse.json<APIResponse<MBTIAnalysisResult>>({
      success: true,
      data: mbtiResult
    });

  } catch (error) {
    console.error('MBTI Analysis API Error:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.'
      }
    }, { status: 500 });
  }
}

// OPTIONS 메서드 처리 (CORS)
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