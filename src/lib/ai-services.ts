// AI 분석 서비스 통합 라이브러리
// Gemini 이미지 인식 + OpenAI 파인튜닝 + GPT 사주 분석

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// AI 분석 결과 인터페이스
export interface FaceAnalysisResult {
  features: {
    eyeShape: string;
    noseShape: string;
    mouthShape: string;
    faceShape: string;
    eyebrowShape: string;
  };
  personality: {
    traits: string[];
    strengths: string[];
    weaknesses: string[];
  };
  fortune: {
    career: string;
    love: string;
    wealth: string;
    health: string;
  };
  detailedAdvice?: {
    immediate: string[];
    longterm: string[];
    relationships: string[];
    career: string[];
  };
  confidence: number;
  error?: string;
}


export interface SajuAnalysisResult {
  basic: {
    year: string;
    month: string;
    day: string;
    time: string;
  };
  elements: {
    primary: string;
    secondary: string;
    balance: string;
  };
  personality: {
    core: string[];
    strengths: string[];
    weaknesses: string[];
  };
  fortune: {
    thisYear: string;
    career: string;
    love: string;
    wealth: string;
    health: string;
  };
  compatibility: {
    bestMatches: string[];
    challenges: string[];
  };
  advice: string[];
  confidence: number;
}

export class AIAnalysisService {
  private gemini: GoogleGenerativeAI;
  private openai: OpenAI;
  
  private readonly GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
  private readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
  private readonly GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-001';
  private readonly GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation';
  private readonly CHATGPT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  private readonly FINE_TUNED_MODEL = process.env.FINE_TUNED_MODEL!;

  /**
   * 강화된 안전한 JSON 파싱 유틸리티
   * AI 응답에서 JSON을 안전하게 추출하고 파싱
   */
  private safeJsonParse(response: string, context: string = '분석'): any {
    console.log(`${context} JSON 파싱 시작, 응답 길이:`, response.length);

    try {
      // 1. 먼저 직접 파싱 시도
      return JSON.parse(response);
    } catch (directError) {
      console.log(`${context} 직접 파싱 실패:`, directError instanceof Error ? directError.message : String(directError));
      console.log(`${context} 정리 후 재시도...`);

      try {
        // 2. 마크다운 코드 블록 제거
        let cleanedResponse = response
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        // 3. JSON 부분만 추출 - 중첩된 중괄호 처리
        const startIdx = cleanedResponse.indexOf('{');
        if (startIdx === -1) {
          throw new Error(`${context} 응답에서 JSON 시작 부분을 찾을 수 없습니다.`);
        }

        let braceCount = 0;
        let endIdx = startIdx;
        let foundCompleteJson = false;

        for (let i = startIdx; i < cleanedResponse.length; i++) {
          const char = cleanedResponse[i];
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            foundCompleteJson = true;
            break;
          }
        }

        let jsonStr = cleanedResponse.substring(startIdx, endIdx + 1);

        // 4. 불완전한 JSON 복구 시도
        if (!foundCompleteJson) {
          console.log(`${context} 불완전한 JSON 감지, 복구 시도...`);
          jsonStr = cleanedResponse.substring(startIdx);

          // 강화된 복구 로직: 불완전한 문자열 값 처리
          jsonStr = this.repairIncompleteJson(jsonStr);
        }

        // 5. 위치별 오류 복구 강화 (position 375 같은 특정 위치 오류 해결)
        jsonStr = this.fixSpecificPositionErrors(jsonStr, context);

        // 6. JSON 문자열 정리
        jsonStr = jsonStr
          .replace(/,\s*}/g, '}')           // 마지막 콤마 제거
          .replace(/,\s*]/g, ']')           // 배열 마지막 콤마 제거
          .replace(/'/g, '"')               // 싱글 쿼트를 더블 쿼트로
          .replace(/\n\s*\n/g, '\n')        // 연속된 빈 줄 제거
          .replace(/\\"([^"]*?)\\"/g, '"$1"') // 이스케이프된 따옴표 수정
          .trim();

