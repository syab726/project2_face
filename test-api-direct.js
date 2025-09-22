const https = require('https');
const http = require('http');

async function testIdealTypeAPI() {
  try {
    console.log('=== 이상형 생성 API 직접 테스트 ===');
    
    const testData = {
      physiognomyResult: {
        personality: {
          traits: ['친근하고 온화한 성격', '책임감이 강한 타입', '안정감을 주는 인상'],
          socialStyle: '사교적이고 협력적',
          compatibility: '따뜻한 마음을 가진 사람과 잘 맞음'
        },
        fortune: {
          career: '꾸준한 발전',
          love: '안정적인 관계',
          health: '건강한 체질'
        }
      },
      preferences: {
        gender: 'opposite',
        ageRange: '20-30',
        style: 'natural',
        mbti: 'ENFP'
      }
    };

    console.log('테스트 데이터:', JSON.stringify(testData, null, 2));

    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/analysis/ideal-type',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('API 호출 옵션:', options);
    console.log('서버 응답 대기 중...');

    const req = http.request(options, (res) => {
      console.log('응답 상태 코드:', res.statusCode);
      console.log('응답 헤더:', res.headers);

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          console.log('===== 응답 데이터 =====');
          console.log('Raw 응답:', data);
          
          const responseJson = JSON.parse(data);
          console.log('파싱된 응답:', JSON.stringify(responseJson, null, 2));
          
          if (responseJson.success && responseJson.data) {
            console.log('✅ API 호출 성공!');
            if (responseJson.data.imageUrl) {
              console.log('🖼️ 이미지 URL 존재:', responseJson.data.imageUrl.substring(0, 100) + '...');
            } else {
              console.log('❌ 이미지 URL 없음');
            }
          } else {
            console.log('❌ API 실패:', responseJson.error);
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          console.log('원본 응답:', data);
        }
      });
    });

    req.on('error', (e) => {
      console.error('요청 오류:', e);
    });

    // 요청 데이터 전송
    req.write(postData);
    req.end();

  } catch (error) {
    console.error('테스트 실행 오류:', error);
  }
}

testIdealTypeAPI();