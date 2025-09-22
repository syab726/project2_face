const sharp = require('sharp');
const fs = require('fs');

async function createValidTestImage() {
  try {
    // 100x100 픽셀의 흰색 배경에 검은색 사각형을 그린 간단한 테스트 이미지 생성
    const width = 100;
    const height = 100;
    
    // RGB 이미지 데이터 생성 (흰색 배경)
    const channels = 3; // RGB
    const data = Buffer.alloc(width * height * channels, 255); // 모든 픽셀을 흰색(255)으로 설정
    
    // 중앙에 검은색 사각형 추가 (30x30)
    const rectSize = 30;
    const startX = (width - rectSize) / 2;
    const startY = (height - rectSize) / 2;
    
    for (let y = startY; y < startY + rectSize; y++) {
      for (let x = startX; x < startX + rectSize; x++) {
        const idx = (y * width + x) * channels;
        data[idx] = 0;     // R
        data[idx + 1] = 0; // G  
        data[idx + 2] = 0; // B
      }
    }
    
    // sharp를 사용해서 PNG로 변환
    const pngBuffer = await sharp(data, {
      raw: {
        width: width,
        height: height, 
        channels: channels
      }
    }).png().toBuffer();
    
    // 파일로 저장
    fs.writeFileSync('/tmp/test-face-valid.png', pngBuffer);
    fs.writeFileSync('/tmp/test-palm-valid.png', pngBuffer);
    
    console.log('✅ 유효한 테스트 이미지 생성 완료');
    console.log('크기:', pngBuffer.length, 'bytes');
    
  } catch (error) {
    console.error('❌ 이미지 생성 오류:', error);
  }
}

createValidTestImage();