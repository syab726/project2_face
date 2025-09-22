import express from 'express';
import faceRoutes from './faceRoutes.js';
const router = express.Router();
router.use('/face', faceRoutes);
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Face Analysis AI Tool API',
        version: '1.0.0',
        endpoints: {
            face: {
                validate: 'POST /api/face/validate',
                analyzeFree: 'POST /api/face/analyze/free',
                analyzePremium: 'POST /api/face/analyze/premium',
                startSession: 'POST /api/face/session/start',
                getStatus: 'GET /api/face/session/:sessionId/status',
                deleteSession: 'DELETE /api/face/session/:sessionId',
                getFields: 'GET /api/face/fields',
                getServiceStatus: 'GET /api/face/status',
                prepareDownload: 'GET /api/face/session/:sessionId/download'
            }
        }
    });
});
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});
export default router;
//# sourceMappingURL=index.js.map