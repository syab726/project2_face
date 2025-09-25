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
              <strong>최종 업데이트:</strong> 2025년 9월 25일<br/>
              <strong>시행일:</strong> 2025년 9월 25일
            </p>

            {/* 핵심 보호 원칙 - 최상단 강조 */}
            <section style={{ marginBottom: '30px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '25px',
                borderRadius: '15px',
                color: 'white',
                textAlign: 'center',
                marginBottom: '30px'
              }}>
                <h2 style={{ color: 'white', marginBottom: '15px', fontSize: '1.5rem' }}>
                  🛡️ 개인정보 ZERO 정책
                </h2>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  <p style={{ marginBottom: '10px' }}>
                    ✅ 회원가입 없음 - 어떠한 개인정보도 요구하지 않습니다
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    ✅ 사진 즉시 삭제 - AI 분석 후 0.1초 내 자동 삭제
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    ✅ 데이터베이스 미보관 - 서버에 어떠한 정보도 저장하지 않음
                  </p>
                  <p style={{ margin: 0 }}>
                    ✅ 추적 불가능 - 쿠키나 추적 기술 미사용
                  </p>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제1조 (개인정보 처리방침의 목적)
              </h2>
              <p style={{ marginBottom: '15px' }}>
                FaceWisdom AI(이하 "회사")는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관련 법령에 따라
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
                  <strong>✅ 중요:</strong> 본 서비스는 <strong>회원가입이 필요 없는</strong> 완전 익명 서비스입니다.<br/>
                  얼굴 사진은 <strong>AI 분석 처리 시에만 메모리에 임시 존재</strong>하고 <strong>즉시 자동 삭제</strong>됩니다.<br/>
                  어떠한 개인정보도 수집, 저장, 보관하지 않습니다.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제2조 (처리하는 개인정보의 항목)
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.1rem' }}>
                  📸 서비스 이용 시 임시 처리 항목 (저장되지 않음)
                </h3>
                <div style={{
                  background: '#fff3cd',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #ffeaa7',
                  marginBottom: '15px'
                }}>
                  <ul style={{ paddingLeft: '20px', marginBottom: '0' }}>
                    <li><strong>얼굴 사진:</strong> AI 분석 중에만 메모리에 존재, 분석 완료 즉시 자동 삭제</li>
                    <li><strong>나이/성별:</strong> 분석 정확도를 위한 선택 입력, 저장되지 않음</li>
                    <li><strong>MBTI 응답:</strong> MBTI 분석 서비스 이용 시, 결과 생성 후 즉시 삭제</li>
                    <li><strong>생년월일시:</strong> 사주 분석 서비스 이용 시, 결과 생성 후 즉시 삭제</li>
                  </ul>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.1rem' }}>
                  💳 결제 관련 항목 (PG사 직접 처리)
                </h3>
                <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                  <li><strong>결제 정보:</strong> KG이니시스에서 직접 처리, 당사는 접근 불가</li>
                  <li><strong>이메일:</strong> 결제 확인용으로만 사용, 30일 후 자동 삭제</li>
                </ul>
              </div>

              <div style={{
                background: '#ffebee',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #ef5350'
              }}>
                <h4 style={{ color: '#c62828', margin: '0 0 10px', fontSize: '1rem' }}>
                  🚫 절대 수집하지 않는 정보
                </h4>
                <ul style={{ color: '#c62828', paddingLeft: '20px', margin: 0, fontWeight: 'bold' }}>
                  <li>이름, 주소, 전화번호 등 신원정보</li>
                  <li>주민등록번호, 여권번호 등 고유식별정보</li>
                  <li>사용자 ID, 비밀번호 (회원가입 자체가 없음)</li>
                  <li>위치정보, IP 주소 등 추적 가능 정보</li>
                  <li>쿠키, 로컬 스토리지 등 브라우저 저장 정보</li>
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
                  <li>AI 기반 얼굴 관상 실시간 분석 (저장 없음)</li>
                  <li>MBTI와 결합한 성격 분석 즉시 제공 (저장 없음)</li>
                  <li>생년월일시 기반 사주 분석 즉시 제공 (저장 없음)</li>
                  <li>분석 결과 PDF 실시간 생성 (서버 미보관)</li>
                  <li>결제 처리 (PG사 직접 처리)</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제4조 (개인정보의 처리 및 보유기간)
              </h2>

              <div style={{
                background: '#d4edda',
                padding: '20px',
                borderRadius: '10px',
                border: '3px solid #28a745',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#155724', margin: '0 0 15px', fontSize: '1.3rem' }}>
                  ⚡ 실시간 처리 · 즉시 삭제 원칙
                </h3>
                <div style={{ color: '#155724', fontSize: '1.1rem' }}>
                  <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                    🗑️ <strong>얼굴 사진:</strong> AI 분석 처리 중 메모리에만 존재 → 분석 완료 즉시 자동 삭제 (0.1초 이내)
                  </p>
                  <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                    🗑️ <strong>입력 정보:</strong> 분석에만 사용 → 결과 생성 즉시 메모리에서 삭제
                  </p>
                  <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                    🗑️ <strong>분석 결과:</strong> 사용자 브라우저로 전송 → 서버에 저장하지 않음
                  </p>
                  <p style={{ marginBottom: '0', fontWeight: 'bold' }}>
                    🗑️ <strong>PDF 파일:</strong> 실시간 생성 후 다운로드 → 서버 미보관
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.1rem' }}>
                  📋 법적 의무 보관 항목 (결제 관련만)
                </h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>결제 기록:</strong> 전자상거래법에 따라 5년간 보관 (PG사 보관)</li>
                  <li><strong>이메일 주소:</strong> 결제 확인용으로 30일간 보관 후 자동 삭제</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제5조 (개인정보의 제3자 제공)
              </h2>
              <div style={{
                background: '#e3f2fd',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #2196f3'
              }}>
                <p style={{ color: '#0d47a1', margin: 0, fontWeight: 'bold' }}>
                  ✅ 회사는 수집한 개인정보가 없으므로 제3자에게 제공할 정보도 없습니다.<br/>
                  ✅ 결제 처리는 KG이니시스가 직접 처리하며, 당사는 결제 정보에 접근할 수 없습니다.
                </p>
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
                <div style={{
                  background: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <p style={{ margin: 0, color: '#555' }}>
                    본 서비스는 개인정보를 수집·저장하지 않으므로:<br/>
                    • 열람할 개인정보가 없습니다<br/>
                    • 정정·삭제할 개인정보가 없습니다<br/>
                    • 처리 정지를 요구할 개인정보가 없습니다<br/><br/>
                    <strong>결과:</strong> 완전한 익명성과 프라이버시가 보장됩니다
                  </p>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제7조 (개인정보의 안전성 확보조치)
              </h2>
              <ul style={{ paddingLeft: '20px' }}>
                <li><strong>Zero-Knowledge 아키텍처:</strong> 개인정보를 애초에 수집하지 않는 설계</li>
                <li><strong>메모리 자동 정리:</strong> 분석 완료 즉시 메모리에서 데이터 삭제</li>
                <li><strong>SSL/TLS 암호화:</strong> 전송 구간 암호화</li>
                <li><strong>서버 미저장 원칙:</strong> 어떠한 개인정보도 서버에 기록하지 않음</li>
                <li><strong>로그 미수집:</strong> IP 주소 등 추적 가능 정보 로깅하지 않음</li>
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
                  <p style={{ marginBottom: '8px' }}><strong>담당자:</strong> 개인정보보호팀</p>
                  <p style={{ marginBottom: '8px' }}><strong>이메일:</strong> syab726@gmail.com</p>
                  <p style={{ marginBottom: '8px' }}><strong>운영시간:</strong> 평일 09:00 - 18:00</p>
                  <p style={{ marginBottom: '0' }}><strong>처리 방침:</strong> 개인정보 미수집으로 인한 문의만 처리</p>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3rem' }}>
                제9조 (개인정보 처리방침 변경)
              </h2>
              <p>
                본 개인정보 처리방침은 2025년 9월 25일부터 적용됩니다.
                법령·정책 또는 보안기술의 변경에 따라 내용이 변경될 수 있으며,
                변경 시에는 사전에 웹사이트를 통해 공지하겠습니다.
              </p>
            </section>

            {/* 최종 강조 */}
            <section style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '25px',
              borderRadius: '15px',
              color: 'white',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1.3rem' }}>
                🔐 당신의 프라이버시는 완벽하게 보호됩니다
              </h3>
              <p style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                회원가입 없음 · 사진 즉시 삭제 · 데이터 미보관
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                AI 분석은 실시간으로 처리되며, 어떠한 정보도 저장되지 않습니다
              </p>
            </section>

            {/* 신고센터 안내 */}
            <section style={{
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.1rem' }}>
                🏛️ 개인정보 침해신고센터
              </h3>
              <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>
                개인정보 침해에 대한 신고나 상담이 필요한 경우 아래 기관에 문의하실 수 있습니다.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#777' }}>
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