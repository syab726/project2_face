/**
 * ⚠️ 중요 경고: 면접 관상 분석기 수정 금지
 * 
 * 이 컴포넌트는 사용자의 명시적 요청에 따라 완전히 잠금 상태입니다.
 * 특히 다음 사항들은 절대 수정하지 마세요:
 * - AI 분석 로직 및 API 호출
 * - PDF 생성 기능
 * - 마이크로 인터셜션 추출 또는 작업 컴포넌트 임의 수정
 * - 분석 결과 표시 방식
 * 
 * 수정 필요시 반드시 사용자 승인 필요
 * 마지막 승인: 2025-01-11
 * 
 * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import InicisPaymentModal from '@/components/InicisPaymentModal';

// Window 타입 확장
declare global {
  interface Window {
    html2canvas: any;
    jspdf: {
      jsPDF: any;
    };
  }
}

type AnalysisType = 'home' | 'face' | 'face-saju' | 'mbti-face' | 'interview' | 'about' | 'terms';

interface InterviewFaceAnalyzerProps {
  onComplete?: (result: any) => void;
  onNavigate?: (view: AnalysisType) => void;
}

function InterviewFaceAnalyzer({ onComplete, onNavigate }: InterviewFaceAnalyzerProps) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');
  const [jobField, setJobField] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // 섹션별 색상 매핑
  const getSectionColor = (sectionKey: string) => {
    const colorMap: { [key: string]: string } = {
      '종합평가': 'rgba(52, 152, 219, 0.08)',      // 파란색 계열
      '첫인상_분석': 'rgba(46, 204, 113, 0.08)',    // 초록색 계열
      '신뢰도_평가': 'rgba(155, 89, 182, 0.08)',    // 보라색 계열
      '리더십_잠재력': 'rgba(241, 196, 15, 0.08)',  // 노란색 계열
      '팀워크_성향': 'rgba(26, 188, 156, 0.08)',    // 청록색 계열
      '스트레스_관리': 'rgba(230, 126, 34, 0.08)',  // 주황색 계열
      '성장_가능성': 'rgba(231, 76, 60, 0.08)',     // 빨간색 계열
      '강점_분석': 'rgba(52, 73, 94, 0.08)',       // 회색 계열
      '보완점': 'rgba(192, 57, 43, 0.08)',         // 진한 빨간색 계열
      '의사소통능력': 'rgba(39, 174, 96, 0.08)',    // 진한 초록색 계열
      '창의성_혁신성': 'rgba(142, 68, 173, 0.08)',  // 진한 보라색 계열
      '전문성_역량': 'rgba(41, 128, 185, 0.08)'     // 진한 파란색 계열
    };
    return colorMap[sectionKey] || 'rgba(0, 0, 0, 0.05)';
  };

  // 뒤로가기 핸들러 (PDF 저장 확인 포함)
  const handleBackWithPDFConfirm = async () => {
    if (analysisResult) {
      const shouldSavePDF = window.confirm("PDF로 저장하시겠습니까?");

      if (shouldSavePDF) {
        // 바로 PDF 다운로드 실행
        await downloadPDF();

        // PDF 다운로드 후 약간의 지연 후 뒤로가기
        setTimeout(() => {
          // 세션 데이터 정리
          sessionStorage.removeItem('interviewUserData');
          onNavigate?.('home');
        }, 1000);
      } else {
        // 세션 데이터 정리 후 즉시 뒤로가기
        sessionStorage.removeItem('interviewUserData');
        onNavigate?.('home');
      }
    } else {
      // 분석 결과가 없으면 바로 뒤로가기
      sessionStorage.removeItem('interviewUserData');
      onNavigate?.('home');
    }
  };

  // PDF 다운로드 함수 (별도 분리)
  const downloadPDF = async () => {
    try {
      console.log('면접 관상 PDF 다운로드 시작');

      // CDN 라이브러리 로드 확인 및 로드
      if (!window.html2canvas) {
        const script1 = document.createElement('script');
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(script1);
        await new Promise(resolve => script1.onload = resolve);
      }

      if (!window.jspdf) {
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script2);
        await new Promise(resolve => script2.onload = resolve);
      }

      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `면접관상분석-${gender === 'male' ? '남성' : '여성'}-${age}세-${jobField}-${currentDate}.pdf`;

      // 분석 결과 컨테이너 찾기
      const resultContainer = document.querySelector('.analysis-result-container');

      if (resultContainer) {
        // 스크롤을 맨 위로 이동
        window.scrollTo(0, 0);

        // 실제 컨테이너 크기 측정
        const actualWidth = Math.max(resultContainer.scrollWidth, resultContainer.offsetWidth, 800);
        const actualHeight = Math.max(resultContainer.scrollHeight, resultContainer.offsetHeight, 600);

        // 잠시 대기 후 캡처 (렌더링 완료 대기)
        await new Promise(resolve => setTimeout(resolve, 500));

        // html2canvas로 변환
        const canvas = await window.html2canvas(resultContainer, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: actualWidth,
          height: actualHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: actualWidth,
          windowHeight: actualHeight,
          removeContainer: false,
          foreignObjectRendering: false,
          logging: true
        });

        // PDF 생성
        const { jsPDF } = window.jspdf;
        const a4Width = 210;
        const a4Height = 297;
        const margin = 15;
        const contentWidth = a4Width - (margin * 2);
        const contentHeight = a4Height - (margin * 2);

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const pxToMmRatio = 0.264583;
        const canvasWidthMm = canvasWidth * pxToMmRatio;
        const canvasHeightMm = canvasHeight * pxToMmRatio;
        const widthScale = contentWidth / canvasWidthMm;
        const scaledHeight = canvasHeightMm * widthScale;
        const totalPages = Math.ceil(scaledHeight / contentHeight);

        for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
          if (pageIndex > 0) {
            pdf.addPage();
          }

          const pageStartY = (pageIndex * contentHeight) / widthScale / pxToMmRatio;
          const pageEndY = Math.min(
            pageStartY + (contentHeight / widthScale / pxToMmRatio),
            canvasHeight
          );
          const sliceHeight = pageEndY - pageStartY;

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvasWidth;
          tempCanvas.height = sliceHeight;
          const tempCtx = tempCanvas.getContext('2d');

          tempCtx.drawImage(
            canvas,
            0, pageStartY,
            canvasWidth, sliceHeight,
            0, 0,
            canvasWidth, sliceHeight
          );

          const imgData = tempCanvas.toDataURL('image/jpeg', 0.95);
          const sliceHeightMm = sliceHeight * pxToMmRatio * widthScale;

          pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, sliceHeightMm);
        }

        pdf.save(filename);
        console.log('면접 관상 PDF 다운로드 완료');
      } else {
        alert('분석 결과를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  const JOB_FIELDS = [
    '일반사무직', 'IT/개발', '영업/마케팅', '금융/회계',
    '교육/강사', '의료/간호', '서비스업', '제조/기술',
    '법무/행정', '언론/방송', '예술/디자인', '기타'
  ];

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
    if (!uploadedImage || !gender || !age || !jobField) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    startAnalysis();
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

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage!);
      formData.append('analysisType', 'interview');
      formData.append('gender', gender);
      formData.append('age', age.toString());
      formData.append('jobField', jobField);

      const response = await fetch('/api/analyze-interview-face', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('분석 요청 실패');
      }

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result.data.analysis || result.data);
        if (onComplete) {
          onComplete(result.data.analysis || result.data);
        }
      } else {
        throw new Error(result.message || '분석 실패');
      }
    } catch (error) {
      console.error('면접 관상 분석 오류:', error);
      alert(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 분석 결과 화면
  if (analysisResult) {
    return (
      <div className="analysis-result-container" style={{
        padding: '15px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: window.innerWidth <= 768 ? '20px' : '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          color: '#333',
          width: '100%',
          boxSizing: 'border-box',
          wordWrap: 'break-word',
          overflow: 'hidden'
        }}>
          {/* 뒤로가기 버튼 */}
          <div style={{
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <button
              style={{
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={handleBackWithPDFConfirm}
            >
              ← 뒤로가기
            </button>
          </div>

          <h2 style={{
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '1.8em'
          }}>
            면접 관상 분석 결과
          </h2>

          {/* 업로드된 사진 및 사용자 정보 표시 */}
          {uploadedImage && (
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '15px',
                overflow: 'hidden',
                border: '3px solid #e0e0e0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <img
                  src={imagePreview}
                  alt="분석 대상 사진"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{
                flex: 1,
                color: '#2c3e50'
              }}>
                <h3 style={{
                  margin: '0 0 10px 0',
                  fontSize: '1.2em',
                  fontWeight: 'bold',
                  color: '#34495e'
                }}>분석 대상 정보</h3>
                <div style={{ fontSize: '1em', lineHeight: '1.6' }}>
                  <div><strong>성별:</strong> {gender === 'male' ? '남성' : '여성'}</div>
                  <div><strong>나이:</strong> {age}세</div>
                  <div><strong>희망 직군:</strong> {jobField}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '20px',
            width: '100%',
            overflow: 'visible',
            wordWrap: 'break-word'
          }}>
            {/* 종합평가 */}
            {analysisResult.종합평가 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>종합평가</h3>
                <div style={{
                  background: getSectionColor('종합평가'),
                  padding: '20px',
                  borderRadius: '12px',
                  fontSize: '1.05em',
                  lineHeight: '1.7',
                  border: '1px solid rgba(52, 152, 219, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.종합평가}</p>
                </div>
              </div>
            )}

            {/* 첫인상 분석 */}
            {analysisResult.첫인상_분석 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>첫인상 분석</h3>
                <div style={{
                  background: getSectionColor('첫인상_분석'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(46, 204, 113, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.첫인상_분석}</p>
                </div>
              </div>
            )}

            {/* 신뢰도 평가 */}
            {analysisResult.신뢰도_평가 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>신뢰도 평가</h3>
                <div style={{
                  background: getSectionColor('신뢰도_평가'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(155, 89, 182, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.신뢰도_평가}</p>
                </div>
              </div>
            )}

            {/* 리더십 잠재력 */}
            {analysisResult.리더십_잠재력 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>리더십 잠재력</h3>
                <div style={{
                  background: getSectionColor('리더십_잠재력'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(241, 196, 15, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.리더십_잠재력}</p>
                </div>
              </div>
            )}

            {/* 팀워크 성향 */}
            {analysisResult.팀워크_성향 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>팀워크 성향</h3>
                <div style={{
                  background: getSectionColor('팀워크_성향'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(26, 188, 156, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.팀워크_성향}</p>
                </div>
              </div>
            )}

            {/* 스트레스 관리 */}
            {analysisResult.스트레스_관리 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>스트레스 관리</h3>
                <div style={{
                  background: getSectionColor('스트레스_관리'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(230, 126, 34, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.스트레스_관리}</p>
                </div>
              </div>
            )}

            {/* 성장 가능성 */}
            {analysisResult.성장_가능성 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>성장 가능성</h3>
                <div style={{
                  background: getSectionColor('성장_가능성'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(231, 76, 60, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.성장_가능성}</p>
                </div>
              </div>
            )}

            {/* 강점 분석 */}
            {analysisResult.강점_분석 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>강점 분석</h3>
                <div style={{
                  background: getSectionColor('강점_분석'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(52, 73, 94, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.강점_분석}</p>
                </div>
              </div>
            )}

            {/* 보완점 */}
            {analysisResult.보완점 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>보완점</h3>
                <div style={{
                  background: getSectionColor('보완점'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(192, 57, 43, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.보완점}</p>
                </div>
              </div>
            )}

            {/* 의사소통능력 */}
            {analysisResult.의사소통능력 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>의사소통능력</h3>
                <div style={{
                  background: getSectionColor('의사소통능력'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(39, 174, 96, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.의사소통능력}</p>
                </div>
              </div>
            )}

            {/* 창의성 및 혁신성 */}
            {analysisResult.창의성_혁신성 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>창의성 및 혁신성</h3>
                <div style={{
                  background: getSectionColor('창의성_혁신성'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(142, 68, 173, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.창의성_혁신성}</p>
                </div>
              </div>
            )}

            {/* 전문성 및 역량 */}
            {analysisResult.전문성_역량 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>전문성 및 역량</h3>
                <div style={{
                  background: getSectionColor('전문성_역량'),
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(41, 128, 185, 0.15)'
                }}>
                  <p style={{
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontSize: '1em',
                    lineHeight: '1.7'
                  }}>{analysisResult.전문성_역량}</p>
                </div>
              </div>
            )}

          </div>

          {/* 버튼들 */}
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                color: '#495057',
                border: '1px solid #dee2e6',
                padding: '14px 25px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: 'bold',
                minWidth: '160px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onClick={async () => {
                try {
                  console.log('면접 관상 PDF 다운로드 시작');
                  
                  // CDN 라이브러리 로드 확인 및 로드
                  if (!window.html2canvas) {
                    const script1 = document.createElement('script');
                    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    document.head.appendChild(script1);
                    await new Promise(resolve => script1.onload = resolve);
                  }
                  
                  if (!window.jspdf) {
                    const script2 = document.createElement('script');
                    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                    document.head.appendChild(script2);
                    await new Promise(resolve => script2.onload = resolve);
                  }
                  
                  const currentDate = new Date().toISOString().split('T')[0];
                  const filename = `면접관상분석-${gender === 'male' ? '남성' : '여성'}-${age}세-${jobField}-${currentDate}.pdf`;
                  
                  // 분석 결과 컨테이너 찾기
                  const resultContainer = document.querySelector('.analysis-result-container');
                  
                  if (resultContainer) {
                    // 스크롤을 맨 위로 이동
                    window.scrollTo(0, 0);
                    
                    // 실제 컨테이너 크기 측정
                    const actualWidth = Math.max(resultContainer.scrollWidth, resultContainer.offsetWidth, 800);
                    const actualHeight = Math.max(resultContainer.scrollHeight, resultContainer.offsetHeight, 600);
                    
                    console.log(`컨테이너 크기: ${actualWidth}px x ${actualHeight}px`);
                    
                    // 잠시 대기 후 캡처 (렌더링 완료 대기)
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // html2canvas로 변환
                    const canvas = await window.html2canvas(resultContainer, {
                      scale: 1.5, // 해상도 조정
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: '#ffffff',
                      width: actualWidth,
                      height: actualHeight,
                      scrollX: 0,
                      scrollY: 0,
                      windowWidth: actualWidth,
                      windowHeight: actualHeight,
                      removeContainer: false,
                      foreignObjectRendering: false,
                      logging: true
                    });
                    
                    // PDF 생성 - 다중 페이지 방식
                    const { jsPDF } = window.jspdf;

                    // A4 사이즈 설정
                    const a4Width = 210; // mm
                    const a4Height = 297; // mm
                    const margin = 15; // mm
                    const contentWidth = a4Width - (margin * 2);
                    const contentHeight = a4Height - (margin * 2);

                    // PDF 문서 생성
                    const pdf = new jsPDF({
                      orientation: 'portrait',
                      unit: 'mm',
                      format: 'a4'
                    });

                    // Canvas 원본 크기 (픽셀)
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;

                    // 폭을 A4에 맞추기 위한 스케일 계산 (픽셀을 mm로 변환)
                    const pxToMmRatio = 0.264583; // 96 DPI 기준
                    const canvasWidthMm = canvasWidth * pxToMmRatio;
                    const canvasHeightMm = canvasHeight * pxToMmRatio;

                    // 폭을 기준으로 스케일링 (원본 텍스트 크기 최대한 유지)
                    const widthScale = contentWidth / canvasWidthMm;
                    const scaledHeight = canvasHeightMm * widthScale;

                    console.log(`원본 Canvas: ${canvasWidth}px x ${canvasHeight}px`);
                    console.log(`스케일 후 크기: ${contentWidth.toFixed(2)}mm x ${scaledHeight.toFixed(2)}mm`);

                    // 필요한 페이지 수 계산
                    const totalPages = Math.ceil(scaledHeight / contentHeight);
                    console.log(`총 필요 페이지: ${totalPages}`);

                    // 각 페이지별로 처리
                    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
                      // 두 번째 페이지부터 새 페이지 추가
                      if (pageIndex > 0) {
                        pdf.addPage();
                      }

                      // 현재 페이지에서 표시할 Canvas 영역 계산 (픽셀 기준)
                      const pageStartY = (pageIndex * contentHeight) / widthScale / pxToMmRatio;
                      const pageEndY = Math.min(
                        pageStartY + (contentHeight / widthScale / pxToMmRatio),
                        canvasHeight
                      );
                      const sliceHeight = pageEndY - pageStartY;

                      // 해당 영역만 잘라내기 위한 임시 Canvas
                      const tempCanvas = document.createElement('canvas');
                      const tempContext = tempCanvas.getContext('2d');
                      tempCanvas.width = canvasWidth;
                      tempCanvas.height = sliceHeight;

                      // 원본 Canvas에서 해당 영역 복사
                      tempContext.drawImage(
                        canvas,
                        0, pageStartY, canvasWidth, sliceHeight,  // 소스 영역
                        0, 0, canvasWidth, sliceHeight           // 대상 영역
                      );

                      // 잘라낸 부분을 base64로 변환
                      const sliceImageData = tempCanvas.toDataURL('image/png', 1.0);

                      // PDF에 이미지 추가 - 원본 텍스트 크기 유지
                      const imageHeightInPdf = sliceHeight * pxToMmRatio * widthScale;

                      pdf.addImage(
                        sliceImageData,
                        'PNG',
                        margin, // x 위치
                        margin, // y 위치
                        contentWidth, // 폭
                        imageHeightInPdf // 높이
                      );
                    }

                    // PDF 저장
                    pdf.save(filename);
                    
                    console.log('면접 관상 PDF 다운로드 완료');
                    
                  } else {
                    alert('분석 결과를 찾을 수 없습니다.');
                  }
                } catch (error) {
                  console.error('PDF 다운로드 오류:', error);
                  alert('PDF 다운로드 중 오류가 발생했습니다.');
                }
              }}
            >
              PDF 저장
            </button>

            <button
              style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                color: '#495057',
                border: '1px solid #dee2e6',
                padding: '14px 25px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: 'bold',
                minWidth: '160px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onClick={handleBackWithPDFConfirm}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: '20px', 
        padding: '30px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#2196f3', 
          marginBottom: '10px',
          fontSize: '1.8em'
        }}>
          면접 관상 분석
        </h2>
        
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginBottom: '30px', 
          fontSize: '1.1em' 
        }}>
          취업 준비생을 위한 특별한 면접 관상 분석 서비스 (900원)
        </p>

        {/* 사진 업로드 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#2196f3', marginBottom: '15px' }}>
            1. 얼굴 사진 업로드
          </h3>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '3px dashed #2196f3',
              borderRadius: '15px',
              padding: '30px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#f8f9fa',
              transition: 'all 0.3s ease',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            {imagePreview ? (
              <>
                <img 
                  src={imagePreview} 
                  alt="업로드된 이미지" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    borderRadius: '10px' 
                  }} 
                />
                <p style={{ marginTop: '10px', color: '#2196f3' }}>
                  다른 사진으로 변경하려면 클릭하세요
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3em', marginBottom: '10px' }}>+</div>
                <h4 style={{ color: '#2196f3', margin: '0 0 10px 0' }}>
                  면접용 사진을 업로드해주세요
                </h4>
                <p style={{ color: '#666', margin: 0 }}>
                  JPG, PNG, WEBP (최대 10MB)
                </p>
              </>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: 'none' }}
          />
        </div>

        {/* 기본 정보 입력 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#2196f3', marginBottom: '15px' }}>
            2. 기본 정보 입력
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            {/* 나이 입력 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>나이</label>
              <input
                type="number"
                min="20"
                max="60"
                value={age}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="나이를 입력하세요"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1em'
                }}
              />
            </div>

            {/* 성별 선택 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>성별</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['male', 'female'].map((genderOption) => (
                  <button
                    key={genderOption}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: gender === genderOption ? '2px solid #2196f3' : '2px solid #e0e0e0',
                      borderRadius: '8px',
                      background: gender === genderOption ? '#e3f2fd' : '#fff',
                      cursor: 'pointer',
                      fontSize: '1em'
                    }}
                    onClick={() => setGender(genderOption)}
                  >
                    {genderOption === 'male' ? '남성' : '여성'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 직군 선택 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>희망 직군</label>
            <select
              value={jobField}
              onChange={(e) => setJobField(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1em',
                backgroundColor: '#fff'
              }}
            >
              <option value="">직군을 선택하세요</option>
              {JOB_FIELDS.map((field) => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 분석 시작 버튼 */}
        <div style={{ textAlign: 'center' }}>
          <button
            disabled={!uploadedImage || !gender || !age || !jobField || isAnalyzing}
            style={{
              background: (!uploadedImage || !gender || !age || !jobField || isAnalyzing) 
                ? '#ccc' 
                : 'linear-gradient(45deg, #2196f3, #21cbf3)',
              color: '#333',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '1.1em',
              fontWeight: 'bold',
              cursor: (!uploadedImage || !gender || !age || !jobField || isAnalyzing) 
                ? 'not-allowed' 
                : 'pointer',
              minWidth: '200px',
              boxShadow: (!uploadedImage || !gender || !age || !jobField || isAnalyzing) 
                ? 'none' 
                : '0 4px 15px rgba(33, 150, 243, 0.3)'
            }}
            onClick={handleAnalysis}
          >
            {isAnalyzing ? '분석 중...' : '면접 관상 분석 시작'}
          </button>
          
          {isAnalyzing && (
            <div style={{
              marginTop: '20px',
              padding: '25px',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '15px',
              color: '#333',
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
                AI가 면접 관상 분석 중입니다
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05em' }}>
                면접에서의 인상, 강점, 주의사항을 분석하고 있습니다
              </p>
              <span style={{ fontSize: '0.9em', opacity: '0.8', color: 'rgba(255,255,255,0.7)' }}>
                잠시만 기다려주세요 (최대 1분 소요)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 결제 모달 */}
      <InicisPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        serviceType="interview"
        serviceName="면접관상 분석"
        amount={4900}
        description="면접에서 좋은 인상을 주는 관상 분석 서비스"
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

export default InterviewFaceAnalyzer;