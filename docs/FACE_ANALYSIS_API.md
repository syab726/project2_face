# 얼굴 분석 API 문서

## 개요

이 문서는 Project wisdom.md 요구사항에 따라 구현된 Gemini API 기반 얼굴 분석 시스템의 API 사용법을 설명합니다.

## 시스템 구조

### 핵심 컴포넌트

1. **GeminiService** (`src/services/geminiService.ts`)
   - Gemini API 연동 및 얼굴 분석 처리
   - 무료 버전: Gemini 1.5 Pro 모델 사용
   - 유료 버전: Gemini 2.0 Flash 모델 사용

2. **FaceDetectionService** (`src/services/faceDetectionService.ts`)
   - 얼굴 인식 및 분석 로직
   - 이미지 검증 및 전처리
   - 비동기 세션 관리

3. **FaceController** (`src/controllers/faceController.ts`)
   - REST API 엔드포인트 처리
   - 요청 검증 및 응답 형식화

4. **FaceUtils** (`src/utils/faceUtils.ts`)
   - 유틸리티 함수 및 헬퍼 메서드
   - 이미지 처리 및 결과 포맷팅

## API 엔드포인트

### 1. 서비스 상태 확인

```http
GET /api/face/status
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "healthy": true,
    "activeSessions": 2,
    "message": "서비스가 정상적으로 운영되고 있습니다.",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### 2. 분석 분야 목록 조회

```http
GET /api/face/fields
```

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": "love",
      "name": "연애",
      "description": "연애 운세, 이성과의 관계, 로맨틱한 만남에 대한 분석",
      "price": 9900
    },
    {
      "id": "comprehensive",
      "name": "종합",
      "description": "모든 분야를 종합한 전반적인 운세 분석",
      "price": 19900
    }
  ]
}
```

### 3. 이미지 검증

```http
POST /api/face/validate
Content-Type: application/json

{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "faceDetected": true,
    "imageQuality": "high",
    "canAnalyze": true
  }
}
```

### 4. 무료 분석 (오악 분석)

```http
POST /api/face/analyze/free
Content-Type: application/json

{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "fiveFeatures": {
      "forehead": "이마 분석 - 지혜, 사고력, 미래운 관련",
      "eyes": "눈 분석 - 성격, 감정, 대인관계 관련",
      "nose": "코 분석 - 의지력, 재물운, 중년운 관련",
      "mouth": "입 분석 - 언변, 식복, 말년운 관련",
      "chin": "턱 분석 - 의지력, 추진력, 생활력 관련"
    },
    "summary": "오악 종합 분석 결과",
    "generalAdvice": "일반적인 조언",
    "formattedResult": "## 오악 분석 결과\n\n### 이마 (額)\n..."
  },
  "processingTime": 3450
}
```

### 5. 유료 분석 (전문 분야별)

```http
POST /api/face/analyze/premium
Content-Type: application/json

{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "selectedField": "love"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "selectedField": "love",
    "detailedAnalysis": {
      "field": "love",
      "positiveAspects": ["긍정적 요소들"],
      "negativeAspects": ["부정적 요소들"],
      "interpretation": "연애 분야에 대한 상세한 해석",
      "advice": "연애 분야에 대한 구체적인 조언"
    },
    "summary": "연애 분야 전문 분석 결과입니다...",
    "formattedResult": "## 연애 분야 전문 분석\n\n### 긍정적 요소\n...",
    "fieldInfo": {
      "name": "연애",
      "price": 9900
    }
  },
  "processingTime": 5230
}
```

### 6. 비동기 분석 세션 시작

```http
POST /api/face/session/start
Content-Type: application/json

{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "analysisType": "premium",
  "selectedField": "love"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "sessionId": "face_1642248600000_abc123def",
    "message": "분석이 시작되었습니다. 진행 상태를 확인해주세요."
  }
}
```

### 7. 분석 세션 상태 확인

```http
GET /api/face/session/{sessionId}/status
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "status": "analyzing",
    "progress": 50,
    "message": "특징을 바탕으로 관상을 분석하고 있습니다...",
    "result": null
  }
}
```

