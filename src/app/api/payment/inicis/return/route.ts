import { NextRequest, NextResponse } from 'next/server';
import inicisPaymentService from '@/services/inicisPaymentService';
import realMetricsStore from '@/services/realMetricsStore';
import type { InicisPaymentResult } from '@/services/inicisPaymentService';

export async function POST(request: NextRequest) {
  try {
    // POST 데이터 파싱 시도
    let paymentResult: InicisPaymentResult;
    let authToken: string | null = null;
    let authUrl: string | null = null;

    // Content-Type 확인
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // JSON 형식
      const jsonData = await request.json();
      console.log('📦 JSON 데이터 수신:', JSON.stringify(jsonData, null, 2));

      paymentResult = {
        resultCode: jsonData.P_RCODE || jsonData.resultCode,
        resultMsg: jsonData.P_RMESG || jsonData.resultMsg,
        tid: jsonData.P_TID || jsonData.tid,
        mid: jsonData.P_MID || jsonData.mid,
        oid: jsonData.P_OID || jsonData.oid,
        price: parseInt(jsonData.P_AMT || jsonData.price) || 0,
        CARD_Num: jsonData.P_CARD_NUM || jsonData.CARD_Num,
        applDate: jsonData.P_AUTH_DT || jsonData.applDate,
        applTime: jsonData.P_AUTH_TM || jsonData.applTime
      };

      authToken = jsonData.P_AUTH_TOKEN || jsonData.authToken;
      authUrl = jsonData.P_NEXT_URL || jsonData.authUrl;
    } else {
      // FormData 형식 (KG이니시스 표준 파라미터)
      const formData = await request.formData();
      const formDataObj: any = {};
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });
      console.log('📦 KG이니시스 표준 FormData 수신:', JSON.stringify(formDataObj, null, 2));

      paymentResult = {
        resultCode: formData.get('P_RCODE') as string || formData.get('resultCode') as string,
        resultMsg: formData.get('P_RMESG') as string || formData.get('resultMsg') as string,
        tid: formData.get('P_TID') as string || formData.get('tid') as string,
        mid: formData.get('P_MID') as string || formData.get('mid') as string,
        oid: formData.get('P_OID') as string || formData.get('oid') as string,
        price: parseInt(formData.get('P_AMT') as string || formData.get('price') as string) || 0,
        CARD_Num: formData.get('P_CARD_NUM') as string || formData.get('CARD_Num') as string,
        applDate: formData.get('P_AUTH_DT') as string || formData.get('applDate') as string,
        applTime: formData.get('P_AUTH_TM') as string || formData.get('applTime') as string
      };

      authToken = formData.get('P_AUTH_TOKEN') as string || formData.get('authToken') as string;
      authUrl = formData.get('P_NEXT_URL') as string || formData.get('authUrl') as string;
    }

    console.log('💳 KG이니시스 결제 결과 수신됨:', {
      P_RCODE: paymentResult.resultCode,
      P_OID: paymentResult.oid,
      P_AMT: paymentResult.price,
      P_TID: paymentResult.tid,
      P_AUTH_TOKEN: authToken ? '있음' : '없음'
    });

    // authToken이 있으면 승인 처리 필요

    if (authToken && authUrl) {
      // 인증 완료, 승인 요청 필요
      console.log('🔑 인증 토큰 수신, 승인 요청 시작');

      try {
        const approveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/inicis/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // KG이니시스 표준 파라미터로 전달
            P_AUTH_TOKEN: authToken,
            P_NEXT_URL: authUrl,
            P_MID: paymentResult.mid,
            P_OID: paymentResult.oid,
            P_AMT: paymentResult.price.toString(),
            P_TIMESTAMP: Date.now().toString(),
            // 레거시 지원을 위한 백워드 호환성
            authToken,
            authUrl,
            mid: paymentResult.mid,
            oid: paymentResult.oid,
            price: paymentResult.price,
            timestamp: Date.now().toString()
          })
        });

        const approveResult = await approveResponse.json();

        if (approveResult.success) {
          // 승인 성공
          paymentResult.resultCode = '0000';
          paymentResult.tid = approveResult.data.tid;
          paymentResult.price = approveResult.data.price;
        } else {
          // 승인 실패 - PostMessage로 처리
          const approvalFailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>결제 승인 실패</title>
    <style>
        body {
            font-family: 'Gowun Dodum', sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
        }
        .failure-icon { font-size: 60px; margin-bottom: 20px; }
        .message { font-size: 18px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="failure-icon">❌</div>
    <div class="message">결제 승인에 실패했습니다</div>

    <script>
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'PAYMENT_FAILED',
                    data: { message: '${approveResult.message}' }
                }, '*');
                setTimeout(() => window.close && window.close(), 3000);
            } else {
                window.close && window.close();
            }
        } catch (error) {
            window.location.href = '/gwansang?payment=error';
        }
    </script>
