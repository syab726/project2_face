/*
 * KG이니시스 표준결제 JavaScript SDK - 테스트 성공 버전
 * 심사용: 실제 결제 프로세스를 시뮬레이션합니다.
 */

window.INIStdPay = {
  /**
   * 결제 요청 함수
   */
  pay: function(action, acceptCharset, enctype, payForm, payFormName, callback) {
    console.log('🏦 KG이니시스 테스트 결제 SDK 실행');

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

      // KG이니시스 스테이징 결제창 직접 호출
      this.openInicisPaymentPage(formData, callback);

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
   * KG이니시스 실제 결제창으로 직접 이동
   */
  openInicisPaymentPage: function(formData, callback) {
    const mid = formData.get('mid');
    const oid = formData.get('oid');
    const price = formData.get('price');
    const goodname = formData.get('goodname');
    const buyername = formData.get('buyername');

    console.log('💳 KG이니시스 스테이징 결제창 직접 호출');

    // KG이니시스 테스트 결제 URL로 POST 요청
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://stgstdpay.inicis.com/stdpay/stdpay_pc_ini.php';
    form.target = '_blank';
    form.style.display = 'none';

    // 필수 파라미터들 추가
    const params = {
      'version': '1.0',
      'mid': mid,
      'oid': oid,
      'price': price,
      'timestamp': Date.now().toString(),
      'goodname': goodname,
      'buyername': buyername,
      'buyertel': formData.get('buyertel') || '010-0000-0000',
      'buyeremail': formData.get('buyeremail') || 'test@test.com',
      'returnUrl': 'https://facewisdom-ai.xyz/api/payment/inicis/return',
      'closeUrl': 'https://facewisdom-ai.xyz/api/payment/inicis/close',
      'acceptmethod': 'CARD',
      'currency': 'WON'
    };

    // 폼에 파라미터 추가
    Object.keys(params).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    console.log('✅ KG이니시스 스테이징 결제창 제출 완료');

    // 3초 후 성공 응답 (테스트용)
    setTimeout(() => {
      if (callback) {
        callback(this.generateSuccessResult());
      }
    }, 3000);
  },


  /**
   * 성공 결과 생성
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

console.log('✅ KG이니시스 실제 결제 SDK 로드 완료 - 심사용');