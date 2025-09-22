# 내 얼굴 탐구생활 (Face Analysis AI) 개발 가이드라인

## 프로젝트 개요

### 기본 정보
- **프로젝트명**: 내 얼굴 탐구생활 (project2_face)
- **서비스 유형**: AI 기반 얼굴 분석 웹 서비스 (관상, 손금, 운세)
- **타겟 사용자**: 젊은 성인층(20-30대) 및 중년층
- **핵심 기능**: 모바일 반응형 디자인, 소셜 미디어 공유, 무료/유료 티어

### 기술 스택
- **백엔드**: Node.js + Express.js + TypeScript (ES Modules)
- **AI 서비스**: Gemini Vision API (주요) + OpenAI GPT-4o API (보조)
- **이미지 처리**: Sharp, Multer
- **보안**: Helmet, Express Rate Limit, CORS
- **기타**: UUID, Joi validation, PDFKit

## 프로젝트 아키텍처

### 디렉토리 구조 규칙
```
src/
├── index.ts                 # 서버 진입점 (절대 삭제 금지)
├── controllers/            # 요청 처리 로직
├── services/               # 비즈니스 로직 및 외부 API 연동
├── routes/                 # API 라우팅
├── middleware/             # 미들웨어 (검증, 인증 등)
├── types/                  # TypeScript 타입 정의
└── utils/                  # 유틸리티 함수

public/                     # 정적 파일
├── assets/                 # 이미지, CSS, JS 등
└── uploads/                # 업로드된 파일 임시 저장

SHRIMP/                     # Task Manager (절대 수정 금지)
```

### 핵심 파일 관계
- **서버 시작**: `src/index.ts` → `src/routes/index.ts` → `src/routes/faceRoutes.ts`
- **분석 플로우**: `faceController.ts` → `faceDetectionService.ts` → `geminiService.ts`
- **타입 정의**: 모든 API 응답은 `src/types/faceAnalysis.ts`에 정의된 인터페이스 사용 필수

## 코딩 표준

### TypeScript 규칙
- **Import 스타일**: ES Modules만 사용 (`import/export`, CommonJS 금지)
- **파일 확장자**: 모든 import에서 `.js` 확장자 명시 필수 (컴파일 후 실제 파일)
- **타입 정의**: `any` 타입 절대 금지, 모든 타입 명시적 정의
- **비동기 처리**: Promise/async-await 패턴만 사용

### 명명 규칙
- **파일명**: camelCase (예: `faceController.ts`, `imageService.ts`)
- **클래스명**: PascalCase (예: `FaceDetectionService`)
- **변수/함수명**: camelCase (예: `analyzeImage`, `sessionId`)
- **상수명**: UPPER_SNAKE_CASE (예: `MAX_SESSIONS`, `SESSION_TIMEOUT`)
- **인터페이스명**: PascalCase (예: `FaceAnalysisRequest`)

### 코드 스타일
- **문자열**: 단일 따옴표 우선 (`'hello'`), 템플릿 리터럴 시 백틱 사용
- **들여쓰기**: 2칸 스페이스
- **세미콜론**: 필수 사용
- **JSDoc**: 모든 public 메서드에 필수

## 기능 구현 표준

### API 응답 형식 (절대 변경 금지)
```typescript
// 성공 응답
{
  success: true,
  data: T,
  processingTime?: number
}

// 실패 응답
{
  success: false,
  error: string,
  processingTime?: number
}
```

### 이미지 처리 규칙
- **지원 형식**: JPEG, PNG만 허용
- **최대 크기**: 10MB
- **검증 순서**: 1) 형식 검증 → 2) 크기 검증 → 3) Gemini 얼굴 인식 검증
- **Base64 처리**: 모든 이미지는 `data:image/` 형식으로 처리

### 분석 티어 구분
- **무료 분석**: 오악(五岳) 분석만 제공
- **유료 분석**: 전문 분야별 상세 분석 (관상, 손금, 운세 중 선택)
- **세션 관리**: 비동기 분석을 위한 UUID 기반 세션 시스템

### AI 서비스 연동 규칙
- **주 서비스**: Gemini Vision API (얼굴 인식 및 기본 분석)
- **보조 서비스**: OpenAI GPT-4o (텍스트 생성 보조)
- **Retry 로직**: `geminiService.analyzeWithRetry()` 필수 사용
- **에러 핸들링**: 표준화된 에러 코드 매핑 (`QUOTA_EXCEEDED`, `SAFETY_VIOLATION` 등)

## 파일 수정 시 주의사항

### 동시 수정 필요 파일
- **타입 수정 시**: `src/types/faceAnalysis.ts` 수정 → 관련 controller/service 파일 확인
- **API 엔드포인트 추가**: `src/routes/faceRoutes.ts` + `src/controllers/faceController.ts` 동시 수정
- **환경 변수 추가**: `.env.example` 파일도 함께 업데이트