**분석 완료 시:**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "progress": 100,
    "message": "분석이 완료되었습니다!",
    "result": {
      "success": true,
      "data": { /* 분석 결과 데이터 */ }
    }
  }
}
```

### 8. 분석 결과 다운로드 준비

```http
GET /api/face/session/{sessionId}/download
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "content": "## 연애 분야 전문 분석\n\n### 긍정적 요소\n...",
    "filename": "face_analysis_face_1642248600000_abc123def.txt",
    "contentType": "text/plain",
    "size": 2048
  }
}
```

### 9. 분석 세션 삭제

```http
DELETE /api/face/session/{sessionId}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "message": "세션이 삭제되었습니다."
  }
}
```

## 분석 분야

### 지원되는 분야

1. **연애 (love)** - 9,900원
2. **사업 (business)** - 9,900원
3. **건강 (health)** - 9,900원
4. **자녀 (children)** - 9,900원
5. **성격 (personality)** - 9,900원
6. **성향 (tendency)** - 9,900원
7. **재물운 (wealth)** - 9,900원
8. **대인관계 (relationships)** - 9,900원
9. **직업 (career)** - 9,900원
10. **결혼 (marriage)** - 9,900원
11. **종합 (comprehensive)** - 19,900원

## 분석 상태

- **detecting** - 얼굴 특징을 파악하고 있습니다...
- **analyzing** - 특징을 바탕으로 관상을 분석하고 있습니다...
- **interpreting** - 선택하신 분야에 대한 해석을 작성하고 있습니다...
- **completed** - 분석이 완료되었습니다!
- **failed** - 분석 중 오류가 발생했습니다.

## 에러 처리

### 일반적인 에러 응답 형식

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

### 주요 에러 코드

- **QUOTA_EXCEEDED**: API 사용량 한도 초과
- **SAFETY_VIOLATION**: 안전 정책 위반
- **NETWORK_ERROR**: 네트워크 오류
- **INVALID_IMAGE**: 올바르지 않은 이미지
- **NO_FACE_DETECTED**: 얼굴 인식 불가
- **IMAGE_TOO_LARGE**: 이미지 크기 초과
- **UNSUPPORTED_FORMAT**: 지원되지 않는 이미지 형식

## 사용 예시

### JavaScript (브라우저)

```javascript
// 무료 분석 예시
async function analyzeFaceFree(imageData) {
  try {
    const response = await fetch('/api/face/analyze/free', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: imageData
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('분석 결과:', result.data);
      console.log('포맷된 결과:', result.data.formattedResult);
    } else {
      console.error('분석 실패:', result.error);
    }
  } catch (error) {
    console.error('요청 실패:', error);
  }
}

// 비동기 세션 분석 예시
async function analyzeWithSession(imageData, selectedField) {
  try {
    // 세션 시작
    const sessionResponse = await fetch('/api/face/session/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: imageData,
        analysisType: 'premium',
        selectedField: selectedField
      })
    });
    
    const sessionResult = await sessionResponse.json();
    
    if (!sessionResult.success) {
      throw new Error(sessionResult.error);
    }
    
    const sessionId = sessionResult.data.sessionId;
    
    // 상태 확인 폴링
    const checkStatus = async () => {
      const statusResponse = await fetch(`/api/face/session/${sessionId}/status`);
      const statusResult = await statusResponse.json();
      
      if (statusResult.success) {
        const { status, progress, message, result } = statusResult.data;
        
        // 진행률 업데이트
        updateProgress(progress, message);
        
        if (status === 'completed' && result) {
          // 분석 완료
          console.log('분석 완료:', result.data);
          return result.data;
        } else if (status === 'failed') {
          throw new Error('분석 실패');
        } else {
          // 2초 후 다시 확인
          setTimeout(checkStatus, 2000);
        }
      }
    };
    
    return checkStatus();
  } catch (error) {
    console.error('세션 분석 실패:', error);
  }
}

function updateProgress(progress, message) {
  console.log(`진행률: ${progress}% - ${message}`);
}
```

## 설정 및 환경 변수

```bash
# API 키 설정
GEMINI_API_KEY=your_gemini_api_key_here

# 모델 설정
GEMINI_MODEL_FREE=gemini-1.5-pro-002
GEMINI_MODEL=gemini-2.0-flash-001

# 파일 업로드 설정
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=./public/uploads

# 서버 설정
PORT=3000
NODE_ENV=development
```

## 성능 및 제한사항

### 성능
- 무료 분석: 평균 3-5초
- 유료 분석: 평균 5-10초
- 최대 동시 세션: 100개

### 제한사항
- 이미지 크기: 최대 10MB
- 지원 형식: JPEG, PNG, WebP
- 세션 유지 시간: 30분
- Rate Limit: 15분당 100개 요청

## 테스트

테스트 실행:
```bash
cd examples
node test-face-analysis.js
```

또는 브라우저에서:
```javascript
// 개발자 도구 콘솔에서 실행
runFaceAnalysisTests();
```

## 문제 해결

### 1. API 키 오류
```
Error: GEMINI_API_KEY is required
```
→ `.env` 파일에 올바른 Gemini API 키를 설정하세요.

### 2. 이미지 인식 실패
```
얼굴을 인식할 수 없습니다.
```
→ 명확한 얼굴이 보이는 고품질 이미지를 사용하세요.

### 3. 세션 만료
```
세션을 찾을 수 없습니다.
```
→ 세션은 30분 후 자동 만료됩니다. 새로운 세션을 시작하세요.

### 4. 할당량 초과
```
API 사용량 한도를 초과했습니다.
```
→ 잠시 후 다시 시도하거나 API 키의 할당량을 확인하세요.

## 보안 고려사항

- 모든 API 요청에 rate limiting 적용
- 이미지 데이터 크기 제한
- 안전하지 않은 콘텐츠 자동 차단
- 세션 자동 만료 및 정리
- CORS 설정을 통한 도메인 제한

## 향후 개선사항

1. **캐싱 시스템**: 동일한 이미지 분석 결과 캐싱
2. **배치 처리**: 여러 이미지 동시 분석
3. **웹훅 지원**: 분석 완료 시 콜백 URL 호출
4. **분석 히스토리**: 사용자별 분석 이력 저장
5. **A/B 테스트**: 다양한 프롬프트 성능 비교