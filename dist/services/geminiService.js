import { GoogleGenerativeAI } from '@google/generative-ai';
export class GeminiService {
    genAI;
    freeModel;
    premiumModel;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.freeModel = process.env.GEMINI_MODEL_FREE || 'gemini-1.5-pro-002';
        this.premiumModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash-001';
    }
    async validateImage(imageData) {
        try {
            const model = this.genAI.getGenerativeModel({ model: this.freeModel });
            const prompt = `
        이 이미지에 사람의 얼굴이 명확하게 보이는지 확인해주세요.
        다음 조건을 만족하는지 검사해주세요:
        1. 얼굴이 명확하게 보이는가?
        2. 이마, 눈, 코, 입, 턱이 모두 보이는가?
        3. 이미지 품질이 분석에 적합한가?
        
        결과를 JSON 형태로 반환해주세요:
        {
          "faceDetected": boolean,
          "quality": "high" | "medium" | "low",
          "visibleFeatures": ["forehead", "eyes", "nose", "mouth", "chin"],
          "issues": ["문제점들"]
        }
      `;
            const imagePart = {
                inlineData: {
                    data: imageData.split(',')[1],
                    mimeType: 'image/jpeg'
                }
            };
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();
            try {
                const validation = JSON.parse(text);
                return {
                    isValid: validation.faceDetected && validation.visibleFeatures.length >= 4,
                    faceDetected: validation.faceDetected,
                    imageQuality: validation.quality,
                    error: validation.issues?.length > 0 ? validation.issues.join(', ') : undefined
                };
            }
            catch (parseError) {
                console.error('Failed to parse validation response:', parseError);
                return {
                    isValid: false,
                    error: 'Invalid response format from validation'
                };
            }
        }
        catch (error) {
            console.error('Image validation failed:', error);
            return {
                isValid: false,
                error: 'Image validation failed'
            };
        }
    }
    async analyzeFaceFree(imageData) {
        try {
            const model = this.genAI.getGenerativeModel({ model: this.freeModel });
            const prompt = `
        당신은 마의상법을 통달한 40년 경력의 관상가입니다. 
        지금부터 주어진 얼굴 특징을 바탕으로, 마의상법의 30가지 항목에 따라 이 인물의 관상을 오악분야만 분석해 주세요.
        오악에 대한 종합적인 분석을 간략하게만 설명해주면 된다.
        
        다음 JSON 형태로 정확히 반환해주세요:
        {
          "faceFeatures": {
            "faceShape": "얼굴형 설명",
            "skinTone": "피부색 설명",
            "eyeShape": "눈 형태 설명",
            "eyebrowShape": "눈썹 형태 설명",
            "noseShape": "코 형태 설명",
            "mouthShape": "입 형태 설명",
            "chinShape": "턱 형태 설명",
            "fiveFeatures": {
              "forehead": "이마 분석 - 지혜, 사고력, 미래운 관련",
              "eyes": "눈 분석 - 성격, 감정, 대인관계 관련",
              "nose": "코 분석 - 의지력, 재물운, 중년운 관련",
              "mouth": "입 분석 - 언변, 식복, 말년운 관련",
              "chin": "턱 분석 - 의지력, 추진력, 생활력 관련"
            }
          },
          "summary": "오악 종합 분석 결과",
          "generalAdvice": "일반적인 조언"
        }
      `;
            const imagePart = {
                inlineData: {
                    data: imageData.split(',')[1],
                    mimeType: 'image/jpeg'
                }
            };
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();
            try {
                const parsedResult = JSON.parse(text);
                return {
                    faceFeatures: parsedResult.faceFeatures,
                    rawResponse: text
                };
            }
            catch (parseError) {
                console.error('Failed to parse Gemini response:', parseError);
                throw new Error('Invalid response format from Gemini');
            }
        }
        catch (error) {
            console.error('Gemini free analysis failed:', error);
            throw this.handleGeminiError(error);
        }
    }
    async analyzeFacePremium(imageData, selectedField) {
        try {
            const model = this.genAI.getGenerativeModel({ model: this.premiumModel });
            const fieldMap = {
                love: '연애',
                business: '사업',
                health: '건강',
                children: '자녀',
                comprehensive: '종합',
                personality: '성격',
                tendency: '성향',
                wealth: '재물운',
                relationships: '대인관계',
                career: '직업',
                marriage: '결혼'
            };
            const selectedFieldKorean = fieldMap[selectedField];
            const prompt = `
        당신은 마의상법을 통달한 40년 경력의 관상가입니다. 
        지금부터 주어진 얼굴 특징을 바탕으로, 마의상법의 30가지 항목에 따라 이 인물의 관상을 분석해 주세요.
        
        분석할 항목: 오악, 귀, 눈, 입, 코, 명궁, 재백궁, 형제궁, 전택궁, 자녀궁, 노복궁, 질액궁, 천이궁, 관록궁, 복덕궁, 상모, 오성육요, 육부삼재삼정, 사학당, 팔학당, 오행형, 오형상, 논형, 골상, 육상, 두상, 상액, 논면, 논미, 상목
        
        사용자가 선택한 관심 분야: ${selectedFieldKorean}
        
        다음 JSON 형태로 정확히 반환해주세요:
        {
          "faceFeatures": {
            "faceShape": "얼굴형 설명",
            "skinTone": "피부색 설명",
            "eyeShape": "눈 형태 설명",
            "eyebrowShape": "눈썹 형태 설명",
            "noseShape": "코 형태 설명",
            "mouthShape": "입 형태 설명",
            "chinShape": "턱 형태 설명",
            "fiveFeatures": {
              "forehead": "이마 분석",
              "eyes": "눈 분석",
              "nose": "코 분석",
              "mouth": "입 분석",
              "chin": "턱 분석"
            },
            "ears": "귀 분석",
            "cheekbones": "광대 분석",
            "jawline": "턱선 분석",
            "faceSymmetry": "얼굴 대칭성 분석",
            "overallHarmony": "전체적 조화 분석"
          },
          "fieldAnalysis": {
            "field": "${selectedField}",
            "positiveAspects": ["긍정적 요소들"],
            "negativeAspects": ["부정적 요소들"],
            "interpretation": "${selectedFieldKorean} 분야에 대한 상세한 해석",
            "advice": "${selectedFieldKorean} 분야에 대한 구체적인 조언"
          },
          "comprehensiveSummary": ${selectedField === 'comprehensive' ? `{
            "balance": "인상의 균형과 전체적인 흐름",
            "overallTendency": "종합적 운세 경향",
            "lifeFlowAdvice": "전반적인 인생 흐름에 대한 조언"
          }` : 'null'}
        }
      `;
            const imagePart = {
                inlineData: {
                    data: imageData.split(',')[1],
                    mimeType: 'image/jpeg'
                }
            };
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();
            try {
                const parsedResult = JSON.parse(text);
                return {
                    faceFeatures: parsedResult.faceFeatures,
                    rawResponse: text
                };
            }
            catch (parseError) {
                console.error('Failed to parse Gemini response:', parseError);
                throw new Error('Invalid response format from Gemini');
            }
        }
        catch (error) {
            console.error('Gemini premium analysis failed:', error);
            throw this.handleGeminiError(error);
        }
    }
    handleGeminiError(error) {
        if (error.message?.includes('quota')) {
            return {
                code: 'QUOTA_EXCEEDED',
                message: 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
                details: error
            };
        }
        if (error.message?.includes('safety')) {
            return {
                code: 'SAFETY_VIOLATION',
                message: '안전 정책 위반으로 분석을 진행할 수 없습니다.',
                details: error
            };
        }
        if (error.message?.includes('network') || error.message?.includes('timeout')) {
            return {
                code: 'NETWORK_ERROR',
                message: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
                details: error
            };
        }
        return {
            code: 'UNKNOWN_ERROR',
            message: '알 수 없는 오류가 발생했습니다.',
            details: error
        };
    }
    async analyzeWithRetry(imageData, isPremium = false, selectedField, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (isPremium && selectedField) {
                    return await this.analyzeFacePremium(imageData, selectedField);
                }
                else {
                    return await this.analyzeFaceFree(imageData);
                }
            }
            catch (error) {
                lastError = error;
                console.log(`Analysis attempt ${attempt} failed:`, error);
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
}
export const geminiService = new GeminiService();
//# sourceMappingURL=geminiService.js.map