</body>
</html>`;
          return new NextResponse(approvalFailHtml, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
      } catch (error) {
        console.error('승인 요청 실패:', error);
        const approvalErrorHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>결제 승인 오류</title>
    <style>
        body {
            font-family: 'Gowun Dodum', sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
        }
        .error-icon { font-size: 60px; margin-bottom: 20px; }
        .message { font-size: 18px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="error-icon">⚠️</div>
    <div class="message">결제 승인 중 오류가 발생했습니다</div>

    <script>
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'PAYMENT_FAILED',
                    data: { message: '결제 승인 중 오류가 발생했습니다.' }
                }, '*');
                setTimeout(() => window.close && window.close(), 3000);
            } else {
                window.close && window.close();
            }
        } catch (error) {
            window.location.href = '/gwansang?payment=error';
        }
    </script>
</body>
</html>`;
        return new NextResponse(approvalErrorHtml, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    } else {
      // authToken이 없을 때 - 결제 결과 검증
      const isValid = inicisPaymentService.verifyPaymentResult(paymentResult);

      if (!isValid) {
          console.error('❌ 결제 결과 검증 실패');

          // 결제 실패 메트릭스 기록 (oid가 있을 때만)
          if (paymentResult.oid) {
            realMetricsStore.trackPaymentFailure(
              'system',
              extractServiceTypeFromOid(paymentResult.oid),
              '결제 검증 실패'
            );
          }

          const verificationFailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>결제 검증 실패</title>
    <style>
        body {
            font-family: 'Gowun Dodum', sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
        }
        .failure-icon { font-size: 60px; margin-bottom: 20px; }
        .message { font-size: 18px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="failure-icon">❌</div>
    <div class="message">결제 검증에 실패했습니다</div>

    <script>
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'PAYMENT_FAILED',
                    data: { message: '결제 검증에 실패했습니다.' }
                }, '*');
                setTimeout(() => window.close && window.close(), 3000);
            } else {
                window.close && window.close();
            }
        } catch (error) {
            window.location.href = '/gwansang?payment=error';
        }
    </script>
