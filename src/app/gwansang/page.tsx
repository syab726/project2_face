'use client';

/**
 * ⚠️ 중요 경고: 면접 관상 분석 페이지 수정 금지
 *
 * 이 페이지는 사용자의 명시적 요청에 따라 완전히 잠금 상태입니다.
 * 특히 다음 사항들은 절대 수정하지 마세요:
 * - PDF 생성 로직 (DOM 선택자, 폰트, 색상 처리)
 * - API 호출 구조 (Gemini + Fine-tuned 모델)
 * - 페이지 색상 및 레이아웃
 * - 분석 결과 표시 방식
 *
 * 수정 필요시 반드시 사용자 승인 필요
 * 마지막 승인: 2025-01-11
 *
 * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
 */

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import AdBanner from '@/components/AdBanner';
import InterviewFaceAnalyzer from '@/components/InterviewFaceAnalyzer';
import InicisPaymentModal from '@/components/InicisPaymentModal';
import { generateHTMLToPDF, generateSimplePDF } from '@/lib/pdf-generator';

// Next.js 빌드 에러 해결을 위한 dynamic 설정
export const dynamic = 'force-dynamic';

// Next.js dynamic import 사용 (SSR 안전)
const FaceAnalyzer = dynamicImport(() => import('@/components/FaceAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>로딩 중...</div>
});
const FaceSajuAnalyzer = dynamicImport(() => import('@/components/FaceSajuAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>관상+사주 로딩 중...</div>
});
const MBTIAnalyzer = dynamicImport(() => import('@/components/MBTIAnalyzer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>MBTI 분석 로딩 중...</div>
});

type AnalysisType = 'home' | 'face' | 'face-saju' | 'mbti-face' | 'interview' | 'about' | 'terms';

