const https = require('https');
const http = require('http');
const fs = require('fs');
const FormData = require('form-data');

async function testFaceAPI() {
  try {
    console.log('=== Face API 테스트 ===');
    
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
    const tempFilePath = '/tmp/test-face.png';
    fs.writeFileSync(tempFilePath, testImageBuffer);

    // FormData 생성
    const form = new FormData();
    form.append('faceImage', fs.createReadStream(tempFilePath), {
      filename: 'test-face.png',
      contentType: 'image/png'
    });

    console.log('Face API 호출 중...');

    // 요청 옵션
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/analysis/face',
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      console.log('응답 상태 코드:', res.statusCode);
      console.log('응답 헤더:', res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('===== 응답 데이터 =====');
        try {
          const responseJson = JSON.parse(data);
          console.log('파싱된 응답:', JSON.stringify(responseJson, null, 2));
        } catch (parseError) {
          console.log('Raw 응답:', data);
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

    // FormData를 요청에 파이프
    form.pipe(req);

  } catch (error) {
    console.error('테스트 실행 오류:', error);
  }
}

testFaceAPI();