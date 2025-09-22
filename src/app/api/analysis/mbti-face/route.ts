/**
 * ⚠️ 중요 경고: MBTI+관상 API 라우트 수정 금지
 * 
 * 이 API는 사용자의 명시적 요청에 따라 잠금 상태입니다.
 * 특히 오류 처리나 폴백 로직 추가 금지
 * - AI 분석 실패시 더미 데이터 반환 금지
 * - 오류는 그대로 클라이언트에 전달
 * - 실제 AI 분석만 수행
 * 
 * 수정 필요시 반드시 사용자 승인 필요
 * 마지막 승인: 2025-01-11
 * 
 * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai-service-helper';
import type { APIResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const faceImage = formData.get('faceImage') as File;
    const mbtiType = formData.get('mbtiType') as string;
    const age = formData.get('age') as string;
    
    if (!faceImage || !mbtiType) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_DATA',
          message: '얼굴 이미지와 MBTI 타입이 필요합니다.'
        }
      }, { status: 400 });
    }

    console.log(`MBTI+관상 분석 요청: ${mbtiType} 타입, 나이 ${age || '미입력'}`);
    
    // 얼굴 이미지를 Buffer로 변환
    const imageBuffer = Buffer.from(await faceImage.arrayBuffer());
    
    // AI 서비스를 통한 MBTI+관상 융합 분석
    const analysisResult = await getAIService().analyzeMBTIFace(
      imageBuffer,
      mbtiType,
      age || '25'
    );
    
    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('MBTI-Face API Error:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.'
      }
    }, { status: 500 });
  }
}