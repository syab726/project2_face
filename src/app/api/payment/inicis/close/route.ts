import { NextRequest, NextResponse } from 'next/server';
import inicisPaymentService from '@/services/inicisPaymentService';
import realMetricsStore from '@/services/realMetricsStore';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 결제창에서 전달받은 파라미터들
    const closeData = {
      resultCode: formData.get('resultCode') as string,
      resultMsg: formData.get('resultMsg') as string,
      oid: formData.get('oid') as string,
      closeUrl: formData.get('closeUrl') as string
    };

    console.log('🔴 결제창 닫힘/취소됨:', {
      resultCode: closeData.resultCode,
      resultMsg: closeData.resultMsg,
      oid: closeData.oid
    });

    // 결제 취소/중단 메트릭스 기록
    if (closeData.oid) {
      const serviceType = extractServiceTypeFromOid(closeData.oid);
      
      realMetricsStore.trackPaymentFailure(
        'user',
        serviceType,
        '사용자 결제 취소'
      );
    }

    // 결제 취소 페이지로 리다이렉트
    const cancelUrl = `/payment/cancel?reason=${encodeURIComponent('결제가 취소되었습니다.')}&oid=${closeData.oid}`;
    
    return NextResponse.json({
      success: false,
      message: '결제가 취소되었습니다.',
      redirectUrl: cancelUrl,
      closeData: {
        resultCode: closeData.resultCode,
        resultMsg: closeData.resultMsg,
        oid: closeData.oid
      }
    });

  } catch (error) {
    console.error('결제창 닫힘 처리 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '결제 취소 처리 중 오류가 발생했습니다.',
      redirectUrl: '/payment/cancel?reason=close_processing_error'
    }, { status: 500 });
  }
}

/**
 * GET 요청도 처리 (일부 결제 취소는 GET으로 올 수 있음)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const closeData = {
    resultCode: searchParams.get('resultCode') || '',
    resultMsg: searchParams.get('resultMsg') || '',
    oid: searchParams.get('oid') || '',
    closeUrl: searchParams.get('closeUrl') || ''
  };

  console.log('🔴 결제창 닫힘 (GET):', closeData);

  // 결제 취소 메트릭스 기록
  if (closeData.oid) {
    const serviceType = extractServiceTypeFromOid(closeData.oid);
    
    realMetricsStore.trackPaymentFailure(
      'user',
      serviceType,
      '사용자 결제 취소 (GET)'
    );
  }

  // HTML 응답으로 창 닫기 스크립트 반환
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>결제 취소</title>
      <meta charset="utf-8">
    </head>
    <body>
      <script>
        try {
          // 부모창에 결과 전달
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'PAYMENT_CANCELLED',
              data: {
                resultCode: '${closeData.resultCode}',
                resultMsg: '${closeData.resultMsg}',
                oid: '${closeData.oid}'
              }
            }, '*');
          }
          
          // 창 닫기
          window.close();
          
          // 창이 닫히지 않은 경우 리다이렉트
          setTimeout(() => {
            location.href = '/payment/cancel?reason=${encodeURIComponent('결제가 취소되었습니다.')}&oid=${closeData.oid}';
          }, 1000);
        } catch (e) {
          console.error('결제 취소 처리 오류:', e);
          location.href = '/payment/cancel?reason=close_error';
        }
      </script>
      
      <div style="text-align: center; margin-top: 50px;">
        <h3>결제가 취소되었습니다.</h3>
        <p>잠시 후 페이지가 이동됩니다...</p>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

/**
 * 주문번호에서 서비스 타입 추출
 */
function extractServiceTypeFromOid(oid: string): string {
  const match = oid.match(/^([^_]+)_/);
  if (match) {
    return match[1].toLowerCase().replace('-', '_');
  }
  return 'unknown';
}