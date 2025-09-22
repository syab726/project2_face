# 강제 서버 리셋 요청

이 파일이 존재하면 웹훅에서 다음 명령을 실행해야 합니다:

```bash
cd /var/www/face_wisdom
git fetch origin
git reset --hard origin/main
npm install
npm run build
pm2 restart face_wisdom
```

생성 시간: 2025년 9월 21일 01시 45분