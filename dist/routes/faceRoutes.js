import express from 'express';
import { faceController } from '../controllers/faceController.js';
const router = express.Router();
router.post('/validate', faceController.validateImage.bind(faceController));
router.post('/analyze/free', faceController.analyzeFree.bind(faceController));
router.post('/analyze/premium', faceController.analyzePremium.bind(faceController));
router.post('/session/start', faceController.startAnalysisSession.bind(faceController));
router.get('/session/:sessionId/status', faceController.getAnalysisStatus.bind(faceController));
router.delete('/session/:sessionId', faceController.deleteAnalysisSession.bind(faceController));
router.get('/fields', faceController.getAnalysisFields.bind(faceController));
router.get('/status', faceController.getServiceStatus.bind(faceController));
router.get('/session/:sessionId/download', faceController.prepareDownload.bind(faceController));
export default router;
//# sourceMappingURL=faceRoutes.js.map