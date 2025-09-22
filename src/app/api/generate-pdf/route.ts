import { NextRequest, NextResponse } from 'next/server';
import { PDFReportGenerator } from '@/lib/pdf-generator';
import type { APIResponse, ComprehensiveReport } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report } = body;

    if (!report) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_REPORT_DATA',
          message: '리포트 데이터가 필요합니다.'
        }
      }, { status: 400 });
    }

    // 필수 필드 검증
    if (!report.userId || !report.mbtiAnalysis) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_REPORT_DATA',
          message: '필수 리포트 데이터가 누락되었습니다.'
        }
      }, { status: 400 });
    }

    const pdfGenerator = new PDFReportGenerator();
    const pdfBytes = await pdfGenerator.generateComprehensiveReport(report as ComprehensiveReport);

    // PDF 바이너리를 base64로 인코딩하여 전송
    const base64PDF = Buffer.from(pdfBytes).toString('base64');

    return NextResponse.json<APIResponse<{ pdf: string; filename: string }>>({
      success: true,
      data: {
        pdf: base64PDF,
        filename: `얼굴분석리포트_${new Date().toISOString().split('T')[0]}.pdf`
      }
    });

  } catch (error) {
    console.error('PDF Generation API Error:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'PDF_GENERATION_FAILED',
        message: error instanceof Error ? error.message : 'PDF 생성 중 오류가 발생했습니다.'
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