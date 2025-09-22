const http = require('http');

async function testGenderFix() {
  console.log('=== 성별 수정 테스트 ===');

  // 여성 테스트
  const womanTestData = {
    mbtiType: 'ENFP',
    age: 25,
    preferredGender: '여성',
    faceAnalysis: {
      personality: {
        traits: ['ENFP 타입의 매력적인 특성', '조화로운 성격'],
        socialStyle: '사교적이고 협력적'
      }
    }
  };

  console.log('\n1. 여성 이상형 생성 테스트');
  console.log('전달 데이터:', JSON.stringify(womanTestData, null, 2));

  await testAPI(womanTestData, '여성');

  // 남성 테스트
  const manTestData = {
    mbtiType: 'INTJ',
    age: 28,
    preferredGender: '남성',
    faceAnalysis: {
      personality: {
        traits: ['INTJ 타입의 매력적인 특성', '조화로운 성격'],
        socialStyle: '사교적이고 협력적'
      }
    }
  };

  console.log('\n2. 남성 이상형 생성 테스트');
  console.log('전달 데이터:', JSON.stringify(manTestData, null, 2));

  await testAPI(manTestData, '남성');
}

async function testAPI(testData, expectedGender) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/analysis/ideal-type-face',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const responseJson = JSON.parse(data);
          
          if (responseJson.success && responseJson.data) {
            console.log(`✅ ${expectedGender} 이상형 생성 성공!`);
            console.log('응답 성별:', responseJson.data.preferredGender);
            console.log('이미지 크기:', responseJson.data.imageUrl?.length || 0);
            
            if (responseJson.data.preferredGender === expectedGender) {
              console.log('🎯 성별 전달 정확함!');
            } else {
              console.log('❌ 성별 전달 오류!');
              console.log('예상:', expectedGender, '실제:', responseJson.data.preferredGender);
            }
          } else {
            console.log(`❌ ${expectedGender} 이상형 생성 실패:`, responseJson.error);
          }
        } catch (parseError) {
          console.log('JSON 파싱 오류:', parseError.message);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('요청 오류:', e);
      resolve();
    });

    req.setTimeout(15000, () => {
      console.error(`${expectedGender} 테스트 타임아웃`);
      req.destroy();
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

testGenderFix();