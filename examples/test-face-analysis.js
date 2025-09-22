/**
 * 얼굴 분석 API 테스트 예제
 * 
 * 이 파일은 구현된 얼굴 분석 API의 기능을 테스트하기 위한 예제입니다.
 * 실제 사용 시에는 실제 이미지 데이터를 사용해야 합니다.
 */

const API_BASE_URL = 'http://localhost:3000/api';

// 테스트용 더미 이미지 데이터 (실제로는 실제 얼굴 이미지의 base64 데이터를 사용해야 함)
const DUMMY_IMAGE_DATA = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

/**
 * API 요청 헬퍼 함수
 */
async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log(`${method} ${endpoint}:`, {
      status: response.status,
      success: result.success,
      data: result.data,
      error: result.error
    });

    return result;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    return null;
  }
}

/**
 * 테스트 함수들
 */

// 1. 서비스 상태 확인
async function testServiceStatus() {
  console.log('\n=== 서비스 상태 확인 ===');
  await makeRequest('/face/status');
}

// 2. 분석 분야 목록 조회
async function testGetAnalysisFields() {
  console.log('\n=== 분석 분야 목록 조회 ===');
  await makeRequest('/face/fields');
}

// 3. 이미지 검증 테스트
async function testImageValidation() {
  console.log('\n=== 이미지 검증 테스트 ===');
  
  // 올바른 이미지 데이터 테스트
  await makeRequest('/face/validate', 'POST', {
    imageData: DUMMY_IMAGE_DATA
  });
  
  // 잘못된 이미지 데이터 테스트
  await makeRequest('/face/validate', 'POST', {
    imageData: 'invalid-image-data'
  });
}

// 4. 무료 분석 테스트
async function testFreeAnalysis() {
  console.log('\n=== 무료 분석 테스트 ===');
  
  await makeRequest('/face/analyze/free', 'POST', {
    imageData: DUMMY_IMAGE_DATA
  });
}

// 5. 유료 분석 테스트
async function testPremiumAnalysis() {
  console.log('\n=== 유료 분석 테스트 ===');
  
  const fields = ['love', 'business', 'wealth', 'comprehensive'];
  
  for (const field of fields) {
    console.log(`\n--- ${field} 분야 분석 ---`);
    await makeRequest('/face/analyze/premium', 'POST', {
      imageData: DUMMY_IMAGE_DATA,
      selectedField: field
    });
  }
}

// 6. 비동기 세션 테스트
async function testAsyncSession() {
  console.log('\n=== 비동기 세션 테스트 ===');
  
  // 세션 시작
  const sessionResult = await makeRequest('/face/session/start', 'POST', {
    imageData: DUMMY_IMAGE_DATA,
    analysisType: 'premium',
    selectedField: 'love'
  });
  
  if (sessionResult && sessionResult.success) {
    const sessionId = sessionResult.data.sessionId;
    console.log(`세션 ID: ${sessionId}`);
    
    // 상태 확인 (몇 번 반복)
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
      
      console.log(`\n--- 상태 확인 ${i + 1} ---`);
      const statusResult = await makeRequest(`/face/session/${sessionId}/status`);
      
      if (statusResult && statusResult.data.status === 'completed') {
        console.log('분석 완료!');
        
        // 다운로드 준비
        console.log('\n--- 다운로드 준비 ---');
        await makeRequest(`/face/session/${sessionId}/download`);
        
        // 세션 삭제
        console.log('\n--- 세션 삭제 ---');
        await makeRequest(`/face/session/${sessionId}`, 'DELETE');
        
        break;
      }
    }
  }
}

// 7. 에러 처리 테스트
async function testErrorHandling() {
  console.log('\n=== 에러 처리 테스트 ===');
  
  // 존재하지 않는 세션 ID
  await makeRequest('/face/session/invalid-session-id/status');
  
  // 빈 이미지 데이터
  await makeRequest('/face/analyze/free', 'POST', {
    imageData: ''
  });
  
  // 잘못된 분석 분야
  await makeRequest('/face/analyze/premium', 'POST', {
    imageData: DUMMY_IMAGE_DATA,
    selectedField: 'invalid-field'
  });
}

/**
 * 전체 테스트 실행
 */
async function runAllTests() {
  console.log('🧪 얼굴 분석 API 테스트 시작\n');
  
  try {
    await testServiceStatus();
    await testGetAnalysisFields();
    await testImageValidation();
    
    // 주의: 실제 API 키가 설정되어 있어야 아래 테스트가 작동합니다.
    console.log('\n⚠️  주의: 실제 분석 테스트는 올바른 API 키와 실제 얼굴 이미지가 필요합니다.');
    
    // 실제 분석 테스트 (주석 해제하여 사용)
    // await testFreeAnalysis();
    // await testPremiumAnalysis();
    // await testAsyncSession();
    
    await testErrorHandling();
    
    console.log('\n✅ 모든 테스트 완료');
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
  }
}

// Node.js 환경에서 실행
if (typeof require !== 'undefined' && require.main === module) {
  // fetch가 Node.js에서 지원되지 않는 경우를 위한 polyfill
  if (typeof fetch === 'undefined') {
    global.fetch = require('node-fetch');
  }
  
  runAllTests();
}

// 브라우저 환경에서 실행
if (typeof window !== 'undefined') {
  window.runFaceAnalysisTests = runAllTests;
  console.log('브라우저 콘솔에서 runFaceAnalysisTests() 함수를 실행하세요.');
}

module.exports = {
  runAllTests,
  testServiceStatus,
  testGetAnalysisFields,
  testImageValidation,
  testFreeAnalysis,
  testPremiumAnalysis,
  testAsyncSession,
  testErrorHandling
};