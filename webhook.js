const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = 9000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// 웹훅 처리
app.post('/webhook', (req, res) => {
  console.log('Webhook received from GitHub!');

  // GitHub 서명 검증 (optional but recommended)
  if (WEBHOOK_SECRET) {
    const signature = req.get('X-Hub-Signature-256');
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex')}`;

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return res.status(401).send('Unauthorized');
    }
  }

  // main 브랜치 푸시인지 확인
  if (req.body.ref === 'refs/heads/main') {
    console.log('Main branch push detected. Starting deployment...');

    // 배포 명령 실행 - git reset --hard 사용으로 안전하게 처리
    const deployCommand = `
      cd /var/www/face_wisdom &&
      git fetch origin &&
      git reset --hard origin/main &&
      npm install &&
      npm run build &&
      pm2 restart face_wisdom
    `;

    // 백그라운드에서 실행 (타임아웃 방지)
    exec(deployCommand, {
      maxBuffer: 1024 * 1024 * 10, // 10MB 버퍼
      timeout: 300000 // 5분 타임아웃
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('Deploy error:', error);
        console.error('stderr:', stderr);
        return;
      }
      console.log('Deploy success!');
      console.log('stdout:', stdout);
    });

    // 즉시 응답 (GitHub 웹훅 타임아웃 방지)
    res.status(200).send('Deployment started');
  } else {
    res.status(200).send('Not main branch, skipping deployment');
  }
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).send('Webhook server is running');
});

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});