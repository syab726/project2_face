'use client';

import { useState, useRef, useEffect } from 'react';
import { generateHTMLToPDF, generateSimplePDF } from '@/lib/pdf-generator';
import InicisPaymentModal from '@/components/InicisPaymentModal';

type AnalysisType = 'home' | 'face' | 'face-saju' | 'mbti-face' | 'about' | 'terms';

interface MBTIAnalyzerProps {
  onComplete?: (result: any) => void;
  onNavigate?: (view: AnalysisType) => void;
}

const MBTI_TYPES = [
  'ENFP', 'ENFJ', 'ENTP', 'ENTJ',
  'ESFP', 'ESFJ', 'ESTP', 'ESTJ', 
  'INFP', 'INFJ', 'INTP', 'INTJ',
  'ISFP', 'ISFJ', 'ISTP', 'ISTJ'
];

/**
 * ⚠️ 중요 경고: MBTI+관상 컴포넌트 수정 금지
 * 
 * 이 컴포넌트는 사용자의 명시적 요청에 따라 잠금 상태입니다.
 * 특히 PDF 다운로드 관련 코드는 절대 수정하지 마세요.
 * - PDF는 축소하지 않고 원본 크기 유지
 * - 여러 페이지로 자동 분할
 * - 글자 크기 16px 고정
 * 
 * 수정 필요시 반드시 사용자 승인 필요
 * 마지막 승인: 2025-01-11
 * 
 * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
 */
