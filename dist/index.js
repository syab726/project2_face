import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import apiRoutes from './routes/index.js';
config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
    }
});
app.use(limiter);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static('public'));
app.use('/api', apiRoutes);
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Face Analysis AI Tool - 관상 분석 AI 도구',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            api: '/api',
            face: '/api/face'
        }
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Page not found'
    });
});
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Face Analysis AI Tool server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Access: http://localhost:${PORT}`);
    console.log(`📋 API: http://localhost:${PORT}/api`);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
export default app;
//# sourceMappingURL=index.js.map