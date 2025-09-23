
Build Error
Failed to compile

Next.js (14.2.0) is outdated (learn more)
./src/app/api/payment/inicis/return/route.ts
Error: 
  x Expected a semicolon
     ,-[/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face/src/app/api/payment/inicis/return/route.ts:250:1]
 250 |     }
 251 | 
 252 |     // 결제 성공 처리
 253 |     if (paymentResult.resultCode === '0000') {
     :     ^
 254 |       const serviceType = paymentResult.oid ? extractServiceTypeFromOid(paymentResult.oid) : 'unknown';
 255 |       
 256 |       // 결제 완료 메트릭스 기록
     `----

  x Expected a semicolon
     ,-[/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face/src/app/api/payment/inicis/return/route.ts:474:1]
 474 |       });
 475 |     }
 476 | 
 477 |   } catch (error) {
     :     ^^^^^
 478 |     console.error('결제 결과 처리 오류:', error);
 479 | 
 480 |     // 처리 오류를 부모 창에 알리는 HTML 페이지 반환
     `----

  x Return statement is not allowed here
     ,-[/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face/src/app/api/payment/inicis/return/route.ts:532:1]
 532 |     </body>
 533 |     </html>`;
 534 |     
 535 | ,->     return new NextResponse(errorHtml, {
 536 | |         status: 500,
 537 | |         headers: {
 538 | |           'Content-Type': 'text/html; charset=utf-8'
 539 | |         }
 540 | `->     });
 541 |       }
 542 |     }
     `----

  x Expression expected
     ,-[/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face/src/app/api/payment/inicis/return/route.ts:539:1]
 539 |       }
 540 |     });
 541 |   }
 542 | }
     : ^
 543 | 
 544 | /**
 545 |  * 주문번호에서 서비스 타입 추출
     `----

Caused by:
    Syntax Error
This error occurred during the build process and can only be dismissed by fixing the error.



1. 초기 개발 환경 설정
우선, KG이니시스 결제 연동을 위한 개발 환경을 설정해야 합니다.

SDK/라이브러리 다운로드: 매뉴얼에 명시된 KG이니시스 제공 SDK(소프트웨어 개발 키트) 또는 라이브러리를 다운로드합니다. 이 라이브러리에는 결제 요청에 필요한 함수와 보안 관련 로직이 포함되어 있습니다.

상점 아이디(MID)와 키 발급: KG이니시스에 가입하여 상점 아이디(MID)와 결제 승인에 필요한 키(Key)를 발급받습니다. 이 정보는 결제 요청의 유효성을 검증하는 데 사용됩니다.

2. 결제 요청 페이지 구현 (프론트엔드)
사용자가 결제하기 버튼을 누르면 KG이니시스 결제창이 열리도록 프론트엔드 페이지를 구현해야 합니다.

결제 요청 데이터 생성: 상품 정보, 가격, 주문번호(OID), 구매자 정보 등 결제에 필요한 데이터를 HTML 폼 또는 JavaScript 객체로 만듭니다. 이 데이터는 결제 요청 시 백엔드로 전달됩니다.

결제창 호출: KG이니시스에서 제공하는 JavaScript 함수(INIStdPay.pay())를 사용하여 결제창을 띄웁니다. 이 함수는 위에서 준비한 결제 데이터를 매개변수로 받습니다.

결제창 호출 데이터 구성: 매뉴얼에 나와 있는 대로 P_MID, P_AMT, P_OID 등 필수 파라미터를 정확히 설정해야 합니다. **주문번호(OID)**는 반드시 고유해야 하며, P_HPPURL은 결제 승인 후 결과를 받을 백엔드 URL을 지정합니다.

3. 결제 승인 및 결과 처리 (백엔드)
프론트엔드에서 결제창 호출 후 사용자가 결제를 완료하면, KG이니시스 서버는 설정된 백엔드 URL로 결제 결과를 전달합니다.

결제 결과 수신: KG이니시스에서 보낸 결제 결과를 받을 백엔드 엔드포인트(URL)를 구현합니다. 이 엔드포인트는 POST 방식으로 데이터를 수신합니다.

결제 데이터 검증: 수신된 데이터에 P_TID(거래 아이디)와 P_AUTH_TOKEN(결제 승인 토큰)이 포함되어 있는지 확인합니다. 이것은 결제가 성공했음을 의미합니다.

결제 승인 요청: 수신한 P_TID와 P_AUTH_TOKEN을 이용하여 KG이니시스 서버에 최종 결제 승인을 요청합니다. 이 과정은 서버 간의 통신이므로 보안이 매우 중요합니다. KG이니시스 SDK를 사용하여 INIStdPayRequest 클래스 등을 활용해 요청을 보냅니다.

DB 업데이트: 최종 승인 결과가 SUCCESS로 반환되면, 데이터베이스에 해당 주문의 결제 상태를 '결제 완료'로 변경합니다. 이 단계가 성공해야만 사용자의 주문이 최종적으로 확정됩니다.

4. 결제 실패 및 예외 처리
결제 과정 중 발생할 수 있는 오류를 처리하는 것도 중요합니다.

결제 실패 알림: 결제 승인 요청이 실패하거나 사용자가 결제를 중단하면 KG이니시스는 P_RMESG(실패 메시지)를 함께 전달합니다. 이 정보를 사용자에게 보여주어 다시 결제를 시도하도록 안내해야 합니다.

데이터 일치 여부 확인: 결제 승인 전, 요청 시점의 주문번호(OID), 가격(P_AMT) 등이 결제 완료 후 받은 데이터와 일치하는지 반드시 검증해야 합니다. 이는 해킹 시도를 방지하는 중요한 보안 절차입니다.

중복 결제 방지: 하나의 주문번호(OID)로 여러 번 결제가 시도되지 않도록 백엔드 로직에서 관리해야 합니다.

5. 결제 취소/환불 기능 구현
결제 후 환불이 필요한 경우를 대비해 취소 기능을 구현해야 합니다.

부분/전체 취소: KG이니시스 SDK를 이용하여 결제 취소 API를 호출합니다. 이 때 P_TID와 취소 금액 등 필수 정보를 함께 보냅니다.

환불 처리: 취소 요청이 성공하면 데이터베이스에 해당 주문의 상태를 '환불 완료'로 업데이트해야 합니다.

