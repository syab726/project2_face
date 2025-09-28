import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { ShortsGenerator } from '@/lib/shortsGenerator';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const celebrityName = formData.get('celebrityName') as string;
    const imageFile = formData.get('image') as File;

    if (!celebrityName || !imageFile) {
      return NextResponse.json(
        { error: '유명인 이름과 이미지가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`🎬 ${celebrityName} 쇼츠 생성 요청 받음`);

    // 업로드 디렉터리 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'shorts');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 이미지 파일 저장
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const imageFileName = `${Date.now()}_${imageFile.name}`;
    const imagePath = path.join(uploadDir, imageFileName);
    await writeFile(imagePath, imageBuffer);

    // 쇼츠 생성기 초기화
    const generator = new ShortsGenerator(path.join(uploadDir, 'temp'));

    // 쇼츠 생성
    const result = await generator.generateShorts({
      celebrityName,
      imagePath,
      outputDir: uploadDir
    });

    if (result.success && result.videoPath) {
      // 생성된 영상의 공개 URL 생성
      const publicVideoPath = result.videoPath.replace(
        path.join(process.cwd(), 'public'),
        ''
      ).replace(/\\/g, '/');

      return NextResponse.json({
        success: true,
        message: '쇼츠가 성공적으로 생성되었습니다!',
        data: {
          celebrityName,
          videoUrl: publicVideoPath,
          duration: result.duration,
          downloadUrl: publicVideoPath
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '쇼츠 생성에 실패했습니다.'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('쇼츠 생성 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// 쇼츠 생성 상태 확인 (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shortsId = searchParams.get('id');

    if (!shortsId) {
      return NextResponse.json(
        { error: '쇼츠 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에서 상태 조회
    // 현재는 간단한 응답만 반환
    return NextResponse.json({
      success: true,
      data: {
        id: shortsId,
        status: 'completed',
        progress: 100
      }
    });

  } catch (error) {
    console.error('쇼츠 상태 확인 오류:', error);
    return NextResponse.json(
      { success: false, error: '상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}