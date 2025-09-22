'use client';

import { useState } from 'react';

type PrivacyView = 'privacy' | 'home';

export default function PrivacyPage() {
  const [currentView, setCurrentView] = useState<PrivacyView>('privacy');

  if (currentView === 'home') {
    // 메인페이지로 리다이렉트하는 대신 이동 처리
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '0',
      fontFamily: "'Gowun Dodum', sans-serif",
      background: 'linear-gradient(180deg, #fefcea 0%, #f1daff 100%)',
      color: '#333'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 16px' }}>
        <button 
          style={{
            background: '#f5f5f5',
            color: '#666',
            border: 'none',
            padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
            borderRadius: '20px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)'
          }}
          onClick={() => setCurrentView('home')}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = '#f5f5f5';
          }}
        >
          ← 홈으로 돌아가기
        </button>
        
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            color: '#5e2b97',
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)'
          }}>🔒 개인정보 처리방침</h1>
          
          <div style={{ lineHeight: '1.6', color: '#333', fontSize: '1rem' }}>
            <p style={{ 
              marginBottom: '30px', 
              textAlign: 'center',
              color: '#666',
              fontSize: '1rem',
              background: '#f0f8ff',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #e3f2fd'
            }}>
              <strong>최종 업데이트:</strong> 2025년 8월 1일<br/>
              <strong>시행일:</strong> 2025년 8월 1일
            </p>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제1조 (개인정보 처리방침의 목적)
              </h2>
              <p style={{ marginBottom: '15px' }}>
                미다에나(이하 "회사")는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관련 법령에 따라 
                개인정보 처리방침을 수립·공개하여 정보주체가 안심하고 서비스를 이용할 수 있도록 하고 있습니다.
              </p>
              <div style={{ 
                background: '#e8f5e8', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid #c8e6c9',
                marginBottom: '15px'
              }}>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  <strong>✅ 중요:</strong> 본 서비스는 <strong>회원가입이 필요 없는</strong> 서비스입니다.<br/>
                  얼굴 사진, 나이 등의 정보는 <strong>분석 처리 시에만 임시 사용</strong>되고 <strong>즉시 삭제</strong>됩니다.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제2조 (처리하는 개인정보의 항목)
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.1rem' }}>
                  📸 필수 처리 항목 (서비스 이용 시)
                </h3>
                <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                  <li><strong>얼굴 사진:</strong> AI 관상 분석을 위한 얼굴 특징 추출</li>
                  <li><strong>나이:</strong> 연령대별 맞춤 분석 제공</li>
                  <li><strong>MBTI 유형:</strong> MBTI × 관상 분석 서비스 이용 시</li>
                  <li><strong>생년월일시:</strong> 사주 분석 서비스 이용 시</li>
                </ul>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.1rem' }}>
                  💳 결제 관련 항목 (유료 서비스 이용 시)
                </h3>
                <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                  <li><strong>이메일:</strong> 결제 확인 및 PDF 전송용</li>
                  <li><strong>결제 정보:</strong> 주문번호, 결제금액, 결제일시 (PG사 처리)</li>
                </ul>
              </div>

              <div style={{
                background: '#fff3cd',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #ffeaa7'
              }}>
                <h4 style={{ color: '#856404', margin: '0 0 10px', fontSize: '1rem' }}>
                  ⚠️ 수집하지 않는 정보
                </h4>
                <ul style={{ color: '#856404', paddingLeft: '20px', margin: 0 }}>
                  <li>이름, 주소, 전화번호 등 신원정보</li>
                  <li>주민등록번호, 여권번호 등 고유식별정보</li>
                  <li>신용카드 번호, 계좌번호 등 결제수단 정보</li>
                  <li>사용자 ID, 비밀번호 (회원가입 없음)</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제3조 (개인정보의 처리 목적)
              </h2>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.1rem' }}>
                  🎯 서비스 제공 목적
                </h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>AI 기반 얼굴 관상 분석 서비스 제공</li>
                  <li>MBTI와 결합한 성격 분석 서비스 제공</li>
                  <li>생년월일시 기반 사주 분석 서비스 제공</li>
                  <li>분석 결과 PDF 생성 및 제공</li>
                  <li>결제 처리 및 영수증 발송</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제4조 (개인정보의 처리 및 보유기간)
              </h2>
              
              <div style={{
                background: '#f8d7da',
                padding: '20px',
                borderRadius: '10px',
                border: '2px solid #f5c6cb',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#721c24', margin: '0 0 15px', fontSize: '1.2rem' }}>
                  🔥 핵심 원칙: 즉시 삭제
                </h3>
                <div style={{ color: '#721c24' }}>
                  <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                    ✅ <strong>얼굴 사진:</strong> 분석 완료 즉시 삭제 (보관하지 않음)
                  </p>
                  <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                    ✅ <strong>개인정보:</strong> 서비스 제공 완료 즉시 삭제 (보관하지 않음)
                  </p>
                  <p style={{ marginBottom: '0', fontWeight: 'bold' }}>
                    ✅ <strong>분석 결과:</strong> 서버에 저장하지 않음 (사용자 기기에만 저장)
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.1rem' }}>
                  📋 예외적 보관 항목
                </h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>결제 기록:</strong> 전자상거래법에 따라 5년간 보관</li>
                  <li><strong>오류 로그:</strong> 서비스 개선을 위해 6개월간 보관 (개인식별정보 제외)</li>
                  <li><strong>이메일 주소:</strong> 결제 확인용으로 30일간 보관 후 삭제</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제5조 (개인정보의 제3자 제공)
              </h2>
              <div style={{
                background: '#d4edda',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #c3e6cb'
              }}>
                <p style={{ color: '#155724', margin: 0, fontWeight: 'bold' }}>
                  ✅ 회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 
                  정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                </p>
              </div>
              
              <div style={{ marginTop: '15px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.1rem' }}>
                  💳 결제 처리 위탁
                </h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>수탁업체:</strong> KG이니시스</li>
                  <li><strong>위탁업무:</strong> 결제 처리 및 승인</li>
                  <li><strong>제공항목:</strong> 결제금액, 주문번호, 이메일</li>
                  <li><strong>보유기간:</strong> 결제 완료시까지</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제6조 (정보주체의 권리·의무)
              </h2>
              
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.1rem' }}>
                  🔍 정보주체의 권리
                </h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>개인정보 처리 현황에 대한 조회·확인 요구</li>
                  <li>개인정보 처리 정지 요구</li>
                  <li>개인정보 삭제 요구</li>
                  <li>개인정보 처리로 인한 피해 구제 요구</li>
                </ul>
              </div>

              <div style={{
                background: '#e3f2fd',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #bbdefb'
              }}>
                <h4 style={{ color: '#0d47a1', margin: '0 0 10px', fontSize: '1rem' }}>
                  📞 권리 행사 방법
                </h4>
                <p style={{ color: '#0d47a1', margin: 0 }}>
                  <strong>이메일:</strong> syab726@gmail.com<br/>
                  <strong>처리기간:</strong> 요청 접수 후 3영업일 이내 처리
                </p>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제7조 (개인정보의 안전성 확보조치)
              </h2>
              <ul style={{ paddingLeft: '20px' }}>
                <li><strong>관리적 조치:</strong> 개인정보 취급 직원의 접근권한 제한 및 교육</li>
                <li><strong>기술적 조치:</strong> 개인정보처리시스템의 접근권한 관리, 암호화</li>
                <li><strong>물리적 조치:</strong> 개인정보가 저장된 장소의 출입통제</li>
                <li><strong>즉시 삭제:</strong> 분석 완료 즉시 모든 개인정보 삭제</li>
              </ul>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제8조 (개인정보 보호책임자)
              </h2>
              <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #dee2e6'
              }}>
                <h3 style={{ color: '#333', margin: '0 0 15px', fontSize: '1.1rem' }}>
                  📞 개인정보 보호책임자 연락처
                </h3>
                <div style={{ color: '#555' }}>
                  <p style={{ marginBottom: '8px' }}><strong>담당자:</strong> 양미라 (대표자)</p>
                  <p style={{ marginBottom: '8px' }}><strong>이메일:</strong> syab726@gmail.com</p>
                  <p style={{ marginBottom: '8px' }}><strong>연락처:</strong> 010-2326-9495</p>
                  <p style={{ marginBottom: '0' }}><strong>운영시간:</strong> 평일 09:00 - 18:00</p>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제9조 (개인정보 처리방침 변경)
              </h2>
              <p>
                본 개인정보 처리방침은 2025년 8월 1일부터 적용됩니다. 
                법령·정책 또는 보안기술의 변경에 따라 내용이 변경될 수 있으며, 
                변경 시에는 사전에 웹사이트를 통해 공지하겠습니다.
              </p>
            </section>

            {/* 신고센터 안내 */}
            <section style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '25px',
              borderRadius: '15px',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1.2rem' }}>
                🏛️ 개인정보 침해신고센터
              </h3>
              <p style={{ marginBottom: '10px', fontSize: '0.95rem' }}>
                개인정보 침해에 대한 신고나 상담이 필요한 경우 아래 기관에 문의하실 수 있습니다.
              </p>
              <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
                <p style={{ marginBottom: '5px' }}>개인정보 침해신고센터: (privacy.go.kr / 국번없이 182)</p>
                <p style={{ marginBottom: '5px' }}>개인정보 분쟁조정위원회: (www.kopico.go.kr / 1833-6972)</p>
                <p style={{ margin: 0 }}>대검찰청 사이버범죄수사단: (www.spo.go.kr / 국번없이 1301)</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}