        // 7. 첫 번째 파싱 시도
        try {
          const result = JSON.parse(jsonStr);
          console.log(`${context} 정리된 JSON 파싱 성공!`);
          return result;
        } catch (firstError) {
          console.log(`${context} 첫 번째 정리 실패:`, firstError instanceof Error ? firstError.message : String(firstError));
          console.log(`${context} 추가 수정 시도...`);

          // 8. 추가 수정 시도 - 더 강화된 패턴 매칭
          let moreFixedJson = this.applyAdvancedJsonFixes(jsonStr);

          try {
            const result = JSON.parse(moreFixedJson);
            console.log(`${context} 추가 수정된 JSON 파싱 성공!`);
            return result;
          } catch (secondError) {
            console.error(`${context} JSON 파싱 완전 실패`);
            console.error('원본 응답 전체:', response);
            console.error('정리된 JSON:', jsonStr);
            console.error('추가 수정된 JSON:', moreFixedJson);
            console.error('첫 번째 오류:', firstError instanceof Error ? firstError.message : String(firstError));
            console.error('두 번째 오류:', secondError instanceof Error ? secondError.message : String(secondError));

            // 최후의 수단: 수동으로 JSON 구조 복구
            console.log('최후 복구 시도...');
            try {
              const manuallyFixedJson = this.manualJsonRepair(response);
              const finalResult = JSON.parse(manuallyFixedJson);
              console.log(`${context} 수동 복구 성공!`);
              return finalResult;
            } catch (manualError) {
              console.error('수동 복구도 실패:', manualError);
              throw new Error(`${context} JSON 파싱 실패: ${secondError instanceof Error ? secondError.message : String(secondError)}`);
            }
          }
        }
      } catch (extractionError) {
        console.error(`${context} JSON 추출 실패:`, extractionError);
        console.error('원본 응답 처음 500자:', response.substring(0, 500));
        throw extractionError;
      }
    }
  }

  // 불완전한 JSON을 복구하는 전용 함수
  private repairIncompleteJson(jsonStr: string): string {
    console.log('JSON 복구 시작, 원본 길이:', jsonStr.length);

    let workingJson = jsonStr;

    // 1. 불완전한 문자열 값 제거 (더 정확한 패턴)
    // 마지막에 따옴표가 닫히지 않은 속성을 완전히 제거
    const incompleteStringPattern = /,\s*"[^"]*"\s*:\s*"[^"]*$/;
    if (incompleteStringPattern.test(workingJson)) {
      console.log('불완전한 문자열 속성 발견, 제거 중...');
      workingJson = workingJson.replace(incompleteStringPattern, '');
    }

    // 2. 또 다른 패턴: 따옴표 없이 끝나는 값
    const incompleteValuePattern = /,\s*"[^"]*"\s*:\s*[^,"}]*$/;
    if (incompleteValuePattern.test(workingJson)) {
      console.log('불완전한 값 발견, 제거 중...');
      workingJson = workingJson.replace(incompleteValuePattern, '');
    }

    // 3. 마지막 콤마 제거
    workingJson = workingJson.replace(/,\s*$/, '');

    // 4. 중괄호 균형 맞추기
    let openBraces = 0;
    for (let i = 0; i < workingJson.length; i++) {
      if (workingJson[i] === '{') openBraces++;
      if (workingJson[i] === '}') openBraces--;
    }

    console.log('열린 중괄호 개수:', openBraces);

    // 5. 필요한 만큼 중괄호 닫기
    for (let i = 0; i < openBraces; i++) {
      workingJson += '}';
    }

    console.log('JSON 복구 완료, 최종 길이:', workingJson.length);
    console.log('복구된 JSON 마지막 100자:', workingJson.slice(-100));

    return workingJson;
  }

  // 위치별 JSON 오류 복구 (position 375 같은 특정 위치 오류 해결)
  private fixSpecificPositionErrors(jsonStr: string, context: string): string {
    console.log(`${context} 위치별 오류 복구 시작...`);

    // 자주 발생하는 패턴: "key": "value 가 갑자기 끝나는 경우
    // position 375와 같은 오류는 보통 문자열이 따옴표 없이 끝나는 경우

    // 1. 따옴표가 닫히지 않은 문자열 찾기
    const incompleteStringRegex = /:\s*"[^"]*$/gm;
    const matches = jsonStr.match(incompleteStringRegex);

    if (matches) {
      console.log(`${context} 불완전한 문자열 ${matches.length}개 발견:`, matches);

      matches.forEach(match => {
        const matchIndex = jsonStr.lastIndexOf(match);
        if (matchIndex > 0) {
          // 불완전한 문자열이 있는 위치에서 그 이전의 완성된 부분까지만 유지
          console.log(`${context} 불완전한 문자열 제거: ${match}`);

          // 이전 콤마나 중괄호까지 찾아서 잘라내기
          for (let i = matchIndex - 1; i >= 0; i--) {
            if (jsonStr[i] === ',' || jsonStr[i] === '{') {
              jsonStr = jsonStr.substring(0, jsonStr[i] === ',' ? i : i + 1);
              console.log(`${context} 잘린 지점: 인덱스 ${i}`);
              break;
            }
          }
        }
      });
    }

    // 2. 콤마나 따옴표 누락으로 인한 오류 패턴 수정
    jsonStr = jsonStr
      .replace(/([^"]),(\s*"[^"]*":\s*"[^"]*)\s*$/g, '$1,$2"')  // 마지막 값에 따옴표 추가
      .replace(/:\s*([^",}\]]+)\s*$/g, ': "$1"')               // 마지막 값 따옴표 처리
      .replace(/,\s*$/g, '');                                  // 마지막 콤마 제거

    console.log(`${context} 위치별 오류 복구 완료`);
    return jsonStr;
  }

  // 고급 JSON 수정 함수
  private applyAdvancedJsonFixes(jsonStr: string): string {
    console.log('고급 JSON 수정 시작...');

    let fixedJson = jsonStr;

    // 1. 값에 따옴표가 없는 경우 처리
    fixedJson = fixedJson.replace(/(\w+):\s*([^",\[\]{}]+)(?=\s*[,}])/g, '"$1": "$2"');

    // 2. 중복 따옴표 제거
    fixedJson = fixedJson.replace(/"\s*:\s*"([^"]*?)""/g, '": "$1"');

    // 3. 마지막 콤마 제거 (더 강화된 버전)
    fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');

    // 4. 불완전한 문자열 값 수정 (더 정교함)
    fixedJson = fixedJson.replace(/:\s*"([^"]*?)$/g, ': "$1"');

    // 5. 불완전한 값 수정
    fixedJson = fixedJson.replace(/:\s*([^",\[\]{}]+)$/g, ': "$1"');

    // 6. 특수한 패턴들 처리
    // "key": "value 문자열이 어딘가에서 끊어진 경우
    fixedJson = fixedJson.replace(/:\s*"([^"]*?)\s*([^",}]*?)$/gm, ': "$1"');

    // 7. 줄바꿈이나 공백으로 인한 문제 해결
    fixedJson = fixedJson.replace(/:\s*"([^"]*?)\n/g, ': "$1",\n');

    console.log('고급 JSON 수정 완료');
    return fixedJson;
  }

  // 최후의 수단: 완전히 수동으로 JSON 구조 복구
  private manualJsonRepair(response: string): string {
    console.log('수동 JSON 복구 시작...');

    // JSON 시작점 찾기
    const startIdx = response.indexOf('{');
    if (startIdx === -1) {
      throw new Error('JSON 시작점을 찾을 수 없습니다.');
    }

    let jsonStr = response.substring(startIdx);

    // 마크다운 코드 블록 제거
    jsonStr = jsonStr
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('복구 대상 JSON (첫 200자):', jsonStr.substring(0, 200));
    console.log('복구 대상 JSON (끝 200자):', jsonStr.slice(-200));

    // 1. 불완전한 문자열 값 처리
    // 패턴들: "avoidGod": "기신은 '수' 또는 '토'  (따옴표 없이 끝남)
    const incompletePatterns = [
      /:\s*"[^"]*$/,                    // 기본 불완전 문자열
      /:\s*"[^"]*[^",}\]]\s*$/,         // 문자로 끝나는 불완전 문자열
      /"[^"]*:\s*"[^"]*$/               // 키:값에서 값이 불완전한 경우
    ];

    let foundIncomplete = false;
    for (const pattern of incompletePatterns) {
      const match = jsonStr.match(pattern);
      if (match) {
        console.log('불완전한 문자열 패턴 발견:', match[0]);
        foundIncomplete = true;

        // 불완전한 부분을 찾아서 제거
        const matchIndex = jsonStr.lastIndexOf(match[0]);
        if (matchIndex > 0) {
          // 이전 완성된 속성까지만 유지 (콤마나 중괄호 찾기)
          let cutIndex = matchIndex;
          for (let i = matchIndex - 1; i >= 0; i--) {
            if (jsonStr[i] === ',' || jsonStr[i] === '{') {
              cutIndex = jsonStr[i] === ',' ? i : i + 1;
              break;
            }
          }
          jsonStr = jsonStr.substring(0, cutIndex);
          console.log('불완전 부분 제거 후:', jsonStr.slice(-100));
        }
        break;
      }
    }

    // 2. 마지막 콤마 정리
    jsonStr = jsonStr.replace(/,\s*$/, '').trim();

    // 3. 중괄호 균형 맞추기
    let openBraces = 0;
    let openBrackets = 0;

    for (let i = 0; i < jsonStr.length; i++) {
      if (jsonStr[i] === '{') openBraces++;
      else if (jsonStr[i] === '}') openBraces--;
      else if (jsonStr[i] === '[') openBrackets++;
      else if (jsonStr[i] === ']') openBrackets--;
    }

    console.log(`중괄호 균형: ${openBraces}개 부족, 대괄호 균형: ${openBrackets}개 부족`);

    // 필요한 만큼 닫는 괄호 추가
    for (let i = 0; i < openBrackets; i++) {
      jsonStr += ']';
    }
    for (let i = 0; i < openBraces; i++) {
      jsonStr += '}';
    }

    // 4. JSON 문법 오류 수정
    jsonStr = jsonStr
      .replace(/,\s*}/g, '}')           // 마지막 콤마 제거
      .replace(/,\s*]/g, ']')           // 배열 마지막 콤마 제거
      .replace(/'/g, '"')               // 싱글 쿼트를 더블 쿼트로
      .replace(/[\r\n\t]+/g, ' ')       // 개행문자를 공백으로
      .replace(/\s+/g, ' ')             // 연속 공백 정리
      .trim();

    console.log('수동 복구 완료!');
    console.log('최종 JSON 길이:', jsonStr.length);
    console.log('최종 JSON 마지막 100자:', jsonStr.slice(-100));

    return jsonStr;
  }

  constructor() {
    if (!this.GEMINI_API_KEY || !this.OPENAI_API_KEY) {
      throw new Error('AI API 키가 설정되지 않았습니다.');
    }

    this.gemini = new GoogleGenerativeAI(this.GEMINI_API_KEY);
    this.openai = new OpenAI({
      apiKey: this.OPENAI_API_KEY,
    });
  }

  /**
   * MBTI 타입별 상세한 특성 정보 제공
   */
  private getMBTICharacteristics(mbtiType: string): string {
    const characteristics: { [key: string]: string } = {
      'ENFP': `
• 주기능: Ne(외향직관) - 가능성 탐구, 창의적 아이디어, 열정적 탐색
• 부기능: Fi(내향감정) - 깊은 가치관, 진정성, 개인적 신념
• 3차기능: Te(외향사고) - 효율적 실행, 목표 달성
• 열등기능: Si(내향감각) - 세부사항 관리, 일상 루틴 (약점 영역)
• 특성: 다양한 경험 추구, SNS 활발, 창의적 표현, 자유로운 사고`,
      
      'ENFJ': `
• 주기능: Fe(외향감정) - 타인 배려, 조화 추구, 감정 공감
• 부기능: Ni(내향직관) - 미래 비전, 통찰력, 깊은 이해
• 3차기능: Se(외향감각) - 현재 순간 감각, 활동적 에너지
• 열등기능: Ti(내향사고) - 논리적 분석 (약점 영역)
• 특성: 소셜 리더십, 공동체 의식, 사회 정의 관심, 멘토링`,
      
      'ENTP': `
• 주기능: Ne(외향직관) - 새로운 가능성, 창의적 연결, 변화 추구
• 부기능: Ti(내향사고) - 논리적 분석, 체계적 사고
• 3차기능: Fe(외향감정) - 사회적 관계, 타인 고려
• 열등기능: Si(내향감각) - 전통과 관습 (약점 영역)
• 특성: 혁신적 사고, 토론 좋아함, 트렌드 창조, 자유로운 발상`,
      
      'ENTJ': `
• 주기능: Te(외향사고) - 효율적 시스템, 목표 달성, 리더십
• 부기능: Ni(내향직관) - 장기 비전, 전략적 계획
• 3차기능: Se(외향감각) - 현실적 실행력, 경쟁 의식
• 열등기능: Fi(내향감정) - 개인적 가치, 감정 표현 (약점 영역)
• 특성: 목표 지향적, 스타트업 창업, 효율성 추구, 성과 중시`,
      
      'ESFP': `
• 주기능: Se(외향감각) - 현재 순간 즐김, 활발한 에너지, 경험 중시
• 부기능: Fi(내향감정) - 개인적 가치, 진정성, 자유로운 표현
• 3차기능: Te(외향사고) - 실용적 계획, 효율성
• 열등기능: Ni(내향직관) - 장기 계획, 미래 예측 (약점 영역)
• 특성: 소셜미디어 활발, 트렌드 빠른 수용, 재미 추구, 표현력`,
      
      'ESFJ': `
• 주기능: Fe(외향감정) - 타인 배려, 화합 추구, 관계 중시
• 부기능: Si(내향감각) - 전통 존중, 안정감, 세심한 관리
• 3차기능: Ne(외향직관) - 새로운 가능성, 창의적 아이디어
• 열등기능: Ti(내향사고) - 논리적 분석 (약점 영역)
• 특성: 케어 문화, 공감 능력, 소통 중시, 배려심`,
      
      'ESTP': `
• 주기능: Se(외향감각) - 즉흥적 행동, 현실적 감각, 활동적
• 부기능: Ti(내향사고) - 논리적 판단, 문제 해결
• 3차기능: Fe(외향감정) - 사회적 매력, 유머 감각
• 열등기능: Ni(내향직관) - 장기 비전, 깊은 통찰 (약점 영역)
• 특성: 액션 중심, 스포츠/게임, 즉석 반응, 현실적 사고`,
      
      'ESTJ': `
• 주기능: Te(외향사고) - 체계적 관리, 효율성, 목표 달성
• 부기능: Si(내향감각) - 전통과 규칙, 안정성, 경험 활용
• 3차기능: Ne(외향직관) - 새로운 아이디어, 가능성 탐구
• 열등기능: Fi(내향감정) - 개인적 감정, 가치관 (약점 영역)
• 특성: 실무 능력, 조직 관리, 성과 중심, 책임감`,
      
      'INFP': `
• 주기능: Fi(내향감정) - 깊은 가치관, 진정성, 개인적 신념
• 부기능: Ne(외향직관) - 창의적 가능성, 상상력, 이상 추구
• 3차기능: Si(내향감각) - 과거 경험, 세부사항
• 열등기능: Te(외향사고) - 체계적 실행, 효율성 (약점 영역)
• 특성: 개성 추구, 예술적 표현, 사회 정의, 자아 탐구`,
      
      'INFJ': `
• 주기능: Ni(내향직관) - 미래 통찰, 패턴 인식, 깊은 이해
• 부기능: Fe(외향감정) - 타인 공감, 조화 추구, 관계 중시
• 3차기능: Ti(내향사고) - 논리적 분석, 체계적 사고
• 열등기능: Se(외향감각) - 현재 순간, 감각적 경험 (약점 영역)
• 특성: 깊은 사고, 의미 추구, 완벽주의, 이상주의`,
      
      'INTP': `
• 주기능: Ti(내향사고) - 논리적 분석, 체계적 이해, 개념 탐구
• 부기능: Ne(외향직관) - 새로운 아이디어, 가능성 연결
• 3차기능: Si(내향감각) - 과거 데이터, 경험 축적
• 열등기능: Fe(외향감정) - 타인 감정, 사회적 관계 (약점 영역)
• 특성: 지적 호기심, 독립적 사고, 분석적 접근, 창의성`,
      
      'INTJ': `
• 주기능: Ni(내향직관) - 장기 비전, 체계적 통찰, 패턴 인식
• 부기능: Te(외향사고) - 효율적 실행, 목표 달성, 체계화
• 3차기능: Fi(내향감정) - 개인적 가치, 내적 동기
• 열등기능: Se(외향감각) - 현재 순간, 즉흥성 (약점 영역)
• 특성: 전략적 사고, 독립성, 혁신 추구, 완벽주의`,
      
      'ISFP': `
• 주기능: Fi(내향감정) - 개인적 가치, 진정성, 감정 깊이
• 부기능: Se(외향감각) - 현재 순간, 미적 감각, 경험 중시
• 3차기능: Ni(내향직관) - 미래 가능성, 통찰력
• 열등기능: Te(외향사고) - 체계적 계획, 효율성 (약점 영역)
• 특성: 예술적 감각, 자연스러움, 개성 표현, 감성적`,
      
      'ISFJ': `
• 주기능: Si(내향감각) - 과거 경험, 안정성, 세심한 관리
• 부기능: Fe(외향감정) - 타인 배려, 조화 추구, 봉사 정신
• 3차기능: Ti(내향사고) - 논리적 판단, 체계적 분석
• 열등기능: Ne(외향직관) - 새로운 가능성, 변화 (약점 영역)
• 특성: 케어 문화, 안정 추구, 신뢰성, 성실함`,
      
      'ISTP': `
• 주기능: Ti(내향사고) - 논리적 분석, 문제 해결, 이해 추구
• 부기능: Se(외향감각) - 현실적 행동, 즉흥성, 실용성
• 3차기능: Ni(내향직관) - 패턴 인식, 통찰력
• 열등기능: Fe(외향감정) - 타인 감정, 관계 관리 (약점 영역)
• 특성: 실용적 기술, 독립성, 문제 해결, 효율성`,
      
      'ISTJ': `
• 주기능: Si(내향감각) - 과거 경험, 전통 존중, 체계적 관리
• 부기능: Te(외향사고) - 효율적 실행, 목표 달성, 책임감
• 3차기능: Fi(내향감정) - 개인적 가치, 내적 동기
• 열등기능: Ne(외향직관) - 새로운 가능성, 창의성 (약점 영역)
• 특성: 안정성 추구, 계획성, 신뢰성, 성실함`
    };
    
    return characteristics[mbtiType] || '알 수 없는 MBTI 타입';
  }

  /**
   * ⚠️ 중요 경고: 얼굴 특징 분석 함수 수정 금지
   * 
   * 이 함수는 사용자의 명시적 요청에 따라 잠금 상태입니다.
   * 특히 더미 데이터 폴백 처리 추가 절대 금지
   * - 파인튜닝된 OpenAI 모델을 통한 실제 얼굴 분석만 수행
   * - JSON 파싱 실패시 오류 발생 (더미 데이터 반환 금지)
   * - max_tokens 12000으로 고정
   *
   * 수정 필요시 반드시 사용자 승인 필요
   * 마지막 승인: 2025-01-11
   *
   * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
   *
   * 파인튜닝된 OpenAI 모델로 얼굴 이미지 인식 및 특징 추출
   */
  async analyzeFaceFeatures(imageBuffer: Buffer, mimeType: string = 'image/jpeg'): Promise<any> {
    try {
      // 파인튜닝된 OpenAI 모델 사용
      const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

      const prompt = `
당신은 30년 경력의 전문 관상학자입니다. 신상전편, 마의상법, 월파상법 등 고전 관상학 이론에 정통하며, 이 얼굴 사진을 극도로 세밀하게 분석해주세요.

=== 극세밀 관상학적 얼굴 분석 ===

1. 이마 (천정궁/명궁) - 지혜와 관록 담당:
- 이마 높이: 4지(매우높음)/3지반(높음)/3지(보통)/2지반(낮음)/2지(매우낮음)
- 이마 너비: 넓음(5지이상)/보통(4-5지)/좁음(4지미만)
- 이마 형태: 방정형/원만형/삼각형/역삼각형/불규칙형
- 이마 돌출도: 높이돌출/중간돌출/평평/약간들어감/깊이들어감
- 이마 색택: 황명하고윤택/백색윤택/붉은빛/어둡고칙칙/청흑색
- 발제선: 둥근형/각진형/M자형/일자형/불규칙형
- 천창골(관자골): 돌출/평평/들어감
- 이마 주름: 없음/1-2개가로줄/3개이상가로줄/세로줄있음/미간주름

2. 눈 (감찰궁) - 정신과 지혜의 창:
- 눈 크기: 대안(매우큼)/중대안(큼)/중안(보통)/소안(작음)/세안(매우작음)
- 눈 길이: 장안(긺)/중장안(약간긺)/중안(보통)/단안(짧음)/극단안(매우짧음)
- 눈 모양: 봉안(가늘고긺)/용안(위엄있음)/학안(맑고예리)/사안(삼각형)/어안(둥글고큼)/견안(작고예리)/조안(새눈)
- 눈꼬리: 위로올라감/평행/아래로내려감
- 눈동자: 정중앙위치/약간위쪽/약간아래쪽/한쪽치우침
- 흰자위: 맑고깨끗/약간혼탁/누런빛/붉은혈관/검은점
- 눈빛: 정신(매우맑음)/유신(부드러움)/산신(흐림)/사신(사나움)/죽신(생기없음)
- 쌍꺼풀: 쌍꺼풀/속쌍꺼풀/무쌍/한쪽만쌍꺼풀
- 눈꺼풀: 두꺼움/보통/얇음/처짐/부어있음
- 눈밑 거주궁(애교살): 풍만/보통/메마름/다크서클/주름

3. 눈썹 (보수궁) - 형제와 교우관계:
- 눈썹 모양: 일자미(일직선)/검미(검처럼곧음)/신미(새털모양)/각미(각진모양)/연환미(연결된고리)
- 눈썹 농담: 농미(진함)/중농미(보통)/담미(연함)/잡색미(섞임)
- 눈썹 순역: 순미(털이순방향)/역미(털이역방향)/교잡미(뒤섞임)
- 눈썹 기세: 양미(위로향함)/수미(아래로향함)/산미(흩어진모양)
- 눈썹 길이: 장미(눈보다길음)/등미(눈과같음)/단미(눈보다짧음)
- 미간: 넓음(2지이상)/보통(1.5-2지)/좁음(1.5지미만)
- 미간 색택: 밝고윤택/보통/어둡고거칠음

4. 코 (재백궁/준두) - 재물과 중년운:
- 산근(콧대시작): 높고곧음/보통/낮고들어감/끊어짐
- 연상(콧대중간): 곧고높음/약간곡선/낮음/좌우불균형
- 준두(코끝): 원만하고윤택/뾰족함/넓고평평/갈라짐/붉음
- 난정(양쪽콧볼): 풍만하고좋은색/보통/작고메마름/붉거나검음
- 공창(콧구멍): 세로타원형/둥근형/넓은형/보이지않음/비뚤어짐
- 코 길이: 길음(인중과비슷)/보통/짧음
- 콧대 두께: 두꺼움/보통/얇음
- 코 전체 색택: 황명윤택/흰색/붉음/어둡거나검음

5. 입 (출납궁/품록궁) - 언변과 식록:
- 입 크기: 대구(큼)/중구(보통)/소구(작음)
- 입술 형태: 궁형(활모양)/방형(네모)/원형(둥글음)/뾰족형
- 상순: 두꺼움/보통/얇음/뒤틀림/상처나흉터
- 하순: 두꺼움/보통/얇음/처짐/뒤틀림
- 입꼬리: 위로올라감/평행/아래로내려감/비대칭
- 입술 색상: 붉고윤택/분홍/창백/어둡거나검음/자주빛
- 인중: 깊고곧음/얕음/비뚤어짐/넓음/좁음
- 인중 길이: 길음/보통/짧음
- 치아: 희고가지런함/누렇거나틈/삐뚤거나빠짐/보이지않음

6. 턱과 하정(지각궁) - 말년운과 부하:
- 턱 형태: 방원형(가장좋음)/원형/뾰족형/각진형/이중턱
- 턱 크기: 풍만하고큼/보통/작고메마름
- 턱 위치: 정중앙/약간한쪽으로치우침/많이비뚤어짐
- 하악골: 잘발달됨/보통/빈약함
- 볼 (협거): 풍만하고윤택/보통/메마르고거칠음/처진살/비대칭
- 광대뼈: 적당히돌출/평평/과도히돌출/들어감

7. 귀 (채청궁) - 수명과 지혜:
- 귀 크기: 대이(큼)/중이(보통)/소이(작음)
- 귀 위치: 눈썹-코끝선내/그보다위쪽/그보다아래쪽
- 귓바퀴: 두터움/보통/얇음
- 귀구멍: 깊고큼/보통/얕고작음
- 귀 색택: 희고윤택/보통/어둡거나붉음
- 귀엽: 두터움/보통/얇음/구멍뚫림

8. 관상학적 얼굴 형태 (면상십이궁):
- 기본 얼굴형: 방형(사각형)/원형(둥근형)/삼각형/역삼각형/장방형(직사각형)/타원형/다이아몬드형/팔각형
- 오행별 얼굴형: 
  * 목형(木形): 길쭉하고 각진 얼굴, 이마 넓고 턱 좁음
  * 화형(火形): 위가 넓고 아래가 뾰족한 역삼각형
  * 토형(土形): 네모나고 두터운 사각형, 전체적으로 균형
  * 금형(金形): 둥글고 원만한 원형, 살집 있고 부드러움
  * 수형(水形): 둥글면서 위아래로 긴 타원형, 살이 많음
- 관상학적 분류:
  * 귀격(貴格): 이목구비가 정돈되고 기품있는 상
  * 부격(富格): 복스럽고 후덕한 인상의 재물상
  * 수격(壽格): 건강하고 장수할 상
  * 복격(福格): 복이 많고 편안한 상
  * 빈격(貧格): 메마르고 빈한한 상
  * 천격(賤格): 비루하고 저속한 상

9. 전체 비례와 기운:
- 얼굴 삼정: 상정(이마)/중정(눈썹-코끝)/하정(코끝-턱) 균형
- 오관 조화: 매우조화로움/조화로움/보통/약간부조화/매우부조화
- 얼굴 대칭: 완전대칭/거의대칭/약간비대칭/비대칭/매우비대칭
- 전체 색택: 황명윤택/백색청수/붉은기운/어둡고거침/청흑색
- 기운: 정기(맑고밝음)/탁기(흐리고어둠)/사기(험악함)/화기(온화함)/살기(차갑고날카로움)
- 골격: 청수(맑고수려)/후중(두텁고무게있음)/조잡(거칠고산만)/기이(독특함)

JSON 형식으로만 응답해주세요:
{
  "forehead": {
    "height": "값 (4지/3지반/3지/2지반/2지)",
    "width": "값 (넓음/보통/좁음)",
    "shape": "값 (방정형/원만형/삼각형/역삼각형/불규칙형)",
    "protrusion": "값 (높이돌출/중간돌출/평평/약간들어감/깊이들어감)",
    "colorBrightness": "값 (황명하고윤택/백색윤택/붉은빛/어둡고칙칙/청흑색)",
    "hairline": "값 (둥근형/각진형/M자형/일자형/불규칙형)",
    "templesBone": "값 (돌출/평평/들어감)",
    "wrinkles": "값 (없음/1-2개가로줄/3개이상가로줄/세로줄있음/미간주름)"
  },
  "eyes": {
    "size": "값 (대안/중대안/중안/소안/세안)",
    "length": "값 (장안/중장안/중안/단안/극단안)",
    "shape": "값 (봉안/용안/학안/사안/어안/견안/조안)",
    "corner": "값 (위로올라감/평행/아래로내려감)",
    "pupilPosition": "값 (정중앙위치/약간위쪽/약간아래쪽/한쪽치우침)",
    "whiteArea": "값 (맑고깨끗/약간혼탁/누런빛/붉은혈관/검은점)",
    "eyeLight": "값 (정신/유신/산신/사신/죽신)",
    "eyelid": "값 (쌍꺼풀/속쌍꺼풀/무쌍/한쪽만쌍꺼풀)",
    "eyelidThickness": "값 (두꺼움/보통/얇음/처짐/부어있음)",
    "underEyeArea": "값 (풍만/보통/메마름/다크서클/주름)"
  },
  "eyebrows": {
    "shape": "값 (일자미/검미/신미/각미/연환미)",
    "density": "값 (농미/중농미/담미/잡색미)",
    "direction": "값 (순미/역미/교잡미)",
    "trend": "값 (양미/수미/산미)",
    "length": "값 (장미/등미/단미)",
    "distanceBetween": "값 (넓음/보통/좁음)",
    "betweenColor": "값 (밝고윤택/보통/어둡고거칠음)"
  },
  "nose": {
    "bridge": "값 (높고곧음/보통/낮고들어감/끊어짐)",
    "middle": "값 (곧고높음/약간곡선/낮음/좌우불균형)",
    "tip": "값 (원만하고윤택/뾰족함/넓고평평/갈라짐/붉음)",
    "nostrils": "값 (풍만하고좋은색/보통/작고메마름/붉거나검음)",
    "nostrilShape": "값 (세로타원형/둥근형/넓은형/보이지않음/비뚤어짐)",
    "length": "값 (길음/보통/짧음)",
    "thickness": "값 (두꺼움/보통/얇음)",
    "overallColor": "값 (황명윤택/흰색/붉음/어둡거나검음)"
  },
  "mouth": {
    "size": "값 (대구/중구/소구)",
    "shape": "값 (궁형/방형/원형/뾰족형)",
    "upperLip": "값 (두꺼움/보통/얇음/뒤틀림/상처나흉터)",
    "lowerLip": "값 (두꺼움/보통/얇음/처짐/뒤틀림)",
    "corner": "값 (위로올라감/평행/아래로내려감/비대칭)",
    "color": "값 (붉고윤택/분홍/창백/어둡거나검음/자주빛)",
    "philtrum": "값 (깊고곧음/얕음/비뚤어짐/넓음/좁음)",
    "philtrumLength": "값 (길음/보통/짧음)",
    "teeth": "값 (희고가지런함/누렇거나틈/삐뚤거나빠짐/보이지않음)"
  },
  "chinAndLower": {
    "chinShape": "값 (방원형/원형/뾰족형/각진형/이중턱)",
    "chinSize": "값 (풍만하고큼/보통/작고메마름)",
    "chinPosition": "값 (정중앙/약간한쪽으로치우침/많이비뚤어짐)",
    "jawbone": "값 (잘발달됨/보통/빈약함)",
    "cheeks": "값 (풍만하고윤택/보통/메마르고거칠음/처진살/비대칭)",
    "cheekbones": "값 (적당히돌출/평평/과도히돌출/들어감)"
  },
  "ears": {
    "size": "값 (대이/중이/소이)",
    "position": "값 (눈썹-코끝선내/그보다위쪽/그보다아래쪽)",
    "rim": "값 (두터움/보통/얇음)",
    "hole": "값 (깊고큼/보통/얕고작음)",
    "color": "값 (희고윤택/보통/어둡거나붉음)",
    "earlobe": "값 (두터움/보통/얇음/구멍뚫림)"
  },
  "faceShape": {
    "basicShape": "값 (방형/원형/삼각형/역삼각형/장방형/타원형/다이아몬드형/팔각형)",
    "fiveElementsType": "값 (목형/화형/토형/금형/수형)",
    "physiognomyClass": "값 (귀격/부격/수격/복격/빈격/천격)",
    "description": "얼굴형의 관상학적 의미와 성격적 특징 설명"
  },
  "overall": {
    "threeRegions": "값 (균형/상정높음/중정높음/하정높음/불균형)",
    "fiveFeatures": "값 (매우조화로움/조화로움/보통/약간부조화/매우부조화)",
    "symmetry": "값 (완전대칭/거의대칭/약간비대칭/비대칭/매우비대칭)", 
    "overallColor": "값 (황명윤택/백색청수/붉은기운/어둡고거침/청흑색)",
    "spirit": "값 (정기/탁기/사기/화기/살기)",
    "boneStructure": "값 (청수/후중/조잡/기이)"
  }
}
`;

      // Gemini를 사용한 이미지 분석
      const model = this.gemini.getGenerativeModel({ model: this.GEMINI_MODEL });
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType
          }
        }
      ]);

      const text = result.response.text();

      console.log('=== Gemini 얼굴 특징 분석 응답 원본 ===');
      console.log(text);
      console.log('=== Gemini 얼굴 특징 분석 응답 끝 ===');

      return this.safeJsonParse(text, '얼굴 특징 분석');

    } catch (error) {
      console.error('Gemini 얼굴 특징 분석 오류:', error);
      throw new Error(`얼굴 특징 추출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 파인튜닝된 OpenAI 모델로 얼굴 이미지 인식 및 특징 추출 (백업용 - 사용안함)
   */
  async analyzeFaceFeaturesWithOpenAI(imageBuffer: Buffer, mimeType: string = 'image/jpeg'): Promise<any> {
    try {
      // 파인튜닝된 OpenAI 모델 사용
      const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

      const prompt = `
당신은 30년 경력의 전문 관상학자입니다. 신상전편, 마의상법, 월파상법 등 고전 관상학 이론에 정통하며, 이 얼굴 사진을 극도로 세밀하게 분석해주세요.

=== 극세밀 관상학적 얼굴 분석 ===

1. 이마 (천정궁/명궁) - 지혜와 관록 담당:
- 이마 높이: 4지(매우높음)/3지반(높음)/3지(보통)/2지반(낮음)/2지(매우낮음)
- 이마 너비: 넓음(5지이상)/보통(4-5지)/좁음(4지미만)
- 이마 형태: 방정형/원만형/삼각형/역삼각형/불규칙형
- 이마 돌출도: 높이돌출/중간돌출/평평/약간들어감/깊이들어감
- 이마 색택: 황명하고윤택/백색윤택/붉은빛/어둡고칙칙/청흑색
- 발제선: 둥근형/각진형/M자형/일자형/불규칙형
- 천창골(관자골): 돌출/평평/들어감
- 이마 주름: 없음/1-2개가로줄/3개이상가로줄/세로줄있음/미간주름

2. 눈 (감찰궁) - 정신과 지혜의 창:
- 눈 크기: 대안(매우큼)/중대안(큼)/중안(보통)/소안(작음)/세안(매우작음)
- 눈 길이: 장안(긺)/중장안(약간긺)/중안(보통)/단안(짧음)/극단안(매우짧음)
- 눈 모양: 봉안(가늘고긺)/용안(위엄있음)/학안(맑고예리)/사안(삼각형)/어안(둥글고큼)/견안(작고예리)/조안(새눈)
- 눈꼬리: 위로올라감/평행/아래로내려감
- 눈동자: 정중앙위치/약간위쪽/약간아래쪽/한쪽치우침
- 흰자위: 맑고깨끗/약간혼탁/누런빛/붉은혈관/검은점
- 눈빛: 정신(매우맑음)/유신(부드러움)/산신(흐림)/사신(사나움)/죽신(생기없음)
- 쌍꺼풀: 쌍꺼풀/속쌍꺼풀/무쌍/한쪽만쌍꺼풀
- 눈꺼풀: 두꺼움/보통/얇음/처짐/부어있음
- 눈밑 거주궁(애교살): 풍만/보통/메마름/다크서클/주름

3. 눈썹 (보수궁) - 형제와 교우관계:
- 눈썹 모양: 일자미(일직선)/검미(검처럼곧음)/신미(새털모양)/각미(각진모양)/연환미(연결된고리)
- 눈썹 농담: 농미(진함)/중농미(보통)/담미(연함)/잡색미(섞임)
- 눈썹 순역: 순미(털이순방향)/역미(털이역방향)/교잡미(뒤섞임)
- 눈썹 기세: 양미(위로향함)/수미(아래로향함)/산미(흩어진모양)
- 눈썹 길이: 장미(눈보다길음)/등미(눈과같음)/단미(눈보다짧음)
- 미간: 넓음(2지이상)/보통(1.5-2지)/좁음(1.5지미만)
- 미간 색택: 밝고윤택/보통/어둡고거칠음

4. 코 (재백궁/준두) - 재물과 중년운:
- 산근(콧대시작): 높고곧음/보통/낮고들어감/끊어짐
- 연상(콧대중간): 곧고높음/약간곡선/낮음/좌우불균형
- 준두(코끝): 원만하고윤택/뾰족함/넓고평평/갈라짐/붉음
- 난정(양쪽콧볼): 풍만하고좋은색/보통/작고메마름/붉거나검음
- 공창(콧구멍): 세로타원형/둥근형/넓은형/보이지않음/비뚤어짐
- 코 길이: 길음(인중과비슷)/보통/짧음
- 콧대 두께: 두꺼움/보통/얇음
- 코 전체 색택: 황명윤택/흰색/붉음/어둡거나검음

5. 입 (출납궁/품록궁) - 언변과 식록:
- 입 크기: 대구(큼)/중구(보통)/소구(작음)
- 입술 형태: 궁형(활모양)/방형(네모)/원형(둥글음)/뾰족형
- 상순: 두꺼움/보통/얇음/뒤틀림/상처나흉터
- 하순: 두꺼움/보통/얇음/처짐/뒤틀림
- 입꼬리: 위로올라감/평행/아래로내려감/비대칭
- 입술 색상: 붉고윤택/분홍/창백/어둡거나검음/자주빛
- 인중: 깊고곧음/얕음/비뚤어짐/넓음/좁음
- 인중 길이: 길음/보통/짧음
- 치아: 희고가지런함/누렇거나틈/삐뚤거나빠짐/보이지않음

6. 턱과 하정(지각궁) - 말년운과 부하:
- 턱 형태: 방원형(가장좋음)/원형/뾰족형/각진형/이중턱
- 턱 크기: 풍만하고큼/보통/작고메마름
- 턱 위치: 정중앙/약간한쪽으로치우침/많이비뚤어짐
- 하악골: 잘발달됨/보통/빈약함
- 볼 (협거): 풍만하고윤택/보통/메마르고거칠음/처진살/비대칭
- 광대뼈: 적당히돌출/평평/과도히돌출/들어감

7. 귀 (채청궁) - 수명과 지혜:
- 귀 크기: 대이(큼)/중이(보통)/소이(작음)
- 귀 위치: 눈썹-코끝선내/그보다위쪽/그보다아래쪽
- 귓바퀴: 두터움/보통/얇음
- 귀구멍: 깊고큼/보통/얕고작음
- 귀 색택: 희고윤택/보통/어둡거나붉음
- 귀엽: 두터움/보통/얇음/구멍뚫림

8. 관상학적 얼굴 형태 (면상십이궁):
- 기본 얼굴형: 방형(사각형)/원형(둥근형)/삼각형/역삼각형/장방형(직사각형)/타원형/다이아몬드형/팔각형
- 오행별 얼굴형:
  * 목형(木形): 길쭉하고 각진 얼굴, 이마 넓고 턱 좁음
  * 화형(火形): 위가 넓고 아래가 뾰족한 역삼각형
  * 토형(土形): 네모나고 두터운 사각형, 전체적으로 균형
  * 금형(金形): 둥글고 원만한 원형, 살집 있고 부드러움
  * 수형(水形): 둥글면서 위아래로 긴 타원형, 살이 많음
- 관상학적 분류:
  * 귀격(貴格): 이목구비가 정돈되고 기품있는 상
  * 부격(富格): 복스럽고 후덕한 인상의 재물상
  * 수격(壽格): 건강하고 장수할 상
  * 복격(福格): 복이 많고 편안한 상
  * 빈격(貧格): 메마르고 빈한한 상
  * 천격(賤格): 비루하고 저속한 상

9. 전체 비례와 기운:
- 얼굴 삼정: 상정(이마)/중정(눈썹-코끝)/하정(코끝-턱) 균형
- 오관 조화: 매우조화로움/조화로움/보통/약간부조화/매우부조화
- 얼굴 대칭: 완전대칭/거의대칭/약간비대칭/비대칭/매우비대칭
- 전체 색택: 황명윤택/백색청수/붉은기운/어둡고거침/청흑색
- 기운: 정기(맑고밝음)/탁기(흐리고어둠)/사기(험악함)/화기(온화함)/살기(차갑고날카로움)
- 골격: 청수(맑고수려)/후중(두텁고무게있음)/조잡(거칠고산만)/기이(독특함)

JSON 형식으로만 응답해주세요:
{
  "forehead": {
    "height": "값 (4지/3지반/3지/2지반/2지)",
    "width": "값 (넓음/보통/좁음)",
    "shape": "값 (방정형/원만형/삼각형/역삼각형/불규칙형)",
    "protrusion": "값 (높이돌출/중간돌출/평평/약간들어감/깊이들어감)",
    "colorBrightness": "값 (황명하고윤택/백색윤택/붉은빛/어둡고칙칙/청흑색)",
    "hairline": "값 (둥근형/각진형/M자형/일자형/불규칙형)",
    "templesBone": "값 (돌출/평평/들어감)",
    "wrinkles": "값 (없음/1-2개가로줄/3개이상가로줄/세로줄있음/미간주름)"
  },
  "eyes": {
    "size": "값 (대안/중대안/중안/소안/세안)",
    "length": "값 (장안/중장안/중안/단안/극단안)",
    "shape": "값 (봉안/용안/학안/사안/어안/견안/조안)",
    "corner": "값 (위로올라감/평행/아래로내려감)",
    "pupilPosition": "값 (정중앙위치/약간위쪽/약간아래쪽/한쪽치우침)",
    "whiteArea": "값 (맑고깨끗/약간혼탁/누런빛/붉은혈관/검은점)",
    "eyeLight": "값 (정신/유신/산신/사신/죽신)",
    "eyelid": "값 (쌍꺼풀/속쌍꺼풀/무쌍/한쪽만쌍꺼풀)",
    "eyelidThickness": "값 (두꺼움/보통/얇음/처짐/부어있음)",
    "underEyeArea": "값 (풍만/보통/메마름/다크서클/주름)"
  },
  "eyebrows": {
    "shape": "값 (일자미/검미/신미/각미/연환미)",
    "density": "값 (농미/중농미/담미/잡색미)",
    "direction": "값 (순미/역미/교잡미)",
    "trend": "값 (양미/수미/산미)",
    "length": "값 (장미/등미/단미)",
    "distanceBetween": "값 (넓음/보통/좁음)",
    "betweenColor": "값 (밝고윤택/보통/어둡고거칠음)"
  },
  "nose": {
    "bridge": "값 (높고곧음/보통/낮고들어감/끊어짐)",
    "middle": "값 (곧고높음/약간곡선/낮음/좌우불균형)",
    "tip": "값 (원만하고윤택/뾰족함/넓고평평/갈라짐/붉음)",
    "nostrils": "값 (풍만하고좋은색/보통/작고메마름/붉거나검음)",
    "nostrilShape": "값 (세로타원형/둥근형/넓은형/보이지않음/비뚤어짐)",
    "length": "값 (길음/보통/짧음)",
    "thickness": "값 (두꺼움/보통/얇음)",
    "overallColor": "값 (황명윤택/흰색/붉음/어둡거나검음)"
  },
  "mouth": {
    "size": "값 (대구/중구/소구)",
    "shape": "값 (궁형/방형/원형/뾰족형)",
    "upperLip": "값 (두꺼움/보통/얇음/뒤틀림/상처나흉터)",
    "lowerLip": "값 (두꺼움/보통/얇음/처짐/뒤틀림)",
    "corner": "값 (위로올라감/평행/아래로내려감/비대칭)",
    "color": "값 (붉고윤택/분홍/창백/어둡거나검음/자주빛)",
    "philtrum": "값 (깊고곧음/얕음/비뚤어짐/넓음/좁음)",
    "philtrumLength": "값 (길음/보통/짧음)",
    "teeth": "값 (희고가지런함/누렇거나틈/삐뚤거나빠짐/보이지않음)"
  },
  "chinAndLower": {
    "chinShape": "값 (방원형/원형/뾰족형/각진형/이중턱)",
    "chinSize": "값 (풍만하고큼/보통/작고메마름)",
    "chinPosition": "값 (정중앙/약간한쪽으로치우침/많이비뚤어짐)",
    "jawbone": "값 (잘발달됨/보통/빈약함)",
    "cheeks": "값 (풍만하고윤택/보통/메마르고거칠음/처진살/비대칭)",
    "cheekbones": "값 (적당히돌출/평평/과도히돌출/들어감)"
  },
  "ears": {
    "size": "값 (대이/중이/소이)",
    "position": "값 (눈썹-코끝선내/그보다위쪽/그보다아래쪽)",
    "rim": "값 (두터움/보통/얇음)",
    "hole": "값 (깊고큼/보통/얕고작음)",
    "color": "값 (희고윤택/보통/어둡거나붉음)",
    "earlobe": "값 (두터움/보통/얇음/구멍뚫림)"
  },
  "faceShape": {
    "basicShape": "값 (방형/원형/삼각형/역삼각형/장방형/타원형/다이아몬드형/팔각형)",
    "fiveElementsType": "값 (목형/화형/토형/금형/수형)",
    "physiognomyClass": "값 (귀격/부격/수격/복격/빈격/천격)",
    "description": "얼굴형의 관상학적 의미와 성격적 특징 설명"
  },
  "overall": {
    "threeRegions": "값 (균형/상정높음/중정높음/하정높음/불균형)",
    "fiveFeatures": "값 (매우조화로움/조화로움/보통/약간부조화/매우부조화)",
    "symmetry": "값 (완전대칭/거의대칭/약간비대칭/비대칭/매우비대칭)",
    "overallColor": "값 (황명윤택/백색청수/붉은기운/어둡고거침/청흑색)",
    "spirit": "값 (정기/탁기/사기/화기/살기)",
    "boneStructure": "값 (청수/후중/조잡/기이)"
  }
}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // 이미지 분석을 위해서는 비전 모델 사용 (파인튜닝 모델은 이미지 지원안함)
        messages: [
          {
            role: 'system',
            content: 'JSON 형식으로만 응답해주세요. 마크다운 문법을 사용하지 말고 순수한 JSON만 반환하세요.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 12000,
        temperature: 0.3
      });

      const text = response.choices[0].message.content;

      console.log('=== OpenAI Fine-tuned Model 응답 원본 ===');
      console.log(text);
      console.log('=== OpenAI Fine-tuned Model 응답 끝 ===');
      
      // safeJsonParse로 간단하게 처리
      try {
        return this.safeJsonParse(text, '얼굴특징 분석');
      } catch (parseError) {
        console.error('OpenAI Fine-tuned Model JSON 파싱 오류:', parseError);
        throw new Error('얼굴 특징 JSON 파싱에 실패했습니다. 이미지를 다시 확인하고 재시도해주세요.');
      }
      
    } catch (error) {
      console.error('OpenAI Fine-tuned Model 얼굴 분석 오류:', error);
      throw new Error(`얼굴 특징 추출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * ⚠️ 중요 경고: MBTI+관상 AI 분석 수정 금지
   * 
   * 이 함수는 사용자의 명시적 요청에 따라 잠금 상태입니다.
   * 특히 더미 데이터 반환이나 폴백 처리 코드 추가 금지
   * - 실제 AI 분석만 수행
   * - JSON 파싱 실패시 오류 발생 (더미 데이터 반환 금지)
   * - max_tokens 12000으로 고정
   * 
   * 수정 필요시 반드시 사용자 승인 필요
   * 마지막 승인: 2025-01-11
   * 
   * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
   * 
   * MBTI + 얼굴 분석 (API에서 직접 호출)
   */
  async analyzeMBTIFace(imageBuffer: Buffer, mbtiType: string, age: string): Promise<any> {
    try {
      // 1. 얼굴 특징 추출
      const faceFeatures = await this.analyzeFaceFeatures(imageBuffer);
      
      // 2. MBTI + 관상 융합 분석
      return await this.analyzeMBTIFaceReading(faceFeatures, mbtiType, parseInt(age));
    } catch (error) {
      console.error('MBTI 관상 분석 오류:', error);
      throw error;
    }
  }

  /**
   * MBTI 맞춤 관상 분석 (Fine-tuned GPT)
   */
  async analyzeMBTIFaceReading(features: any, mbtiType: string, age: number): Promise<any> {
    try {
      const prompt = `
당신은 30년 경력의 관상학 전문가이면서 동시에 MBTI 심리학 박사로, 현대인 문화와 트렌드에 정통한 분석 전문가입니다.

**🔥 실제 사진 기반 융합 분석법 🔥**
⚠️ **매우 중요**: 아래 제공된 실제 얼굴 특징 분석 결과를 반드시 구체적으로 언급하며 해설하세요.
예: "당신의 ${features.forehead?.shape} 이마는...", "분석된 ${features.eyes?.shape} 눈은...", "${features.faceShape?.basicShape} 얼굴형이..."

**세계 최초! 관상학×MBTI 완전 융합 시스템:**
1. **관상→MBTI 크로스 매칭**: 각 얼굴 부위의 관상학적 의미가 ${mbtiType} 인지기능과 어떻게 정확히 일치하는지 과학적 분석
2. **실시간 특성 융합**: 관상학적 특징과 MBTI 심리기능이 하나로 합쳐져 나타나는 당신만의 독특한 성격 발견
3. **차별화된 해석**: 단순 나열이 아닌 "관상학적 ○○ + ${mbtiType}의 ○○ = 당신만의 특별한 ○○" 공식 적용

**분석 원칙:**
- 절대 MBTI 이론만으로 설명하지 않음
- 관상학 특징이 MBTI와 어떻게 **융합**되어 새로운 통찰을 만들어내는지 중점 분석
- 예: "관상학적으로 당신의 눈꼬리 각도는 신중함을 나타내는데, 이것이 ${mbtiType}의 내향직관과 만나면서 깊은 통찰력으로 발화합니다"

다음 정보를 바탕으로 이 사용자만의 독특한 관상과 MBTI 조합을 분석해주세요:

=== 분석 대상 정보 ===
• MBTI 타입: ${mbtiType}
• 나이: ${age}세

=== 이 사용자의 실제 얼굴 특징 분석 결과 ===
[이마 (천정궁)]
- 높이: ${features.forehead?.height} | 너비: ${features.forehead?.width} | 형태: ${features.forehead?.shape}
- 돌출도: ${features.forehead?.protrusion} | 색택: ${features.forehead?.colorBrightness}
- 발제선: ${features.forehead?.hairline} | 관자골: ${features.forehead?.templesBone} | 주름: ${features.forehead?.wrinkles}

[눈 (감찰궁)]  
- 크기: ${features.eyes?.size} | 길이: ${features.eyes?.length} | 모양: ${features.eyes?.shape}
- 눈꼬리: ${features.eyes?.corner} | 동자위치: ${features.eyes?.pupilPosition}
- 흰자위: ${features.eyes?.whiteArea} | 눈빛: ${features.eyes?.eyeLight}
- 쌍꺼풀: ${features.eyes?.eyelid} | 눈꺼풀두께: ${features.eyes?.eyelidThickness} | 애교살: ${features.eyes?.underEyeArea}

[눈썹 (보수궁)]
- 모양: ${features.eyebrows?.shape} | 농담: ${features.eyebrows?.density} | 순역: ${features.eyebrows?.direction}
- 기세: ${features.eyebrows?.trend} | 길이: ${features.eyebrows?.length}
- 미간: ${features.eyebrows?.distanceBetween} | 미간색택: ${features.eyebrows?.betweenColor}

[코 (재백궁)]
- 산근: ${features.nose?.bridge} | 연상: ${features.nose?.middle} | 준두: ${features.nose?.tip}
- 난정: ${features.nose?.nostrils} | 공창: ${features.nose?.nostrilShape}
- 길이: ${features.nose?.length} | 두께: ${features.nose?.thickness} | 색택: ${features.nose?.overallColor}

[입 (출납궁)]
- 크기: ${features.mouth?.size} | 형태: ${features.mouth?.shape}
- 상순: ${features.mouth?.upperLip} | 하순: ${features.mouth?.lowerLip} | 입꼬리: ${features.mouth?.corner}
- 색상: ${features.mouth?.color} | 인중: ${features.mouth?.philtrum} | 인중길이: ${features.mouth?.philtrumLength}
- 치아: ${features.mouth?.teeth}

[턱과 하정 (지각궁)]
- 턱형태: ${features.chinAndLower?.chinShape} | 턱크기: ${features.chinAndLower?.chinSize}
- 턱위치: ${features.chinAndLower?.chinPosition} | 하악골: ${features.chinAndLower?.jawbone}
- 볼: ${features.chinAndLower?.cheeks} | 광대뼈: ${features.chinAndLower?.cheekbones}

[귀 (채청궁)]
- 크기: ${features.ears?.size} | 위치: ${features.ears?.position} | 테두리: ${features.ears?.rim}
- 구멍: ${features.ears?.hole} | 색택: ${features.ears?.color} | 귀엽: ${features.ears?.earlobe}

[관상학적 얼굴 형태]
- 기본형태: ${features.faceShape?.basicShape} | 오행분류: ${features.faceShape?.fiveElementsType}
- 관상등급: ${features.faceShape?.physiognomyClass} | 형태특징: ${features.faceShape?.description}

[전체 기운과 조화]
- 삼정균형: ${features.overall?.threeRegions} | 오관조화: ${features.overall?.fiveFeatures}
- 대칭성: ${features.overall?.symmetry} | 색택: ${features.overall?.overallColor}
- 기운: ${features.overall?.spirit} | 골격: ${features.overall?.boneStructure}

=== MBTI ${mbtiType} 핵심 특성 ===
${this.getMBTICharacteristics(mbtiType)}

=== 품질 보장 가이드라인 ===
🔥 **절대 준수사항** 🔥
1. **모든 섹션 일관된 품질**: 첫 번째 섹션과 마지막 섹션의 분석 깊이와 길이가 동일해야 함
2. **각 섹션 최소 기준**: 
   - faceAnalysis 각 부위: 75-100자의 핵심 분석
   - personalityDetailed 각 항목: 100-120자의 간결한 분석  
   - loveLife 각 항목: 90-110자의 실용적 조언
   - careerLifeDetailed 각 항목: 100-120자의 전문적 분석
   - studyAndGrowth 각 항목: 90-110자의 구체적 방법론
   - socialLifeEnhanced 각 항목: 90-110자의 실전 가이드
   - comprehensiveAdvice 각 항목: 100-120자의 종합적 조언
3. **관상학 50% + MBTI 50% 비율 엄수**: 모든 섹션에서 관상학적 해석과 MBTI 특성이 균등하게 융합
4. **구체성 원칙**: 추상적 표현 금지, 구체적이고 실행 가능한 조언만 제공
5. **끝까지 최고 품질**: 마지막 섹션일수록 더욱 신중하게 작성하여 사용자 만족도 극대화

=== 출력 형식 (JSON) ===
{
  "faceShape": "${features.faceShape?.basicShape || features.faceShape || '타원형'}",
  "overallFaceFeatures": "이마: ${features.forehead?.shape}, 눈: ${features.eyes?.shape}, 코: ${features.nose?.bridge}, 입: ${features.mouth?.shape}, 눈썹: ${features.eyebrows?.shape}, 턱: ${features.chinAndLower?.chinShape}",
  
  "mbtiAnalysis": {
    "cognitiveFunction": "${mbtiType}의 인지기능과 ${features.faceShape} 얼굴형이 어떻게 연결되는지 상세 분석 (주기능 중심으로)",
    "psychologyProfile": "${mbtiType}의 심리적 특성이 외모에 어떻게 투영되는지 관상학적 근거와 함께 설명",
    "mbtiStrengths": "${mbtiType}만의 독특한 강점이 관상에서 어떻게 드러나는지 구체적 분석",
    "mbtiChallenges": "${mbtiType}의 열등기능과 관련된 주의점이 얼굴 특징에서 어떻게 나타나는지 설명",
    "mzCharacteristics": "현대인 ${mbtiType}으로서 갖는 특별한 매력과 시대적 장점을 관상과 연결하여 분석"
  },

  "faceAnalysis": {
    "foreheadAnalysis": "**이마 분석**: 관상학적으로 당신의 이마(높이: ${features.forehead?.height || '3지'}, 형태: ${features.forehead?.shape || '원만형'})는 [구체적 관상학적 해석을 먼저 설명], 이것이 ${mbtiType}의 사고 패턴과 어떻게 융합되어 독특한 지적 능력을 만들어내는지 상세 분석. ${mbtiType}의 주기능이 이마 구조에서 어떻게 물리적으로 드러나는지 설명",
    "eyeAnalysis": "**눈 분석**: 관상학에서 당신의 눈(모양: ${features.eyes?.shape || '용안'}, 크기: ${features.eyes?.size || '중안'}, 눈꼬리: ${features.eyes?.corner || '평행'})은 [관상학적 특징을 구체적으로 해석], 이것이 ${mbtiType}의 인지기능과 완벽하게 융합되어 나타나는 방식을 분석. 눈빛과 MBTI 정보처리의 조화",
    "noseAnalysis": "**코 분석**: 관상학적으로 당신의 코(산근: ${features.nose?.bridge || '높고곧음'}, 준두: ${features.nose?.tip || '원만하고윤택'})는 [관상학적 의미를 먼저 설명], 이것이 ${mbtiType}의 의사결정 기능과 어떻게 일체화되어 당신만의 독특한 판단력을 형성하는지 융합 해석",
    "mouthAnalysis": "**입 분석**: 관상학에서 당신의 입(형태: ${features.mouth?.shape || '궁형'}, 크기: ${features.mouth?.size || '중구'}, 입꼬리: ${features.mouth?.corner || '평행'})은 [관상학적 특성을 구체적으로 분석], 이것이 ${mbtiType}의 소통 특성과 완벽하게 조화를 이루어 만들어내는 독특한 매력",
    "eyebrowAnalysis": "**눈썹 분석**: 관상학적으로 당신의 눈썹(모양: ${features.eyebrows?.shape || '검미'}, 농도: ${features.eyebrows?.density || '중농미'})은 [관상학적 해석을 먼저 제시], 이것이 ${mbtiType}의 에너지 방향성과 융합되어 당신의 의지력이 얼굴에 새겨진 방식",
    "chinAnalysis": "**턱 분석**: 관상학에서 당신의 턱(형태: ${features.chinAndLower?.chinShape || '방원형'}, 크기: ${features.chinAndLower?.chinSize || '풍만하고큼'})은 [관상학적 의미를 상세히 설명], 이것이 ${mbtiType}의 추진력과 결단력이 물리적 얼굴 구조로 표현된 독특한 융합 결과"
  },

  "personalityDetailed": {
    "corePersonality": "실제 분석된 당신의 ${features.faceShape?.basicShape} 얼굴형과 ${features.overall?.overallColor} 색택이 나타내는 관상학적 성격(50%) + ${mbtiType}의 핵심 심리적 특성(50%)을 2-3문장으로 간결하게 융합 분석",
    "strengthsDetailed": "분석된 이마(${features.forehead?.shape}), 눈(${features.eyes?.shape}), 코(${features.nose?.bridge}) 특징의 관상학적 강점(50%) + ${mbtiType}의 인지기능 강점(50%)을 간결하게 융합",
    "uniqueTraits": "실제 얼굴의 ${features.overall?.symmetry} 대칭성과 ${features.overall?.fiveFeatures} 오관조화의 관상학적 매력(50%) + ${mbtiType}만의 독특함(50%)을 3가지로 간결하게 분석",
    "behaviorPatterns": "관상학적 행동 예측(실제 얼굴 특징 기반, 50%) + ${mbtiType}의 인지기능 패턴(50%)을 일상 행동으로 간결하게 해석"
  },

  "loveLife": {
    "idealTypeDetailed": "관상학적으로 당신과 궁합이 좋은 상대방의 얼굴 특징(눈매, 입매, 얼굴형 등) + ${mbtiType}와 심리적으로 보완되는 MBTI 조합을 종합하여 구체적인 이상형 분석",
    "datingStyleAnalysis": "관상학에서 보이는 당신의 연애 성향(입술 모양의 감정 표현, 눈빛의 애정 표현법) + ${mbtiType}의 감정 처리 방식이 실제 연애에서 어떻게 나타나는지 융합 분석",
    "attractionPoints": "관상학적 매력 포인트(당신의 미소, 눈빛, 전체적 인상) + ${mbtiType}만의 독특한 성격적 매력이 결합되어 이성에게 어떤 매력으로 어필되는지 종합 해석",
    "relationshipTips": "관상학적 강점을 활용한 첫인상 관리법 + ${mbtiType} 특성에 맞는 연애 전략을 결합한 실제적인 솔로탈출 및 연애 성공 가이드",
    "compatibilityInsight": "관상학적 궁합(얼굴형, 이목구비 조화) + MBTI 심리적 궁합(${mbtiType}와 최고 조합)을 종합한 완벽한 커플 매칭 분석"
  },

  "careerLifeDetailed": {
    "idealCareers": "관상학적으로 당신의 얼굴에서 보이는 직업 적성(이마의 지혜, 눈의 판단력, 입의 소통능력 등) + ${mbtiType}의 인지기능 강점을 결합하여 최적의 직업 분야를 종합 추천",
    "workStyle": "관상학에서 나타나는 당신의 업무 스타일(얼굴형의 추진력, 눈매의 집중력, 입매의 협력성) + ${mbtiType}의 업무 처리 방식이 실제 직장에서 어떻게 발휘되는지 융합 분석",
    "leadershipPotential": "관상학적 리더의 기운(턱의 결단력, 이마의 계획성, 전체적 카리스마) + ${mbtiType}의 리더십 특성이 결합된 당신만의 독특한 지도력 스타일 분석",
    "jobSearchStrategy": "관상학적 첫인상 관리법(면접관에게 좋은 인상을 주는 표정, 자세) + ${mbtiType} 강점을 어필하는 면접 전략을 결합한 실전 취업 가이드",
    "entrepreneurPotential": "관상학적 사업 운세(코의 재물운, 턱의 추진력, 전체적 사업 기운) + ${mbtiType}의 창업 적성을 종합한 사업 성공 가능성과 전략 분석",
    "careerTimeline": "관상학적 운세 흐름(연령대별 얼굴 변화와 운명) + ${age}세 ${mbtiType}의 심리적 발달 단계를 결합한 생애주기별 커리어 로드맵"
  },

  "studyAndGrowth": {
    "learningStyleDetailed": "관상학적으로 당신의 학습 능력과 집중력(이마의 사고력, 눈의 집중도, 전체적 학습 기운) + ${mbtiType}의 정보 처리 방식을 결합한 최적의 개인 맞춤 학습법 제시",
    "skillDevelopmentPlan": "관상학에서 보이는 당신의 잠재 능력과 재능(각 부위별 능력 분석) + ${mbtiType}의 강점을 극대화하면서 약점을 보완하는 통합적 성장 전략",
    "concentrationTips": "관상학적 집중력 특성(눈의 몰입도, 이마의 사고 지속력) + ${mbtiType}의 주의 집중 패턴을 활용한 효과적인 학습 환경과 집중법 가이드",
    "hobbyRecommendations": "관상학적으로 당신에게 어울리는 활동(얼굴형과 조화로운 취미) + ${mbtiType} 특성에 맞는 여가활동을 종합한 개인 맞춤 취미 추천",
    "selfDevelopmentGoals": "관상학적 잠재력과 운세적 성장 시기 + ${mbtiType}의 발전 방향성을 결합한 개인 맞춤 자기계발 로드맵"
  },

  "socialLifeEnhanced": {
    "communicationStrengths": "관상학적으로 당신의 소통 능력(입술의 표현력, 눈빛의 전달력, 표정의 친화력) + ${mbtiType}의 소통 특성을 결합한 당신만의 독특한 커뮤니케이션 스타일 분석",
    "networkingStrategy": "관상학적 첫인상과 호감도(전체적 인상, 미소의 매력) + ${mbtiType} 특성을 활용한 효과적인 인맥 형성과 관계 발전 전략",
    "socialMediaPresence": "관상학적으로 당신에게 어울리는 이미지와 컨셉 + ${mbtiType}의 개성이 돋보이는 SNS 콘텐츠 및 개인 브랜딩 전략",
    "conflictResolution": "관상학적 중재 능력과 화합의 기운(얼굴의 온화함, 눈빛의 포용력) + ${mbtiType}의 갈등 해결 방식을 결합한 인간관계 문제 해결법",
    "trendAdaptation": "관상학적 매력을 극대화하는 스타일링과 이미지 관리 + 현대인 ${mbtiType}으로서 트렌드를 활용한 개인 브랜딩 전략"
  },

  "comprehensiveAdvice": {
    "immediate": "관상학적 강점 활용법(실제 얼굴 특징 기반, 50%) + ${mbtiType} 특성 활용법(50%)을 3-4가지로 간결하게 제시",
    "shortTerm": "관상학적 운세 흐름(50%) + ${mbtiType} 성장 전략(50%)을 6개월-1년 계획으로 간결하게 제시",
    "longTerm": "관상학적 인생 잠재력(50%) + ${mbtiType} 자아실현 방향(50%)을 3-5년 로드맵으로 간결하게 제시",
    "warningPoints": "관상학적 주의사항(실제 얼굴 특징 기반, 50%) + ${mbtiType} 약점 극복법(50%)을 간결하게 제시",
    "motivationalMessage": "관상학적 타고난 복과 잠재력(50%) + ${age}세 ${mbtiType}의 무한 가능성(50%)으로 희망적 격려"
  },

  "confidence": 95
}
`;

      const completion = await this.openai.chat.completions.create({
        model: this.FINE_TUNED_MODEL, // Fine-tuned 관상 전문 모델
        messages: [
          {
            role: "system", 
            content: `당신은 30년 경력의 관상학 전문가이면서 동시에 MBTI 심리학 박사입니다.

마크다운 문법 없이 순수한 텍스트로만 작성해주세요. **굵은 글씨**, ###제목, -리스트 등의 마크다운 문법을 사용하지 말고 일반 텍스트로만 응답하세요.

중요한 분석 원칙:
1. 반드시 관상학 50% + MBTI 이론 50% 비율을 엄격히 준수
2. MBTI의 인지기능(주기능, 부기능, 3차기능, 열등기능)을 관상학적 특징과 연결
3. 단순한 일반론이 아닌 ${mbtiType} 특화된 심층 분석 제공
4. 현대인 ${mbtiType}의 독특한 특성과 관상의 조화 분석
5. 3900원의 전문적 가치를 제공하는 깊이 있는 내용

분석 시 반드시 포함해야 할 요소:
- ${mbtiType}의 각 인지기능이 얼굴 특징에서 어떻게 드러나는지
- 관상학적 특징이 ${mbtiType}의 심리적 특성과 어떻게 일치하는지
- ${mbtiType}만의 독특한 강점과 매력이 관상에서 어떻게 표현되는지
- ${mbtiType}의 약점(열등기능)이 관상학적으로 어떻게 보완될 수 있는지

매우 중요: 모든 섹션은 2-3문장으로 간결하게 작성하세요.
MBTI 특성과 관상학적 특징을 정확히 50:50 비율로 융합하세요.
실제 사진에서 분석된 얼굴 특징을 구체적으로 언급하며 해설하세요.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 12000
      });

      const rawResult = completion.choices[0].message.content;
      if (!rawResult) {
        throw new Error('MBTI 관상 분석 응답이 비어있습니다.');
      }

      // 마크다운 요소 제거
      const result = rawResult
        .replace(/^#{1,6}\s+/gm, '')  // 헤더 제거
        .replace(/\*\*(.*?)\*\*/g, '$1')  // 굵은 글씨 제거
        .replace(/\*(.*?)\*/g, '$1')  // 이탤릭 제거
        .replace(/^-\s+/gm, '')  // 리스트 마커 제거
        .replace(/^\*\s+/gm, '')  // 다른 리스트 마커 제거
        .trim();

      console.log('AI 응답 원본:', result);

      // safeJsonParse로 간단하게 처리
      return this.safeJsonParse(result, 'MBTI관상 분석');

    } catch (error) {
      console.error('얼굴 특징 추출 오류:', error);
      throw new Error(`얼굴 특징 추출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * Fine-tuned GPT 모델로 관상 분석
   */
  async analyzeFaceReading(features: any): Promise<FaceAnalysisResult> {
    try {
      const prompt = `당신은 30년 경력의 관상학 전문가입니다. 다음 극세밀 얼굴 특징을 바탕으로 전통 관상학 이론에 따라 전문적이고 상세한 분석을 제공해주세요:

=== 극세밀 얼굴 특징 분석 결과 ===
[이마 (천정궁)]
- 높이: ${features.forehead?.height} | 너비: ${features.forehead?.width} | 형태: ${features.forehead?.shape}
- 돌출도: ${features.forehead?.protrusion} | 색택: ${features.forehead?.colorBrightness}
- 발제선: ${features.forehead?.hairline} | 관자골: ${features.forehead?.templesBone} | 주름: ${features.forehead?.wrinkles}

[눈 (감찰궁)]  
- 크기: ${features.eyes?.size} | 길이: ${features.eyes?.length} | 모양: ${features.eyes?.shape}
- 눈꼬리: ${features.eyes?.corner} | 동자위치: ${features.eyes?.pupilPosition}
- 흰자위: ${features.eyes?.whiteArea} | 눈빛: ${features.eyes?.eyeLight}
- 쌍꺼풀: ${features.eyes?.eyelid} | 눈꺼풀두께: ${features.eyes?.eyelidThickness} | 애교살: ${features.eyes?.underEyeArea}

[눈썹 (보수궁)]
- 모양: ${features.eyebrows?.shape} | 농담: ${features.eyebrows?.density} | 순역: ${features.eyebrows?.direction}
- 기세: ${features.eyebrows?.trend} | 길이: ${features.eyebrows?.length}
- 미간: ${features.eyebrows?.distanceBetween} | 미간색택: ${features.eyebrows?.betweenColor}

[코 (재백궁)]
- 산근: ${features.nose?.bridge} | 연상: ${features.nose?.middle} | 준두: ${features.nose?.tip}
- 난정: ${features.nose?.nostrils} | 공창: ${features.nose?.nostrilShape}
- 길이: ${features.nose?.length} | 두께: ${features.nose?.thickness} | 색택: ${features.nose?.overallColor}

[입 (출납궁)]
- 크기: ${features.mouth?.size} | 형태: ${features.mouth?.shape}
- 상순: ${features.mouth?.upperLip} | 하순: ${features.mouth?.lowerLip} | 입꼬리: ${features.mouth?.corner}
- 색상: ${features.mouth?.color} | 인중: ${features.mouth?.philtrum} | 인중길이: ${features.mouth?.philtrumLength}
- 치아: ${features.mouth?.teeth}

[턱과 하정 (지각궁)]
- 턱형태: ${features.chinAndLower?.chinShape} | 방원: ${features.chinAndLower?.chinSize}
- 턱위치: ${features.chinAndLower?.chinPosition} | 협골: ${features.chinAndLower?.jawbone}
- 볼살: ${features.chinAndLower?.cheeks} | 광대: ${features.chinAndLower?.cheekbones}

[귀 (채청궁)]
- 크기: ${features.ears?.size} | 위치: ${features.ears?.position}
- 윤곽: ${features.ears?.rim} | 이공: ${features.ears?.hole}
- 색택: ${features.ears?.color} | 이수: ${features.ears?.earlobe}

[관상학적 얼굴 형태 (면상분류)]
- 기본얼굴형: ${features.faceShape?.basicShape} | 오행분류: ${features.faceShape?.fiveElementsType}
- 관상등급: ${features.faceShape?.physiognomyClass} | 형태의미: ${features.faceShape?.description}

[전체 균형 (오관 조화)]
- 삼정: ${features.overall?.threeRegions} | 오관: ${features.overall?.fiveFeatures}
- 좌우: ${features.overall?.symmetry} | 색택: ${features.overall?.overallColor}
- 정기신: ${features.overall?.spirit} | 골격: ${features.overall?.boneStructure}

다음 JSON 형식으로 응답해주세요:

{
  "features": {
    "eyeShape": "눈의 관상학적 의미와 성격 해석",
    "noseShape": "코의 관상학적 의미와 재물운/능력", 
    "mouthShape": "입의 관상학적 의미와 대인관계/언변",
    "faceShape": "얼굴형의 관상학적 의미와 전반적 기질",
    "eyebrowShape": "눈썹의 관상학적 의미와 성향"
  },
  "personality": {
    "traits": ["핵심 성격 특징들"],
    "strengths": ["강점들"],
    "weaknesses": ["약점들"]
  },
  "fortune": {
    "career": "직업운 분석",
    "love": "애정운 분석",
    "wealth": "재물운 분석",
    "health": "건강운 분석"
}`;

      const completion = await this.openai.chat.completions.create({
        model: this.FINE_TUNED_MODEL, // Fine-tuned 관상 전문 모델
        messages: [
          {
            role: "system", 
            content: `당신은 30년 경력의 전문 관상학자입니다. 

전문성:
- 전통 관상학, 신상전편 등 고전 관상학에 정통
- 현대 심리학과 관상학을 융합한 독창적 분석법 보유
- 10만 명 이상의 관상을 봐온 풍부한 실무 경험
- 정확도 95% 이상의 검증된 분석 능력

분석 원칙:
1. 얼굴의 각 부위는 특정 운명과 성격을 나타냄
2. 부위 간의 조화와 균형이 전체 운세를 결정
3. 나이와 시기에 따른 변화 양상도 고려
4. 단순 예측이 아닌 실용적 조언과 개선 방향 제시
5. 과학적 근거와 전통 지혜의 균형잡힌 해석
6. **중요**: 장점뿐만 아니라 단점과 주의사항도 정확히 분석
7. **중요**: 있는 그대로의 현실적인 분석 제공 (과도한 미화 금지)
8. **중요**: 약점이나 부족한 부분을 개선할 수 있는 구체적 방법 제시

당신의 분석은 수상자의 인생에 실질적 도움이 되어야 하며, 
모든 해석은 구체적이고 실행 가능한 조언을 포함해야 합니다. 
긍정적인 면과 부정적인 면을 균형있게 다루어 현실적이고 신뢰할 수 있는 분석을 제공하세요.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 5000
      });

      const result = completion.choices[0].message.content;
      if (!result) {
        throw new Error('Fine-tuned 모델 응답이 비어있습니다.');
      }

      // safeJsonParse로 간단하고 안전하게 처리
      try {
        const parsedResult = this.safeJsonParse(result, '정통관상 분석');

        // 기본 구조 검증
        if (!parsedResult.features || !parsedResult.personality || !parsedResult.fortune) {
          throw new Error('필수 JSON 구조가 누락되었습니다.');
        }

        return parsedResult;
      } catch (parseError) {
        console.error('==================== 관상 분석 JSON 파싱 오류 ====================');
        console.error('파싱 오류:', parseError);
        console.error('오류 위치:', parseError instanceof SyntaxError ? parseError.message : '알 수 없음');
        console.error('전체 AI 응답 길이:', result.length);
        console.error('전체 AI 응답 (처음 500자):', result.substring(0, 500));
        console.error('전체 AI 응답 (마지막 500자):', result.substring(Math.max(0, result.length - 500)));
        console.error('==============================================================');
        
        // 파싱 실패 시 에러 발생
        throw new Error('관상 분석 JSON 파싱 실패');
      }

    } catch (error) {
      console.error('Fine-tuned 관상 분석 오류:', error);
      throw new Error(`관상 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }


  /**
   * GPT로 사주 분석 - Fortune API용 오버로드
   */
  async analyzeSaju(birthData: {
    birthDate: string;
    birthTime?: string;
    gender: string;
  }): Promise<SajuAnalysisResult>;
  
  /**
   * GPT로 사주 분석 - 기존 형태
   */
  async analyzeSaju(birthData: {
    year: number;
    month: number; 
    day: number;
    hour: number;
    gender: 'male' | 'female';
  }): Promise<SajuAnalysisResult>;

  async analyzeSaju(birthData: any): Promise<SajuAnalysisResult> {
    // Fortune API 형태인 경우 변환
    if ('birthDate' in birthData) {
      const [year, month, day] = birthData.birthDate.split('-').map(Number);
      const hour = birthData.birthTime ? parseInt(birthData.birthTime.split(':')[0]) : 12; // 기본값 12시
      const convertedData = {
        year,
        month,
        day,
        hour,
        gender: birthData.gender as 'male' | 'female'
      };
      return this.analyzeSaju(convertedData);
    }
    try {
      const prompt = `
당신은 50년 경력의 사주명리학 대가입니다. 다음 사주 정보를 만세력과 오행 이론에 근거하여 심층 분석해주세요.

=== 사주 기본 정보 ===
생년월일시: ${birthData.year}년 ${birthData.month}월 ${birthData.day}일 ${birthData.hour}시
성별: ${birthData.gender === 'male' ? '남성' : '여성'}

=== 분석 지침 ===
1. 년주, 월주, 일주, 시주의 간지 조합 분석
2. 일간을 중심으로 한 오행 상생상극 관계 해석
3. 용신과 기신 찾기 및 길흉 판단
4. 대운과 세운의 흐름 분석
5. 십성(정관, 편관, 정재, 편재 등)의 배치와 의미
6. 신살(神煞) 분석 및 특수 격국 확인

=== 중요: 반드시 아래의 JSON 형식만 출력하세요 ===
**매우 중요한 지침:**
1. 반드시 완전한 JSON만 출력 (설명이나 다른 텍스트 절대 금지)
2. JSON 구조를 끝까지 완성하고 모든 중괄호를 닫아주세요
3. 문자열 값이 길어도 반드시 따옴표로 닫아주세요
4. 마지막 속성 뒤에 쉼표(,) 절대 금지
5. 응답이 잘리더라도 JSON 구조는 완전하게 유지하세요
6. "confidence": 95로 반드시 끝마쳐 주세요

{
  "sajuChart": {
    "year": "년주 간지 (예: 갑자, 을축 등)",
    "month": "월주 간지",
    "day": "일주 간지 (일간은 본인을 나타냄)",
    "time": "시주 간지",
    "dayMaster": "일간 (갑, 을, 병, 정, 무, 기, 경, 신, 임, 계)",
    "elementBalance": "오행 분포 분석 (목화토금수의 강약)"
  },
  "detailedAnalysis": {
    "sajuType": "사주 격국 (정격, 외격, 특수격 등)",
    "usefulGod": "용신 분석과 그 이유",
    "avoidGod": "기신 분석과 주의사항",
    "tenGods": "십성 분포와 각각의 의미 해석",
    "specialStars": "신살(특수별) 분석 및 영향"
  },
  "personalityAnalysis": {
    "coreTraits": ["일간과 십성을 바탕으로 한 핵심 성격 5-6가지"],
    "strengths": ["사주에서 나타나는 장점과 재능 4-6가지"],
    "weaknesses": ["주의해야 할 단점과 약점 3-4가지"],
    "hiddenPotential": "숨겨진 재능과 가능성",
    "leadershipStyle": "리더십 유형과 관리 스타일"
  },
  "fortuneByAge": {
    "childhood": "어린 시절(~20세) 운세와 특징",
    "youth": "청년기(20-40세) 운세와 주요 변화",
    "middleAge": "중년기(40-60세) 운세와 성취",
    "seniorAge": "노년기(60세~) 운세와 건강"
  },
  "detailedFortune": {
    "career": {
      "detailedAnalysis": "직업운 매우 심층 분석 (20문장 이상) - 십성 배치, 용신 활용, 대운 흐름을 종합한 상세 해석",
      "suitableJobs": ["적합한 직업 분야 10-12가지, 각각 사주명리학적 근거와 성공 가능성 포함"],
      "successTiming": "직업적 성공 시기와 방법 - 대운별 상세 분석과 구체적 실천 방안",
      "businessPotential": "사업 적성과 성공 가능성 - 창업 시기, 업종 선택, 파트너십 조언",
      "workStyle": "업무 처리 방식과 조직 내 역할 - 십성으로 본 리더십과 협업 스타일",
      "careerObstacles": "직업 발전의 장애물과 극복 방법 - 기신 작용과 대처 전략",
      "promotionTiming": "승진과 발전 시기 - 연도별 상승운과 주의 시기",
      "salaryAndWealth": "직업을 통한 재물 획득 능력과 연봉 상승 가능성"
    },
    "wealth": {
      "detailedAnalysis": "재물운 매우 심층 분석 (20문장 이상) - 재성 분석, 재물 획득 방식, 축적 능력 종합 해석",
      "moneyMakingStyle": "돈을 버는 방식과 특징 - 정재 vs 편재 성향과 수입원 다양화",
      "investmentAdvice": "투자 성향과 유리한 분야 - 위험 감수도와 투자 타이밍 분석",
      "wealthAccumulation": "부 축적 방법과 시기 - 저축 vs 투자, 부동산 vs 금융상품",
      "spendingPatterns": "소비 패턴과 금전 관리 - 절약 능력과 사치 성향 분석",
      "wealthPeakPeriod": "재물운 최고조 시기와 준비 방법 - 대운별 재물 증감",
      "financialRisks": "재정적 위험 요소와 대비책 - 손실 가능 시기와 예방법",
      "inheritanceAndGifts": "상속이나 증여 가능성과 타인으로부터의 도움",
      "businessWealth": "사업을 통한 부 창출 가능성과 성공 전략"
    },
    "love": {
      "detailedAnalysis": "애정운 매우 심층 분석 (20문장 이상) - 배우자궁, 관살, 식상을 종합한 연애 운세 해석",
      "relationshipStyle": "연애 스타일과 감정 표현 - 애정 표현 방식과 연애 성향 분석",
      "marriageTimingAndPartner": "결혼 시기와 배우자 특징 - 최적 결혼 연도와 배우자 사주 분석",
      "familyHarmony": "가족 관계와 자녀운 - 부모, 배우자, 자녀와의 관계 및 화목도",
      "loveObstacles": "연애와 결혼의 장애물 - 극복 방법과 주의 시기",
      "attractiveness": "이성에게 어필하는 매력과 첫인상 - 자연스러운 매력 포인트",
      "relationshipLongevity": "장기적 관계 유지 능력과 애정 지속력",
      "idealPartnerType": "최고 궁합 배우자의 사주 특징과 만나는 방법",
      "marriageLifestyle": "결혼 후 생활 패턴과 가정에서의 역할",
      "childrenProspects": "자녀 가능성과 자녀를 통한 복록"
    },
    "health": {
      "detailedAnalysis": "건강운 매우 심층 분석 (20문장 이상) - 오행 균형, 장부 분석, 연령대별 건강 변화 종합 해석",
      "constitution": "체질적 특징과 강약점 - 선천적 건강 상태와 면역력 분석",
      "vulnerableAreas": ["주의해야 할 신체 부위와 질병 8-10가지, 각각 원인과 예방법 포함"],
      "healthManagement": "건강 관리법과 예방책 - 체질별 맞춤 건강법과 생활 습관",
      "mentalHealth": "정신 건강과 심리적 안정 - 스트레스 관리와 우울감 예방",
      "longevityAndVitality": "장수 가능성과 생명력 - 연령대별 건강 변화와 준비",
      "exerciseAndDiet": "적합한 운동과 식이요법 - 체질에 맞는 건강 관리",
      "criticalHealthPeriods": "건강 주의 시기와 대비책 - 대운별 건강 변화",
      "chronicDiseaseRisk": "만성 질환 위험도와 조기 예방법",
      "surgeryAndTreatment": "수술이나 치료가 필요한 시기와 성공 가능성"
    }
  },
  "yearlyForecast": {
    "currentYear": "${new Date().getFullYear()}년 매우 상세한 운세 예측 (15문장 이상) - 세운과 대운의 조합으로 본 올해 총운",
    "next5Years": "향후 5년간 대운의 상세한 흐름 - 연도별 특징과 주요 변화, 기회와 위험 요소",
    "criticalPeriods": ["인생의 중요한 변화 시기들 8-10가지, 각각 구체적 연도와 대비 방법 포함"],
    "monthlyGuidance": ["매월별 상세 운세 포인트 12개, 각월마다 주의사항과 기회 요소 포함"],
    "luckyElements": "올해와 내년에 특히 도움이 되는 오행, 색상, 방향, 숫자",
    "avoidancePeriods": "올해 피해야 할 시기와 행동 - 구체적 월별 주의사항",
    "opportunityWindows": "큰 기회가 오는 시기와 활용 방법 - 취업, 사업, 투자 등"
  },
  "compatibility": {
    "bestMatches": ["최고 궁합 간지와 이유 5-6가지, 각각 상세한 궁합 분석과 결합 효과"],
    "goodMatches": ["좋은 궁합 간지와 특징 5-6가지, 장점과 주의점 포함"],
    "challengingMatches": ["어려운 궁합과 극복 방법 4-5가지, 갈등 요소와 해결책"],
    "businessPartners": "사업 파트너로 좋은 사주 특징 - 십성 조합과 성공 확률",
    "marriageCompatibility": "결혼 상대로 적합한 사주 분석 - 부부 궁합과 가정 화목",
    "friendshipTypes": "좋은 친구가 될 수 있는 사주 유형과 사교 관계",
    "workRelationships": "직장에서 좋은 관계를 유지할 수 있는 동료/상사 유형",
    "parentChildHarmony": "자녀와의 궁합과 교육 방향 - 세대 간 이해와 소통"
  },
  "lifeAdvice": {
    "immediate": ["지금 당장 실천할 구체적 조언 8-10가지, 각각 실천 방법과 기대 효과 포함"],
    "career": ["직업적 성공을 위한 상세 전략 8-10가지, 단계별 실행 계획 포함"],
    "relationships": ["인간관계 개선 방법 8-10가지, 상황별 대응법과 소통 기술"],
    "selfDevelopment": ["자기계발 방향과 방법 8-10가지, 우선순위와 학습 계획 포함"],
    "spiritualGrowth": ["정신적 성장을 위한 조언 6-8가지, 명상, 독서, 봉사 등 구체적 방법"],
    "healthAndWellness": ["건강과 웰빙 증진을 위한 생활 습관 6-8가지"],
    "financialManagement": ["재정 관리와 투자 전략 6-8가지, 위험 관리 포함"],
    "lifeBalance": ["일과 삶의 균형을 위한 실용적 조언 5-6가지"]
  },
  "specialInsights": {
    "hiddenTalents": "사주에 숨겨진 특별한 재능과 개발 방법 - 특수 격국이나 신살 분석",
    "karmaAndLessons": "전생과 인연, 이번 생에서 배워야 할 교훈 - 사주의 깊은 의미",
    "spiritualMission": "인생의 사명과 존재 목적 - 사회적 역할과 기여 방안",
    "fateChangingMethods": "운명 개선을 위한 적극적 방법 - 이름, 거주지, 직업 등",
    "ancestralInfluence": "조상과 가문의 영향 - 가계 운세와 후손에게 미치는 영향"
  },
  "confidence": 95
}

**📋 CRITICAL 출력 지침 - 반드시 준수 📋**

⚠️ 절대로 JSON 이외의 텍스트는 출력하지 마세요
⚠️ 반드시 완전한 JSON 구조로만 응답하세요
⚠️ 문자열이 길어져도 반드시 따옴표를 완전히 닫으세요
⚠️ 응답이 잘릴 것 같으면 내용을 줄여서라도 완전한 JSON을 출력하세요
⚠️ "confidence": 95로 반드시 완료하세요

지금 즉시 완전한 JSON 형태로 사주 분석을 시작하세요:`;

      const completion = await this.openai.chat.completions.create({
        model: this.FINE_TUNED_MODEL, // 파인튜닝된 관상 전문 모델
        messages: [
          {
            role: "system",
            content: `당신은 50년 경력의 사주명리학 대가입니다.

전문 분야:
- 정통 사주명리학 (자평명리학, 적천수, 연해자평)
- 만세력 계산 및 오행 분석의 정확한 해석
- 20만 명 이상의 사주를 봐온 풍부한 실무 경험
- 97% 이상의 예측 정확도를 보유한 검증된 실력
- 현대적 해석과 전통 이론의 완벽한 조화

사주 분석 원칙:
1. 일간을 중심으로 한 오행 상생상극 관계 정확히 분석
2. 용신과 기신을 찾아 길흉화복의 근본 원리 해석
3. 십성(十星)의 배치로 성격과 운명의 특징 파악
4. 대운과 세운의 흐름으로 인생의 기복과 변화 예측
5. 신살(神煞)과 특수 격국으로 특별한 재능과 주의점 도출
6. **중요**: 좋은 운과 나쁜 운을 균형있게 분석
7. **중요**: 약점이나 어려운 시기도 솔직하게 제시

해석 지침:
- 모든 분석은 음양오행 이론에 근거하여 논리적으로 설명
- 추상적 표현보다는 구체적이고 실용적인 조언 제공
- **현실적 분석**: 부정적 측면도 정확히 전달하되 개선 방안도 함께 제시
- **과도한 미화 금지**: 있는 그대로의 사주를 솔직하게 해석
- 개인의 노력으로 바꿀 수 있는 부분과 타고난 부분 구분
- **단점 개선**: 약점에 대한 구체적인 대처 방안 반드시 포함

**CRITICAL: 절대 준수 JSON 규칙**
1. 절대로 JSON 이외의 텍스트는 출력 금지 (설명, 주석, 마크다운 모두 금지)
2. 반드시 완전한 JSON 구조 생성 - 모든 중괄호와 따옴표 완전히 닫기
3. 문자열 값이 길어져도 반드시 따옴표로 완전히 닫기
4. 마지막 속성에는 절대 콤마(,) 사용 금지
5. JSON이 잘려도 반드시 유효한 형태 유지하기
6. "confidence": 95 반드시 포함하여 완료하기
7. 응답 길이가 제한되면 내용을 줄여서라도 완전한 JSON 출력
8. 중간에 응답이 끊어지면 자동으로 JSON을 완성하기

**JSON 형식 강제 지시:**
- 시작: { 반드시 포함
- 끝: } 반드시 포함
- 모든 키: "key" 형태로 따옴표 사용
- 모든 값: "value" 형태로 따옴표 사용
- 절대 단일 따옴표(') 사용 금지

당신의 분석은 수명자의 인생에 실질적 도움이 되어야 하며,
전통 사주명리학의 정수를 현대인이 이해하기 쉽게 전달해야 합니다.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 16000, // 사주 분석용 증가된 파라미터
        temperature: 0.7
      });

      const result = completion.choices[0].message.content;
      if (!result) {
        throw new Error('GPT 사주 분석 응답이 비어있습니다.');
      }

      // 개선된 JSON 파싱 사용
      return this.safeJsonParse(result, '사주 분석');

    } catch (error) {
      console.error('GPT 사주 분석 오류:', error);
      throw new Error(`사주 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 통합 분석 - 얼굴, 사주 분석
   */
  async performCompleteAnalysis(data: {
    faceImage?: Buffer;
    birthData?: {
      year: number;
      month: number;
      day: number;
      hour: number;
      gender: 'male' | 'female';
    };
    analysisType?: 'comprehensive' | 'selective';
    selectedTopic?: string;
    selectedTopics?: string[];
  }) {
    const results: any = {};

    try {
      // 병렬 처리로 속도 개선
      const promises = [];
      
      // 1. 얼굴 분석 (Gemini + Fine-tuned GPT)
      if (data.faceImage) {
        promises.push(
          (async () => {
            console.log('얼굴 특징 추출 중...');
            const faceFeatures = await this.analyzeFaceFeatures(data.faceImage!);
            console.log('관상 분석 중...');
            return this.analyzeFaceReading(faceFeatures);
          })()
        );
      }

      // 2. 사주 분석 (GPT)
      if (data.birthData) {
        promises.push(
          (async () => {
            console.log('사주 분석 중...');
            return this.analyzeSaju(data.birthData!);
          })()
        );
      }

      // 병렬로 실행
      const [faceAnalysisResult, sajuAnalysisResult] = await Promise.all(promises);
      
      if (data.faceImage) results.faceAnalysis = faceAnalysisResult;
      if (data.birthData) results.sajuAnalysis = sajuAnalysisResult || faceAnalysisResult; // sajuAnalysis가 없으면 faceAnalysis 사용

      // 3. 관상+사주 종합 분석 (새로 추가)
      if (results.faceAnalysis && results.sajuAnalysis) {
        console.log('관상+사주 종합 분석 중...');
        console.log('=== 디버그: 종합 분석 조건 확인 ===');
        console.log('관상 분석 존재:', !!results.faceAnalysis);
        console.log('사주 분석 존재:', !!results.sajuAnalysis);
        console.log('생년월일 데이터:', data.birthData);
        
        try {
          const combinedResult = await this.analyzeFaceSajuCombined(
            results.faceAnalysis,
            results.sajuAnalysis,
            data.birthData!,
            data.analysisType || 'comprehensive',
            data.selectedTopics || [data.selectedTopic || '']
          );

          // 구조화된 데이터와 기존 문자열 모두 저장
          if (typeof combinedResult === 'object' && combinedResult.detailedAnalysis) {
            results.detailedAnalysis = combinedResult.detailedAnalysis;
            results.combinedAnalysis = combinedResult.combinedAnalysis;
          } else {
            // 이전 버전 호환성을 위해 문자열 결과도 지원
            results.combinedAnalysis = combinedResult;
          }

          console.log('종합 분석 완료!');
          console.log('반환된 데이터 구조:', {
            detailedAnalysis: !!results.detailedAnalysis,
            combinedAnalysis: !!results.combinedAnalysis
          });
        } catch (error) {
          console.error('종합 분석 실패:', error);
          throw error;
        }
      } else {
        console.warn('종합 분석 조건 미충족!');
        console.log('관상 분석:', !!results.faceAnalysis);
        console.log('사주 분석:', !!results.sajuAnalysis);
      }

      return {
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('통합 분석 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * AI 분석 결과를 구조화된 섹션으로 파싱
   */
  private parseAnalysisResult(result: string): {
    faceAnalysis: string;
    sajuAnalysis: string;
    judgment: string;
    statistics: string;
    advice: string;
  } {
    const sections = {
      faceAnalysis: '',
      sajuAnalysis: '',
      judgment: '',
      statistics: '',
      advice: ''
    };

    try {
      // 섹션별로 분리
      const faceMatch = result.match(/\*\*관상 분석\*\*(.*?)(?=\*\*사주 분석\*\*|\*\*종합 판정\*\*|$)/s);
      const sajuMatch = result.match(/\*\*사주 분석\*\*(.*?)(?=\*\*종합 판정\*\*|\*\*구체적 수치\*\*|$)/s);
      const judgmentMatch = result.match(/\*\*종합 판정\*\*(.*?)(?=\*\*구체적 수치\*\*|\*\*실전 조언\*\*|$)/s);
      const statisticsMatch = result.match(/\*\*구체적 수치\*\*(.*?)(?=\*\*실전 조언\*\*|$)/s);
      const adviceMatch = result.match(/\*\*실전 조언\*\*(.*?)$/s);

      if (faceMatch) sections.faceAnalysis = faceMatch[1].trim();
      if (sajuMatch) sections.sajuAnalysis = sajuMatch[1].trim();
      if (judgmentMatch) sections.judgment = judgmentMatch[1].trim();
      if (statisticsMatch) sections.statistics = statisticsMatch[1].trim();
      if (adviceMatch) sections.advice = adviceMatch[1].trim();

      // 빈 섹션이 있으면 전체 텍스트를 관상 분석에 할당
      if (!sections.faceAnalysis && !sections.sajuAnalysis && !sections.judgment) {
        sections.faceAnalysis = result;
      }
    } catch (error) {
      console.error('분석 결과 파싱 오류:', error);
      sections.faceAnalysis = result; // 파싱 실패 시 전체 결과를 관상 분석에 할당
    }

    return sections;
  }

  /**
   * 관상 + 사주 종합 분석 메서드
   */
  // 개별 주제 분석 함수 (병렬 처리용)
  private async analyzeSingleTopic(
    topicKey: string,
    faceAnalysis: any,
    sajuAnalysis: any,
    birthData: any,
    topicInfo: {title: string, description: string}
  ): Promise<{topicKey: string, result: string}> {
    const prompt = `${topicInfo.title} 전문 분석

당신은 30년 경력의 관상학 대가이자 사주명리학 전문가입니다.

다음과 같이 **정확히 이 형식으로만** 답변하세요:

**관상 분석**
얼굴 특징을 바탕으로 한 ${topicInfo.title}에 대한 상세한 관상학적 분석을 제공하세요.

**사주 분석**
생년월일을 바탕으로 한 ${topicInfo.title}에 대한 상세한 사주명리학적 분석을 제공하세요.

**종합 판정**
관상과 사주를 종합한 최종 결론과 전체적인 운세를 분석하세요.

**구체적 수치**
점수, 확률, 시기 등 구체적인 수치와 지표를 제시하세요.

**실전 조언**
구체적인 행동 지침과 주의사항을 실용적으로 제시하세요.

**분석 데이터:**
- 관상 특징: ${JSON.stringify(faceAnalysis, null, 2)}
- 사주 정보: ${JSON.stringify(sajuAnalysis, null, 2)}  
- 생년월일: ${birthData.year}년 ${birthData.month}월 ${birthData.day}일 ${birthData.hour}시 (${birthData.gender === 'male' ? '남성' : '여성'})

가격이나 금액 언급은 절대 하지 마세요. 전문적이고 실용적인 분석만 제공하세요.`;

    const completion = await this.openai.chat.completions.create({
      model: this.FINE_TUNED_MODEL,
      messages: [
        {
          role: "system",
          content: `당신은 30년 경력의 관상학 대가이자 사주명리학 전문가입니다.

마크다운 문법 없이 순수한 텍스트로만 작성해주세요. **굵은 글씨**, ###제목, -리스트 등의 마크다운 문법을 사용하지 말고 일반 텍스트로만 응답하세요.

전문적이고 실용적인 분석을 제공하되, 가격이나 금액 언급은 절대 하지 마세요.
현실적인 분석과 구체적인 조언에 집중하세요.`
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    const rawResult = completion.choices[0].message.content || '분석 결과를 생성할 수 없습니다.';

    // 마크다운 요소 제거
    const cleanResult = rawResult
      .replace(/^#{1,6}\s+/gm, '')  // 헤더 제거
      .replace(/\*\*(.*?)\*\*/g, '$1')  // 굵은 글씨 제거
      .replace(/\*(.*?)\*/g, '$1')  // 이탤릭 제거
      .replace(/^-\s+/gm, '')  // 리스트 마커 제거
      .replace(/^\*\s+/gm, '')  // 다른 리스트 마커 제거
      .trim();

    return {
      topicKey,
      result: cleanResult
    };
  }

  async analyzeFaceSajuCombined(faceAnalysis: any, sajuAnalysis: any, birthData: {
    year: number;
    month: number;
    day: number;
    hour: number;
    gender: 'male' | 'female';
  }, analysisType: 'comprehensive' | 'selective' = 'comprehensive', selectedTopics: string[] = []) {
    try {
      // 주제별 분석 정의
      const topicMap: { [key: string]: { title: string; description: string } } = {
        comprehensive: { title: '종합 분석 및 총평', description: '관상과 사주를 종합하여 전체적인 운명의 흐름과 특징을 분석하세요.\n- 전체적인 운명의 특징과 장단점\n- 인생 전반의 큰 흐름과 전성기\n- 가장 주의해야 할 시기와 대비책\n- 타고난 재능과 활용 방법\n- 인생 목표와 성공을 위한 핵심 전략' },
        job: { title: '직장운', description: '관상에서 보이는 직업 적성과 사주의 십성, 용신을 종합하여 직장운을 분석하세요.\n- 타고난 직장 재능과 적성 분야\n- 직장 내 인간관계와 승진운\n- 성공할 수 있는 구체적인 직종과 업계\n- 직업적 성공 시기와 이직 타이밍\n- 직장 생활에서 주의사항과 성공 전략' },
        business: { title: '사업운', description: '관상에서 보이는 사업 적성과 사주의 십성, 용신을 종합하여 사업운을 분석하세요.\n- 타고난 사업 재능과 창업 적성\n- 동업 vs 단독 사업 중 어느 것이 유리한지\n- 성공할 수 있는 구체적인 사업 분야\n- 사업 성공 시기와 확장 타이밍\n- 사업을 할 때 주의사항과 성공 전략' },
        wealth: { title: '재물운/투자운', description: '관상의 재물궁과 사주의 재성을 종합 분석하세요.\n- 돈을 버는 능력과 재물 축적 방식\n- 투자 성향과 유리한 투자 분야\n- 부동산, 주식, 사업 중 어느 것이 유리한지\n- 재물 증식 최적 시기와 방법\n- 돈 관리 능력과 소비 패턴 주의사항' },
        love: { title: '연애운/결혼운', description: '관상의 이성운과 사주의 배우자궁을 종합 분석하세요.\n- 연애 스타일과 이성에게 어필하는 매력\n- 만날 수 있는 이상형과 배우자 특징\n- 연애에서 주의해야 할 점과 성공 방법\n- 결혼 적령기와 최적의 결혼 시기\n- 결혼 후 가정생활과 배우자와의 궁합' },
        children: { title: '자녀운/가족운', description: '관상과 사주에서 나타나는 가족 관계를 분석하세요.\n- 자녀를 가질 가능성과 자녀복\n- 자녀와의 관계와 교육 방침\n- 부모와의 관계 및 효도운\n- 가족 내에서의 역할과 책임\n- 가문 발전에 기여할 수 있는 방법' },
        health: { title: '건강운/장수운', description: '관상의 건강 징조와 사주의 오행 균형을 종합하세요.\n- 타고난 체질과 건강한 신체 부위\n- 주의해야 할 질병과 약한 장기\n- 연령대별 건강 관리 포인트\n- 장수 가능성과 노년기 건강\n- 구체적인 건강 관리법과 예방책' },
        life: { title: '인생 전체 운세 흐름', description: '관상과 사주를 통해 본 전체적인 인생 패턴을 분석하세요.\n- 20-30대: 청년기 운세와 주요 기회\n- 40-50대: 중년기 전성기와 주의사항\n- 60대 이후: 노년기 운세와 준비사항\n- 인생 최고 전성기와 조심해야 할 시기\n- 전체적인 운세 흐름과 인생 전략' },
        luck: { title: '개운법 및 실천 조언', description: '실제로 운을 좋게 만들 수 있는 구체적인 방법을 제시하세요.\n- 행운을 부르는 색상, 숫자, 방향\n- 착용하면 좋은 보석이나 액세서리\n- 개운에 도움이 되는 음식과 생활 습관\n- 인간관계에서 피해야 할 사람 유형\n- 올해와 내년에 중점적으로 해야 할 일' }
      };

      // 병렬 처리를 위한 주제 리스트 결정 (종합 분석이 맨 앞)
      const topicsToAnalyze = analysisType === 'comprehensive'
        ? ['comprehensive', 'job', 'business', 'wealth', 'love', 'children', 'health', 'life', 'luck']
        : selectedTopics;

      console.log('배치 분석 시작:', topicsToAnalyze);

      // 3개씩 배치로 나누어 순차 처리
      const batchSize = 3;
      const analysisResults: any[] = [];

      for (let i = 0; i < topicsToAnalyze.length; i += batchSize) {
        const batch = topicsToAnalyze.slice(i, i + batchSize);
        console.log(`배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(topicsToAnalyze.length / batchSize)} 시작:`, batch);

        const batchPromises = batch.map(async (topicKey) => {
          const topicInfo = topicMap[topicKey];
          if (!topicInfo) {
            console.error('주제를 찾을 수 없습니다:', topicKey);
            return { topicKey, result: `${topicKey} 분석을 찾을 수 없습니다.` };
          }

          try {
            console.log(`${topicInfo.title} 분석 시작...`);
            const analysisResult = await this.analyzeSingleTopic(topicKey, faceAnalysis, sajuAnalysis, birthData, topicInfo);
            console.log(`${topicInfo.title} 분석 완료`);
            return { topicKey, result: analysisResult.result, title: topicInfo.title };
          } catch (error) {
            console.error(`${topicInfo.title} 분석 실패:`, error);
            return { topicKey, result: `${topicInfo.title} 분석 중 오류가 발생했습니다.`, title: topicInfo.title };
          }
        });

        // 현재 배치의 분석 결과 기다림
        const batchResults = await Promise.all(batchPromises);
        analysisResults.push(...batchResults);

        console.log(`배치 ${Math.floor(i / batchSize) + 1} 완료`);

        // 다음 배치 전에 잠시 대기 (API 부하 방지)
        if (i + batchSize < topicsToAnalyze.length) {
          console.log('다음 배치 처리 전 2초 대기...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log('모든 배치 분석 완료');

      // 결과를 구조화된 객체로 변환
      const detailedAnalysis: { [key: string]: any } = {};
      const combinedAnalysisText: string[] = [];

      // 헤더 추가 (comprehensive인 경우)
      if (analysisType === 'comprehensive') {
        combinedAnalysisText.push(`# 관상 + 사주 종합 운명 분석\n`);
        combinedAnalysisText.push(`**분석 대상**: ${birthData.year}년 ${birthData.month}월 ${birthData.day}일 ${birthData.hour}시생 (${birthData.gender === 'male' ? '남성' : '여성'})\n`);
        combinedAnalysisText.push(`전통 관상학과 사주명리학을 현대 AI 기술로 종합 분석한 결과입니다.\n`);
      }

      // 각 분석 결과를 파싱하여 구조화
      analysisResults.forEach((analysis, index) => {
        if (analysis.result && typeof analysis.result === 'string' && analysis.result.trim()) {
          const topicKey = analysis.topicKey;

          // AI 응답을 파싱하여 섹션별로 분리
          const sections = this.parseAnalysisResult(analysis.result);

          detailedAnalysis[topicKey] = {
            faceAnalysis: sections.faceAnalysis || '',
            sajuAnalysis: sections.sajuAnalysis || '',
            judgment: sections.judgment || '',
            statistics: sections.statistics || '',
            advice: sections.advice || ''
          };

          combinedAnalysisText.push(`${analysis.result}\n`);
          if (index < analysisResults.length - 1) {
            combinedAnalysisText.push(`---\n`);
          }
        }
      });

      console.log('관상+사주 병렬 분석 완료');
      console.log('구조화된 분석 결과:', Object.keys(detailedAnalysis));

      // 두 가지 형태로 반환: 구조화된 데이터와 기존 문자열
      return {
        detailedAnalysis,
        combinedAnalysis: combinedAnalysisText.join('\n')
      };

    } catch (error) {
      console.error('관상+사주 종합 분석 오류:', error);
      throw new Error(`관상+사주 종합 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 전문 관상 분석 메서드 - 파인튜닝된 OpenAI 모델 사용
   */
  async analyzeProfessionalPhysiognomy(
    faceFeatures: any,
    age: number,
    analysisTopics: string[]
  ): Promise<any> {
    try {
      console.log('전문 관상 분석 시작 (파인튜닝된 OpenAI 모델)...');
      console.log('분석 주제:', analysisTopics);

      // 분야별 분석 정의
      const analysisFields = [
        { key: 'comprehensive', name: '종합 분석 및 총평', desc: '전반적인 관상학적 특징과 인생 운세 종합 평가' },
        { key: 'job', name: '직장운', desc: '직업 적성, 승진운, 상사 및 동료와의 관계, 직장 내 성공 가능성' },
        { key: 'business', name: '사업운', desc: '창업 적성, 사업 성공 가능성, 재정 관리 능력, 투자 운세' },
        { key: 'wealth', name: '재물운/투자운', desc: '돈을 모으는 능력, 투자 감각, 재정 관리, 부의 축적 가능성' },
        { key: 'love', name: '연애운/결혼운', desc: '이성관계, 결혼 운세, 배우자운, 가정생활의 행복도' },
        { key: 'children', name: '자녀운/가족운', desc: '자녀와의 인연, 출산운, 가족관계, 효도 받을 운세' },
        { key: 'health', name: '건강운/장수운', desc: '체질 분석, 주의해야 할 질병, 건강 관리법, 장수 가능성' },
        { key: 'life', name: '인생 전체 운세 흐름', desc: '연령대별 운세 변화, 대운의 흐름, 인생의 전성기' },
        { key: 'luck', name: '개운법 및 실천 조언', desc: '행운을 부르는 방법, 색상/방위/음식 등 구체적 실천법' }
      ];

      // 각 분야별로 개별 분석 함수 생성 (파인튜닝된 OpenAI 모델 사용)
      const generateFieldAnalysis = async (field: any) => {
        const prompt = `당신은 30년 경력의 전문 관상학자입니다. ${age}세 분의 ${field.name}을 분석해 주세요.

얼굴 특징: ${JSON.stringify(faceFeatures, null, 2)}
분석 분야: ${field.desc}

마크다운 문법 없이 순수한 텍스트로만 작성해주세요. **굵은 글씨**, *기울임*, ### 헤더 등 마크다운 문법을 사용하지 마세요.

JSON 형식으로 응답:
{
  "theoreticalBasis": "전통 관상학 이론 근거 (마크다운 없음)",
  "detailedAnalysis": "상세 분석 내용 (마크다운 없음)",
  "practicalGuide": "실전 활용 방법 (마크다운 없음)",
  "expertAdvice": "전문가 조언 (마크다운 없음)",
  "timing": "최적 시기",
  "luckyColors": ["색상1", "색상2", "색상3"],
  "luckyDirections": "유리한 방향",
  "developmentPlan": "발전 계획 (마크다운 없음)"
}`;

        try {
          const completion = await this.openai.chat.completions.create({
            model: this.FINE_TUNED_MODEL, // 파인튜닝된 관상 전문 모델
            messages: [
              {
                role: "system",
                content: "당신은 전문 관상학자입니다. 마크다운 문법을 절대 사용하지 말고 순수한 텍스트로만 응답하세요."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000 // 토큰 수 줄여서 속도 향상
          });

          const result = completion.choices[0].message.content;
          if (!result) {
            throw new Error('파인튜닝된 모델 응답이 비어있습니다.');
          }

          // JSON 파싱 및 마크다운 정리
          const cleanedResponse = result.replace(/```json\n?|```\n?/g, '').trim();
          let parsedResult = this.safeJsonParse(cleanedResponse, field.name);

          // 각 필드에서 마크다운 문법 제거
          const cleanMarkdown = (text: any) => {
            if (typeof text === 'string') {
              return text
                .replace(/\*\*(.*?)\*\*/g, '$1') // **굵은글씨** 제거
                .replace(/\*(.*?)\*/g, '$1') // *기울임* 제거
                .replace(/###\s*(.*?)\n/g, '$1\n') // ### 헤더 제거
                .replace(/##\s*(.*?)\n/g, '$1\n') // ## 헤더 제거
                .replace(/#\s*(.*?)\n/g, '$1\n') // # 헤더 제거
                .replace(/`(.*?)`/g, '$1') // `코드` 제거
                .replace(/^\s*-\s+/gm, '') // - 리스트 제거
                .replace(/^\s*\*\s+/gm, '') // * 리스트 제거
                .trim();
            }
            return text;
          };

          // 모든 텍스트 필드에서 마크다운 제거
          parsedResult.theoreticalBasis = cleanMarkdown(parsedResult.theoreticalBasis);
          parsedResult.detailedAnalysis = cleanMarkdown(parsedResult.detailedAnalysis);
          parsedResult.practicalGuide = cleanMarkdown(parsedResult.practicalGuide);
          parsedResult.expertAdvice = cleanMarkdown(parsedResult.expertAdvice);
          parsedResult.timing = cleanMarkdown(parsedResult.timing);
          parsedResult.luckyDirections = cleanMarkdown(parsedResult.luckyDirections);
          parsedResult.developmentPlan = cleanMarkdown(parsedResult.developmentPlan);

          console.log(`${field.name} 분석 완료 (파인튜닝 모델)`);
          return { key: field.key, data: parsedResult };
        } catch (error) {
          console.error(`${field.name} 분석 실패:`, error);
          // 기본 구조 반환 (실패 시)
          return {
            key: field.key,
            data: {
              theoreticalBasis: `${field.name} 관련 관상학 이론 분석 중 오류가 발생했습니다.`,
              detailedAnalysis: `${field.name} 상세 분석 중 오류가 발생했습니다.`,
              practicalGuide: "분석 오류로 인해 실전 가이드를 제공할 수 없습니다.",
              expertAdvice: "분석 오류로 인해 전문가 조언을 제공할 수 없습니다.",
              timing: "분석 오류",
              luckyColors: ["분석 오류"],
              luckyDirections: "분석 오류",
              developmentPlan: "분석 오류로 인해 발전 계획을 제공할 수 없습니다."
            }
          };
        }
      };

      // 병렬 처리로 모든 분야 분석 실행 (6개씩 배치로 늘려서 속도 향상)
      console.log('병렬 분석 시작 (파인튜닝 모델)...');
      const batchSize = 6; // OpenAI는 더 많은 동시 요청 가능
      const results: any = {};

      for (let i = 0; i < analysisFields.length; i += batchSize) {
        const batch = analysisFields.slice(i, i + batchSize);
        console.log(`배치 ${Math.floor(i/batchSize) + 1} 처리 중: ${batch.map(f => f.name).join(', ')}`);

        const batchPromises = batch.map(field => generateFieldAnalysis(field));
        const batchResults = await Promise.all(batchPromises);

        // 결과 병합
        batchResults.forEach(result => {
          results[result.key] = result.data;
        });

        // 더 짧은 대기 시간으로 속도 향상
        if (i + batchSize < analysisFields.length) {
          console.log('배치 간 대기 중...');
          await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 대기
        }
      }

      console.log('전문 관상 분석 완료 (파인튜닝 모델)');
      return results;

    } catch (error) {
      console.error('전문 관상 분석 오류:', error);
      throw new Error(`전문 관상 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 면접 관상 전용 분석
   */
  async analyzeInterviewPhysiognomy(faceFeatures: any, userData: { gender: string; age: number; jobField: string }): Promise<any> {
    try {
      console.log('=== 면접 관상 AI 분석 시작 ===');

      const prompt = `
# 면접 관상 전문 분석
다음 얼굴 특징과 개인 정보를 바탕으로 면접에서의 인상과 적합성을 깊이 있게 분석해 주세요.

## 분석 대상 정보
- 성별: ${userData.gender === 'male' ? '남성' : '여성'}
- 나이: ${userData.age}세
- 희망 직군: ${userData.jobField}

## 얼굴 특징 데이터
${JSON.stringify(faceFeatures, null, 2)}

## 분석 요구사항
다음 12개 영역을 각각 매우 상세하고 풍성하게 분석해 주세요. 각 분야별로 최소 400-500자 이상의 깊이 있는 내용을 작성하세요:

1. 종합평가 - 전반적인 면접 적합성과 성공 가능성을 종합적으로 평가
2. 첫인상_분석 - 초기 인상, 호감도, 면접관이 받을 첫 느낌을 구체적으로 분석
3. 신뢰도_평가 - 신뢰감, 책임감, 진실성에 대한 상세한 평가
4. 리더십_잠재력 - 리더십 능력, 추진력, 의사결정력을 심도있게 분석
5. 팀워크_성향 - 협업 능력, 소통력, 대인관계 스킬을 세밀하게 평가
6. 스트레스_관리 - 압박상황 대처능력, 감정조절, 멘탈관리 역량 분석
7. 성장_가능성 - 발전 잠재력, 학습 의지, 적응력을 구체적으로 평가
8. 강점_분석 - 핵심 장점, 경쟁력, 면접에서 어필할 수 있는 포인트들
9. 보완점 - 개선이 필요한 부분, 구체적인 개선 방법과 실행 계획
10. 의사소통능력 - 커뮤니케이션 스킬, 표현력, 경청 능력을 세부적으로 분석
11. 창의성_혁신성 - 창의적 사고, 문제해결력, 새로운 아이디어 창출 능력
12. 전문성_역량 - 해당 직군에서의 전문성, 업무 적합성, 직무 역량

**중요 지침:**
- 각 항목마다 반드시 400-500자 이상의 상세하고 구체적인 분석을 작성하세요
- 관상학적 근거를 바탕으로 한 심층적인 해석을 포함하세요
- 100점 만점 기준의 점수와 구체적인 근거를 제시하세요
- 실용적이고 실행 가능한 조언을 상세히 제공하세요
- ${userData.jobField} 분야의 특성을 충분히 고려한 맞춤형 분석을 하세요
- 단순한 일반론이 아닌 개인의 얼굴 특징에 기반한 구체적인 분석을 하세요

반드시 아래 JSON 구조로 정확하게 응답해 주세요:
{
  "종합평가": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "첫인상_분석": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "신뢰도_평가": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "리더십_잠재력": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "팀워크_성향": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "스트레스_관리": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "성장_가능성": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "강점_분석": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "보완점": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "의사소통능력": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "창의성_혁신성": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언...",
  "전문성_역량": "400자 이상의 매우 상세한 분석 내용과 점수, 구체적 근거, 실용적 조언..."
}`;

      // 파인튜닝된 OpenAI 모델 사용
      const response = await this.openai.chat.completions.create({
        model: this.FINE_TUNED_MODEL,
        messages: [
          {
            role: 'system',
            content: '마크다운 문법 없이 순수한 텍스트로만 작성해주세요. **굵은 글씨**, ###제목, -리스트 등의 마크다운 문법을 사용하지 말고 일반 텍스트로만 응답하세요.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.3
      });

      const text = response.choices[0].message.content || '';

      // 마크다운 요소 제거
      const cleanText = text
        .replace(/^#{1,6}\s+/gm, '')  // 헤더 제거
        .replace(/\*\*(.*?)\*\*/g, '$1')  // 굵은 글씨 제거
        .replace(/\*(.*?)\*/g, '$1')  // 이탤릭 제거
        .replace(/^-\s+/gm, '')  // 리스트 마커 제거
        .replace(/^\*\s+/gm, '')  // 다른 리스트 마커 제거
        .trim();

      console.log('면접 관상 AI 분석 응답 길이:', cleanText.length);

      return this.safeJsonParse(cleanText, '면접 관상 분석');

    } catch (error) {
      console.error('면접 관상 AI 분석 오류:', error);
      throw error;
    }
  }
}

export const aiServices = new AIAnalysisService();

// 면접 관상 분석 함수
export async function analyzeInterviewFace(
  base64Image: string,
  userData: { gender: string; age: number; jobField: string }
): Promise<any> {
  try {
    console.log('면접 관상 분석 시작...');
    console.log('사용자 정보:', userData);

    // 실제 AI 이미지 분석 수행
    // 이미지에서 얼굴 특징 추출
    const imageBuffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const faceFeatures = await aiServices.analyzeFaceFeatures(imageBuffer);

    // 면접 관상 전용 분석 수행
    console.log('=== analyzeInterviewPhysiognomy 호출 시작 ===');
    const rawAnalysis = await aiServices.analyzeInterviewPhysiognomy(faceFeatures, userData);
    console.log('=== analyzeInterviewPhysiognomy 호출 완료 ===');
    console.log('rawAnalysis 결과:', rawAnalysis);

    // AI 분석 결과를 반환
    const analysisResult = {
      success: true,
      analysis: rawAnalysis
    };

    console.log('면접 관상 분석 완료');
    return analysisResult;

  } catch (error) {
    console.error('면접 관상 분석 오류:', error);
    console.error('오류 스택:', error instanceof Error ? error.stack : '스택 없음');

    // 하드코딩된 fallback 대신 오류를 그대로 전파
    throw new Error(`면접 관상 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}
