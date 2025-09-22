# 강제 배포 요청

이 파일이 존재하면 웹훅에서 다음 명령을 실행해야 합니다:

```bash
cd /var/www/face_wisdom
git fetch origin
git reset --hard origin/main
npm install
npm run build
pm2 restart face_wisdom
pm2 restart webhook
```

생성 시간: 2025년 9월 21일 17시 08분
요청 사항: 이니시스 공식 가이드 기반 PC/모바일 결제 시스템 완전 재구현

## 변경 사항
- 이니시스 공식 가이드 기반 PC 일반결제 시스템 구현
- 모바일 결제 대응 및 디바이스별 URL 분기
- 모든 필수 파라미터 및 보안 요구사항 준수
- 팝업 차단 대응 및 오류 처리 강화
- 테스트 페이먼트 페이지 추가 (/test-payment)