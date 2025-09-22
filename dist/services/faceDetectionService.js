import { geminiService } from './geminiService.js';
import { v4 as uuidv4 } from 'uuid';
export class FaceDetectionService {
    activeSessions = new Map();
    MAX_SESSIONS = 100;
    SESSION_TIMEOUT = 30 * 60 * 1000;
    constructor() {
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 5 * 60 * 1000);
    }
    async validateAndPreprocessImage(imageData) {
        try {
            if (!imageData.startsWith('data:image/')) {
                return {
                    isValid: false,
                    error: '지원되지 않는 이미지 형식입니다. JPEG, PNG 형식만 지원됩니다.'
                };
            }
            const sizeInBytes = (imageData.length * 3) / 4;
            const maxSize = 10 * 1024 * 1024;
            if (sizeInBytes > maxSize) {
                return {
                    isValid: false,
                    error: '이미지 크기가 너무 큽니다. 10MB 이하의 이미지를 업로드해주세요.'
                };
            }
            const validation = await geminiService.validateImage(imageData);
            if (!validation.isValid) {
                return {
                    isValid: false,
                    error: validation.error || '얼굴을 인식할 수 없습니다. 명확한 얼굴 사진을 업로드해주세요.',
                    faceDetected: validation.faceDetected,
                    imageQuality: validation.imageQuality
                };
            }
            return validation;
        }
        catch (error) {
            console.error('Image validation failed:', error);
            return {
                isValid: false,
                error: '이미지 검증 중 오류가 발생했습니다.'
            };
        }
    }
    async analyzeFaceFree(imageData) {
        const startTime = Date.now();
        try {
            const validation = await this.validateAndPreprocessImage(imageData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error
                };
            }
            const analysisResult = await geminiService.analyzeWithRetry(imageData, false);
            const parsedResult = JSON.parse(analysisResult.rawResponse);
            const freeResult = {
                fiveFeatures: parsedResult.faceFeatures.fiveFeatures,
                summary: parsedResult.summary,
                generalAdvice: parsedResult.generalAdvice
            };
            return {
                success: true,
                data: freeResult,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            console.error('Free face analysis failed:', error);
            return {
                success: false,
                error: this.getErrorMessage(error),
                processingTime: Date.now() - startTime
            };
        }
    }
    async analyzeFacePremium(request) {
        const startTime = Date.now();
        try {
            if (!request.selectedField) {
                return {
                    success: false,
                    error: '분석할 분야를 선택해주세요.'
                };
            }
            const validation = await this.validateAndPreprocessImage(request.imageData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error
                };
            }
            const analysisResult = await geminiService.analyzeWithRetry(request.imageData, true, request.selectedField);
            const parsedResult = JSON.parse(analysisResult.rawResponse);
            const premiumResult = {
                selectedField: request.selectedField,
                detailedAnalysis: parsedResult.fieldAnalysis,
                comprehensiveSummary: parsedResult.comprehensiveSummary
            };
            return {
                success: true,
                data: premiumResult,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            console.error('Premium face analysis failed:', error);
            return {
                success: false,
                error: this.getErrorMessage(error),
                processingTime: Date.now() - startTime
            };
        }
    }
    async createAnalysisSession(request) {
        if (this.activeSessions.size >= this.MAX_SESSIONS) {
            this.cleanupExpiredSessions();
            if (this.activeSessions.size >= this.MAX_SESSIONS) {
                throw new Error('서버가 과부하 상태입니다. 잠시 후 다시 시도해주세요.');
            }
        }
        const sessionId = uuidv4();
        const session = {
            sessionId,
            imageData: request.imageData,
            analysisType: request.analysisType,
            selectedField: request.selectedField,
            status: 'detecting',
            createdAt: new Date()
        };
        this.activeSessions.set(sessionId, session);
        this.processAnalysisSession(sessionId);
        return sessionId;
    }
    getAnalysisStatus(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return {
                status: 'failed',
                progress: 0,
                message: '세션을 찾을 수 없습니다.'
            };
        }
        const statusMessages = {
            detecting: '얼굴 인식 중...',
            analyzing: '특징 분석 중...',
            interpreting: '관상 해설 작성 중...',
            completed: '분석 완료',
            failed: '분석 실패'
        };
        const progressMap = {
            detecting: 25,
            analyzing: 50,
            interpreting: 75,
            completed: 100,
            failed: 0
        };
        return {
            status: session.status,
            progress: progressMap[session.status],
            message: statusMessages[session.status],
            result: session.result
        };
    }
    async processAnalysisSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        try {
            session.status = 'detecting';
            await this.delay(1000);
            session.status = 'analyzing';
            await this.delay(1500);
            session.status = 'interpreting';
            let result;
            if (session.analysisType === 'free') {
                result = await this.analyzeFaceFree(session.imageData);
            }
            else {
                result = await this.analyzeFacePremium({
                    imageData: session.imageData,
                    analysisType: session.analysisType,
                    selectedField: session.selectedField
                });
            }
            session.status = result.success ? 'completed' : 'failed';
            session.result = result;
            session.completedAt = new Date();
            setTimeout(() => {
                this.activeSessions.delete(sessionId);
            }, 60 * 60 * 1000);
        }
        catch (error) {
            console.error(`Analysis session ${sessionId} failed:`, error);
            session.status = 'failed';
            session.result = {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }
    cleanupExpiredSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.activeSessions.entries()) {
            const elapsed = now - session.createdAt.getTime();
            if (elapsed > this.SESSION_TIMEOUT) {
                this.activeSessions.delete(sessionId);
            }
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getErrorMessage(error) {
        if (error.code) {
            switch (error.code) {
                case 'QUOTA_EXCEEDED':
                    return 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
                case 'SAFETY_VIOLATION':
                    return '안전 정책 위반으로 분석을 진행할 수 없습니다.';
                case 'NETWORK_ERROR':
                    return '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
                default:
                    return error.message || '알 수 없는 오류가 발생했습니다.';
            }
        }
        return error.message || '분석 중 오류가 발생했습니다.';
    }
    deleteSession(sessionId) {
        return this.activeSessions.delete(sessionId);
    }
    getActiveSessionCount() {
        return this.activeSessions.size;
    }
    getServiceStatus() {
        const sessionCount = this.getActiveSessionCount();
        const healthy = sessionCount < this.MAX_SESSIONS * 0.8;
        return {
            healthy,
            activeSessions: sessionCount,
            message: healthy ? '서비스가 정상적으로 운영되고 있습니다.' : '서비스가 과부하 상태입니다.'
        };
    }
}
export const faceDetectionService = new FaceDetectionService();
//# sourceMappingURL=faceDetectionService.js.map