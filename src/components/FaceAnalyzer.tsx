/**
 * ⚠️ 중요 경고: 정통 관상 분석 컴포넌트 수정 금지
 * 
 * 이 컴포넌트는 사용자의 명시적 요청에 따라 완전히 잠금 상태입니다.
 * 특히 다음 사항들은 절대 수정하지 마세요:
 * - AI 분석 로직 및 API 호출
 * - PDF 생성 기능
 * - 분석 결과 표시 방식
 * - 모든 기능과 UI
 * 
 * 수정 필요시 반드시 사용자 승인 필요
 * 마지막 승인: 2025-01-11
 * 
 * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { generateHTMLToPDF, generateSimplePDF } from '@/lib/pdf-generator';
import AdBanner from '@/components/AdBanner';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import InicisPaymentModal from '@/components/InicisPaymentModal';

const ANALYSIS_FIELDS = [
  { id: 'comprehensive', name: '종합 분석 (모든 주제 포함)', description: '모든 운세를 종합적으로 분석합니다', isPopular: true, price: 9900 },
  { id: 'career', name: '직업운', description: '직장생활, 승진운, 사업운, 창업운', price: 6900 },
  { id: 'wealth', name: '재물운', description: '돈버는 능력, 투자운, 재물복', price: 6900 },
  { id: 'love', name: '애정운', description: '연애운, 결혼운, 배우자운', price: 6900 },
  { id: 'children', name: '자손운', description: '자녀운, 가족운, 출산운', price: 6900 },
  { id: 'health', name: '건강운', description: '체질, 약한 장기, 장수운', price: 6900 },
  { id: 'life', name: '인생운', description: '연령대별 운세, 전성기, 인생전략', price: 6900 },
  { id: 'luck', name: '개운법', description: '행운 색상, 방위, 음식, 인간관계', price: 6900 }
];

type AnalysisType = 'home' | 'face' | 'face-saju' | 'mbti-face' | 'about' | 'terms';

interface FaceAnalyzerProps {
  onNavigate?: (view: AnalysisType) => void;
}

function FaceAnalyzer({ onNavigate }: FaceAnalyzerProps) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [age, setAge] = useState<number | ''>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('JPG, PNG, WEBP 파일만 지원됩니다.');
        return;
      }

      setUploadedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = () => {
    // 얼굴 사진 검증
    if (!uploadedImage) {
      alert('관상 분석을 위해 얼굴 사진을 업로드해주세요.');
      return;
    }

    // 나이 검증
    if (!age) {
      alert('분석을 위해 나이를 입력해주세요.');
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = (result: any) => {
    console.log('✅ 결제 완료:', result);
    setIsPaymentModalOpen(false);
    startAnalysis();
  };

  const handlePaymentError = (error: any) => {
    console.error('❌ 결제 오류:', error);
    alert(`결제에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('faceImage', uploadedImage!);
      formData.append('age', age.toString());
      formData.append('selectedTopics', JSON.stringify(['comprehensive'])); // 항상 종합 분석

      // 오류 추적을 위한 사용자 정보 추가
      const orderId = `ORDER-${Date.now()}-FACE-comprehensive`;
      formData.append('userEmail', `anonymous-${Date.now()}@facewisdom.com`); // 익명 사용자 처리
      formData.append('orderId', orderId);

      console.log('=== 정통관상 분석 요청 시작 ===');
      console.log('업로드된 이미지:', uploadedImage?.name, uploadedImage?.size);
      console.log('나이:', age);
      console.log('분석 유형: 정통관상 종합분석');

      const response = await fetch('/api/analysis/professional-physiognomy', {
        method: 'POST',
        body: formData,
      });

      console.log('=== API 응답 상태 ===');
      console.log('응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 에러 응답:', errorText);
        throw new Error(`분석 중 오류가 발생했습니다. (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('=== API 응답 결과 ===');
      console.log('성공 여부:', result.success);
      console.log('결과 데이터:', result.data);
      console.log('에러 정보:', result.error);

      if (result.success) {
        setAnalysisResult(result.data);
      } else {
        console.error('❌ 분석 실패:', result.error);
        setError(result.error?.message || '분석 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('분석 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setImagePreview('');
    setAnalysisResult(null);
    setAge('');
    setSelectedTopics([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (analysisResult) {
    // 고정된 9개 섹션 정의 (FaceSajuAnalyzer와 동일한 구조)
    const fixedSections = [
      { key: 'comprehensive', title: '🔮 종합 분석 및 총평' },
      { key: 'job', title: '💼 직장운' },
      { key: 'business', title: '🚀 사업운' },
      { key: 'wealth', title: '💰 재물운/투자운' },
      { key: 'love', title: '💖 연애운/결혼운' },
      { key: 'children', title: '👶 자녀운/가족운' },
      { key: 'health', title: '🏥 건강운/장수운' },
      { key: 'life', title: '🌟 인생 전체 운세 흐름' },
      { key: 'luck', title: '🍀 개운법 및 실천 조언' }
    ];

    return (
      <div className="face-analysis-result-container" style={{
        minHeight: '100vh',
        width: '100vw',
        padding: 'clamp(10px, 2vw, 20px)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 'clamp(10px, 3vw, 20px)',
          padding: 'clamp(20px, 4vw, 40px)',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#4caf50', marginBottom: '30px', textAlign: 'center' }}>
            🔮 정통 관상 분석 완료
          </h2>

          <div style={{
            marginBottom: '25px',
            textAlign: 'center',
            width: '100%'
          }}>
            <img
              src={imagePreview}
              alt="업로드된 사진"
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '100px',
                border: '3px solid #4caf50',
                margin: '0 auto',
                display: 'block'
              }}
            />
          </div>

          {/* 9개 고정 섹션 표시 - FaceSajuAnalyzer와 동일한 구조 */}
          {fixedSections.map((section, index) => {
            const sectionData = analysisResult[section.key];
            if (!sectionData) return null;

            // 분야별 고유 색상 설정
            const fieldStyles: { [key: string]: { primary: string, secondary: string, gradient: string } } = {
              'comprehensive': { primary: '#9c27b0', secondary: '#ba68c8', gradient: 'linear-gradient(135deg, #9c27b0, #ba68c8)' },
              'job': { primary: '#1976d2', secondary: '#42a5f5', gradient: 'linear-gradient(135deg, #1976d2, #42a5f5)' },
              'business': { primary: '#f57c00', secondary: '#ffb74d', gradient: 'linear-gradient(135deg, #f57c00, #ffb74d)' },
              'wealth': { primary: '#e91e63', secondary: '#f48fb1', gradient: 'linear-gradient(135deg, #e91e63, #f48fb1)' },
              'love': { primary: '#7b1fa2', secondary: '#ab47bc', gradient: 'linear-gradient(135deg, #7b1fa2, #ab47bc)' },
              'children': { primary: '#4caf50', secondary: '#81c784', gradient: 'linear-gradient(135deg, #4caf50, #81c784)' },
              'health': { primary: '#00796b', secondary: '#4db6ac', gradient: 'linear-gradient(135deg, #00796b, #4db6ac)' },
              'life': { primary: '#ff9800', secondary: '#ffcc02', gradient: 'linear-gradient(135deg, #ff9800, #ffcc02)' },
              'luck': { primary: '#795548', secondary: '#a1887f', gradient: 'linear-gradient(135deg, #795548, #a1887f)' }
            };

            const currentStyle = fieldStyles[section.key] || fieldStyles['comprehensive'];

            return (
              <div key={section.key} style={{
                marginBottom: '40px',
                border: `4px solid ${currentStyle.primary}`,
                borderRadius: '25px',
                overflow: 'hidden',
                boxShadow: `0 12px 30px ${currentStyle.primary}25`,
                position: 'relative',
                background: 'white'
              }}>
                {/* 분야 구분선 */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: currentStyle.gradient
                }}></div>

                {/* 헤더 */}
                <div style={{
                  background: currentStyle.gradient,
                  color: 'white',
                  padding: '25px 20px',
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.8em',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    marginBottom: '15px'
                  }}>
                    {section.title}
                  </h3>
                  <div style={{
                    fontSize: '1.1em',
                    marginTop: '10px',
                    opacity: '0.9',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    display: 'inline-block'
                  }}>
                    전통 관상학 심층 분석
                  </div>
                </div>

                <div style={{ padding: '30px', background: 'white' }}>
                  {/* 이론적 근거 */}
                  {sectionData.theoreticalBasis && (
                    <div style={{
                      marginBottom: '25px',
                      padding: '20px',
                      background: `${currentStyle.primary}05`,
                      borderRadius: '10px'
                    }}>
                      <h4 style={{
                        color: currentStyle.primary,
                        marginBottom: '15px',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        📚 이론적 근거
                      </h4>
                      <MarkdownRenderer
                        content={sectionData.theoreticalBasis}
                        primaryColor={currentStyle.primary}
                        accentColor={currentStyle.secondary}
                      />
                    </div>
                  )}

                  {/* 상세 분석 */}
                  {sectionData.detailedAnalysis && (
                    <div style={{
                      marginBottom: '25px',
                      padding: '20px',
                      background: `${currentStyle.secondary}08`,
                      borderRadius: '10px'
                    }}>
                      <h4 style={{
                        color: currentStyle.secondary,
                        marginBottom: '15px',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        🎯 개인 맞춤 상세 분석
                      </h4>
                      <MarkdownRenderer
                        content={sectionData.detailedAnalysis}
                        primaryColor={currentStyle.primary}
                        accentColor={currentStyle.secondary}
                      />
                    </div>
                  )}

                  {/* 실전 활용 가이드 */}
                  {sectionData.practicalGuide && (
                    <div style={{
                      marginBottom: '25px',
                      padding: '20px',
                      background: `${currentStyle.primary}05`,
                      borderRadius: '10px'
                    }}>
                      <h4 style={{
                        color: currentStyle.primary,
                        marginBottom: '15px',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        💡 실전 활용 가이드
                      </h4>
                      <MarkdownRenderer
                        content={sectionData.practicalGuide}
                        primaryColor={currentStyle.primary}
                        accentColor={currentStyle.secondary}
                      />
                    </div>
                  )}

                  {/* 전문가 심화 조언 */}
                  {sectionData.expertAdvice && (
                    <div style={{
                      marginBottom: '25px',
                      padding: '20px',
                      background: `${currentStyle.secondary}08`,
                      borderRadius: '10px'
                    }}>
                      <h4 style={{
                        color: currentStyle.primary,
                        marginBottom: '15px',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        👨‍🏫 전문가 심화 조언
                      </h4>
                      <MarkdownRenderer
                        content={sectionData.expertAdvice}
                        primaryColor={currentStyle.primary}
                        accentColor={currentStyle.secondary}
                      />
                    </div>
                  )}

                  {/* 추가 상세 정보들 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    marginTop: '25px'
                  }}>
                    {sectionData.timing && (
                      <div style={{
                        padding: '15px',
                        background: `${currentStyle.primary}08`,
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <span style={{ fontSize: '1.4em' }}>⏰</span>
                          <strong style={{ color: currentStyle.primary, fontSize: '1.1em' }}>최적 시기</strong>
                        </div>
                        <p style={{
                          marginTop: '8px',
                          fontSize: '0.95em',
                          lineHeight: '1.6',
                          color: '#333',
                          margin: 0
                        }}>{sectionData.timing}</p>
                      </div>
                    )}

                    {sectionData.luckyColors && (
                      <div style={{
                        padding: '15px',
                        background: `${currentStyle.secondary}08`,
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <span style={{ fontSize: '1.4em' }}>🎨</span>
                          <strong style={{ color: currentStyle.secondary, fontSize: '1.1em' }}>행운 색상</strong>
                        </div>
                        <MarkdownRenderer
                          content={sectionData.luckyColors}
                          primaryColor={currentStyle.primary}
                          accentColor={currentStyle.secondary}
                          style={{ fontSize: '0.95em' }}
                        />
                      </div>
                    )}

                    {sectionData.luckyDirections && (
                      <div style={{
                        padding: '15px',
                        background: `${currentStyle.primary}08`,
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <span style={{ fontSize: '1.4em' }}>🧭</span>
                          <strong style={{ color: currentStyle.primary, fontSize: '1.1em' }}>최적 방향</strong>
                        </div>
                        <MarkdownRenderer
                          content={sectionData.luckyDirections}
                          primaryColor={currentStyle.primary}
                          accentColor={currentStyle.secondary}
                          style={{ fontSize: '0.95em' }}
                        />
                      </div>
                    )}

                    {sectionData.developmentPlan && (
                      <div style={{
                        padding: '15px',
                        background: `${currentStyle.secondary}08`,
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <span style={{ fontSize: '1.4em' }}>📈</span>
                          <strong style={{ color: currentStyle.secondary, fontSize: '1.1em' }}>발전 계획</strong>
                        </div>
                        <MarkdownRenderer
                          content={sectionData.developmentPlan}
                          primaryColor={currentStyle.primary}
                          accentColor={currentStyle.secondary}
                          style={{ fontSize: '0.95em' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}


          <div style={{ 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              <button 
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 25px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '1em',
                  fontWeight: 'bold',
                  minWidth: '160px',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                }}
                onClick={async () => {
                try {
                  console.log('PDF 다운로드 시작');

                  const currentDate = new Date().toISOString().split('T')[0];
                  const filename = `정통관상분석-${currentDate}.pdf`;

                  // 분석 결과 컨테이너 찾기
                  const resultContainer = document.querySelector('.face-analysis-result-container') ||
                                          document.querySelector('[style*="padding: 20px"]');

                  if (resultContainer) {
                    try {
                      await generateHTMLToPDF(resultContainer as HTMLElement, filename);
                      console.log('HTML PDF 다운로드 성공');
                    } catch (htmlError) {
                      console.warn('HTML PDF 실패, 간단 PDF로 대체:', htmlError);
                      await generateSimplePDF(filename);
                      console.log('간단 PDF 다운로드 성공');
                    }
                  } else {
                    console.warn('분석 결과 컨테이너를 찾을 수 없음, 간단 PDF 생성');
                    await generateSimplePDF(filename);
                  }
                } catch (error) {
                  console.error('PDF 다운로드 오류:', error);
                  alert('PDF 다운로드 중 오류가 발생했습니다.');
                }
              }}
              >
                📄 PDF 저장
              </button>
              
            </div>
            
            {/* 업셀링 버튼 추가 */}
            <div style={{
              marginTop: '30px',
              padding: '25px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)'
            }}>
              <h3 style={{
                color: 'white',
                marginBottom: '15px',
                fontSize: '1.3em'
              }}>
                🌟 더 깊이 있는 분석을 원하시나요?
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '20px',
                lineHeight: '1.6'
              }}>
                관상과 사주를 결합한 종합 운명 분석으로<br/>
                당신의 과거, 현재, 미래를 완벽하게 파악하세요!
              </p>
              <button 
                style={{
                  background: 'white',
                  color: '#764ba2',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '1.1em',
                  fontWeight: 'bold',
                  minWidth: '200px',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
                onClick={() => {
                  onNavigate?.('face-saju');
                }}
              >
                🔮 관상+사주 종합분석 받기
              </button>
              <div style={{
                marginTop: '15px',
                fontSize: '0.9em',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                💡 관상과 사주를 함께 분석하면 정확도가 2배 이상 높아집니다!
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100vw',
      padding: 'clamp(10px, 2vw, 20px)',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: 'clamp(10px, 3vw, 20px)', 
        padding: 'clamp(20px, 4vw, 40px)', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#4caf50', 
          marginBottom: '30px' 
        }}>
          🔮 관상 분석
        </h2>

        {/* 상단 광고 영역 */}
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <AdBanner 
            adSlot="face-analyzer-top-slot"
            width={728}
            height={90}
            format="horizontal"
          />
        </div>

        {/* 나이 입력 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>
            1. 나이를 입력해주세요
          </h3>
          <input
            type="number"
            placeholder="만 나이로 입력 (예: 만 25세)"
            min="10"
            max="100"
            value={age}
            onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
            style={{
              width: '250px',
              padding: '12px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '1em',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4caf50'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
            💡 만 나이로 입력해주세요 (신분증 기준 나이)
          </div>
        </div>

        {/* 사진 업로드 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>
            2. 얼굴 사진을 업로드해주세요
          </h3>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: 'none' }}
          />
          
          <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {imagePreview ? (
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={imagePreview} 
                  alt="미리보기"
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '100px',
                    border: '3px solid #4caf50'
                  }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    border: '2px dashed #ccc',
                    borderRadius: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#f9f9f9',
                    margin: '0 auto'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{ textAlign: 'center', color: '#666' }}>
                    <div style={{ fontSize: '2em', marginBottom: '5px' }}>📷</div>
                    <div style={{ fontSize: '0.9em' }}>얼굴 사진 선택</div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              style={{
                background: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedImage ? '다른 사진 선택' : '사진 업로드'}
            </button>
          </div>
        </div>


        {/* 분석 시작 버튼 */}
        <div style={{ textAlign: 'center' }}>
          <button
            disabled={!age || !uploadedImage || isAnalyzing}
            style={{
              background: (!age || !uploadedImage || isAnalyzing) 
                ? '#ccc' 
                : 'linear-gradient(45deg, #4caf50, #66bb6a)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '1.1em',
              fontWeight: 'bold',
              cursor: (!age || !uploadedImage || isAnalyzing) 
                ? 'not-allowed' 
                : 'pointer',
              minWidth: '200px',
              boxShadow: (!age || !uploadedImage || isAnalyzing) 
                ? 'none' 
                : '0 4px 15px rgba(76, 175, 80, 0.3)'
            }}
            onClick={handleAnalysis}
          >
            {isAnalyzing ? '🔮 분석 중...' : '🔮 정통관상 분석 시작!'}
          </button>
          
          {isAnalyzing && (
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'center',
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              color: 'white'
            }}>
              <div 
                className="spin-animation"
                style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '4px solid rgba(255,255,255,0.3)',
                  borderTop: '4px solid white',
                  borderRadius: '50%',
                  marginBottom: '15px'
                }}
              ></div>
              <p style={{ 
                margin: '0',
                fontSize: '1.1em',
                fontWeight: 'bold'
              }}>
                🔮 관상을 분석하고 있습니다...
              </p>
              <p style={{ 
                margin: '8px 0 0',
                fontSize: '0.9em',
                opacity: '0.9'
              }}>
                AI가 얼굴의 특징을 세밀하게 분석하여<br/>
                전문적인 관상 해석을 준비하고 있습니다<br/>
                잠시만 기다려주세요 (최대 1분 소요)
              </p>
            </div>
          )}
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '15px', 
            borderRadius: '8px', 
            marginTop: '20px' 
          }}>
            {error}
          </div>
        )}

        {/* 하단 광고 영역 */}
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <AdBanner 
            adSlot="face-analyzer-bottom-slot"
            width={320}
            height={100}
            format="auto"
          />
        </div>
      </div>

      {/* CSS 애니메이션 */}
      {/* 결제 모달 */}
      <InicisPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        serviceType="professional-physiognomy"
        serviceName="정통관상 분석"
        amount={9900}
        description="전문적인 정통 관상학 분석 서비스"
        onPaymentComplete={handlePaymentComplete}
        onPaymentError={handlePaymentError}
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default FaceAnalyzer;