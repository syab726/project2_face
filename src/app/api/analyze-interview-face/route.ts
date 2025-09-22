import { NextRequest, NextResponse } from 'next/server';
import { analyzeInterviewFace } from '@/lib/ai-services';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const gender = formData.get('gender') as string;
    const age = formData.get('age') as string;
    const jobField = formData.get('jobField') as string;

    if (!imageFile) {
      return NextResponse.json({
        success: false,
        message: '이미지가 업로드되지 않았습니다.'
      }, { status: 400 });
    }

    if (!gender || !age || !jobField) {
      return NextResponse.json({
        success: false,
        message: '모든 정보를 입력해주세요.'
      }, { status: 400 });
    }

    // 이미지를 base64로 변환
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

    console.log('=== 면접 관상 분석 요청 ===');
    console.log('성별:', gender);
    console.log('나이:', age);
    console.log('희망 직군:', jobField);
    console.log('이미지 크기:', buffer.length);

    // AI 서비스를 통한 면접 관상 분석
    const analysisResult = await analyzeInterviewFace(base64Image, {
      gender,
      age: parseInt(age),
      jobField
    });

    console.log('=== 면접 관상 분석 완료 ===');
    console.log('분석 결과:', analysisResult);

    return NextResponse.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('면접 관상 분석 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : '면접 관상 분석 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}