import { faceDetectionService } from '../services/faceDetectionService.js';
import { validateImageData, getFieldDisplayName, getFieldPrice, getUserFriendlyErrorMessage, formatAnalysisResult, generateAnalysisSummary, canAnalyze } from '../utils/faceUtils.js';
import Joi from 'joi';
export class FaceController {
    async validateImage(req, res) {
        try {
            const schema = Joi.object({
                imageData: Joi.string().required().messages({
                    'any.required': '이미지 데이터가 필요합니다.',
                    'string.empty': '이미지 데이터가 비어있습니다.'
                })
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
                return;
            }
            const { imageData } = value;
            const validation = validateImageData(imageData);
            if (!validation.isValid) {
                res.status(400).json({
                    success: false,
                    error: validation.error
                });
                return;
            }
            const faceValidation = await faceDetectionService.validateAndPreprocessImage(imageData);
            res.json({
                success: faceValidation.isValid,
                data: {
                    faceDetected: faceValidation.faceDetected,
                    imageQuality: faceValidation.imageQuality,
                    canAnalyze: faceValidation.isValid
                },
                error: faceValidation.error
            });
        }
        catch (error) {
            console.error('Image validation error:', error);
            res.status(500).json({
                success: false,
                error: '이미지 검증 중 오류가 발생했습니다.'
            });
        }
    }
    async analyzeFree(req, res) {
        try {
            const schema = Joi.object({
                imageData: Joi.string().required().messages({
                    'any.required': '이미지 데이터가 필요합니다.',
                    'string.empty': '이미지 데이터가 비어있습니다.'
                })
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
                return;
            }
            const { imageData } = value;
            const canAnalyzeResult = canAnalyze(imageData);
            if (!canAnalyzeResult.canAnalyze) {
                res.status(400).json({
                    success: false,
                    error: canAnalyzeResult.reason
                });
                return;
            }
            const result = await faceDetectionService.analyzeFaceFree(imageData);
            if (result.success && result.data) {
                res.json({
                    success: true,
                    data: {
                        ...result.data,
                        summary: generateAnalysisSummary(result.data),
                        formattedResult: formatAnalysisResult(result.data)
                    },
                    processingTime: result.processingTime
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: getUserFriendlyErrorMessage(result.error || 'UNKNOWN_ERROR')
                });
            }
        }
        catch (error) {
            console.error('Free analysis error:', error);
            res.status(500).json({
                success: false,
                error: '분석 중 오류가 발생했습니다.'
            });
        }
    }
    async analyzePremium(req, res) {
        try {
            const schema = Joi.object({
                imageData: Joi.string().required().messages({
                    'any.required': '이미지 데이터가 필요합니다.',
                    'string.empty': '이미지 데이터가 비어있습니다.'
                }),
                selectedField: Joi.string().valid('love', 'business', 'health', 'children', 'comprehensive', 'personality', 'tendency', 'wealth', 'relationships', 'career', 'marriage').required().messages({
                    'any.required': '분석할 분야를 선택해주세요.',
                    'any.only': '올바른 분석 분야를 선택해주세요.'
                })
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
                return;
            }
            const { imageData, selectedField } = value;
            const canAnalyzeResult = canAnalyze(imageData);
            if (!canAnalyzeResult.canAnalyze) {
                res.status(400).json({
                    success: false,
                    error: canAnalyzeResult.reason
                });
                return;
            }
            const request = {
                imageData,
                analysisType: 'premium',
                selectedField: selectedField
            };
            const result = await faceDetectionService.analyzeFacePremium(request);
            if (result.success && result.data) {
                res.json({
                    success: true,
                    data: {
                        ...result.data,
                        summary: generateAnalysisSummary(result.data),
                        formattedResult: formatAnalysisResult(result.data),
                        fieldInfo: {
                            name: getFieldDisplayName(selectedField),
                            price: getFieldPrice(selectedField)
                        }
                    },
                    processingTime: result.processingTime
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: getUserFriendlyErrorMessage(result.error || 'UNKNOWN_ERROR')
                });
            }
        }
        catch (error) {
            console.error('Premium analysis error:', error);
            res.status(500).json({
                success: false,
                error: '분석 중 오류가 발생했습니다.'
            });
        }
    }
    async startAnalysisSession(req, res) {
        try {
            const schema = Joi.object({
                imageData: Joi.string().required(),
                analysisType: Joi.string().valid('free', 'premium').required(),
                selectedField: Joi.string().valid('love', 'business', 'health', 'children', 'comprehensive', 'personality', 'tendency', 'wealth', 'relationships', 'career', 'marriage').when('analysisType', {
                    is: 'premium',
                    then: Joi.required(),
                    otherwise: Joi.optional()
                })
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
                return;
            }
            const { imageData, analysisType, selectedField } = value;
            const canAnalyzeResult = canAnalyze(imageData);
            if (!canAnalyzeResult.canAnalyze) {
                res.status(400).json({
                    success: false,
                    error: canAnalyzeResult.reason
                });
                return;
            }
            const request = {
                imageData,
                analysisType,
                selectedField: selectedField
            };
            const sessionId = await faceDetectionService.createAnalysisSession(request);
            res.json({
                success: true,
                data: {
                    sessionId,
                    message: '분석이 시작되었습니다. 진행 상태를 확인해주세요.'
                }
            });
        }
        catch (error) {
            console.error('Session creation error:', error);
            res.status(500).json({
                success: false,
                error: error.message || '세션 생성 중 오류가 발생했습니다.'
            });
        }
    }
    async getAnalysisStatus(req, res) {
        try {
            const { sessionId } = req.params;
            if (!sessionId) {
                res.status(400).json({
                    success: false,
                    error: '세션 ID가 필요합니다.'
                });
                return;
            }
            const status = faceDetectionService.getAnalysisStatus(sessionId);
            res.json({
                success: true,
                data: status
            });
        }
        catch (error) {
            console.error('Status check error:', error);
            res.status(500).json({
                success: false,
                error: '상태 확인 중 오류가 발생했습니다.'
            });
        }
    }
    async deleteAnalysisSession(req, res) {
        try {
            const { sessionId } = req.params;
            if (!sessionId) {
                res.status(400).json({
                    success: false,
                    error: '세션 ID가 필요합니다.'
                });
                return;
            }
            const deleted = faceDetectionService.deleteSession(sessionId);
            res.json({
                success: true,
                data: {
                    deleted,
                    message: deleted ? '세션이 삭제되었습니다.' : '해당 세션을 찾을 수 없습니다.'
                }
            });
        }
        catch (error) {
            console.error('Session deletion error:', error);
            res.status(500).json({
                success: false,
                error: '세션 삭제 중 오류가 발생했습니다.'
            });
        }
    }
    async getAnalysisFields(req, res) {
        try {
            const fields = [
                {
                    id: 'love',
                    name: '연애',
                    description: '연애 운세, 이성과의 관계, 로맨틱한 만남에 대한 분석',
                    price: 9900
                },
                {
                    id: 'business',
                    name: '사업',
                    description: '사업 성공 가능성, 리더십, 사업 파트너십에 대한 분석',
                    price: 9900
                },
                {
                    id: 'health',
                    name: '건강',
                    description: '건강 상태, 체질, 주의해야 할 건강 요소에 대한 분석',
                    price: 9900
                },
                {
                    id: 'children',
                    name: '자녀',
                    description: '자녀 운, 육아 능력, 가족 관계에 대한 분석',
                    price: 9900
                },
                {
                    id: 'personality',
                    name: '성격',
                    description: '성격 특성, 기질, 타고난 성향에 대한 분석',
                    price: 9900
                },
                {
                    id: 'tendency',
                    name: '성향',
                    description: '행동 패턴, 습관, 성향에 대한 분석',
                    price: 9900
                },
                {
                    id: 'wealth',
                    name: '재물운',
                    description: '재물 운, 금전 관리 능력, 투자 성향에 대한 분석',
                    price: 9900
                },
                {
                    id: 'relationships',
                    name: '대인관계',
                    description: '대인관계, 사회성, 인맥 관리에 대한 분석',
                    price: 9900
                },
                {
                    id: 'career',
                    name: '직업',
                    description: '직업 적성, 커리어 발전, 업무 능력에 대한 분석',
                    price: 9900
                },
                {
                    id: 'marriage',
                    name: '결혼',
                    description: '결혼 운, 배우자 관계, 가정 생활에 대한 분석',
                    price: 9900
                },
                {
                    id: 'comprehensive',
                    name: '종합',
                    description: '모든 분야를 종합한 전반적인 운세 분석',
                    price: 19900
                }
            ];
            res.json({
                success: true,
                data: fields
            });
        }
        catch (error) {
            console.error('Fields retrieval error:', error);
            res.status(500).json({
                success: false,
                error: '분야 목록 조회 중 오류가 발생했습니다.'
            });
        }
    }
    async getServiceStatus(req, res) {
        try {
            const status = faceDetectionService.getServiceStatus();
            res.json({
                success: true,
                data: {
                    ...status,
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            });
        }
        catch (error) {
            console.error('Service status error:', error);
            res.status(500).json({
                success: false,
                error: '서비스 상태 확인 중 오류가 발생했습니다.'
            });
        }
    }
    async prepareDownload(req, res) {
        try {
            const { sessionId } = req.params;
            if (!sessionId) {
                res.status(400).json({
                    success: false,
                    error: '세션 ID가 필요합니다.'
                });
                return;
            }
            const status = faceDetectionService.getAnalysisStatus(sessionId);
            if (status.status !== 'completed' || !status.result?.success) {
                res.status(400).json({
                    success: false,
                    error: '완료된 분석 결과가 없습니다.'
                });
                return;
            }
            const result = status.result.data;
            const formattedResult = formatAnalysisResult(result);
            res.json({
                success: true,
                data: {
                    content: formattedResult,
                    filename: `face_analysis_${sessionId}.txt`,
                    contentType: 'text/plain',
                    size: formattedResult.length
                }
            });
        }
        catch (error) {
            console.error('Download preparation error:', error);
            res.status(500).json({
                success: false,
                error: '다운로드 준비 중 오류가 발생했습니다.'
            });
        }
    }
}
export const faceController = new FaceController();
//# sourceMappingURL=faceController.js.map