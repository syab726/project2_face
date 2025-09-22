import express from 'express';
import { faceController } from '../controllers/faceController.js';

const router = express.Router();

/**
 * 얼굴 분석 관련 라우터
 */

// 이미지 검증
router.post('/validate', faceController.validateImage.bind(faceController));

// 무료 분석 (오악 분석)
router.post('/analyze/free', faceController.analyzeFree.bind(faceController));

// 유료 분석 (전문 분야별)
router.post('/analyze/premium', faceController.analyzePremium.bind(faceController));

// 비동기 분석 세션 시작
router.post('/session/start', faceController.startAnalysisSession.bind(faceController));

// 분석 세션 상태 확인
router.get('/session/:sessionId/status', faceController.getAnalysisStatus.bind(faceController));

// 분석 세션 삭제
router.delete('/session/:sessionId', faceController.deleteAnalysisSession.bind(faceController));

// 분석 분야 목록 조회
router.get('/fields', faceController.getAnalysisFields.bind(faceController));

// 서비스 상태 확인
router.get('/status', faceController.getServiceStatus.bind(faceController));

// 분석 결과 다운로드 준비
router.get('/session/:sessionId/download', faceController.prepareDownload.bind(faceController));

export default router;