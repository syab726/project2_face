'use client';

import { useState, useRef, useEffect } from 'react';
import { generateHTMLToPDF, generateSimplePDF } from '@/lib/pdf-generator';
import InicisPaymentModal from '@/components/InicisPaymentModal';

function FaceSajuAnalyzer() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [age, setAge] = useState<number | ''>('');
  const [birthData, setBirthData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    gender: ''
  });
  const [progressStep, setProgressStep] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
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
    if (!age) {
      alert('나이를 입력해주세요.');
      return;
    }

    if (!uploadedImage) {
      const confirmWithoutImage = confirm('얼굴 사진 없이 사주만으로 분석하시겠습니까?\n더 정확한 분석을 위해서는 얼굴 사진을 업로드하는 것을 권장합니다.');
      if (!confirmWithoutImage) {
        return;
      }
    }

    if (!birthData.year || !birthData.month || !birthData.day || !birthData.hour || !birthData.gender) {
      alert('사주 분석을 위해 생년월일시와 성별을 모두 입력해주세요.');
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
    setProgressStep(0);
    setProgressMessage('분석을 시작합니다...');

    const progressTimer = setInterval(() => {
      setProgressStep((prev) => {
        const next = prev + 1;
        switch(next) {
          case 1:
            setProgressMessage('얼굴 특징을 분석하고 있습니다... 🔍');
            break;
          case 2:
            setProgressMessage('사주 명리를 계산하고 있습니다... 📊');
            break;
          case 3:
            setProgressMessage('관상과 사주를 융합 분석하고 있습니다... 🔮');
            break;
          case 4:
            setProgressMessage('맞춤형 해석을 생성하고 있습니다... ✨');
            break;
          case 5:
            setProgressMessage('최종 결과를 정리하고 있습니다... 📝');
            break;
        }
        return next;
      });
    }, 10000);

    try {
      const formData = new FormData();
      if (uploadedImage) {
        formData.append('faceImage', uploadedImage);
      }
      formData.append('birthData', JSON.stringify({
        year: parseInt(birthData.year),
        month: parseInt(birthData.month),
        day: parseInt(birthData.day),
        hour: parseInt(birthData.hour),
        gender: birthData.gender
      }));
      formData.append('age', age.toString());
      formData.append('analysisType', 'comprehensive');
      formData.append('selectedTopics', JSON.stringify(['comprehensive']));

      const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const orderId = `ORDER-${Date.now()}-comprehensive`;
      formData.append('userEmail', `anonymous-${Date.now()}@facewisdom.com`);
      formData.append('orderId', orderId);

      const response = await fetch('/api/analysis/face-saju', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        console.log('=== API 응답 결과 ===');
        console.log('전체 결과:', result.data);
        setAnalysisResult(result.data);
      } else {
        const errorMessage = result?.error?.message || '알 수 없는 오류가 발생했습니다.';
        console.error('API 오류:', errorMessage);
        alert('분석 중 오류가 발생했습니다: ' + errorMessage);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      clearInterval(progressTimer);
      setIsAnalyzing(false);
      setProgressStep(0);
      setProgressMessage('');
    }
  };

  // 하드코딩된 9개 섹션 정의
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

  // 섹션별 내용 추출 함수
  const extractSectionContent = (sectionKey: string) => {
    if (typeof analysisResult?.detailedAnalysis === 'object' && analysisResult.detailedAnalysis !== null) {
      const sectionData = (analysisResult.detailedAnalysis as any)[sectionKey];
      if (sectionData) {
        if (typeof sectionData === 'object' && sectionData !== null) {
          const sections = [];
          if (sectionData.faceAnalysis) sections.push(`**관상학적 분석**\n${sectionData.faceAnalysis}`);
          if (sectionData.sajuAnalysis) sections.push(`**사주명리학적 분석**\n${sectionData.sajuAnalysis}`);
          if (sectionData.judgment) sections.push(`**종합 판단**\n${sectionData.judgment}`);
          if (sectionData.statistics) sections.push(`**통계 및 데이터**\n${sectionData.statistics}`);
          if (sectionData.advice) sections.push(`**실천 조언**\n${sectionData.advice}`);
          return sections.join('\n\n---\n\n');
        } else if (typeof sectionData === 'string') {
          return sectionData;
        }
      }
    }
    return '해당 섹션의 분석 결과를 준비 중입니다...';
  };

  // 마크다운을 HTML로 변환하는 함수
  const convertMarkdownToHTML = (content: string) => {
    return content
      .replace(/\*\*관상\s*분석\*\*/g, '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px 20px; margin: 25px 0 20px 0; border-radius: 8px;"><h4 style="color: white; margin: 0; font-size: 1.1em; font-weight: 600;">👁️ 관상학적 분석</h4></div>')
      .replace(/\*\*사주\s*분석\*\*/g, '<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 12px 20px; margin: 25px 0 20px 0; border-radius: 8px;"><h4 style="color: white; margin: 0; font-size: 1.1em; font-weight: 600;">🎋 사주명리학적 분석</h4></div>')
      .replace(/\*\*종합\s*판[단정]\*\*/g, '<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 12px 20px; margin: 25px 0 20px 0; border-radius: 8px;"><h4 style="color: white; margin: 0; font-size: 1.1em; font-weight: 600;">⚖️ 종합 판정</h4></div>')
      .replace(/\*\*구체적\s*수치\*\*/g, '<div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 12px 20px; margin: 25px 0 20px 0; border-radius: 8px;"><h4 style="color: white; margin: 0; font-size: 1.1em; font-weight: 600;">📊 구체적 수치 & 지표</h4></div>')
      .replace(/\*\*실[전행]*\s*조언\*\*/g, '<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 12px 20px; margin: 25px 0 20px 0; border-radius: 8px;"><h4 style="color: white; margin: 0; font-size: 1.1em; font-weight: 600;">💡 실천 조언</h4></div>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #111827; font-weight: 600;">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="color: #6b7280;">$1</em>')
      .replace(/---/g, '<hr style="border: none; border-top: 2px solid #f3f4f6; margin: 30px 0;">')
      .replace(/\n\n/g, '</p><p style="margin: 15px 0; line-height: 1.8; color: #374151;">')
      .replace(/\n/g, '<br/>');
  };

  // 분석 결과가 있으면 결과 화면을 렌더링
  if (analysisResult) {
    return (
      <div className="analysis-result-container" style={{
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
            🔮 관상+사주 분석 완료
          </h2>

          {imagePreview && (
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
          )}


          {/* 하드코딩된 9개 섹션별 분석 결과 */}
          {analysisResult.detailedAnalysis && (
            <div style={{ marginBottom: '40px' }}>
              {fixedSections.map((section, index) => {
                const sectionKey = section.key;
                const title = section.title;
                const content = extractSectionContent(sectionKey);

                // 섹션별 그라데이션 색상 정의
                const sectionColors: { [key: string]: { bg: string; border: string } } = {
                  'comprehensive': { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '#667eea' },
                  'job': { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: '#f093fb' },
                  'business': { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: '#4facfe' },
                  'wealth': { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', border: '#43e97b' },
                  'love': { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', border: '#fa709a' },
                  'children': { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', border: '#a8edea' },
                  'health': { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', border: '#ff9a9e' },
                  'life': { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', border: '#ffecd2' },
                  'luck': { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', border: '#a8edea' }
                };

                const colors = sectionColors[sectionKey] || { bg: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)', border: '#90caf9' };

                return (
                  <div key={sectionKey} style={{
                    marginBottom: '40px',
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: `3px solid ${colors.border}20`,
                    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {/* 색상 강조 테두리 */}
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      height: '4px',
                      background: colors.bg
                    }}></div>

                    {/* 섹션 헤더 */}
                    <div style={{
                      background: colors.bg,
                      padding: '24px 32px',
                      borderBottom: '2px solid rgba(255,255,255,0.2)',
                      position: 'relative'
                    }}>
                      <h3 style={{
                        color: 'white',
                        margin: '0',
                        fontSize: '1.5em',
                        fontWeight: '700',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        letterSpacing: '-0.5px'
                      }}>{title}</h3>

                      {/* 헤더 장식 요소 */}
                      <div style={{
                        position: 'absolute',
                        right: '24px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        opacity: '0.3',
                        fontSize: '2em'
                      }}>✨</div>
                    </div>

                    {/* 섹션 내용 */}
                    <div style={{
                      padding: '36px',
                      lineHeight: '1.8',
                      fontSize: '15px',
                      color: '#374151',
                      background: 'linear-gradient(to bottom, #ffffff, #fafbfc)'
                    }}>
                      <div style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                      }}>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: `<div style="margin: 15px 0; line-height: 1.8; color: #374151;">${convertMarkdownToHTML(content)}</div>`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
                    const currentDate = new Date().toISOString().split('T')[0];
                    const filename = `관상사주분석-${currentDate}.pdf`;

                    const resultContainer = document.querySelector('.analysis-result-container');

                    if (resultContainer) {
                      try {
                        await generateHTMLToPDF(resultContainer as HTMLElement, filename);
                      } catch (htmlError) {
                        await generateSimplePDF(filename);
                      }
                    } else {
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
          </div>
        </div>
      </div>
    );
  }

  // 분석 입력 폼 렌더링
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
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#4caf50',
          marginBottom: '30px'
        }}>
          📅 관상 + 사주 분석
        </h2>

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

          <div style={{ textAlign: 'center', width: '100%' }}>
            {imagePreview ? (
              <div style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
              }}>
                <img
                  src={imagePreview}
                  alt="미리보기"
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '100px',
                    border: '3px solid #4caf50',
                    display: 'block'
                  }}
                />
              </div>
            ) : (
              <div style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
              }}>
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
                    background: '#f9f9f9'
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

        {/* 생년월일시 입력 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>
            3. 생년월일시를 선택해주세요
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
            <select
              value={birthData.year}
              onChange={(e) => setBirthData({...birthData, year: e.target.value})}
              style={{
                padding: '8px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.95em',
                backgroundColor: '#fff'
              }}
            >
              <option value="">년도 선택</option>
              {Array.from({length: 80}, (_, i) => 2010 - i).map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>

            <select
              value={birthData.month}
              onChange={(e) => setBirthData({...birthData, month: e.target.value})}
              style={{
                padding: '8px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.95em',
                backgroundColor: '#fff'
              }}
            >
              <option value="">월 선택</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>

            <select
              value={birthData.day}
              onChange={(e) => setBirthData({...birthData, day: e.target.value})}
              style={{
                padding: '8px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.95em',
                backgroundColor: '#fff'
              }}
            >
              <option value="">일 선택</option>
              {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}일</option>
              ))}
            </select>

            <select
              value={birthData.hour}
              onChange={(e) => setBirthData({...birthData, hour: e.target.value})}
              style={{
                padding: '8px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.95em',
                backgroundColor: '#fff'
              }}
            >
              <option value="">시간 선택</option>
              {Array.from({length: 24}, (_, i) => i).map(hour => (
                <option key={hour} value={hour}>{hour}시 ({hour === 0 ? '자정' : hour < 12 ? '오전' : '오후'} {hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}시)</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4caf50', marginBottom: '10px' }}>성별</h4>
            <div style={{ display: 'flex', gap: '15px' }}>
              {['male', 'female'].map((gender) => (
                <button
                  key={gender}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: birthData.gender === gender ? '2px solid #4caf50' : '2px solid #e0e0e0',
                    borderRadius: '10px',
                    background: birthData.gender === gender ? '#f0fff4' : '#fff',
                    cursor: 'pointer',
                    fontSize: '1em',
                    fontWeight: birthData.gender === gender ? 'bold' : 'normal',
                    color: birthData.gender === gender ? '#4caf50' : '#333'
                  }}
                  onClick={() => setBirthData({...birthData, gender})}
                >
                  {gender === 'male' ? '👨 남성' : '👩 여성'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 분석 시작 버튼 */}
        <div style={{ textAlign: 'center' }}>
          <button
            disabled={!age || isAnalyzing}
            style={{
              background: (!age || isAnalyzing)
                ? '#ccc'
                : 'linear-gradient(45deg, #4caf50, #66bb6a)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '1.1em',
              fontWeight: 'bold',
              cursor: (!age || isAnalyzing)
                ? 'not-allowed'
                : 'pointer',
              minWidth: '200px',
              boxShadow: (!age || isAnalyzing)
                ? 'none'
                : '0 4px 15px rgba(76, 175, 80, 0.3)'
            }}
            onClick={handleAnalysis}
          >
            {isAnalyzing ? '🔮 분석 중...' : '🔮 관상 X 사주 해석'}
          </button>

          {isAnalyzing && (
            <div style={{
              marginTop: '20px',
              padding: '25px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '50px',
                  height: '50px',
                  border: '4px solid rgba(255,255,255,0.3)',
                  borderTop: '4px solid white',
                  borderRadius: '50%',
                  marginBottom: '20px',
                  animation: 'spin 2s linear infinite'
                }}
              />
              <h3 style={{ marginBottom: '15px', fontSize: '1.3em' }}>
                🌟 관상 + 사주 종합 분석 진행 중...
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <p style={{
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: '1.05em',
                  marginBottom: '10px',
                  fontWeight: 'bold'
                }}>
                  {progressMessage}
                </p>

                <div style={{
                  width: '100%',
                  height: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: `${(progressStep / 5) * 100}%`,
                    height: '100%',
                    background: 'white',
                    borderRadius: '6px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '10px',
                  marginTop: '15px'
                }}>
                  {['얼굴분석', '사주계산', '융합분석', '해석생성', '최종정리'].map((step, index) => (
                    <div key={index} style={{
                      padding: '8px',
                      background: progressStep > index ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '0.85em',
                      color: progressStep > index ? 'white' : 'rgba(255,255,255,0.6)',
                      transition: 'all 0.3s ease'
                    }}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.9em',
                lineHeight: '1.6',
                marginTop: '20px'
              }}>
                전통 관상학과 사주명리학을 AI가 종합 분석하여<br/>
                당신만을 위한 맞춤형 운세를 제공합니다.<br/>
                <span style={{ fontSize: '0.85em', color: 'rgba(255,255,255,0.7)' }}>
                  예상 소요시간: 최대 3분
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 결제 모달 */}
      <InicisPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        serviceType="face-saju"
        serviceName="얼굴+사주 종합 분석"
        amount={7900}
        description="얼굴과 사주를 결합한 종합 분석 서비스"
        onPaymentComplete={handlePaymentComplete}
        onPaymentError={handlePaymentError}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default FaceSajuAnalyzer;