</body>
</html>`;

          return new NextResponse(verificationFailHtml, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
    }

    // 결제 성공 처리
    if (paymentResult.resultCode === '0000') {
      const serviceType = paymentResult.oid ? extractServiceTypeFromOid(paymentResult.oid) : 'unknown';
      
      // 결제 완료 메트릭스 기록
      realMetricsStore.trackPayment(
        paymentResult.oid,
        serviceType,
        paymentResult.price
      );

      console.log('✅ 결제 성공 처리 완료:', {
        tid: paymentResult.tid,
        oid: paymentResult.oid,
        amount: paymentResult.price
      });

      // 결제 성공을 부모 창에 알리는 HTML 페이지 반환
      const successHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>결제 완료</title>
    <style>
        body {
            font-family: 'Gowun Dodum', sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .success-icon { font-size: 60px; margin-bottom: 20px; }
        .message { font-size: 18px; margin-bottom: 10px; }
        .detail { font-size: 14px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="success-icon">✅</div>
    <div class="message">결제가 성공적으로 완료되었습니다!</div>
    <div class="detail">잠시 후 분석이 시작됩니다...</div>

    <script>
        try {
            console.log('🎯 결제 완료 페이지 로드됨');
            console.log('👥 window.parent:', window.parent);
            console.log('🏠 window:', window);
            console.log('🔗 window.parent !== window:', window.parent !== window);

            // 서비스 타입별 분석 페이지 맵핑
            const analysisPageMap = {
                'professional-physiognomy': '/gwansang/original',
                'mbti-face': '/gwansang/mbti',
                'fortune': '/fortune',
                'face-saju': '/gwansang/saju',
                'interview': '/gwansang/interview',
                'ideal-type': '/gwansang'
            };

            // OID에서 서비스 타입 추출
            const oid = '${paymentResult.oid}';
            const serviceTypeMatch = oid.match(/^([^_]+)_/);
            const serviceMap = {
                'PP': 'professional-physiognomy',
                'MF': 'mbti-face',
                'FT': 'fortune',
                'FS': 'face-saju',
                'IV': 'interview',
                'IT': 'ideal-type'
            };
            const serviceType = serviceTypeMatch ? serviceMap[serviceTypeMatch[1]] || 'ideal-type' : 'ideal-type';
            const analysisPage = analysisPageMap[serviceType] || '/gwansang';

            // 결제 정보로 쿼리 파라미터 생성
            const paymentParams = new URLSearchParams({
                payment: 'success',
                tid: '${paymentResult.tid}',
                oid: '${paymentResult.oid}',
                amount: '${paymentResult.price}',
                service: serviceType,
                autoStart: 'true'
            });

            console.log('🎯 분석 페이지:', analysisPage);
            console.log('🎯 서비스 타입:', serviceType);

            // 부모 창에 결제 성공 메시지 전송
            if (window.parent && window.parent !== window) {
                console.log('📤 PostMessage 전송 시작');
                const messageData = {
                    type: 'PAYMENT_SUCCESS',
                    data: {
                        tid: '${paymentResult.tid}',
                        oid: '${paymentResult.oid}',
                        amount: ${paymentResult.price},
                        cardNum: '${paymentResult.CARD_Num || ''}',
                        approvalDate: '${paymentResult.applDate || ''}',
                        approvalTime: '${paymentResult.applTime || ''}',
                        serviceType: serviceType,
                        analysisPage: analysisPage
                    }
                };
                console.log('📨 전송할 메시지:', messageData);

                window.parent.postMessage(messageData, '*');
                console.log('✅ PostMessage 전송 완료');

                // 5초 후에도 창이 닫히지 않으면 직접 분석 페이지로 이동
                setTimeout(() => {
                    console.log('⏰ 5초 타임아웃 - 직접 분석 페이지로 이동');
                    window.location.href = analysisPage + '?' + paymentParams.toString();
                }, 5000);

                // 3초 후 창 닫기 시도
                setTimeout(() => {
                    console.log('🚪 팝업 창 닫기 시도');
                    if (window.close) {
                        window.close();
                    }
                }, 3000);
            } else {
                console.log('⚠️ 팝업이 아닌 일반 페이지에서 열림 - 분석 페이지로 직접 이동');
                // 팝업이 아닌 경우 바로 분석 페이지로 리다이렉트
                setTimeout(() => {
                    window.location.href = analysisPage + '?' + paymentParams.toString();
                }, 2000);
            }
        } catch (error) {
            console.error('❌ PostMessage 전송 실패:', error);
            // 실패시 기본 분석 페이지로 이동
            setTimeout(() => {
                window.location.href = '/gwansang?payment=success&tid=${paymentResult.tid}&oid=${paymentResult.oid}&amount=${paymentResult.price}';
            }, 1000);
        }
    </script>
</body>
</html>`;

      return new NextResponse(successHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    } else {
      // 결제 실패 처리
      if (paymentResult.oid) {
        const serviceType = extractServiceTypeFromOid(paymentResult.oid);
        realMetricsStore.trackPaymentFailure(
          'system',
          serviceType,
          paymentResult.resultMsg || '결제 실패'
        );
      }

      console.log('❌ 결제 실패:', {
        resultCode: paymentResult.resultCode,
        resultMsg: paymentResult.resultMsg,
        oid: paymentResult.oid
      });

      // 결제 실패를 부모 창에 알리는 HTML 페이지 반환
      const failureHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>결제 실패</title>
    <style>
        body {
            font-family: 'Gowun Dodum', sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
        }
        .failure-icon { font-size: 60px; margin-bottom: 20px; }
        .message { font-size: 18px; margin-bottom: 10px; }
        .detail { font-size: 14px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="failure-icon">❌</div>
    <div class="message">결제에 실패했습니다</div>
    <div class="detail">${paymentResult.resultMsg || '알 수 없는 오류'}</div>

    <script>
        try {
            // 부모 창에 결제 실패 메시지 전송
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'PAYMENT_FAILED',
                    data: {
                        resultCode: '${paymentResult.resultCode}',
                        message: '${paymentResult.resultMsg || '결제에 실패했습니다.'}'
                    }
                }, '*');

                // 3초 후 창 닫기
                setTimeout(() => {
                    if (window.close) {
                        window.close();
                    }
                }, 3000);
            } else {
                // 팝업이 아닌 경우 결제 완료 정보와 함께 리다이렉트
                window.close && window.close();
            }
        } catch (error) {
            console.error('PostMessage 전송 실패:', error);
            // 실패시 결제 실패 정보와 함께 리다이렉트
            window.close && window.close();
        }
    </script>
