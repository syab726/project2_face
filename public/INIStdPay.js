/*
 * KG이니시스 표준결제 JavaScript SDK - 테스트 환경용
 * 실제 운영 환경에서는 KG이니시스에서 제공하는 공식 SDK를 사용해야 합니다.
 */

window.INIStdPay = {
  /**
   * 결제 요청 함수
   * @param {string} action - 결제 처리 URL
   * @param {string} acceptCharset - 문자 인코딩
   * @param {string} enctype - 폼 인코딩 타입
   * @param {HTMLFormElement} payForm - 결제 폼 요소
   * @param {string} payFormName - 결제 폼 이름
   * @param {Function} callback - 결제 완료 콜백
   */
  pay: function(action, acceptCharset, enctype, payForm, payFormName, callback) {
    console.log('🏦 KG이니시스 결제 SDK 실행:', {
      action,
      acceptCharset,
      enctype,
      payFormName,
      formData: new FormData(payForm)
    });

    // 폼 데이터 검증
    const formData = new FormData(payForm);
    const requiredFields = ['mid', 'oid', 'price', 'goodname', 'buyername'];

    for (const field of requiredFields) {
      if (!formData.get(field)) {
        console.error(`❌ 필수 필드 누락: ${field}`);
        if (callback) {
          callback({
            error: true,
            message: `필수 필드가 누락되었습니다: ${field}`
          });
        }
        return;
      }
    }

    // 테스트 환경에서는 시뮬레이션된 결제 처리
    const testMode = formData.get('mid') === 'INIpayTest';

    if (testMode) {
      console.log('🧪 테스트 모드 결제 시뮬레이션 시작');

      // 결제 창 시뮬레이션 (실제로는 KG이니시스 결제창이 열림)
      const paymentResult = this.simulateTestPayment(formData);

      setTimeout(() => {
        console.log('💳 테스트 결제 완료:', paymentResult);
        if (callback) {
          callback(paymentResult);
        }
      }, 2000); // 2초 후 결제 완료 시뮬레이션

    } else {
      console.error('❌ 운영 모드는 실제 KG이니시스 SDK가 필요합니다');
      if (callback) {
        callback({
          error: true,
          message: '운영 환경에서는 실제 KG이니시스 SDK를 사용해야 합니다'
        });
      }
    }
  },

  /**
   * 테스트 결제 시뮬레이션
   * @param {FormData} formData - 결제 폼 데이터
   * @returns {Object} 결제 결과
   */
  simulateTestPayment: function(formData) {
    const oid = formData.get('oid');
    const price = formData.get('price');
    const goodname = formData.get('goodname');

    // 테스트용 결제 성공 결과 생성
    return {
      resultCode: '0000',
      resultMsg: '정상처리',
      tid: `test_tid_${Date.now()}`,
      oid: oid,
      price: price,
      goodname: goodname,
      paymethod: 'Card',
      appldate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      appltime: new Date().toTimeString().slice(0, 8).replace(/:/g, ''),
      applnum: Math.random().toString().substr(2, 8),
      cardname: '테스트카드',
      cardnumber: '1234-12**-****-5678',
      // 보안을 위한 추가 토큰 (실제 환경에서는 KG이니시스에서 제공)
      securityToken: this.generateSecurityToken(oid, price),
      securityHash: this.generateSecurityHash(oid, price),
      timestamp: Date.now()
    };
  },

  /**
   * 보안 토큰 생성 (테스트용)
   */
  generateSecurityToken: function(oid, price) {
    return `token_${oid}_${price}_${Date.now()}`;
  },

  /**
   * 보안 해시 생성 (테스트용)
   */
  generateSecurityHash: function(oid, price) {
    return `hash_${oid}_${price}_${Date.now()}`;
  }
};

// 전역 객체로 등록
window.INI = window.INIStdPay;

console.log('✅ KG이니시스 테스트 SDK 로드 완료');