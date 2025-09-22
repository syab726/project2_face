const http = require('http');

async function testIdealTypeFaceAPI() {
  try {
    console.log('=== ideal-type-face API 테스트 ===');
    
    const testData = {
      mbtiType: 'ENFP',
      age: 25,
      preferredGender: '여성',
      faceAnalysis: {
        personality: {
          traits: ['친근하고 온화한 성격', '책임감이 강한 타입'],
          socialStyle: '사교적이고 협력적'
        }
      }
    };

    console.log('테스트 데이터:', JSON.stringify(testData, null, 2));

    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/analysis/ideal-type-face',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('API 호출 시작...');

    const req = http.request(options, (res) => {
      console.log('응답 상태 코드:', res.statusCode);

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          console.log('===== 응답 데이터 =====');
          
          const responseJson = JSON.parse(data);
          console.log('성공 여부:', responseJson.success);
          
          if (responseJson.success && responseJson.data) {
            console.log('✅ API 호출 성공!');
            console.log('MBTI:', responseJson.data.mbtiType);
            console.log('나이:', responseJson.data.age);
            console.log('성별:', responseJson.data.preferredGender);
            
            if (responseJson.data.imageUrl) {
              if (responseJson.data.imageUrl.startsWith('data:image/')) {
                console.log('🖼️ Base64 이미지 생성 성공! 크기:', responseJson.data.imageUrl.length);
              } else {
                console.log('🖼️ 외부 이미지 URL:', responseJson.data.imageUrl);
              }
            } else {
              console.log('❌ 이미지 URL 없음');
            }
          } else {
            console.log('❌ API 실패:', responseJson.error);
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          console.log('원본 응답:', data.substring(0, 500));
        }
      });
    });

    req.on('error', (e) => {
      console.error('요청 오류:', e);
    });

    req.setTimeout(30000, () => {
      console.error('요청 타임아웃');
      req.destroy();
    });

    // 요청 데이터 전송
    req.write(postData);
    req.end();

  } catch (error) {
    console.error('테스트 실행 오류:', error);
  }
}

testIdealTypeFaceAPI();