</body>
</html>`;

      return new NextResponse(failureHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }

  } catch (error) {
    console.error('결제 결과 처리 오류:', error);

    // 처리 오류를 부모 창에 알리는 HTML 페이지 반환
    const errorHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>결제 처리 오류</title>
    <style>
        body {
            font-family: 'Gowun Dodum', sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
        }
        .error-icon { font-size: 60px; margin-bottom: 20px; }
        .message { font-size: 18px; margin-bottom: 10px; }
        .detail { font-size: 14px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="error-icon">⚠️</div>
    <div class="message">결제 처리 중 오류가 발생했습니다</div>
    <div class="detail">잠시 후 다시 시도해주세요</div>

    <script>
        try {
            // 부모 창에 처리 오류 메시지 전송
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'PAYMENT_FAILED',
                    data: {
                        message: '결제 처리 중 오류가 발생했습니다.'
                    }
                }, '*');

                // 3초 후 창 닫기
                setTimeout(() => {
                    if (window.close) {
                        window.close();
                    }
                }, 3000);
            } else {
                // 팝업이 아닌 경우 결제 완료 정보와 함께 리다이렉트
                window.close && window.close();
            }
        } catch (error) {
            console.error('PostMessage 전송 실패:', error);
            // 실패시 결제 실패 정보와 함께 리다이렉트
            window.close && window.close();
        }
    </script>
</body>
</html>`;

    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  }
}

/**
 * 주문번호에서 서비스 타입 추출
 */
function extractServiceTypeFromOid(oid: string): string {
  if (!oid) {
    return 'unknown';
  }

  const match = oid.match(/^([^_]+)_/);
  if (match) {
    const abbr = match[1];
    // 약어를 원래 서비스 타입으로 매핑
    const serviceTypeMap: { [key: string]: string } = {
      'PP': 'professional-physiognomy',
      'MF': 'mbti-face',
      'FT': 'fortune',
      'FS': 'face-saju',
      'IT': 'ideal-type'
    };

    return serviceTypeMap[abbr] || 'unknown';
  }
  return 'unknown';
}

