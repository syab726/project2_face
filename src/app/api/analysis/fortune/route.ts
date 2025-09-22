import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai-service-helper';
import type { APIResponse, FortuneAnalysis } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime, gender } = body;
    
    if (!birthDate) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_BIRTH_DATE',
          message: '생년월일이 필요합니다.'
        }
      }, { status: 400 });
    }

    // 생년월일 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: '생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)'
        }
      }, { status: 400 });
    }

    // 시간 형식 검증 (HH:MM, 선택사항)
    if (birthTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(birthTime)) {
        return NextResponse.json<APIResponse<null>>({
          success: false,
          error: {
            code: 'INVALID_TIME_FORMAT',
            message: '출생시간 형식이 올바르지 않습니다. (HH:MM)'
          }
        }, { status: 400 });
      }
    }

    console.log(`사주 분석 요청: 생년월일 ${birthDate}, 출생시간 ${birthTime || '미입력'}, 성별 ${gender}`);
    
    
    // 실제 AI 서비스를 통한 사주 분석
    const aiService = getAIService();
    const rawSajuResult = await aiService.analyzeSaju({
      birthDate,
      birthTime,
      gender
    });
    
    // FortuneAnalysis 타입으로 변환
    const fortuneAnalysis = aiService.convertToFortuneAnalysis(rawSajuResult);
    
    // 성공 응답
    return NextResponse.json<APIResponse<FortuneAnalysis>>({
      success: true,
      data: fortuneAnalysis
    });

  } catch (error) {
    console.error('Fortune Analysis API Error:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : '사주 분석 중 오류가 발생했습니다.'
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