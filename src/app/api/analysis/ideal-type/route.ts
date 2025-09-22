import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from "@/lib/ai-service-helper";
import type { APIResponse, IdealTypeResult, MBTIAnalysisResult } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { physiognomyResult, preferences } = body;

    if (!physiognomyResult) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_PHYSIOGNOMY_RESULT',
          message: '관상 분석 결과가 필요합니다.'
        }
      }, { status: 400 });
    }

    if (!preferences || !preferences.mbti) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_MBTI',
          message: 'MBTI 정보가 필요합니다.'
        }
      }, { status: 400 });
    }

    // 기본 선호도 설정
    const defaultPreferences = {
      gender: 'opposite', // 이성
      ageRange: '20-30',
      style: 'natural',
      mbti: 'ENFP', // 기본값
      ...preferences
    };

    console.log('=== 이상형 분석 API 호출 정보 ===');
    console.log('관상 분석 결과:', JSON.stringify(physiognomyResult, null, 2));
    console.log('사용자 선호도 (MBTI 포함):', JSON.stringify(defaultPreferences, null, 2));

    // AI 서비스로 이상형 분석 및 이미지 생성
    
    console.log('이상형 분석 및 이미지 생성 시작...');
    
    let idealTypeResult;
    let imageUrl = null;
    
    try {
      // 실제 이상형 분석 수행
      idealTypeResult = await getAIService().generateIdealType(physiognomyResult, defaultPreferences);
      
      // Gemini-2.0-Flash-Preview-Image-Generation로 이미지 생성 시도
      try {
        console.log('Gemini-2.0-Flash-Preview-Image-Generation 이미지 생성 시도...');
        const imageGenerationResult = await getAIService().generateIdealTypeImage(physiognomyResult, defaultPreferences);
        imageUrl = imageGenerationResult.imageUrl;
        console.log('Gemini 이미지 생성 성공, URL 길이:', imageUrl?.length);
      } catch (imageError) {
        console.warn('Gemini 이미지 생성 실패, 텍스트 설명만 제공:', imageError);
        imageUrl = null; // 이미지 생성 실패 시 null로 설정
      }
      
      // 이미지 URL을 결과에 추가
      idealTypeResult.imageUrl = imageUrl;
      
    } catch (error) {
      console.error('이상형 분석 실패:', error);
      
      // 더미데이터 대신 실패 에러를 반환
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'IDEAL_TYPE_ANALYSIS_FAILED',
          message: `이상형 분석에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        }
      }, { status: 500 });
    }

    // 최종 성공 응답
    return NextResponse.json<APIResponse<IdealTypeResult>>({
      success: true,
      data: idealTypeResult
    });

  } catch (error) {
    console.error('Ideal Type Generation API Error:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: error instanceof Error ? error.message : '이상형 생성 중 오류가 발생했습니다.'
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