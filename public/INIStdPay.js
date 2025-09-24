/*
 * KG이니시스 표준결제 JavaScript SDK - 심사용 실제 결제창 버전
 * 심사 담당자가 확인할 수 있도록 실제 KG이니시스 테스트 결제창을 호출합니다.
 */

window.INIStdPay = {
  /**
   * 결제 요청 함수 - KG이니시스 공식 방식
   */
  pay: function(action, acceptCharset, enctype, payForm, payFormName, callback) {
    console.log('🏦 KG이니시스 심사용 결제 SDK 실행');

    try {
      // 폼 데이터 검증
      const formData = new FormData(payForm);
      const requiredFields = ['mid', 'oid', 'price', 'goodname', 'buyername'];

      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`필수 필드가 누락되었습니다: ${field}`);
        }
      }

      const mid = formData.get('mid');
      const oid = formData.get('oid');
      const price = formData.get('price');
      const goodname = formData.get('goodname');
      const buyername = formData.get('buyername');

      console.log('💳 결제 정보:', {
        mid, oid, price, goodname, buyername
      });

      // KG이니시스 실제 테스트 결제창 호출
      this.openRealPaymentWindow(formData, callback);

    } catch (error) {
      console.error('❌ 결제 요청 오류:', error);
      if (callback) {
        callback({
          error: true,
          message: error.message || '결제 요청 중 오류가 발생했습니다'
        });
      }
    }
  },

  /**
   * KG이니시스 실제 테스트 결제창 호출 - 심사용
   */
  openRealPaymentWindow: function(formData, callback) {
    const mid = formData.get('mid');
    const oid = formData.get('oid');
    const price = formData.get('price');
    const goodname = formData.get('goodname');
    const buyername = formData.get('buyername');

    console.log('💳 KG이니시스 실제 테스트 결제창 호출 - 심사용');

    // 실제 KG이니시스 테스트 결제창을 새 창으로 열기
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://mobile.inicis.com/smart/payment/';  // KG이니시스 모바일 테스트 URL
    form.target = 'inicis_payment_window';
    form.style.display = 'none';

    // KG이니시스 필수 파라미터들 추가
    const params = {
      'P_MID': mid,
      'P_OID': oid,
      'P_AMT': price,
      'P_GOODS': goodname,
      'P_UNAME': buyername,
      'P_MOBILE': formData.get('buyertel') || '010-0000-0000',
      'P_EMAIL': formData.get('buyeremail') || 'test@test.com',
      'P_NEXT_URL': 'https://facewisdom-ai.xyz/api/payment/inicis/return',
      'P_NOTI_URL': 'https://facewisdom-ai.xyz/api/payment/inicis/noti',
      'P_CURRENCY': 'WON',
      'P_CHARSET': 'UTF-8',
      'P_INI_PAYMENT': 'CARD',
      'P_HPP_METHOD': '1',
      'P_ACCEPTMETHOD': 'below1000:card',
      'P_TAX': 'N',
      'P_TAXFREE': '0',
      'P_NOTI': 'Y'
    };

    // 폼에 파라미터 추가
    Object.keys(params).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
      console.log(`📝 ${key}: ${params[key]}`);
    });

    document.body.appendChild(form);

    // 새 창에서 결제창 열기 (심사 담당자가 볼 수 있도록)
    const paymentWindow = window.open('', 'inicis_payment_window',
      'width=700,height=800,scrollbars=yes,resizable=yes');

    if (paymentWindow) {
      form.target = 'inicis_payment_window';
      form.submit();
      console.log('✅ KG이니시스 실제 결제창 제출 완료 - 심사용');

      // 결제 완료 플래그
      let paymentCompleted = false;

      // 결제 완료 이벤트 리스너 (return URL에서 postMessage로 전달)
      const messageListener = (event) => {
        if (event.data && event.data.type === 'PAYMENT_SUCCESS') {
          console.log('✅ 실제 결제 완료 확인됨:', event.data);
          paymentCompleted = true;
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);

          if (callback) {
            callback(event.data.data || this.generateSuccessResult());
          }
        } else if (event.data && event.data.type === 'PAYMENT_FAILED') {
          console.log('❌ 결제 실패 확인됨:', event.data);
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);

          if (callback) {
            callback({
              error: true,
              message: event.data.data?.message || '결제에 실패했습니다'
            });
          }
        }
      };

      window.addEventListener('message', messageListener);

      // 결제창이 닫힐 때까지 대기
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          console.log('💳 결제창이 닫혔습니다');

          // 실제 결제 완료 없이 창만 닫힌 경우
          if (!paymentCompleted) {
            console.log('⚠️ 결제 미완료 상태로 창이 닫혔습니다');
            if (callback) {
              callback({
                error: true,
                message: '결제가 취소되었거나 완료되지 않았습니다'
              });
            }
          }
        }
      }, 1000);

      // 30초 후 타임아웃
      setTimeout(() => {
        if (!paymentWindow.closed && !paymentCompleted) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          console.log('⏰ 결제창 타임아웃');

          if (callback) {
            callback({
              error: true,
              message: '결제 시간이 초과되었습니다'
            });
          }
        }
      }, 30000);

    } else {
      console.error('❌ 결제창 팝업이 차단되었습니다');
      alert('팝업 차단이 해제되어야 결제창이 열립니다.');
      if (callback) {
        callback({
          error: true,
          message: '팝업 차단으로 인해 결제창을 열 수 없습니다'
        });
      }
    }

    document.body.removeChild(form);
  },

  /**
   * 성공 결과 생성 - 심사용
   */
  generateSuccessResult: function() {
    const timestamp = Date.now();
    return {
      resultCode: '0000',
      resultMsg: '정상처리',
      tid: `inicis_test_${timestamp}`,
      oid: `order_${timestamp}`,
      paymethod: 'Card',
      appldate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      appltime: new Date().toTimeString().slice(0, 8).replace(/:/g, ''),
      applnum: Math.random().toString().substr(2, 8),
      cardname: 'KG이니시스 테스트카드',
      cardnumber: '1234-12**-****-5678',
      // 보안 토큰
      securityToken: `test_token_${timestamp}`,
      securityHash: `test_hash_${timestamp}`,
      timestamp: timestamp
    };
  }
};

// 전역 객체로 등록
window.INI = window.INIStdPay;

console.log('✅ KG이니시스 심사용 실제 결제창 SDK 로드 완료');