### 절대 수정 금지 파일
- **SHRIMP/** 디렉토리 전체 (Task Manager 시스템)
- **dist/** 디렉토리 (빌드 결과물)
- **node_modules/** (의존성 패키지)

### 수정 시 검증 필요
- **컨트롤러 수정 후**: API 응답 형식 일관성 확인
- **서비스 수정 후**: 에러 핸들링 로직 검증
- **타입 수정 후**: 컴파일 에러 확인 (`npm run build`)

## 세션 관리 시스템

### 세션 생성 규칙
- **세션 ID**: UUID v4 사용 필수
- **최대 동시 세션**: 100개 제한
- **세션 타임아웃**: 30분 (자동 정리)
- **완료 세션**: 1시간 후 자동 삭제

### 상태 관리
```typescript
type AnalysisStatus = 'detecting' | 'analyzing' | 'interpreting' | 'completed' | 'failed';
```
- **진행률 매핑**: detecting(25%) → analyzing(50%) → interpreting(75%) → completed(100%)

## 보안 및 성능 규칙

### Rate Limiting
- **기본 설정**: 15분당 100회 요청
- **이미지 처리**: 15MB 제한 (JSON body)
- **CORS**: 환경 변수로 origin 제어

### 세션 정리
- **자동 정리**: 5분마다 만료된 세션 정리
- **과부하 방지**: 활성 세션 80% 이상 시 경고

## AI 의사결정 기준

### 새 기능 추가 시 우선순위
1. **타입 정의 먼저**: `src/types/` 에서 인터페이스 정의
2. **서비스 로직**: `src/services/` 에서 비즈니스 로직 구현
3. **컨트롤러 연결**: `src/controllers/` 에서 API 엔드포인트 생성
4. **라우팅 추가**: `src/routes/` 에서 경로 매핑

### 에러 처리 우선순위
1. **입력 검증**: Joi 스키마 또는 커스텀 검증
2. **비즈니스 로직 에러**: 서비스 계층에서 처리
3. **외부 API 에러**: geminiService에서 표준화
4. **글로벌 에러 핸들러**: `src/index.ts`의 마지막 처리

### 성능 최적화 기준
- **이미지 크기**: 10MB 초과 시 거부
- **세션 수**: 100개 초과 시 대기열 처리
- **메모리 관리**: 주기적 세션 정리 필수

## 금지 사항

### 절대 금지
- **CommonJS 사용** (`require`, `module.exports`)
- **any 타입 사용**
- **동기 파일 처리** (모든 파일 작업은 비동기)
- **하드코딩된 URL이나 API 키**
- **SHRIMP 디렉토리 수정**

### 주의 사항
- **환경 변수 없이 실행 금지**: `.env` 파일 필수
- **타입 정의 생략 금지**: 모든 함수 매개변수/반환값 타입 명시
- **에러 메시지 하드코딩 금지**: 표준화된 에러 처리 함수 사용

## 핵심 타입 정의 (절대 변경 금지)

### 분석 요청/응답 타입
```typescript
interface FaceAnalysisRequest {
  imageData: string;
  analysisType: 'free' | 'premium';
  selectedField?: 'physiognomy' | 'palmistry' | 'fortune';
}

interface FaceAnalysisResponse {
  success: boolean;
  data?: FreeAnalysisResult | PremiumAnalysisResult;
  error?: string;
  processingTime?: number;
}
```

### 세션 관리 타입
```typescript
interface AnalysisSession {
  sessionId: string;
  imageData: string;
  analysisType: 'free' | 'premium';
  selectedField?: string;
  status: AnalysisStatus;
  createdAt: Date;
  completedAt?: Date;
  result?: FaceAnalysisResponse;
}
```

## 테스트 및 배포

### 필수 확인 사항
- **빌드 성공**: `npm run build` 오류 없음
- **타입 검사**: TypeScript 컴파일 오류 없음
- **API 응답 형식**: 표준 형식 준수 확인
- **환경 변수**: 프로덕션 환경 설정 확인

### 배포 전 체크리스트
- [ ] 모든 import 경로에 `.js` 확장자 포함
- [ ] 환경 변수 설정 완료
- [ ] API 키 보안 확인
- [ ] 에러 처리 로직 검증
- [ ] 세션 정리 로직 동작 확인

## 구현 예시

### 올바른 방법: 이미지 검증
```typescript
async function validateImage(imageData: string): Promise<ImageValidationResult> {
  if (!imageData.startsWith('data:image/')) {
    return { isValid: false, error: '지원되지 않는 이미지 형식입니다.' };
  }
  
  const sizeInBytes = (imageData.length * 3) / 4;
  if (sizeInBytes > 10 * 1024 * 1024) {
    return { isValid: false, error: '이미지 크기가 너무 큽니다.' };
  }
  
  return { isValid: true };
}
```

### 금지된 방법: 동기 처리
```typescript
// 잘못된 예시 - 절대 금지
function processImageSync(imagePath: string) {
  const imageData = fs.readFileSync(imagePath); // 동기 처리 금지
  return heavyProcessing(imageData);
}
```

### 올바른 방법: 에러 핸들링
```typescript
async function analyzeFace(imageData: string): Promise<FaceAnalysisResponse> {
  try {
    const result = await geminiService.analyzeWithRetry(imageData);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: this.getErrorMessage(error) };
  }
}
```

## 환경 설정

### 필수 환경 변수
```bash
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# OpenAI API (선택사항)
OPENAI_API_KEY=your_openai_api_key

# 서버 설정
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```