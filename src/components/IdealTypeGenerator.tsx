'use client';

import { useState, useRef } from 'react';

interface IdealTypeResult {
  description: string;
  imageUrl: string | null;
  characteristics: string[];
  compatibility: {
    score: number;
    explanation: string;
  };
}

export function IdealTypeGenerator() {
  const [step, setStep] = useState<'info' | 'faceUpload' | 'payment' | 'generating' | 'result'>('info');
  const [preferences, setPreferences] = useState({
    gender: '',
    ageRange: '',
    style: '',
    mbti: ''
  });
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [idealTypeResult, setIdealTypeResult] = useState<IdealTypeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePayment = async () => {
    if (!preferences.mbti) {
      setError('MBTI를 먼저 선택해주세요.');
      return;
    }

    if (!preferences.gender || !preferences.ageRange) {
      setError('성별과 나이대를 선택해주세요.');
      return;
    }

    setStep('generating');
    setIsLoading(true);
    setError(null);

    try {
      console.log('=== 이상형 생성 시작 ===');
      console.log('선호도:', preferences);
      console.log('API로 전달될 성별:', preferences.gender);

      // 나이를 숫자로 변환
      const ageNumber = preferences.ageRange === '20-25' ? 23 : 
                       preferences.ageRange === '26-30' ? 28 : 
                       preferences.ageRange === '31-35' ? 33 : 25;

      // ideal-type-face API 직접 호출
      const idealTypeResponse = await fetch('/api/analysis/ideal-type-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mbtiType: preferences.mbti,
          age: ageNumber,
          preferredGender: preferences.gender, // '남성' 또는 '여성' 직접 전달
          faceAnalysis: {
            personality: {
              traits: [`${preferences.mbti} 타입의 매력적인 특성`, '조화로운 성격'],
              socialStyle: '사교적이고 협력적'
            }
          }
        }),
      });

      if (!idealTypeResponse.ok) {
        throw new Error('이상형 생성에 실패했습니다.');
      }

      const idealTypeData = await idealTypeResponse.json();
      
      if (!idealTypeData.success) {
        throw new Error(idealTypeData.error?.message || '이상형 생성에 실패했습니다.');
      }

      console.log('=== 이상형 생성 성공 ===');
      console.log('결과:', idealTypeData.data);

      // 결과를 IdealTypeResult 형식으로 변환
      const convertedResult = {
        description: `${preferences.mbti} 성격에 맞는 이상형이 생성되었습니다!`,
        imageUrl: idealTypeData.data.imageUrl,
        characteristics: [
          `${preferences.mbti} 타입과 잘 맞는 성격`,
          '매력적인 외모',
          '조화로운 관계',
          '긍정적인 에너지'
        ],
        compatibility: {
          score: 88,
          explanation: `${preferences.mbti} 성격과 ${preferences.gender}의 조합으로 훌륭한 궁합을 보여줍니다.`
        }
      };

      setIdealTypeResult(convertedResult);
      setStep('result');

    } catch (error) {
      console.error('이상형 생성 오류:', error);
      setError(error instanceof Error ? error.message : '이상형 생성 중 오류가 발생했습니다.');
      setStep('payment'); // 결제 화면으로 돌아가기
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      
      // 파일 크기 확인 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      
      setFaceImage(file);
      setError(null);
    }
  };

  if (step === 'result') {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          padding: '30px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff6b6b', marginBottom: '20px' }}>
            당신의 이상형이 완성되었어요!
          </h2>
          
          {/* 실제 생성된 이미지 또는 플레이스홀더 */}
          <div style={{ 
            width: '300px', 
            height: '300px', 
            borderRadius: '15px',
            margin: '20px auto',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {idealTypeResult?.imageUrl ? (
              <img 
                src={idealTypeResult.imageUrl} 
                alt="생성된 이상형 이미지"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '15px'
                }}
                onError={(e) => {
                  // 이미지 로드 실패 시 플레이스홀더 표시
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div style="
                        width: 100%; 
                        height: 100%; 
                        background: linear-gradient(45deg, #ff9a9e, #fecfef);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 4em;
                        border-radius: 15px;
                      ">🎨</div>
                    `;
                  }
                }}
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                background: 'linear-gradient(45deg, #ff9a9e, #fecfef)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4em'
              }}>
                🎨
              </div>
            )}
          </div>
          
          {/* 이상형 설명 */}
          {idealTypeResult?.description && (
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '10px', 
              margin: '20px 0',
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#ff6b6b', marginBottom: '10px' }}>이상형 분석 결과</h3>
              <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {idealTypeResult.description}
              </p>
            </div>
          )}

          {/* 매력 포인트 */}
          {idealTypeResult?.characteristics && idealTypeResult.characteristics.length > 0 && (
            <div style={{ margin: '20px 0' }}>
              <h4 style={{ color: '#ff6b6b', marginBottom: '10px' }}>매력 포인트</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {idealTypeResult.characteristics.map((trait, index) => (
                  <span 
                    key={index}
                    style={{
                      background: '#fff5f5',
                      color: '#ff6b6b',
                      padding: '6px 12px',
                      borderRadius: '15px',
                      fontSize: '0.9em',
                      border: '1px solid #ffebeb'
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 궁합 점수 */}
          {idealTypeResult?.compatibility && (
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '15px', 
              borderRadius: '10px', 
              margin: '20px 0' 
            }}>
              <h4 style={{ color: '#28a745', marginBottom: '10px' }}>
                궁합 점수: {idealTypeResult.compatibility.score}점
              </h4>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                {idealTypeResult.compatibility.explanation}
              </p>
            </div>
          )}
          
          <p style={{ marginBottom: '20px', lineHeight: '1.6', color: '#666' }}>
            <strong>성별:</strong> {preferences.gender} | 
            <strong>연령대:</strong> {preferences.ageRange} | 
            <strong>스타일:</strong> {preferences.style} | 
            <strong>MBTI:</strong> {preferences.mbti}
          </p>
          
          <button 
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1em',
              marginRight: '10px'
            }}
            onClick={() => {
              setStep('info');
              setPreferences({ gender: '', ageRange: '', style: '', mbti: '' });
              setFaceImage(null);
              setIdealTypeResult(null);
              setError(null);
            }}
          >
            다른 이상형 만들기
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
            onClick={() => {
              if (idealTypeResult?.imageUrl) {
                // 이미지 다운로드 로직
                const link = document.createElement('a');
                link.href = idealTypeResult.imageUrl;
                link.download = `이상형_${new Date().getTime()}.jpg`;
                link.click();
              } else {
                alert('다운로드할 이미지가 없습니다.');
              }
            }}
          >
            이미지 저장하기
          </button>
        </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          padding: '40px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff6b6b', marginBottom: '30px' }}>
            🎨 이상형 얼굴 생성 중...
          </h2>
          
          <div style={{ 
            width: '100px', 
            height: '100px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #ff6b6b',
            borderRadius: '50%',
            margin: '30px auto'
          }}></div>
          
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            AI가 당신의 취향에 맞는 완벽한 이상형을 그리고 있습니다...<br/>
            잠시만 기다려주세요 (최대 1분 소요)
          </p>
        </div>
      </div>
    );
  }

  if (step === 'faceUpload') {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          padding: '30px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#ff6b6b', marginBottom: '20px', textAlign: 'center' }}>
            📸 얼굴 사진 업로드
          </h2>
          
          <p style={{ textAlign: 'center', marginBottom: '25px', color: '#666' }}>
            관상 분석을 위한 얼굴 사진을 업로드해주세요.<br/>
            정확한 분석을 위해 정면 얼굴이 잘 보이는 사진을 선택해주세요.
          </p>

          {error && (
            <div style={{ 
              background: '#ffebee', 
              color: '#c62828', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ 
            border: '2px dashed #ff6b6b', 
            borderRadius: '15px', 
            padding: '40px', 
            textAlign: 'center',
            backgroundColor: faceImage ? '#fff5f5' : '#fafafa',
            marginBottom: '25px',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
          >
            {faceImage ? (
              <div>
                <div style={{ fontSize: '3em', marginBottom: '10px' }}>✅</div>
                <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  {faceImage.name}
                </p>
                <p style={{ color: '#666', fontSize: '0.9em' }}>
                  파일 크기: {(faceImage.size / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '3em', marginBottom: '10px' }}>📷</div>
                <p style={{ color: '#ff6b6b', fontWeight: 'bold', marginBottom: '10px' }}>
                  여기를 클릭하여 사진을 업로드하세요
                </p>
                <p style={{ color: '#666', fontSize: '0.9em' }}>
                  JPG, PNG 파일 (최대 10MB)
                </p>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          <div style={{ textAlign: 'center' }}>
            <button 
              style={{
                background: faceImage ? 'linear-gradient(45deg, #ff6b6b, #ff8e53)' : '#ccc',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '25px',
                cursor: faceImage ? 'pointer' : 'not-allowed',
                fontSize: '1.1em',
                fontWeight: 'bold',
                marginRight: '15px'
              }}
              disabled={!faceImage}
              onClick={() => setStep('payment')}
            >
              다음 단계 (결제)
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
              onClick={() => setStep('info')}
            >
              뒤로 가기
            </button>
          </div>

          <div style={{ 
            marginTop: '25px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '10px',
            fontSize: '0.9em',
            color: '#666'
          }}>
            <h4 style={{ marginBottom: '10px', color: '#ff6b6b' }}>사진 업로드 가이드</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>정면을 바라보는 얼굴 사진</li>
              <li>얼굴이 선명하게 보이는 사진</li>
              <li>조명이 밝고 그림자가 적은 사진</li>
              <li>모자, 선글라스 등을 착용하지 않은 사진</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          padding: '30px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#ff6b6b', marginBottom: '20px', textAlign: 'center' }}>
            💳 결제하고 이상형 만나기
          </h2>
          
          <div style={{ 
            background: '#fff5f5', 
            padding: '20px', 
            borderRadius: '10px', 
            marginBottom: '25px' 
          }}>
            <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>주문 내역</h3>
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>상품:</strong> AI 이상형 얼굴 생성</p>
              <p><strong>업로드된 사진:</strong> {faceImage?.name || '사진 없음'}</p>
              <p><strong>성별:</strong> {preferences.gender}</p>
              <p><strong>연령대:</strong> {preferences.ageRange}</p>
              <p><strong>스타일:</strong> {preferences.style}</p>
              <p><strong>MBTI:</strong> {preferences.mbti}</p>
              <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #eee' }} />
              <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ff6b6b' }}>
                <strong>총 금액: 9,900원</strong>
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button 
              style={{
                background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1.1em',
                fontWeight: 'bold',
                width: '100%',
                marginBottom: '15px'
              }}
              onClick={handlePayment}
            >
              💳 카드로 결제하기
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
              onClick={() => setStep('faceUpload')}
            >
              뒤로 가기
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
          color: '#ff6b6b', 
          marginBottom: '30px' 
        }}>
          💘 AI 이상형 얼굴 생성
        </h2>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>
            1. 이상형의 성별을 선택해주세요
          </h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            {['남성', '여성'].map((gender) => (
              <button
                key={gender}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: preferences.gender === gender ? '2px solid #ff6b6b' : '2px solid #e0e0e0',
                  borderRadius: '10px',
                  background: preferences.gender === gender ? '#fff5f5' : '#fff',
                  cursor: 'pointer',
                  fontSize: '1em',
                  fontWeight: preferences.gender === gender ? 'bold' : 'normal',
                  color: preferences.gender === gender ? '#ff6b6b' : '#333'
                }}
                onClick={() => setPreferences({...preferences, gender})}
              >
                {gender === '남성' ? '👨 남성' : '👩 여성'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>
            2. 선호하는 연령대를 선택해주세요
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {['20대 초반', '20대 후반', '30대 초반', '30대 후반'].map((age) => (
              <button
                key={age}
                style={{
                  padding: '12px',
                  border: preferences.ageRange === age ? '2px solid #ff6b6b' : '2px solid #e0e0e0',
                  borderRadius: '10px',
                  background: preferences.ageRange === age ? '#fff5f5' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontWeight: preferences.ageRange === age ? 'bold' : 'normal',
                  color: preferences.ageRange === age ? '#ff6b6b' : '#333'
                }}
                onClick={() => setPreferences({...preferences, ageRange: age})}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>
            3. 선호하는 스타일을 선택해주세요
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {['귀여운 스타일', '시크한 스타일', '자연스러운 스타일', '섹시한 스타일'].map((style) => (
              <button
                key={style}
                style={{
                  padding: '12px',
                  border: preferences.style === style ? '2px solid #ff6b6b' : '2px solid #e0e0e0',
                  borderRadius: '10px',
                  background: preferences.style === style ? '#fff5f5' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontWeight: preferences.style === style ? 'bold' : 'normal',
                  color: preferences.style === style ? '#ff6b6b' : '#333'
                }}
                onClick={() => setPreferences({...preferences, style})}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>
            4. 당신의 MBTI를 선택해주세요
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map((mbti) => (
              <button
                key={mbti}
                style={{
                  padding: '10px 8px',
                  border: preferences.mbti === mbti ? '2px solid #ff6b6b' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: preferences.mbti === mbti ? '#fff5f5' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8em',
                  fontWeight: preferences.mbti === mbti ? 'bold' : 'normal',
                  color: preferences.mbti === mbti ? '#ff6b6b' : '#333'
                }}
                onClick={() => setPreferences({...preferences, mbti})}
              >
                {mbti}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            disabled={!preferences.gender || !preferences.ageRange || !preferences.style || !preferences.mbti}
            style={{
              background: (!preferences.gender || !preferences.ageRange || !preferences.style || !preferences.mbti) 
                ? '#ccc' 
                : 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '1.1em',
              fontWeight: 'bold',
              cursor: (!preferences.gender || !preferences.ageRange || !preferences.style || !preferences.mbti) 
                ? 'not-allowed' 
                : 'pointer',
              minWidth: '200px',
              boxShadow: (!preferences.gender || !preferences.ageRange || !preferences.style || !preferences.mbti) 
                ? 'none' 
                : '0 4px 15px rgba(255, 107, 107, 0.3)'
            }}
            onClick={() => setStep('payment')}
          >
            💖 이상형 생성하기 (9,900원)
          </button>
          
          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '0.9em' 
          }}>
            • 고품질 AI 이미지 생성<br/>
            • 무제한 재생성 가능<br/>
            • 이미지 다운로드 제공
          </p>
        </div>
      </div>
    </div>
  );
}