function MBTIAnalyzer({ onComplete, onNavigate }: MBTIAnalyzerProps) {
  const [selectedMBTI, setSelectedMBTI] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  // 이상형 생성 관련 state들 완전 제거됨
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 컴포넌트 로드 확인
  useEffect(() => {
    console.log('MBTIAnalyzer 컴포넌트 로드됨');
    console.log('현재 selectedMBTI:', selectedMBTI);
  }, []);

  // selectedMBTI 변경 추적
  useEffect(() => {
    console.log('selectedMBTI 변경됨:', selectedMBTI);
  }, [selectedMBTI]);


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
    if (!selectedMBTI || !age || !uploadedImage) {
      alert('MBTI, 나이, 사진을 모두 입력해주세요.');
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = (result: any) => {
    console.log('✅ MBTIAnalyzer - 결제 완료 콜백 호출됨:', result);
    setIsPaymentModalOpen(false);
    console.log('🚀 MBTIAnalyzer - startAnalysis 호출 시작');
    startAnalysis();
  };

  const handlePaymentError = (error: any) => {
    console.error('❌ 결제 오류:', error);
    alert(`결제에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('faceImage', uploadedImage!);
      formData.append('mbtiType', selectedMBTI);
      formData.append('age', age.toString());

      // 오류 추적을 위한 사용자 정보 추가
      const orderId = `ORDER-${Date.now()}-MBTI-${selectedMBTI}`;
      formData.append('userEmail', 'user@example.com'); // 실제로는 로그인 정보에서 가져와야 함
      formData.append('orderId', orderId);

      const response = await fetch('/api/analysis/mbti-face', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result.data);
        onComplete?.(result.data);

        // 자동 팝업 제거 - 사용자가 직접 클릭할 때만 표시
      } else {
        alert('분석 중 오류가 발생했습니다: ' + result.error?.message);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };


  const getMBTIDescription = (mbti: string) => {
    const descriptions: { [key: string]: string } = {
      'ENFP': '재기발랄한 활동가',
      'ENFJ': '정의로운 사회운동가', 
      'ENTP': '뜨거운 토론가',
      'ENTJ': '대담한 통솔자',
      'ESFP': '자유로운 연예인',
      'ESFJ': '사교적인 외교관',
      'ESTP': '모험을 즐기는 사업가',
      'ESTJ': '엄격한 관리자',
      'INFP': '열정적인 중재자',
      'INFJ': '선의의 옹호자',
      'INTP': '논리적인 사색가',
      'INTJ': '용의주도한 전략가',
      'ISFP': '호기심 많은 예술가',
      'ISFJ': '용감한 수호자',
      'ISTP': '만능 재주꾼',
      'ISTJ': '현실주의자'
    };
    return descriptions[mbti] || '';
  };

  if (analysisResult) {
    return (
      <div className="mbti-analysis-result-container" style={{ 
        minHeight: '100vh',
        width: '100%',
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '16px', 
          padding: '30px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          <h2 style={{ color: '#5e2b97', marginBottom: '20px' }}>
            ✨ {selectedMBTI} 개인 맞춤 분석 완료!
          </h2>
          
          <div style={{ 
            marginBottom: '25px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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
                border: '3px solid #7c4dff'
              }}
            />
          </div>

          <div style={{ textAlign: 'left', lineHeight: '1.8' }}>
            {/* 기본 정보 */}
            <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9ff', borderRadius: '15px', border: '2px solid #e3d4ff' }}>
              <h3 style={{ color: '#7c4dff', marginBottom: '15px', fontSize: '1.3em' }}>👤 기본 정보</h3>
              <p><strong>MBTI:</strong> {selectedMBTI} ({getMBTIDescription(selectedMBTI)})</p>
              <p><strong>나이:</strong> {age}세</p>
              <p><strong>얼굴형:</strong> {typeof analysisResult.faceShape === 'object' ? analysisResult.faceShape?.shape || analysisResult.faceShape?.basicShape || '타원형' : analysisResult.faceShape || '타원형'}</p>
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                <strong>분석 신뢰도:</strong> {analysisResult.confidence || 85}%
              </p>
            </div>

            {/* 관상학×MBTI 융합 분석 */}
            {analysisResult.faceAnalysis && (
              <div style={{ marginBottom: '20px', padding: '20px', background: 'linear-gradient(145deg, #fff3e0, #ffe0b2)', borderRadius: '15px', border: '2px solid #ffcc80' }}>
                <h3 style={{ color: '#f57c00', marginBottom: '15px', fontSize: '1.3em' }}>🔥 관상학×MBTI 융합 분석</h3>
                
                {analysisResult.faceAnalysis.foreheadAnalysis && (
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ color: '#e65100', marginBottom: '8px' }}>🧠 이마 × 사고패턴</h4>
                    <p style={{ fontSize: '0.95em' }}>{analysisResult.faceAnalysis.foreheadAnalysis}</p>
                  </div>
                )}
                
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#e65100', marginBottom: '8px' }}>👁️ 눈 × 인지기능</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.faceAnalysis.eyeAnalysis}</p>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#e65100', marginBottom: '8px' }}>👃 코 × 의사결정</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.faceAnalysis.noseAnalysis}</p>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#e65100', marginBottom: '8px' }}>👄 입 × 소통방식</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.faceAnalysis.mouthAnalysis}</p>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#e65100', marginBottom: '8px' }}>🤨 눈썹 × 에너지</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.faceAnalysis.eyebrowAnalysis}</p>
                </div>
                
                {analysisResult.faceAnalysis.chinAnalysis && (
                  <div>
                    <h4 style={{ color: '#e65100', marginBottom: '8px' }}>🗿 턱 × 추진력</h4>
                    <p style={{ fontSize: '0.95em' }}>{analysisResult.faceAnalysis.chinAnalysis}</p>
                  </div>
                )}
              </div>
            )}

            {/* 상세 성격 분석 */}
            {analysisResult.personalityDetailed && (
              <div style={{ marginBottom: '20px', padding: '20px', background: 'linear-gradient(145deg, #f3e5f5, #e1bee7)', borderRadius: '15px', border: '2px solid #ce93d8' }}>
                <h3 style={{ color: '#7b1fa2', marginBottom: '15px', fontSize: '1.3em' }}>🧠 상세 성격 분석</h3>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#6a1b9a', marginBottom: '8px' }}>핵심 성격</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.personalityDetailed.corePersonality}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#6a1b9a', marginBottom: '8px' }}>주요 강점</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.personalityDetailed.strengthsDetailed}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#6a1b9a', marginBottom: '8px' }}>독특한 매력</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.personalityDetailed.uniqueTraits}</p>
                </div>
                <div>
                  <h4 style={{ color: '#6a1b9a', marginBottom: '8px' }}>행동 패턴</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.personalityDetailed.behaviorPatterns}</p>
                </div>
              </div>
            )}

            {/* 연애 분석 */}
            {analysisResult.loveLife && (
              <div style={{ marginBottom: '20px', padding: '20px', background: 'linear-gradient(145deg, #fce4ec, #f8bbd9)', borderRadius: '15px', border: '2px solid #f48fb1' }}>
                <h3 style={{ color: '#c2185b', marginBottom: '15px', fontSize: '1.3em' }}>💖 연애 심화 분석</h3>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#ad1457', marginBottom: '8px' }}>이상형 & 만남의 장소</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.loveLife.idealTypeDetailed || analysisResult.loveLife.idealType}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#ad1457', marginBottom: '8px' }}>연애 스타일</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.loveLife.datingStyleAnalysis || analysisResult.loveLife.datingStyle}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#ad1457', marginBottom: '8px' }}>매력 포인트</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.loveLife.attractionPoints || '자연스러운 매력과 진정성'}</p>
                </div>
                <div>
                  <h4 style={{ color: '#ad1457', marginBottom: '8px' }}>연애 성공 전략</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.loveLife.relationshipTips}</p>
                </div>
              </div>
            )}

            {/* 취업/진로 분석 */}
            {analysisResult.careerLifeDetailed && (
              <div style={{ marginBottom: '20px', padding: '20px', background: 'linear-gradient(145deg, #e8f5e8, #c8e6c9)', borderRadius: '15px', border: '2px solid #a5d6a7' }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '15px', fontSize: '1.3em' }}>💼 취업/진로 완전 분석</h3>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#1b5e20', marginBottom: '8px' }}>최적 직업</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.careerLifeDetailed.idealCareers}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#1b5e20', marginBottom: '8px' }}>업무 스타일</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.careerLifeDetailed.workStyle}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#1b5e20', marginBottom: '8px' }}>리더십 잠재력</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.careerLifeDetailed.leadershipPotential}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#1b5e20', marginBottom: '8px' }}>취업 전략</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.careerLifeDetailed.jobSearchStrategy}</p>
                </div>
                <div>
                  <h4 style={{ color: '#1b5e20', marginBottom: '8px' }}>커리어 로드맵</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.careerLifeDetailed.careerTimeline}</p>
                </div>
              </div>
            )}

            {/* 학습/성장 분석 */}
            {analysisResult.studyAndGrowth && (
              <div style={{ marginBottom: '20px', padding: '20px', background: 'linear-gradient(145deg, #fff3e0, #ffcc80)', borderRadius: '15px', border: '2px solid #ffb74d' }}>
                <h3 style={{ color: '#ef6c00', marginBottom: '15px', fontSize: '1.3em' }}>📚 학습/성장 전략</h3>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#e65100', marginBottom: '8px' }}>최적 학습법</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.studyAndGrowth.learningStyleDetailed}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#e65100', marginBottom: '8px' }}>스킬 개발 계획</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.studyAndGrowth.skillDevelopmentPlan}</p>
                </div>
                <div>
                  <h4 style={{ color: '#e65100', marginBottom: '8px' }}>추천 취미</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.studyAndGrowth.hobbyRecommendations}</p>
                </div>
              </div>
            )}

            {/* 소셜 라이프 분석 */}
            {analysisResult.socialLifeEnhanced && (
              <div style={{ marginBottom: '20px', padding: '20px', background: 'linear-gradient(145deg, #e3f2fd, #bbdefb)', borderRadius: '15px', border: '2px solid #90caf9' }}>
                <h3 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '1.3em' }}>🌟 소셜 라이프 마스터</h3>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#0d47a1', marginBottom: '8px' }}>소통 강점</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.socialLifeEnhanced.communicationStrengths}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#0d47a1', marginBottom: '8px' }}>네트워킹 전략</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.socialLifeEnhanced.networkingStrategy}</p>
                </div>
                <div>
                  <h4 style={{ color: '#0d47a1', marginBottom: '8px' }}>개인 브랜딩</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.socialLifeEnhanced.trendAdaptation}</p>
                </div>
              </div>
            )}

            {/* 종합 조언 */}
            {analysisResult.comprehensiveAdvice && (
              <div style={{ marginBottom: '25px', padding: '20px', background: 'linear-gradient(145deg, #f1f8e9, #dcedc8)', borderRadius: '15px', border: '3px solid #aed581' }}>
                <h3 style={{ color: '#33691e', marginBottom: '15px', fontSize: '1.4em' }}>💎 종합 인생 전략</h3>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#2e7d32', marginBottom: '8px' }}>즉시 실행 계획</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.comprehensiveAdvice.immediate}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#2e7d32', marginBottom: '8px' }}>단기 목표</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.comprehensiveAdvice.shortTerm}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#2e7d32', marginBottom: '8px' }}>장기 비전</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.comprehensiveAdvice.longTerm}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#2e7d32', marginBottom: '8px' }}>주의 포인트</h4>
                  <p style={{ fontSize: '0.95em' }}>{analysisResult.comprehensiveAdvice.warningPoints}</p>
                </div>
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.8)', borderRadius: '10px', marginTop: '15px' }}>
                  <h4 style={{ color: '#1b5e20', marginBottom: '8px' }}>💌 특별한 메시지</h4>
                  <p style={{ fontSize: '1em', fontWeight: 'bold', color: '#2e7d32' }}>{analysisResult.comprehensiveAdvice.motivationalMessage}</p>
                </div>
              </div>
            )}

            {/* 업쉀링: 정통 관상분석으로 연결 */}

            {/* 업쉀링 배너 - 정통 관상분석으로 연결 */}
            <div style={{ 
              marginTop: '30px', 
              padding: '25px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              borderRadius: '20px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '15px' }}>🔮 더 깊이 있는 관상 분석을 원하시나요?</h3>
              <p style={{ color: '#f0f0f0', marginBottom: '20px', lineHeight: '1.6' }}>
                이 분석은 현대인을 위한 <strong>가벼운 버전</strong>입니다.<br/>
                <strong>정통 관상학</strong>으로 더 정확하고 상세한 분석을 받아보세요!
              </p>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '15px', 
                borderRadius: '10px', 
                marginBottom: '20px',
                fontSize: '0.9em'
              }}>
                ✨ 전문 관상학자 수준의 분석 • 운세/성격 상세 해석 • PDF 보고서 제공
              </div>
              
              <button 
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: '1.1em',
                  fontWeight: 'bold',
                  marginRight: '15px',
                  boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                  transform: 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
                onClick={() => {
                  onNavigate?.('face');
                }}
              >
                🌟 정통 관상분석 받기
              </button>
              
              <div style={{ marginTop: '15px', fontSize: '0.8em', color: '#e0e0e0' }}>
                💡 더 깊이 있는 <strong>전문 관상학 분석</strong>을 경험해보세요!
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '30px', 
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
                  const filename = `MBTI관상분석-${currentDate}.pdf`;
                  
                  // 분석 결과 컨테이너 찾기
                  const resultContainer = document.querySelector('.mbti-analysis-result-container') || 
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%', 
      padding: '20px',
      boxSizing: 'border-box',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: '16px', 
        padding: '30px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#5e2b97', 
          marginBottom: '30px' 
        }}>
          🔥 MBTI × 관상 종합분석
        </h2>

        {/* MBTI 선택 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#7c4dff', marginBottom: '15px' }}>
            1. 당신의 MBTI를 선택해주세요
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '10px' 
          }}>
            {MBTI_TYPES.map((mbti) => (
              <button
                key={mbti}
                type="button"
                style={{
                  padding: '12px 8px',
                  border: selectedMBTI === mbti ? '2px solid #7c4dff' : '2px solid #e0e0e0',
                  borderRadius: '10px',
                  background: selectedMBTI === mbti ? '#f3f0ff' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontWeight: selectedMBTI === mbti ? 'bold' : 'normal',
                  color: selectedMBTI === mbti ? '#7c4dff' : '#333',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  userSelect: 'none'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('MBTI 버튼 클릭:', mbti);
                  setSelectedMBTI(mbti);
                }}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={(e) => {
                  if (selectedMBTI !== mbti) {
                    e.target.style.borderColor = '#7c4dff';
                    e.target.style.background = '#f8f5ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMBTI !== mbti) {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.background = '#fff';
                  }
                }}
              >
                <div style={{ fontSize: '0.8em', fontWeight: 'bold', pointerEvents: 'none' }}>{mbti}</div>
                <div style={{ fontSize: '0.7em', marginTop: '2px', pointerEvents: 'none' }}>
                  {getMBTIDescription(mbti)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 나이 입력 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#7c4dff', marginBottom: '15px' }}>
            2. 나이를 입력해주세요
          </h3>
          <input
            type="number"
            placeholder="예: 25"
            min="10"
            max="100"
            value={age}
            onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
            style={{
              width: '200px',
              padding: '12px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '1em',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#7c4dff'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <span style={{ marginLeft: '10px', color: '#666' }}>세</span>
        </div>

        {/* 사진 업로드 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#7c4dff', marginBottom: '15px' }}>
            3. 얼굴 사진을 업로드해주세요
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
                alignItems: 'center'
              }}>
                <img 
                  src={imagePreview} 
                  alt="미리보기"
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '100px',
                    border: '3px solid #7c4dff'
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  border: '2px dashed #ccc',
                  borderRadius: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 15px',
                  cursor: 'pointer',
                  background: '#f9f9f9'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '2em', marginBottom: '5px' }}>📷</div>
                  <div style={{ fontSize: '0.9em' }}>사진 선택</div>
                </div>
              </div>
            )}
            
            <button
              style={{
                background: '#7c4dff',
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
            
            <p style={{ 
              fontSize: '0.8em', 
              color: '#666', 
              marginTop: '10px' 
            }}>
              • JPG, PNG, WEBP 파일 (최대 10MB)<br/>
              • 얼굴이 잘 보이는 정면 사진을 권장합니다
            </p>
          </div>
        </div>

        {/* 분석 시작 버튼 */}
        <div style={{ textAlign: 'center' }}>
          <button
            disabled={!selectedMBTI || !age || !uploadedImage || isAnalyzing}
            style={{
              background: (!selectedMBTI || !age || !uploadedImage || isAnalyzing) 
                ? '#ccc' 
                : 'linear-gradient(45deg, #7c4dff, #9c27b0)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '1.1em',
              fontWeight: 'bold',
              cursor: (!selectedMBTI || !age || !uploadedImage || isAnalyzing) 
                ? 'not-allowed' 
                : 'pointer',
              minWidth: '200px',
              boxShadow: (!selectedMBTI || !age || !uploadedImage || isAnalyzing) 
                ? 'none' 
                : '0 4px 15px rgba(124, 77, 255, 0.3)'
            }}
            onClick={handleAnalysis}
          >
            {isAnalyzing ? '🔥 분석 중...' : '🚀 개인 맞춤 분석 시작 (3,900원)'}
          </button>
          
          {isAnalyzing && (
            <div style={{
              marginTop: '20px',
              padding: '25px',
              background: 'linear-gradient(135deg, #7c4dff 0%, #9c27b0 100%)',
              borderRadius: '15px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div
                className="spin-animation"
                style={{
                  display: 'inline-block',
                  width: '50px',
                  height: '50px',
                  border: '4px solid rgba(255,255,255,0.3)',
                  borderTop: '4px solid white',
                  borderRadius: '50%',
                  marginBottom: '20px'
                }}
              />
              <h3 style={{ marginBottom: '10px', fontSize: '1.3em' }}>
                MBTI × 관상 분석 진행 중...
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05em' }}>
                AI가 당신의 {selectedMBTI} × 관상을 전문적으로 분석 중...<br/>
                연애, 취업, 학습, 소셜라이프까지 다 알려드릴게요!<br/>
                <span style={{ fontSize: '0.9em', opacity: '0.8' }}>
                  잠시만 기다려주세요 (최대 1분 소요)
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
        serviceType="mbti-face"
        serviceName="MBTI 얼굴 분석"
        amount={2900}
        description="얼굴로 알아보는 MBTI 성격 분석 서비스"
        onPaymentComplete={handlePaymentComplete}
        onPaymentError={handlePaymentError}
      />

      {/* CSS 애니메이션 */}
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

export default MBTIAnalyzer;