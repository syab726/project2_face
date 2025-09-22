const http = require('http');
const FormData = require('form-data');
const fs = require('fs');

async function testSajuContent() {
  try {
    console.log('=== 사주 분석 내용 확인 테스트 ===');
    
    // 간단한 1x1 픽셀 PNG 이미지 생성 (테스트용)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x21, 0x07, 0x6B, 0xE0, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // 임시 파일로 저장
    const tempFilePath = '/tmp/test-palm-content.png';
    fs.writeFileSync(tempFilePath, testImageBuffer);

    // FormData 생성
    const form = new FormData();
    form.append('palmImage', fs.createReadStream(tempFilePath), {
      filename: 'test-palm.png',
      contentType: 'image/png'
    });
    form.append('name', '김테스트');
    form.append('birthDate', '1990-01-15');
    form.append('birthTime', '14:30');
    form.append('gender', '남성');
    form.append('age', '35');
    form.append('analysisFields', JSON.stringify(['overall']));

    console.log('Saju-Palm API 호출 중...');

    // 요청 옵션
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/analysis/saju-palm',
      method: 'POST',
      headers: form.getHeaders(),
      timeout: 90000 // 90초 타임아웃
    };

    const req = http.request(options, (res) => {
      console.log('응답 상태 코드:', res.statusCode);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('===== 상세 응답 내용 =====');
        try {
          const responseJson = JSON.parse(data);
          
          if (responseJson.success) {
            console.log('✅ Saju-Palm 분석 성공!');
            
            // 사주 분석 내용 확인
            if (responseJson.sajuAnalysis) {
              console.log('\n=== 사주 분석 결과 ===');
              if (responseJson.sajuAnalysis.detailedAnalysis) {
                console.log('📋 상세 분석:', JSON.stringify(responseJson.sajuAnalysis.detailedAnalysis, null, 2));
              }
              if (responseJson.sajuAnalysis.detailedFortune) {
                console.log('🔮 운세 예측 (첫 번째만):', Object.keys(responseJson.sajuAnalysis.detailedFortune)[0], ':', responseJson.sajuAnalysis.detailedFortune[Object.keys(responseJson.sajuAnalysis.detailedFortune)[0]]);
              }
              if (responseJson.sajuAnalysis.lifeAdvice) {
                console.log('💡 인생 조언:', JSON.stringify(responseJson.sajuAnalysis.lifeAdvice, null, 2));
              }
            }
            
            // 통합 분석 내용 확인
            if (responseJson.combinedInsights) {
              console.log('\n=== 통합 분석 결과 ===');
              console.log(JSON.stringify(responseJson.combinedInsights, null, 2));
            }
            
            console.log('\n전체 응답 크기:', JSON.stringify(responseJson).length, '글자');
          } else {
            console.log('❌ Saju-Palm 분석 실패:', responseJson.error);
            if (responseJson.details) {
              console.log('세부 내용:', responseJson.details);
            }
          }
        } catch (parseError) {
          console.log('JSON 파싱 오류:', parseError.message);
          console.log('Raw 응답 (처음 1000자):', data.substring(0, 1000));
        }
        
        // 임시 파일 삭제
        try {
          fs.unlinkSync(tempFilePath);
        } catch {}
      });
    });

    req.on('error', (e) => {
      console.error('요청 오류:', e);
    });

    req.on('timeout', () => {
      console.error('요청 타임아웃 (90초)');
      req.destroy();
    });

    // FormData를 요청에 파이프
    form.pipe(req);

  } catch (error) {
    console.error('테스트 실행 오류:', error);
  }
}

testSajuContent();