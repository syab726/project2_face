const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 9001; // QA용 포트 (운영은 9000)
const PROJECT_PATH = '/var/www/face_wisdom_qa';

app.use(express.json());

// GitHub 웹훅 시크릿 (QA용)
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET_QA || 'your-qa-webhook-secret';

// 웹훅 시그니처 검증 함수
function verifySignature(payload, signature) {
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// GitHub 웹훅 엔드포인트 (QA용)
app.post('/webhook-qa', (req, res) => {
  const signature = req.get('X-Hub-Signature-256');
  const payload = JSON.stringify(req.body);

  // 시그니처 검증 (프로덕션에서는 활성화)
  // if (!verifySignature(payload, signature)) {
  //   console.log('Invalid signature');
  //   return res.status(401).send('Unauthorized');
  // }

  const event = req.get('X-GitHub-Event');
  const branch = req.body.ref;

  console.log(`[QA Webhook] Received ${event} event for branch: ${branch}`);

  // qa 브랜치에 대한 push 이벤트만 처리
  if (event === 'push' && branch === 'refs/heads/qa') {
    console.log('[QA Webhook] Processing QA deployment...');

    // 백그라운드에서 배포 실행
    const deployCommand = `
      cd ${PROJECT_PATH} &&
      git pull origin qa &&
      npm install &&
      npm run build &&
      pm2 restart face_wisdom_qa
    `;

    exec(deployCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('[QA Webhook] Deployment error:', error);
        return;
      }

      console.log('[QA Webhook] Deployment completed successfully');
      console.log('stdout:', stdout);
      if (stderr) console.log('stderr:', stderr);
    });

    res.status(200).send('QA deployment started');
  } else {
    console.log('[QA Webhook] Ignoring non-qa branch or non-push event');
    res.status(200).send('Event ignored');
  }
});

// 헬스체크 엔드포인트
app.get('/health-qa', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'QA Webhook Server',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`QA Webhook server is running on port ${PORT}`);
  console.log(`Project path: ${PROJECT_PATH}`);
});