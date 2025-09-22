import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from "@/lib/ai-service-helper";
import type { APIResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthData } = body;
    
    if (!birthData) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_BIRTH_DATA',
          message: '생년월일시 정보가 필요합니다.'
        }
      }, { status: 400 });
    }

    // 필수 필드 검증
    const requiredFields = ['year', 'month', 'day', 'hour', 'gender'];
    const missingFields = requiredFields.filter(field => !birthData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INCOMPLETE_BIRTH_DATA',
          message: `다음 필드가 필요합니다: ${missingFields.join(', ')}`
        }
      }, { status: 400 });
    }

    // 날짜 유효성 검증
    const { year, month, day, hour, gender } = birthData;
    
    if (year < 1900 || year > new Date().getFullYear()) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_YEAR',
          message: '올바른 년도를 입력해주세요 (1900년 이후).'
        }
      }, { status: 400 });
    }

    if (month < 1 || month > 12) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_MONTH',
          message: '올바른 월을 입력해주세요 (1-12).'
        }
      }, { status: 400 });
    }

    if (day < 1 || day > 31) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_DAY',
          message: '올바른 일을 입력해주세요 (1-31).'
        }
      }, { status: 400 });
    }

    if (hour < 0 || hour > 23) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_HOUR',
          message: '올바른 시간을 입력해주세요 (0-23).'
        }
      }, { status: 400 });
    }

    if (!['male', 'female'].includes(gender)) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_GENDER',
          message: '성별은 male 또는 female이어야 합니다.'
        }
      }, { status: 400 });
    }

    // AI 서비스로 사주 분석 (GPT-4o)
    
    console.log('GPT-4o 사주 분석 시작...', birthData);
    const sajuAnalysisResult = await getAIService().analyzeSaju({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      gender: gender as 'male' | 'female'
    });
    
    // 성공 응답
    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: {
        ...sajuAnalysisResult,
        inputData: birthData,
        processingInfo: {
          analysisEngine: 'GPT-4o',
          analysisType: '사주팔자',
          processingTime: Date.now()
        }
      }
    });

  } catch (error) {
    console.error('Saju Analysis API Error:', error);
    
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