// GET 요청도 처리 (일부 결제 결과는 GET으로 올 수 있음)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const paymentResult: InicisPaymentResult = {
      resultCode: searchParams.get('P_RCODE') || searchParams.get('resultCode') || '',
      resultMsg: searchParams.get('P_RMESG') || searchParams.get('resultMsg') || '',
      tid: searchParams.get('P_TID') || searchParams.get('tid') || '',
      mid: searchParams.get('P_MID') || searchParams.get('mid') || '',
      oid: searchParams.get('P_OID') || searchParams.get('oid') || '',
      price: parseInt(searchParams.get('P_AMT') || searchParams.get('price') || '0'),
      CARD_Num: searchParams.get('P_CARD_NUM') || searchParams.get('CARD_Num') || undefined,
      applDate: searchParams.get('P_AUTH_DT') || searchParams.get('applDate') || undefined,
      applTime: searchParams.get('P_AUTH_TM') || searchParams.get('applTime') || undefined
    };

    console.log('📦 KG이니시스 GET 파라미터 수신:', {
      P_RCODE: paymentResult.resultCode,
      P_OID: paymentResult.oid,
      P_AMT: paymentResult.price,
      P_TID: paymentResult.tid
    });

    // 결제 성공 처리
    if (paymentResult.resultCode === '0000') {
      const serviceType = paymentResult.oid ? extractServiceTypeFromOid(paymentResult.oid) : 'unknown';

      // 결제 완료 메트릭스 기록
      realMetricsStore.trackPayment(
        paymentResult.oid,
        serviceType,
        paymentResult.price
      );

      console.log('✅ KG이니시스 GET 결제 성공 처리 완료');

      // 결제 성공 HTML 반환
      const successHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>결제 완료</title>
    <style>
        body {
            font-family: 'Gowun Dodum', sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .success-icon { font-size: 60px; margin-bottom: 20px; }
        .message { font-size: 18px; margin-bottom: 10px; }
        .detail { font-size: 14px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="success-icon">✅</div>
    <div class="message">결제가 성공적으로 완료되었습니다!</div>
    <div class="detail">잠시 후 분석이 시작됩니다...</div>

    <script>
        try {
            console.log('🎯 GET 결제 완료 페이지 로드됨');

            if (window.parent && window.parent !== window) {
                const messageData = {
                    type: 'PAYMENT_SUCCESS',
                    data: {
                        tid: '${paymentResult.tid}',
                        oid: '${paymentResult.oid}',
                        amount: ${paymentResult.price},
                        cardNum: '${paymentResult.CARD_Num || ''}',
                        approvalDate: '${paymentResult.applDate || ''}',
                        approvalTime: '${paymentResult.applTime || ''}'
                    }
                };

                window.parent.postMessage(messageData, '*');

                setTimeout(() => {
                    if (window.close) {
                        window.close();
                    }
                }, 3000);
            } else {
                setTimeout(() => {
                    if (window.close) {
                        window.close();
                    } else {
                        // 창 닫기가 안 되면 성공 페이지로 리다이렉트
                        window.location.href = '/payment/success?tid=${paymentResult.tid}&oid=${paymentResult.oid}&amount=${paymentResult.price}';
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('❌ GET PostMessage 전송 실패:', error);
            setTimeout(() => {
                window.close && window.close();
            }, 1000);
        }
    </script>
</body>
</html>`;

      return new NextResponse(successHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    } else {
      // 결제 실패 처리
      console.log('❌ GET 결제 실패:', paymentResult.resultMsg);

      const failureHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>결제 실패</title>
    <style>
        body {
            font-family: 'Gowun Dodum', sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
        }
        .failure-icon { font-size: 60px; margin-bottom: 20px; }
        .message { font-size: 18px; margin-bottom: 10px; }
        .detail { font-size: 14px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="failure-icon">❌</div>
    <div class="message">결제에 실패했습니다</div>
    <div class="detail">${paymentResult.resultMsg || '알 수 없는 오류'}</div>

    <script>
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'PAYMENT_FAILED',
                    data: {
                        resultCode: '${paymentResult.resultCode}',
                        message: '${paymentResult.resultMsg || '결제에 실패했습니다.'}'
                    }
                }, '*');

                setTimeout(() => {
                    if (window.close) {
                        window.close();
                    }
                }, 3000);
            } else {
                window.close && window.close();
            }
        } catch (error) {
            window.close && window.close();
        }
    </script>
</body>
</html>`;

      return new NextResponse(failureHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }
  } catch (error) {
    console.error('GET 결제 결과 처리 오류:', error);

    return new NextResponse(`
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>오류</title></head>
<body>
    <script>
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'PAYMENT_FAILED',
                data: { message: '결제 처리 중 오류가 발생했습니다.' }
            }, '*');
        }
        setTimeout(() => { window.close && window.close(); }, 1000);
    </script>
</body>
</html>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}