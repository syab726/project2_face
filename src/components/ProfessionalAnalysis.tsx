'use client';

import { useState, useRef } from 'react';

export function ProfessionalAnalysis() {
  const [step, setStep] = useState<'upload' | 'birth' | 'payment' | 'analyzing' | 'result'>('upload');
  const [uploadedImages, setUploadedImages] = useState<{
    face: File | null;
    palm: File | null;
  }>({ face: null, palm: null });
  const [imagePreviews, setImagePreviews] = useState<{
    face: string;
    palm: string;
  }>({ face: '', palm: '' });
  const [birthData, setBirthData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    gender: ''
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const faceInputRef = useRef<HTMLInputElement>(null);
  const palmInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (type: 'face' | 'palm', event: React.ChangeEvent<HTMLInputElement>) => {
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

      setUploadedImages(prev => ({ ...prev, [type]: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({ ...prev, [type]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = () => {
    setStep('analyzing');
    setIsAnalyzing(true);
    
    // 실제 분석 수행
    performCompleteAnalysis();
  };

  const performCompleteAnalysis = async () => {
    try {
      const formData = new FormData();
      
      if (uploadedImages.face) {
        formData.append('faceImage', uploadedImages.face);
      }
      
      if (uploadedImages.palm) {
        formData.append('palmImage', uploadedImages.palm);
      }
      
      if (birthData.year && birthData.month && birthData.day && birthData.hour && birthData.gender) {
        formData.append('birthData', JSON.stringify({
          year: parseInt(birthData.year),
          month: parseInt(birthData.month),
          day: parseInt(birthData.day),
          hour: parseInt(birthData.hour),
          gender: birthData.gender
        }));
      }
      
      const response = await fetch('/api/analysis/complete', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAnalysisResult(result.data);
        setStep('result');
      } else {
        alert('분석 중 오류가 발생했습니다: ' + result.error?.message);
        setStep('payment');
      }
    } catch (error) {
      console.error('Complete analysis error:', error);
      alert('분석 중 오류가 발생했습니다.');
      setStep('payment');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (step === 'result' && analysisResult) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          padding: '30px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#4caf50', marginBottom: '30px', textAlign: 'center' }}>
            🔮 전문가형 운명 분석 완료
          </h2>
          
          {/* 얼굴 관상 분석 */}
          {analysisResult.faceAnalysis && (
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9ff', borderRadius: '15px' }}>
              <h3 style={{ color: '#7c4dff', marginBottom: '15px' }}>👤 얼굴 관상 분석</h3>
              <div style={{ lineHeight: '1.8' }}>
                <p><strong>얼굴형:</strong> {
                  typeof analysisResult.faceAnalysis.features?.faceShape === 'object' 
                    ? analysisResult.faceAnalysis.features?.faceShape?.basicShape || '타원형'
                    : analysisResult.faceAnalysis.features?.faceShape || '타원형'
                }</p>
                <p><strong>성격 특징:</strong> {analysisResult.faceAnalysis.personality?.traits?.join(', ')}</p>
                <p><strong>직업운:</strong> {analysisResult.faceAnalysis.fortune?.career}</p>
                <p><strong>애정운:</strong> {analysisResult.faceAnalysis.fortune?.love}</p>
              </div>
            </div>
          )}

          {/* 손금 분석 */}
          {analysisResult.palmAnalysis && (
            <div style={{ marginBottom: '30px', padding: '20px', background: '#fff5f5', borderRadius: '15px' }}>
              <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>✋ 손금 분석</h3>
              <div style={{ lineHeight: '1.8' }}>
                <p><strong>생명선:</strong> {analysisResult.palmAnalysis.lines?.lifeLine?.description}</p>
                <p><strong>감정선:</strong> {analysisResult.palmAnalysis.lines?.heartLine?.description}</p>
                <p><strong>지능선:</strong> {analysisResult.palmAnalysis.lines?.headLine?.description}</p>
                <p><strong>재능:</strong> {analysisResult.palmAnalysis.personality?.talents?.join(', ')}</p>
              </div>
            </div>
          )}

          {/* 사주 분석 */}
          {analysisResult.sajuAnalysis && (
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f0fff4', borderRadius: '15px' }}>
              <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>📅 사주팔자 분석</h3>
              <div style={{ lineHeight: '1.8' }}>
                <p><strong>사주:</strong> {analysisResult.sajuAnalysis.basic?.year} - {analysisResult.sajuAnalysis.basic?.month} - {analysisResult.sajuAnalysis.basic?.day} - {analysisResult.sajuAnalysis.basic?.time}</p>
                <p><strong>주원소:</strong> {analysisResult.sajuAnalysis.elements?.primary}</p>
                <p><strong>올해 운세:</strong> {analysisResult.sajuAnalysis.fortune?.thisYear}</p>
                <p><strong>조언:</strong> {analysisResult.sajuAnalysis.advice?.join(', ')}</p>
              </div>
            </div>
          )}

          {/* 종합 분석 */}
          <div style={{ marginBottom: '30px', padding: '20px', background: '#fff9c4', borderRadius: '15px' }}>
            <h3 style={{ color: '#f57f17', marginBottom: '15px' }}>⭐ 종합 운명 분석</h3>
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>분석 항목:</strong> {analysisResult.analysisInfo?.types?.join(', ')}</p>
              <p><strong>사용된 AI:</strong> {Object.values(analysisResult.analysisInfo?.processingEngines || {}).join(', ')}</p>
              <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#666' }}>
                전문가형 종합 분석으로 당신의 과거, 현재, 미래를 깊이 있게 탐구했습니다. 
                각 분야의 AI 전문가들이 협력하여 최고 품질의 분석을 제공합니다.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              style={{
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1em',
                marginRight: '10px'
              }}
              onClick={() => {
                setStep('upload');
                setUploadedImages({ face: null, palm: null });
                setImagePreviews({ face: '', palm: '' });
                setBirthData({ year: '', month: '', day: '', hour: '', gender: '' });
                setAnalysisResult(null);
              }}
            >
              새로운 분석하기
            </button>
            
            <button 
              style={{
                background: '#7c4dff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1em'
              }}
              onClick={() => alert('PDF 저장 기능은 곧 추가됩니다!')}
            >
              PDF로 저장하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          padding: '40px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#4caf50', marginBottom: '30px' }}>
            🔮 전문가형 운명 분석 중...
          </h2>
          
          <div style={{ 
            width: '100px', 
            height: '100px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4caf50',
            borderRadius: '50%',
            margin: '30px auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          
          <div style={{ marginTop: '20px', lineHeight: '1.8', color: '#666' }}>
            <p>🔍 이미지 특징 추출 중...</p>
            <p>🤖 AI 관상 분석 중...</p>
            <p>✋ 손금선 패턴 분석 중...</p>
            <p>📅 사주팔자 계산 중...</p>
            <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
              최고 품질의 종합 분석을 위해 최대 1분이 소요됩니다...
            </p>
          </div>
          
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    const analysisTypes = [];
    if (uploadedImages.face) analysisTypes.push('얼굴 관상');
    if (uploadedImages.palm) analysisTypes.push('손금');
    if (birthData.year && birthData.month && birthData.day && birthData.hour && birthData.gender) {
      analysisTypes.push('사주팔자');
    }

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          padding: '30px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#4caf50', marginBottom: '20px', textAlign: 'center' }}>
            💳 전문가 분석 시작하기
          </h2>
          
          <div style={{ 
            background: '#f0fff4', 
            padding: '20px', 
            borderRadius: '10px', 
            marginBottom: '25px' 
          }}>
            <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>분석 내역</h3>
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>분석 항목:</strong> {analysisTypes.join(' + ')}</p>
              <p><strong>분석 엔진:</strong> Gemini 2.0 + GPT-4o + Fine-tuned AI</p>
              <p><strong>예상 소요시간:</strong> 최대 1분</p>
              <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
              <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#4caf50' }}>
                <strong>총 금액: 19,900원</strong>
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button 
              style={{
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1.1em',
                fontWeight: 'bold',
                width: '100%',
                marginBottom: '15px',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
              onClick={handlePayment}
            >
              🔮 전문가 분석 시작하기
            </button>
            
            <button 
              style={{
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
              onClick={() => setStep('birth')}
            >
              뒤로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'birth') {
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
            color: '#4caf50', 
            marginBottom: '30px' 
          }}>
            📅 생년월일시 입력 (선택사항)
          </h2>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>
              생년월일시를 입력하시면 사주팔자 분석이 포함됩니다
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <input
                type="number"
                placeholder="년도 (예: 1990)"
                value={birthData.year}
                onChange={(e) => setBirthData({...birthData, year: e.target.value})}
                style={{
                  padding: '12px 15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1em'
                }}
              />
              <input
                type="number"
                placeholder="월 (1-12)"
                min="1"
                max="12"
                value={birthData.month}
                onChange={(e) => setBirthData({...birthData, month: e.target.value})}
                style={{
                  padding: '12px 15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1em'
                }}
              />
              <input
                type="number"
                placeholder="일 (1-31)"
                min="1"
                max="31"
                value={birthData.day}
                onChange={(e) => setBirthData({...birthData, day: e.target.value})}
                style={{
                  padding: '12px 15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1em'
                }}
              />
              <input
                type="number"
                placeholder="시간 (0-23)"
                min="0"
                max="23"
                value={birthData.hour}
                onChange={(e) => setBirthData({...birthData, hour: e.target.value})}
                style={{
                  padding: '12px 15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1em'
                }}
              />
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

          <div style={{ textAlign: 'center' }}>
            <button
              style={{
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '30px',
                fontSize: '1.1em',
                fontWeight: 'bold',
                cursor: 'pointer',
                minWidth: '200px',
                marginRight: '15px',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
              onClick={() => setStep('payment')}
            >
              다음 단계로
            </button>
            
            <button
              style={{
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '30px',
                fontSize: '1em',
                cursor: 'pointer'
              }}
              onClick={() => setStep('upload')}
            >
              이전 단계로
            </button>
            
            <p style={{ 
              marginTop: '15px', 
              color: '#666', 
              fontSize: '0.9em' 
            }}>
              사주팔자 분석을 원하지 않으시면 생년월일시를 비워두고 다음 단계로 진행하세요.
            </p>
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
          color: '#4caf50', 
          marginBottom: '30px' 
        }}>
          🔮 전문가형 운명 분석
        </h2>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>
            1. 얼굴 사진 업로드 (필수)
          </h3>
          
          <input
            type="file"
            ref={faceInputRef}
            onChange={(e) => handleImageUpload('face', e)}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: 'none' }}
          />
          
          <div style={{ textAlign: 'center' }}>
            {imagePreviews.face ? (
              <div style={{ marginBottom: '15px' }}>
                <img 
                  src={imagePreviews.face} 
                  alt="얼굴 사진"
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '15px',
                    border: '3px solid #4caf50'
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  border: '2px dashed #ccc',
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 15px',
                  cursor: 'pointer',
                  background: '#f9f9f9'
                }}
                onClick={() => faceInputRef.current?.click()}
              >
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '2em', marginBottom: '5px' }}>👤</div>
                  <div style={{ fontSize: '0.9em' }}>얼굴 사진 선택</div>
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
              onClick={() => faceInputRef.current?.click()}
            >
              {uploadedImages.face ? '다른 사진 선택' : '사진 업로드'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>
            2. 손금 사진 업로드 (선택사항)
          </h3>
          
          <input
            type="file"
            ref={palmInputRef}
            onChange={(e) => handleImageUpload('palm', e)}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: 'none' }}
          />
          
          <div style={{ textAlign: 'center' }}>
            {imagePreviews.palm ? (
              <div style={{ marginBottom: '15px' }}>
                <img 
                  src={imagePreviews.palm} 
                  alt="손금 사진"
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '15px',
                    border: '3px solid #ff6b6b'
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  border: '2px dashed #ccc',
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 15px',
                  cursor: 'pointer',
                  background: '#f9f9f9'
                }}
                onClick={() => palmInputRef.current?.click()}
              >
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '2em', marginBottom: '5px' }}>✋</div>
                  <div style={{ fontSize: '0.9em' }}>손금 사진 선택</div>
                </div>
              </div>
            )}
            
            <button
              style={{
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
              onClick={() => palmInputRef.current?.click()}
            >
              {uploadedImages.palm ? '다른 사진 선택' : '손금 사진 업로드'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            disabled={!uploadedImages.face}
            style={{
              background: !uploadedImages.face 
                ? '#ccc' 
                : 'linear-gradient(45deg, #4caf50, #66bb6a)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '1.1em',
              fontWeight: 'bold',
              cursor: !uploadedImages.face 
                ? 'not-allowed' 
                : 'pointer',
              minWidth: '200px',
              boxShadow: !uploadedImages.face 
                ? 'none' 
                : '0 4px 15px rgba(76, 175, 80, 0.3)'
            }}
            onClick={() => setStep('birth')}
          >
            다음 단계로
          </button>
          
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '0.9em' 
          }}>
            • 얼굴 사진은 필수이며, 손금 사진과 생년월일시는 선택사항입니다<br/>
            • 더 많은 정보를 제공할수록 정확한 분석이 가능합니다
          </p>
        </div>
      </div>
    </div>
  );
}