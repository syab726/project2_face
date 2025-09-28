import * as faceapi from 'face-api.js';

// 모델 로드 상태
let modelsLoaded = false;

// face-api.js 모델 로드
export async function loadModels() {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  } catch (error) {
    console.error('모델 로드 실패:', error);
    throw new Error('얼굴 분석 모델을 로드할 수 없습니다.');
  }
}

// 이미지에서 얼굴 검출 및 랜드마크 추출
export async function detectFace(imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) {
  if (!modelsLoaded) {
    await loadModels();
  }

  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions();

  if (!detection) {
    throw new Error('얼굴을 찾을 수 없습니다.');
  }

  return detection;
}

// 이미지 데이터 URL을 HTML Image Element로 변환
export function createImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}