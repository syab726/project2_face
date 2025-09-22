# 🚨 코드 보호 규칙 🚨

## 절대 수정 금지 파일 및 기능

### 1. 전문관상 분석 관련 파일들 - 🔒 **완전 보호 대상**
- `/src/app/api/analysis/professional-physiognomy/route.ts` - **절대 수정 금지**
- `/src/components/FaceAnalyzer.tsx` - **전문관상 관련 부분 수정 금지**
- `/src/lib/ai-services.ts` - **analyzeProfessionalPhysiognomy 함수 수정 금지**

### 2. 관상+사주 분석 관련 파일들 - 🔒 **완전 보호 대상**
- `/src/app/api/analysis/face-saju/route.ts` - **절대 수정 금지**
- `/src/components/FaceSajuAnalyzer.tsx` - **종합분석 및 UI 구조 수정 금지**
- `/src/lib/ai-services.ts` - **analyzeFaceSajuCombined 함수 수정 금지**

### 3. AI 모델 설정 - 🔒 **완전 보호 대상**
- **모든 AI 분석은 반드시 파인튜닝 모델 사용**: `ft:gpt-4.1-nano-2025-04-14:personal::BsAUgX2j`
- 절대 일반 GPT 모델(gpt-4o-mini 등)로 변경 금지
- 모델 변경은 사용자의 명시적 허락 필요

### 4. 보호 규칙
- 위 파일들은 **사용자의 명시적 허락** 없이는 절대 수정할 수 없음
- 버그 수정, 최적화, 리팩토링 등 어떤 이유라도 먼저 허락을 받아야 함
- 새로운 기능 추가 시에도 전문관상 관련 로직에는 절대 영향을 주면 안 됨

### 5. 허용되는 작업
- 다른 분석 기능 (MBTI, 이상형 등) 수정은 가능 (단, 관상+사주는 보호 대상)
- 새로운 API 라우트 추가는 가능 (단, 전문관상과 무관한 것만)
- UI 스타일링 변경 (단, 전문관상 관련 로직 변경은 금지)

### 6. 위반 시 조치
- 사용자 허락 없이 보호된 코드를 수정하면 즉시 롤백
- 수정 전 반드시 "보호된 코드 수정 허가를 요청합니다" 라고 명시적으로 물어봐야 함
- UI 컨테이너 구조 변경 시 PDF 저장 기능 영향 검토 필수

---
**⚠️ 이 규칙은 절대적이며 예외 없이 적용됩니다.**