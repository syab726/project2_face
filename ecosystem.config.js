module.exports = {
  apps: [{
    name: 'face_wisdom',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/face_wisdom',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      OPENAI_MODEL: 'gpt-4o-mini',
      GEMINI_MODEL_FREE: 'gemini-1.5-pro-002',
      GEMINI_MODEL: 'gemini-2.0-flash-001',
      GEMINI_IMAGE_MODEL: 'gemini-2.0-flash-exp',
      FINE_TUNED_MODEL: 'ft:gpt-4.1-nano-2025-04-14:personal::BsAUgX2j',
      MAX_FILE_SIZE: '10485760',
      UPLOAD_DIR: './public/uploads',
      JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_change_this',
      CORS_ORIGIN: 'https://facewisdom-ai.xyz',
      SESSION_SECRET: process.env.SESSION_SECRET || 'your_session_secret_change_this_too',
      BCRYPT_SALT_ROUNDS: '12',
      RATE_LIMIT_WINDOW_MS: '900000',
      RATE_LIMIT_MAX_REQUESTS: '100',
      APP_NAME: 'Face Analysis AI Tool',
      APP_VERSION: '1.0.0'
    }
  }]
}
