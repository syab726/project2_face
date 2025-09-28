import { NextRequest, NextResponse } from 'next/server';

// 얼굴 특징 분석 함수
function analyzeFaceFeatures(landmarks: any) {
  // face-api.js에서 제공하는 68개 랜드마크 포인트를 분석하여
  // 우리가 정의한 30개 특징 중 하나로 매핑

  const features = {
    jawWidth: 0,      // 턱 너비
    jawAngle: 0,      // 턱 각도
    eyeSize: 0,       // 눈 크기
    eyeShape: 0,      // 눈 모양
    noseHeight: 0,    // 코 높이
    noseWidth: 0,     // 코 너비
    lipThickness: 0,  // 입술 두께
    lipWidth: 0,      // 입술 너비
    faceLength: 0,    // 얼굴 길이
    faceWidth: 0,     // 얼굴 너비
    foreheadWidth: 0, // 이마 너비
    cheekboneHeight: 0, // 광대뼈 높이
    eyebrowThickness: 0, // 눈썹 두께
    eyeDistance: 0,   // 미간 거리
    symmetry: 0       // 얼굴 대칭도
  };

  // face-api.js landmarks 구조 확인 및 처리
  let points: any[];
  if (landmarks._positions) {
    // face-api.js의 실제 구조 - _x, _y 속성을 x, y로 변환
    points = landmarks._positions.map((p: any) => ({
      x: p._x,
      y: p._y
    }));
  } else if (landmarks.positions) {
    points = landmarks.positions;
  } else if (Array.isArray(landmarks)) {
    points = landmarks;
  } else {
    console.error('Landmarks structure:', landmarks);
    throw new Error('Invalid landmarks structure');
  }

  // 턱선 분석 (landmarks 0-16)
  const jaw = points.slice(0, 17);
  const jawMidX = (jaw[0].x + jaw[16].x) / 2;
  const jawWidth = Math.abs(jaw[16].x - jaw[0].x);
  const jawCenterY = jaw[8].y;
  features.jawWidth = jawWidth;

  // 턱 각도 계산 (각진 vs 둥근)
  const jawAnglePoint = jaw[8];
  const leftJawPoint = jaw[3];
  const rightJawPoint = jaw[13];
  const angle = Math.atan2(
    jawAnglePoint.y - (leftJawPoint.y + rightJawPoint.y) / 2,
    jawAnglePoint.x - (leftJawPoint.x + rightJawPoint.x) / 2
  );
  features.jawAngle = Math.abs(angle);

  // 눈 분석 (landmarks 36-47)
  const leftEye = points.slice(36, 42);
  const rightEye = points.slice(42, 48);
  const leftEyeWidth = Math.abs(leftEye[3].x - leftEye[0].x);
  const rightEyeWidth = Math.abs(rightEye[3].x - rightEye[0].x);
  const leftEyeHeight = Math.abs(leftEye[2].y - leftEye[5].y);
  const rightEyeHeight = Math.abs(rightEye[2].y - rightEye[5].y);

  features.eyeSize = (leftEyeWidth + rightEyeWidth + leftEyeHeight + rightEyeHeight) / 4;
  features.eyeShape = (leftEyeWidth + rightEyeWidth) / (leftEyeHeight + rightEyeHeight);
  features.eyeDistance = Math.abs(leftEye[3].x - rightEye[0].x);

  // 코 분석 (landmarks 27-35)
  const nose = points.slice(27, 36);
  const noseTop = nose[0];
  const noseBottom = nose[6];
  const noseLeft = nose[4];
  const noseRight = nose[8];

  features.noseHeight = Math.abs(noseBottom.y - noseTop.y);
  features.noseWidth = Math.abs(noseRight.x - noseLeft.x);

  // 입술 분석 (landmarks 48-67)
  const lips = points.slice(48, 68);
  const upperLip = lips.slice(0, 7);
  const lowerLip = lips.slice(6, 12);

  features.lipWidth = Math.abs(lips[0].x - lips[6].x);
  features.lipThickness = Math.abs(lips[3].y - lips[9].y);

  // 이마 분석 (eyebrow landmarks 17-26)
  const eyebrows = points.slice(17, 27);
  features.foreheadWidth = Math.abs(eyebrows[0].x - eyebrows[9].x);
  features.eyebrowThickness = Math.abs(eyebrows[2].y - eyebrows[7].y);

  // 얼굴 전체 비율
  const faceTop = eyebrows[0].y;
  const faceBottom = jaw[8].y;
  features.faceLength = Math.abs(faceBottom - faceTop);
  features.faceWidth = jawWidth;

  // 광대뼈 분석 (추정)
  const cheekLeft = points[1];
  const cheekRight = points[15];
  features.cheekboneHeight = (cheekLeft.y + cheekRight.y) / 2;

  // 대칭도 계산
  const leftHalf = points.filter((p: any) => p.x < jawMidX);
  const rightHalf = points.filter((p: any) => p.x > jawMidX);
  let symmetryScore = 0;
  leftHalf.forEach((leftPoint: any) => {
    const mirroredX = jawMidX + (jawMidX - leftPoint.x);
    const closest = rightHalf.reduce((prev: any, curr: any) => {
      const prevDist = Math.abs(prev.x - mirroredX) + Math.abs(prev.y - leftPoint.y);
      const currDist = Math.abs(curr.x - mirroredX) + Math.abs(curr.y - leftPoint.y);
      return currDist < prevDist ? curr : prev;
    });
    symmetryScore += Math.sqrt(
      Math.pow(closest.x - mirroredX, 2) + Math.pow(closest.y - leftPoint.y, 2)
    );
  });
  features.symmetry = 1 / (1 + symmetryScore / leftHalf.length);

  // 디버깅: 계산된 특징값들 출력
  console.log('Calculated features:', {
    jawWidth: features.jawWidth,
    jawAngle: features.jawAngle,
    eyeSize: features.eyeSize,
    eyeShape: features.eyeShape,
    noseHeight: features.noseHeight,
    noseWidth: features.noseWidth,
    lipThickness: features.lipThickness,
    lipWidth: features.lipWidth,
    faceLength: features.faceLength,
    faceWidth: features.faceWidth,
    foreheadWidth: features.foreheadWidth,
    cheekboneHeight: features.cheekboneHeight,
    eyebrowThickness: features.eyebrowThickness,
    eyeDistance: features.eyeDistance,
    symmetry: features.symmetry
  });

  // 특징들을 종합하여 30개 카테고리 중 하나로 분류 (완전히 개선된 다양성 로직)
  const scores = new Array(30).fill(0);

  // 얼굴 특징값들을 정규화하여 0-1 범위로 변환
  const normalizedFeatures = {
    jawWidth: Math.min(features.jawWidth / 300, 1),
    jawAngle: Math.min(features.jawAngle / 3, 1),
    eyeSize: Math.min(features.eyeSize / 50, 1),
    eyeShape: Math.min(features.eyeShape / 5, 1),
    noseHeight: Math.min(features.noseHeight / 100, 1),
    noseWidth: Math.min(features.noseWidth / 60, 1),
    lipThickness: Math.min(features.lipThickness / 40, 1),
    faceRatio: Math.min((features.faceLength / features.faceWidth) / 2, 1),
    foreheadRatio: Math.min((features.foreheadWidth / features.jawWidth) / 1.5, 1),
    symmetry: features.symmetry
  };

  // 각 특징별로 다양한 인덱스에 점수 분배 (더 많은 다양성)

  // 턱선 특징 - 여러 인덱스에 분산
  if (normalizedFeatures.jawAngle > 0.8) {
    scores[0] += 4; // 강인한_턱선형
    scores[10] += 2; // 각진_얼굴형
  } else if (normalizedFeatures.jawAngle < 0.4) {
    scores[1] += 4; // 부드러운_곡선형
    scores[11] += 2; // 둥근_얼굴형
  } else {
    scores[14] += 3; // 계란형_얼굴
  }

  // 눈 특징 - 크기와 모양을 구분하여 점수 부여
  if (normalizedFeatures.eyeShape > 0.7) {
    scores[2] += 3; // 날카로운_눈매형
    if (normalizedFeatures.eyeSize > 0.6) scores[4] += 2; // 큰_눈형
  } else if (normalizedFeatures.eyeShape < 0.4) {
    scores[3] += 3; // 둥근_눈매형
    if (normalizedFeatures.eyeSize < 0.4) scores[5] += 2; // 작은_눈형
  }

  // 눈 크기 단독 평가
  if (normalizedFeatures.eyeSize > 0.7) scores[4] += 3; // 큰_눈형
  if (normalizedFeatures.eyeSize < 0.3) scores[5] += 3; // 작은_눈형

  // 코 특징
  if (normalizedFeatures.noseHeight > 0.7) {
    scores[6] += 4; // 높은_코형
  } else if (normalizedFeatures.noseHeight < 0.4) {
    scores[7] += 4; // 작은_코형
  }

  // 입술 특징
  if (normalizedFeatures.lipThickness > 0.6) {
    scores[8] += 4; // 도톰한_입술형
  } else if (normalizedFeatures.lipThickness < 0.3) {
    scores[9] += 4; // 얇은_입술형
  }

  // 얼굴형 비율에 따른 세분화
  if (normalizedFeatures.faceRatio > 0.8) {
    scores[12] += 4; // 긴_얼굴형
  } else if (normalizedFeatures.faceRatio < 0.6) {
    if (normalizedFeatures.jawAngle > 0.6) {
      scores[10] += 3; // 각진_얼굴형
    } else {
      scores[11] += 3; // 둥근_얼굴형
    }
  } else {
    scores[14] += 2; // 계란형_얼굴
  }

  // 이마와 턱의 비율에 따른 분류
  if (normalizedFeatures.foreheadRatio > 0.8) {
    scores[17] += 4; // 역삼각형_얼굴
    scores[18] += 2; // 넓은_이마형
  } else if (normalizedFeatures.foreheadRatio < 0.6) {
    scores[15] += 4; // 하트형_얼굴
    scores[19] += 2; // 좁은_이마형
  }

  // 특수 얼굴형
  if (normalizedFeatures.jawWidth > 0.8) {
    scores[13] += 3; // 사각_얼굴형
  }

  // 광대뼈 높이에 따른 분류
  const normalizedCheekbone = Math.min(features.cheekboneHeight / 300, 1);
  if (normalizedCheekbone > 0.7) {
    scores[20] += 3; // 높은_광대뼈형
    scores[16] += 2; // 다이아몬드형_얼굴
  } else {
    scores[21] += 2; // 부드러운_광대뼈형
  }

  // 눈썹 두께
  const normalizedEyebrow = Math.min(features.eyebrowThickness / 20, 1);
  if (normalizedEyebrow > 0.5) {
    scores[22] += 3; // 뚜렷한_눈썹형
  } else {
    scores[23] += 2; // 연한_눈썹형
  }

  // 대칭도
  if (features.symmetry > 0.7) {
    scores[28] += 3; // 대칭적_얼굴형
  } else {
    scores[29] += 3; // 독특한_매력형
  }

  // 추가 특징들에 랜덤성과 다양성 부여
  const baseIndices = [24, 25, 26, 27]; // 속눈썹, 피부톤 관련
  baseIndices.forEach((index, i) => {
    scores[index] += Math.random() * 2 + 1; // 1-3점 랜덤 부여
  });

  // 얼굴 특징의 조합에 따른 보너스 점수
  if (normalizedFeatures.eyeShape > 0.6 && normalizedFeatures.noseHeight > 0.6) {
    scores[Math.floor(Math.random() * 5)] += 2; // 첫 5개 중 랜덤 보너스
  }

  if (normalizedFeatures.lipThickness > 0.5 && normalizedFeatures.jawAngle < 0.5) {
    scores[Math.floor(Math.random() * 5) + 5] += 2; // 6-10번 중 랜덤 보너스
  }

  // 최고 점수를 가진 인덱스 찾기 (소수점 고려)
  const maxScore = Math.max(...scores);
  const candidateIndices = scores.map((score, index) => ({ score, index }))
    .filter(item => item.score === maxScore)
    .map(item => item.index);

  // 동점이면 특징값 기반으로 우선순위 결정
  let categoryIndex;
  if (candidateIndices.length > 1) {
    // 가장 두드러진 특징 기반으로 선택
    if (candidateIndices.includes(2) && features.eyeShape > 3.2) {
      categoryIndex = 2; // 날카로운_눈매형 우선
    } else if (candidateIndices.includes(6) && features.noseHeight > 75) {
      categoryIndex = 6; // 높은_코형 우선
    } else if (candidateIndices.includes(8) && features.lipThickness > 23) {
      categoryIndex = 8; // 도톰한_입술형 우선
    } else if (candidateIndices.includes(15) && features.foreheadWidth < features.jawWidth * 0.8) {
      categoryIndex = 15; // 하트형_얼굴 우선
    } else {
      // 그 외에는 첫 번째 후보 선택
      categoryIndex = candidateIndices[0];
    }
  } else {
    categoryIndex = candidateIndices[0];
  }

  console.log('Scores:', scores);
  console.log('Max score:', maxScore);
  console.log('Selected category index:', categoryIndex);

  return Math.min(29, Math.max(0, categoryIndex));
}

export async function POST(request: NextRequest) {
  try {
    const { imageData, landmarks } = await request.json();

    if (!landmarks) {
      return NextResponse.json(
        { error: '얼굴 특징점 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 디버깅 완료 - landmarks 구조가 올바르게 처리되고 있음

    // 얼굴 특징 분석
    const featureIndex = analyzeFaceFeatures(landmarks);

    return NextResponse.json({
      success: true,
      featureIndex,
    });
  } catch (error) {
    console.error('얼굴 분석 중 오류:', error);
    return NextResponse.json(
      { error: '얼굴 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}