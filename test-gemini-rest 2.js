const https = require('https');
require('dotenv').config();

async function testGeminiImageGenerationREST() {
  try {
    console.log('=== Gemini REST API 이미지 생성 테스트 ===');
    console.log('API 키 존재:', !!process.env.GEMINI_API_KEY);
    
    const apiKey = process.env.GEMINI_API_KEY;
    const model = 'gemini-2.0-flash-preview-image-generation';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: "Create a simple portrait of a beautiful Korean woman in her 20s with natural beauty. Style: Professional portrait photography, soft natural lighting. Setting: Clean neutral background, looking directly at camera with a warm smile. Quality: High resolution, natural facial features, healthy skin. No text, logos, or watermarks."
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    };
    
    console.log('요청 URL:', url);
    console.log('요청 Body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('응답 상태:', response.status);
    console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json();
    console.log('응답 데이터:', JSON.stringify(responseData, null, 2));
    
    if (responseData.candidates && responseData.candidates.length > 0) {
      const candidate = responseData.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (let i = 0; i < candidate.content.parts.length; i++) {
          const part = candidate.content.parts[i];
          console.log(`Part ${i}:`, Object.keys(part));
          
          if (part.inlineData && part.inlineData.data) {
            console.log('✅ 이미지 생성 성공!');
            console.log('이미지 데이터 크기:', part.inlineData.data.length);
            console.log('MIME 타입:', part.inlineData.mimeType);
            return;
          }
        }
      }
    }
    
    console.log('❌ 이미지 데이터를 찾을 수 없음');
    
  } catch (error) {
    console.error('=== REST API 오류 ===');
    console.error('오류:', error.message);
    console.error('스택:', error.stack);
  }
}

// fetch polyfill for older Node.js versions
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

testGeminiImageGenerationREST();