// 면접 관상 분석 컴포넌트
function InterviewAnalyzer({ onNavigate }: { onNavigate: (view: AnalysisType) => void }) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');
  const [jobField, setJobField] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const JOB_FIELDS = [
    '일반사무직', 'IT/개발', '영업/마케팅', '금융/회계',
    '교육/강사', '의료/간호', '서비스업', '제조/기술',
    '법무/행정', '언론/방송', '예술/디자인', '기타'
  ];

  // 결제 완료 후 자동 분석 로직
  useEffect(() => {
    const payment = searchParams?.get('payment');
    const service = searchParams?.get('service');
    const tid = searchParams?.get('tid');
    const oid = searchParams?.get('oid');

    if (payment === 'success' && service === 'interview' && tid && oid) {
      // 결제 완료 시 기본값으로 설정하고 자동 분석 시작
      console.log('면접관상 결제 완료 - 자동 분석 시작');

      // 기본값 설정 (더미 이미지와 정보로 바로 분석 시작)
      setGender('male'); // 기본값
      setAge(25); // 기본값
      setJobField('일반사무직'); // 기본값

      // 실제로는 결제 시 저장된 이미지와 정보를 가져와야 하지만
      // 현재는 테스트를 위해 바로 분석 결과 표시
      setTimeout(() => {
        alert('결제가 완료되었습니다! 면접관상 분석을 시작합니다.');
        // 여기서 실제 분석 API를 호출해야 함
        // handleAnalysis();
      }, 1000);
    }
  }, [searchParams]);

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

  const handleAnalysis = async () => {
    if (!uploadedImage || !gender || !age || !jobField) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
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
        setAnalysisResult(result.data);
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

  const handleDownloadPDF = async () => {
    try {
      console.log('PDF 다운로드 시작');

      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `면접관상분석-${gender === 'male' ? '남성' : '여성'}-${age}세-${jobField}-${currentDate}.pdf`;

      // 분석 결과 컨테이너 찾기
      const resultContainer = document.querySelector('.interview-analysis-result-container') ||
                              document.querySelector('[style*="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"]');

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
  };

  // 분석 결과 화면
  if (analysisResult) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        padding: 'clamp(10px, 2vw, 20px)',
        boxSizing: 'border-box'
      }}>
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
          onClick={() => onNavigate('home')}
        >
          ← 홈으로
        </button>

        <div className="interview-analysis-result-container" style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '2px solid #e8f4f8',
          color: '#333333'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.8em' }}>
            면접 관상 분석 결과
          </h2>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '20px'
          }}>
            {/* 종합평가 */}
            {analysisResult.종합평가 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>종합평가</h3>
                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px',
                  fontSize: '1.05em',
                  lineHeight: '1.7'
                }}>
                  <p>{analysisResult.종합평가}</p>
                </div>
              </div>
            )}

            {/* 첫인상 분석 */}
            {analysisResult.첫인상_분석 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>첫인상 분석</h3>
                <div style={{
                  background: '#e8f5e8',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.첫인상_분석}</p>
                </div>
              </div>
            )}

            {/* 신뢰도 평가 */}
            {analysisResult.신뢰도_평가 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>신뢰도 평가</h3>
                <div style={{
                  background: '#e3f2fd',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.신뢰도_평가}</p>
                </div>
              </div>
            )}

            {/* 리더십 잠재력 */}
            {analysisResult.리더십_잠재력 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>리더십 잠재력</h3>
                <div style={{
                  background: 'rgba(255, 193, 7, 0.2)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.리더십_잠재력}</p>
                </div>
              </div>
            )}

            {/* 팀워크 성향 */}
            {analysisResult.팀워크_성향 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>팀워크 성향</h3>
                <div style={{
                  background: '#f3e5f5',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.팀워크_성향}</p>
                </div>
              </div>
            )}

            {/* 스트레스 관리 */}
            {analysisResult.스트레스_관리 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>스트레스 관리</h3>
                <div style={{
                  background: '#ffebee',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.스트레스_관리}</p>
                </div>
              </div>
            )}

            {/* 성장 가능성 */}
            {analysisResult.성장_가능성 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>성장 가능성</h3>
                <div style={{
                  background: 'rgba(0, 188, 212, 0.2)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.성장_가능성}</p>
                </div>
              </div>
            )}

            {/* 강점 분석 */}
            {analysisResult.강점_분석 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>강점 분석</h3>
                <div style={{
                  background: 'rgba(139, 195, 74, 0.2)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.강점_분석}</p>
                </div>
              </div>
            )}

            {/* 보완점 */}
            {analysisResult.보완점 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>보완점</h3>
                <div style={{
                  background: '#fff3e0',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.보완점}</p>
                </div>
              </div>
            )}

            {/* 실전 면접 전략 */}
            {analysisResult.실전_면접_전략 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>실전 면접 전략</h3>
                <div style={{
                  background: 'rgba(103, 58, 183, 0.2)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.실전_면접_전략}</p>
                </div>
              </div>
            )}

            {/* 헤어 스타일링 */}
            {analysisResult.헤어_스타일링 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>헤어 스타일링</h3>
                <div style={{
                  background: 'rgba(233, 30, 99, 0.2)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.헤어_스타일링}</p>
                </div>
              </div>
            )}

            {/* 예상 질문 대비 */}
            {analysisResult.예상_질문_대비 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>예상 질문 대비</h3>
                <div style={{
                  background: 'rgba(96, 125, 139, 0.2)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.예상_질문_대비}</p>
                </div>
              </div>
            )}

            {/* 메이크업 팁 (여성인 경우) */}
            {gender === 'female' && analysisResult.makeupTips && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>면접 메이크업 팁</h3>
                <div style={{
                  background: 'rgba(233, 30, 99, 0.2)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  {Array.isArray(analysisResult.makeupTips) ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {analysisResult.makeupTips.map((tip: string, index: number) => (
                        <li key={index} style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ lineHeight: '1.7' }}>{analysisResult.makeupTips}</p>
                  )}
                </div>
              </div>
            )}

            {/* 직군별 맞춤 조언 */}
            {analysisResult.jobSpecificAdvice && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>{jobField} 면접 맞춤 조언</h3>
                <div style={{
                  background: 'rgba(103, 58, 183, 0.2)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7' }}>{analysisResult.jobSpecificAdvice}</p>
                </div>
              </div>
            )}

            {/* 종합 평가 */}
            {analysisResult.summary && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3em' }}>종합 평가</h3>
                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <p style={{ lineHeight: '1.7', fontSize: '1.05em' }}>{analysisResult.summary}</p>
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
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                color: 'white',
                border: 'none',
                padding: '14px 25px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: 'bold',
                minWidth: '160px',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
              onClick={() => {
                setAnalysisResult(null);
                setUploadedImage(null);
                setImagePreview('');
                setGender('');
                setAge('');
                setJobField('');
              }}
            >
              새로 분석하기
            </button>

            <button
              style={{
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
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
              onClick={handleDownloadPDF}
            >
              PDF 저장
            </button>

            <button
              style={{
                background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                color: 'white',
                border: 'none',
                padding: '14px 25px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: 'bold',
                minWidth: '160px',
                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
              }}
              onClick={() => onNavigate('home')}
            >
              홈으로
            </button>
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
        onClick={() => onNavigate('home')}
      >
        ← 돌아가기
      </button>

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
                <div style={{ fontSize: '3em', marginBottom: '10px' }}>📸</div>
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

        {/* 결제 시작 버튼 */}
        <div style={{ textAlign: 'center' }}>
          <button
            disabled={!uploadedImage || !gender || !age || !jobField}
            style={{
              background: (!uploadedImage || !gender || !age || !jobField)
                ? '#ccc'
                : 'linear-gradient(45deg, #2196f3, #21cbf3)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '1.1em',
              fontWeight: 'bold',
              cursor: (!uploadedImage || !gender || !age || !jobField)
                ? 'not-allowed'
                : 'pointer',
              minWidth: '200px',
              boxShadow: (!uploadedImage || !gender || !age || !jobField)
                ? 'none'
                : '0 4px 15px rgba(33, 150, 243, 0.3)'
            }}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            면접 관상 분석 결제하기 (900원)
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
                  animation: 'spin 1s linear infinite'
                }}
              />
              <h3 style={{ marginBottom: '10px', fontSize: '1.3em' }}>
                면접 관상 분석 진행 중...
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05em' }}>
                면접에서의 인상, 강점, 주의사항을 분석하고 있습니다
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 결제 모달 */}
      <InicisPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        serviceType="interview"
        serviceName="면접 관상 분석"
        amount={900}
        description="AI 기반 면접 관상 분석 서비스"
        onPaymentComplete={(result) => {
          console.log('면접관상 결제 완료:', result);
          setIsPaymentModalOpen(false);

          // 결제 완료 후 분석 시작
          setTimeout(() => {
            handleAnalysis();
          }, 1000);
        }}
        onPaymentError={(error) => {
          console.error('면접관상 결제 실패:', error);
          alert(`결제에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
        }}
      />
    </div>
  );
}

interface GwansangPageContentProps {
  initialView?: string;
}

function GwansangPageContent({ initialView }: GwansangPageContentProps) {
  // 초기 뷰 설정: URL 파라미터가 있으면 사용, 없으면 'home'
  const getInitialView = (): AnalysisType => {
    if (initialView && ['face', 'face-saju', 'mbti-face', 'interview'].includes(initialView)) {
      return initialView as AnalysisType;
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState<AnalysisType>(getInitialView());
  const searchParams = useSearchParams();

  useEffect(() => {
    const view = searchParams?.get('view');
    const payment = searchParams?.get('payment');
    const service = searchParams?.get('service');

    // 결제 완료 시 해당 서비스로 이동하고 자동 분석 시작 알림
    if (payment === 'success' && service) {
      // 서비스 타입에 따라 적절한 뷰로 설정
      if (service.includes('mbti')) {
        setCurrentView('mbti-face');
      } else if (service.includes('saju')) {
        setCurrentView('face-saju');
      } else if (service.includes('interview')) {
        setCurrentView('interview');
      } else if (service.includes('professional-physiognomy')) {
        setCurrentView('face');
      }

      // 결제 완료 메시지 표시
      setTimeout(() => {
        alert('결제가 완료되었습니다! 자동으로 분석이 시작됩니다.');
      }, 1000);
    } else if (payment === 'failed') {
      alert('결제에 실패했습니다. 다시 시도해주세요.');
    } else if (payment === 'error') {
      alert('결제 처리 중 오류가 발생했습니다.');
    }

    if (view && ['face', 'face-saju', 'mbti-face', 'interview'].includes(view)) {
      setCurrentView(view as AnalysisType);
    }
  }, [searchParams]);

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
              padding: '10px 16px 5px'
            }}>
              <h1 style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                marginBottom: '4px',
                color: '#5e2b97',
                textAlign: 'center',
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}>내 얼굴 탐구생활</h1>
              <p style={{
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                color: '#666',
                textAlign: 'center',
                marginBottom: '5px',
                lineHeight: '1.4',
                padding: '0 16px'
              }}>AI가 알려주는 나의 얼굴 속<br className="mobile-break" /> 성향, 운명, 그리고 궁합까지</p>
            </header>

            <section style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '10px',
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
              onClick={() => window.location.href = '/gwansang/mbti-purchase'}
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
                }}>MBTI × 관상 분석</h3>
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
                      fontWeight: 'bold'
                    }}
                  >
                    ✨ 바로 분석하기 ✨
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
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/gwansang/saju-purchase'}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}>
                <h3 style={{
                  color: '#ff6b6b',
                  marginBottom: '12px',
                  fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                  lineHeight: '1.3'
                }}>관상 × 사주 분석</h3>
                <p style={{
                  lineHeight: '1.5',
                  color: '#555',
                  marginBottom: '16px',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                }}>얼굴 관상과 사주를 함께 본 완벽한 운명 분석</p>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <div
                    style={{
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 24px)',
                      borderRadius: '25px',
                      fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-block',
                      fontWeight: 'bold'
                    }}
                  >
                    🌟 바로 분석하기 🌟
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
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/gwansang/interview-purchase'}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}>
                <h3 style={{
                  color: '#4caf50',
                  marginBottom: '12px',
                  fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                  lineHeight: '1.3'
                }}>면접 관상 분석</h3>
                <p style={{
                  lineHeight: '1.5',
                  color: '#555',
                  marginBottom: '16px',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                }}>면접관이 보는 당신의 첫인상과 개선점을 분석</p>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <div
                    style={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 24px)',
                      borderRadius: '25px',
                      fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-block',
                      fontWeight: 'bold'
                    }}
                  >
                    💼 바로 분석하기 💼
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
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/gwansang/original-purchase'}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}>
                <h3 style={{
                  color: '#ff9800',
                  marginBottom: '12px',
                  fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                  lineHeight: '1.3'
                }}>정통 관상 분석</h3>
                <p style={{
                  lineHeight: '1.5',
                  color: '#555',
                  marginBottom: '16px',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                }}>전통 관상학 기반 얼굴 분석과 미래 운세</p>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <div
                    style={{
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 24px)',
                      borderRadius: '25px',
                      fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-block',
                      fontWeight: 'bold'
                    }}
                  >
                    👑 바로 분석하기 👑
                  </div>
                </div>
              </div>
            </section>

            <div style={{
              textAlign: 'center',
              padding: '20px 16px 40px',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              marginTop: '20px',
              background: 'rgba(255,255,255,0.7)'
            }}>
              <div style={{
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                <h3 style={{
                  color: '#5e2b97',
                  marginBottom: '16px',
                  fontSize: 'clamp(1.1rem, 4vw, 1.3rem)'
                }}>🔮 특별한 기능들</h3>
                <div style={{ textAlign: 'left', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', lineHeight: '1.6' }}>
                  <p style={{ margin: '8px 0', color: '#666' }}>✨ <strong>AI 정밀 분석:</strong> 최신 AI 기술로 정확한 관상 분석</p>
                  <p style={{ margin: '8px 0', color: '#666' }}>💖 <strong>연애 운세:</strong> 이상형, 연애 스타일, 궁합 분석</p>
                  <p style={{ margin: '8px 0', color: '#666' }}>💼 <strong>취업 운세:</strong> 적성, 진로, 면접 성공 전략</p>
                  <p style={{ margin: '8px 0', color: '#666' }}>📚 <strong>학업 운세:</strong> 학습 스타일, 집중력, 성취도</p>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'face' && (
          <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>}>
            <FaceAnalyzer />
          </Suspense>
        )}

        {currentView === 'face-saju' && (
          <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>관상+사주 로딩 중...</div>}>
            <FaceSajuAnalyzer />
          </Suspense>
        )}

        {currentView === 'mbti-face' && (
          <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>MBTI 분석 로딩 중...</div>}>
            <MBTIAnalyzer />
          </Suspense>
        )}

        {currentView === 'interview' && (
          <InterviewAnalyzer onNavigate={setCurrentView} />
        )}

        {/* 광고 배너 - 홈에서만 표시 */}
        {currentView === 'home' && (
          <div style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            zIndex: 1000,
            background: '#fff',
            borderTop: '1px solid #e0e0e0'
          }}>
            <AdBanner position="bottom" />
          </div>
        )}
      </div>

      <style jsx global>{`
        .mobile-break {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-break {
            display: block;
          }
        }
      `}</style>
    </>
  );
}

export default function GwansangPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>페이지 로딩 중...</div>}>
      <GwansangPageContent />
    </Suspense>
  );
}