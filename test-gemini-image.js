const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiImageGeneration() {
  try {
    console.log('=== Gemini 이미지 생성 테스트 시작 ===');
    console.log('API 키 존재:', !!process.env.GEMINI_API_KEY);
    console.log('API 키 길이:', process.env.GEMINI_API_KEY?.length);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-preview-image-generation',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        responseMimeType: 'text/plain'
      }
    });

    console.log('모델 인스턴스 생성 완료');

    const prompt = `Create a simple portrait of a beautiful Korean woman in her 20s with natural beauty. 
Style: Professional portrait photography, soft natural lighting.
Setting: Clean neutral background, looking directly at camera with a warm smile.
Quality: High resolution, natural facial features, healthy skin.
No text, logos, or watermarks.`;

    console.log('프롬프트:', prompt);
    console.log('API 호출 시작...');
    
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    
    console.log('응답 받음');
    console.log('응답 구조:', JSON.stringify(response, null, 2));
    
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      console.log('첫 번째 candidate:', JSON.stringify(candidate, null, 2));
      
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
          
          if (part.text) {
            console.log('텍스트 응답:', part.text);
          }
        }
      }
    }
    
    console.log('❌ 이미지 데이터를 찾을 수 없음');
    
  } catch (error) {
    console.error('=== Gemini 이미지 생성 오류 ===');
    console.error('오류 타입:', error.constructor.name);
    console.error('오류 메시지:', error.message);
    console.error('오류 스택:', error.stack);
    
    if (error.response) {
      console.error('API 응답:', error.response);
    }
    
    if (error.status) {
      console.error('HTTP 상태:', error.status);
    }
  }
}

testGeminiImageGeneration();