'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AdBanner from '@/components/AdBanner';

// Next.js dynamic import 사용 (SSR 안전)
const FaceAnalyzer = dynamic(() => import('@/components/FaceAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>로딩 중...</div>
});
const FaceSajuAnalyzer = dynamic(() => import('@/components/FaceSajuAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>관상+사주 로딩 중...</div>
});
const MBTIAnalyzer = dynamic(() => import('@/components/MBTIAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>MBTI 분석 로딩 중...</div>
});

// 테스트용 직접 import (디버깅)
// import FaceSajuAnalyzerDirect from '@/components/FaceSajuAnalyzer';
type AnalysisType = 'home' | 'face' | 'face-saju' | 'mbti-face' | 'about' | 'terms';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<AnalysisType>('home');

  return (
    <>

      <div style={{ 
        minHeight: '100vh', 
        padding: '0',
        fontFamily: "'Gowun Dodum', sans-serif",
        background: 'linear-gradient(180deg, #fefcea 0%, #f1daff 100%)',
        color: '#333'
      }}>
        {currentView === 'home' && (
          <>
            <header style={{ 
              textAlign: 'center', 
              padding: '40px 16px 20px'
            }}>
              <h1 style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                marginBottom: '8px',
                color: '#5e2b97',
                textAlign: 'center',
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}>내 얼굴 탐구생활</h1>
              <p style={{
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                color: '#666',
                textAlign: 'center',
                marginBottom: '20px',
                lineHeight: '1.4',
                padding: '0 16px'
              }}>AI가 알려주는 나의 얼굴 속<br className="mobile-break" /> 성향, 운명, 그리고 궁합까지</p>
            </header>



            <section style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '20px',
              gap: '16px',
              padding: '0 16px',
              paddingBottom: '40px'
            }}>
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px 16px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentView('mbti-face')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-8px', 
                  right: '16px', 
                  background: '#ff6b6b', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '16px', 
                  fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                  fontWeight: 'bold'
                }}>
                  인기
                </div>
                <h3 style={{
                  color: '#7b1fa2',
                  marginBottom: '12px',
                  marginTop: '12px',
                  fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                  lineHeight: '1.3'
                }}>🔥 <span style={{ fontWeight: 'bold', color: '#ff6b6b' }}>MBTI × 관상 분석</span></h3>
                <p style={{
                  lineHeight: '1.5',
                  color: '#555',
                  marginBottom: '16px',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                }}>MBTI와 관상을 결합한 성격 분석으로 연애, 취업, 학업까지 종합 분석</p>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <div 
                    style={{
                      backgroundColor: '#7c4dff',
                      color: 'white',
                      border: 'none',
                      padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 24px)',
                      borderRadius: '25px',
                      fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-block',
                      minWidth: '180px',
                      textAlign: 'center'
                    }}
                  >
                    MBTI 분석 시작
                  </div>
                </div>
              </div>

              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px 16px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentView('face')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-8px', 
                  right: '16px', 
                  background: '#FF9800', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '16px', 
                  fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                  fontWeight: 'bold'
                }}>
                  정통분석
                </div>
                <h3 style={{
                  color: '#7b1fa2',
                  marginBottom: '12px',
                  marginTop: '12px',
                  fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                  lineHeight: '1.3'
                }}>🔮 정통 관상 분석</h3>
                <p style={{
                  lineHeight: '1.5',
                  color: '#555',
                  marginBottom: '16px',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                }}>전문적인 관상학으로 성격, 운세, 적성을 상세 분석합니다!</p>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <div 
                    style={{
                      backgroundColor: '#7c4dff',
                      color: 'white',
                      border: 'none',
                      padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 24px)',
                      borderRadius: '25px',
                      fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-block',
                      minWidth: '180px',
                      textAlign: 'center'
                    }}
                  >
                    정통 관상분석 시작
                  </div>
                </div>
              </div>

              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px 16px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentView('face-saju')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-8px', 
                  right: '16px', 
                  background: '#9C27B0', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '16px', 
                  fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                  fontWeight: 'bold'
                }}>
                  프리미엄
                </div>
                <h3 style={{
                  color: '#7b1fa2',
                  marginBottom: '12px',
                  marginTop: '12px',
                  fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                  lineHeight: '1.3'
                }}>🌟 관상 + 사주 종합분석</h3>
                <p style={{
                  lineHeight: '1.5',
                  color: '#555',
                  marginBottom: '16px',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                }}>얼굴 관상과 사주팔자를 결합한 최고급 종합 분석으로 인생의 모든 답을 찾아보세요!</p>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <div 
                    style={{
                      backgroundColor: '#7c4dff',
                      color: 'white',
                      border: 'none',
                      padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 24px)',
                      borderRadius: '25px',
                      fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-block',
                      minWidth: '180px',
                      textAlign: 'center'
                    }}
                  >
                    종합분석 시작
                  </div>
                </div>
              </div>


            </section>

            {/* 하단 광고 영역 - 반응형 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              margin: '30px 0',
              padding: '0 16px'
            }}>
              <AdBanner 
                adSlot="main-page-bottom-slot"
                width={728}
                height={90}
                format="auto"
                style={{ 
                  maxWidth: '100%',
                  width: 'min(728px, 100vw - 32px)',
                  height: 'clamp(50px, 12vw, 90px)'
                }}
              />
            </div>

            <footer style={{
              marginTop: '40px',
              textAlign: 'center',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              color: '#888',
              padding: '20px 16px',
              lineHeight: '1.4'
            }}>
              <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                <a 
                  href="/service"
                  style={{
                    color: '#666',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: 'inherit',
                    marginRight: '20px'
                  }}
                >
                  서비스 소개
                </a>
                <a 
                  href="/agree"
                  style={{
                    color: '#666',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: 'inherit'
                  }}
                >
                  이용약관
                </a>
              </div>
              <div style={{ textAlign: 'center' }}>
                ⓒ 2025 내 얼굴 탐구생활
              </div>
              
              {/* 사업자 정보 */}
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '10px',
                fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                lineHeight: '1.4',
                color: '#777'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>상호명:</strong> 미다에나 (대표자: 양미라)
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>사업자등록번호:</strong> 397-10-02518
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>사업장 주소:</strong> 서울특별시 서대문구 증가로 150, 108동 402호
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>연락처:</strong> 010-2326-9495
                </div>
                <div>
                  <strong>통신판매신고번호:</strong> (준비중)
                </div>
              </div>
            </footer>
          </>
        )}

        {currentView === 'face' && (
          <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 16px' }}>
            <button 
              style={{
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
                borderRadius: '20px',
                cursor: 'pointer',
                marginBottom: '16px',
                fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                marginTop: '16px'
              }}
              onClick={() => setCurrentView('home')}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = '#e0e0e0';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = '#f5f5f5';
              }}
            >
              ← 돌아가기
            </button>
            <FaceAnalyzer onNavigate={setCurrentView} />
          </div>
        )}

        {currentView === 'face-saju' && (
          <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 16px' }}>
            <button 
              style={{
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
                borderRadius: '20px',
                cursor: 'pointer',
                marginBottom: '16px',
                fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                marginTop: '16px'
              }}
              onClick={() => setCurrentView('home')}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = '#e0e0e0';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = '#f5f5f5';
              }}
            >
              ← 돌아가기
            </button>
            <FaceSajuAnalyzer />
          </div>
        )}

        {currentView === 'mbti-face' && (
          <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 16px' }}>
            <button 
              style={{
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
                borderRadius: '20px',
                cursor: 'pointer',
                marginBottom: '16px',
                fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                marginTop: '16px'
              }}
              onClick={() => setCurrentView('home')}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = '#e0e0e0';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = '#f5f5f5';
              }}
            >
              ← 돌아가기
            </button>
            <MBTIAnalyzer onNavigate={setCurrentView} />
          </div>
        )}



      </div>
    </>
  );
}