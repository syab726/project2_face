#!/bin/bash

# QA 서버 설정 스크립트
# 이 스크립트는 서버에서 실행됩니다.

echo "=== QA 환경 구축 시작 ==="

# 1. QA 디렉터리 생성
echo "1. QA 디렉터리 생성..."
sudo mkdir -p /var/www/face_wisdom_qa
sudo chown -R $USER:$USER /var/www/face_wisdom_qa

# 2. Git 저장소 클론 (qa 브랜치)
echo "2. Git 저장소 클론 (qa 브랜치)..."
cd /var/www/face_wisdom_qa
git clone -b qa https://github.com/syab726/project2_face.git .

# 3. QA용 설정 파일들 복사
echo "3. QA용 설정 파일 적용..."
cp package.qa.json package.json

# 4. Node.js 의존성 설치
echo "4. Node.js 의존성 설치..."
npm install

# 5. Next.js 빌드
echo "5. Next.js 빌드..."
npm run build

# 6. PM2 로그 디렉터리 생성
echo "6. PM2 로그 디렉터리 설정..."
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# 7. PM2로 QA 애플리케이션 시작
echo "7. PM2로 QA 애플리케이션 시작..."
pm2 start ecosystem.qa.config.js

# 8. PM2 설정 저장
echo "8. PM2 설정 저장..."
pm2 save
pm2 startup

echo "=== QA 환경 구축 완료 ==="
echo "QA 서버: http://localhost:3001"
echo "웹훅 서버: http://localhost:9001"
echo ""
echo "PM2 상태 확인: pm2 status"
echo "PM2 로그 확인: pm2 logs face_wisdom_qa"