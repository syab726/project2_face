const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'temp', 'app-data.json');

if (fs.existsSync(dataPath)) {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // 테스트 생성된 오류들만 필터링해서 제거
  const cleanErrors = data.adminErrors.filter(error => 
    !error.metadata?.testGenerated && 
    !error.userEmail?.includes('test@example.com')
  );
  
  // 메트릭스는 유지하되 오류 카운트만 조정
  const errorDiff = data.adminErrors.length - cleanErrors.length;
  data.metrics.totalErrors = Math.max(0, data.metrics.totalErrors - errorDiff);
  data.metrics.todayErrors = Math.max(0, data.metrics.todayErrors - errorDiff);
  
  // 테스트 관련 오류 타입 정리
  const testErrorTypes = ['analysis-failed', 'payment-failed', 'server-error', 'ai-service-error', 'network-error', 'custom-test-error'];
  testErrorTypes.forEach(type => {
    delete data.metrics.errorsByType[type];
  });
  
  data.adminErrors = cleanErrors;
  data.lastUpdate = new Date().toISOString();
  
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('테스트 데이터 정리 완료');
  console.log('제거된 오류:', errorDiff, '개');
  console.log('남은 오류:', cleanErrors.length, '개');
} else {
  console.log('데이터 파일이 존재하지 않습니다.');
}
