'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAnalysisResult, CATEGORIES } from '@/data/freeAnalysisMapping';
import { loadModels, detectFace, createImageElement } from '@/lib/faceAnalysis';

interface FreeTestAnalyzerProps {
  category: 'luxury' | 'car' | 'city' | 'job' | 'food';
}

export default function FreeTestAnalyzer({ category }: FreeTestAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryInfo = CATEGORIES[category];

  useEffect(() => {
    // 컴포넌트 마운트 시 모델 미리 로드
    loadModels()
      .then(() => setModelsLoaded(true))
      .catch((err) => console.error('모델 로드 실패:', err));
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('파일 업로드 이벤트');
    const file = event.target.files?.[0];
    if (file) {
      console.log('파일 선택됨:', file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResult(null);
        console.log('이미지 설정 완료');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      // 이미지 엘리먼트 생성
      const img = await createImageElement(selectedImage);

      // 얼굴 감지 및 랜드마크 추출
      const detection = await detectFace(img);

      if (!detection) {
        throw new Error('얼굴을 찾을 수 없습니다. 정면 사진을 사용해주세요.');
      }

      // 디버깅 완료 - landmarks 구조가 올바르게 처리되고 있음

      // API로 얼굴 분석 요청
      const response = await fetch('/api/analysis/free-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: selectedImage,
          landmarks: detection.landmarks
        }),
      });

      if (!response.ok) {
        throw new Error('분석 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      const analysisResult = getAnalysisResult(data.featureIndex, category);

      setResult(analysisResult);
    } catch (error: any) {
      console.error('분석 중 오류 발생:', error);
      setError(error.message || '얼굴 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    // Reset input by accessing DOM element directly
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleShare = (platform: string) => {
    const shareText = `내게 어울리는 ${categoryInfo.title.replace('내게 어울리는 ', '')}는 "${result}"! 🎉 AI 얼굴 분석으로 알아본 결과예요!`;
    const shareUrl = `${window.location.origin}/free-test/${category}`;
    const fullShareMessage = `${shareText} ${shareUrl}`;

    // 모바일 환경 감지
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    switch (platform) {
      case 'kakao':
        // 카카오톡 공유 (카카오스토리 아님)
        if (typeof window !== 'undefined' && (window as any).Kakao) {
          (window as any).Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: `${categoryInfo.title} 결과`,
              description: shareText,
              imageUrl: 'https://via.placeholder.com/400x400?text=Face+Analysis',
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
            buttons: [
              {
                title: '나도 테스트하기',
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
            ],
          });
        } else if (isMobile) {
          // 모바일에서 카카오톡 앱으로 직접 연결 시도
          const kakaoUrl = `kakaotalk://msg?text=${encodeURIComponent(fullShareMessage)}`;
          const fallbackUrl = `https://sharer.kakao.com/talk/friends/?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

          try {
            window.location.href = kakaoUrl;
            // 2초 후에도 페이지가 그대로면 웹 공유로 대체
            setTimeout(() => {
              window.open(fallbackUrl, '_blank');
            }, 2000);
          } catch (e) {
            window.open(fallbackUrl, '_blank');
          }
        } else {
          // 데스크톱에서는 텍스트 복사
          navigator.clipboard.writeText(fullShareMessage).then(() => {
            alert('텍스트가 복사되었습니다! 카카오톡에서 붙여넣기 해주세요.');
          });
        }
        break;
      case 'facebook':
        if (isMobile) {
          // 모바일에서 페이스북 앱으로 직접 연결
          const fbUrl = `fb://share?link=${encodeURIComponent(shareUrl)}`;
          const fallbackUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;

          try {
            window.location.href = fbUrl;
            setTimeout(() => {
              window.open(fallbackUrl, '_blank');
            }, 2000);
          } catch (e) {
            window.open(fallbackUrl, '_blank');
          }
        } else {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        }
        break;
      case 'twitter':
        if (isMobile) {
          // 모바일에서 트위터 앱으로 직접 연결
          const twitterUrl = `twitter://post?message=${encodeURIComponent(fullShareMessage)}`;
          const fallbackUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

          try {
            window.location.href = twitterUrl;
            setTimeout(() => {
              window.open(fallbackUrl, '_blank');
            }, 2000);
          } catch (e) {
            window.open(fallbackUrl, '_blank');
          }
        } else {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        }
        break;
      case 'instagram':
        if (isMobile) {
          // 모바일에서 인스타그램 앱으로 연결 시도 (텍스트는 복사)
          navigator.clipboard.writeText(fullShareMessage).then(() => {
            alert('텍스트가 복사되었습니다! 인스타그램 앱에서 붙여넣기 해주세요.');
            try {
              window.location.href = 'instagram://camera';
            } catch (e) {
              // 앱이 없으면 아무것도 하지 않음
            }
          });
        } else {
          // 데스크톱에서는 텍스트만 복사
          navigator.clipboard.writeText(fullShareMessage).then(() => {
            alert('텍스트가 복사되었습니다! 인스타그램에서 붙여넣기 해주세요.');
          });
        }
        break;
      case 'threads':
        if (isMobile) {
          // 모바일에서 스레드 앱으로 직접 연결
          const threadsUrl = `barcelona://create?text=${encodeURIComponent(fullShareMessage)}`;
          const fallbackUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(fullShareMessage)}`;

          try {
            window.location.href = threadsUrl;
            setTimeout(() => {
              window.open(fallbackUrl, '_blank');
            }, 2000);
          } catch (e) {
            window.open(fallbackUrl, '_blank');
          }
        } else {
          window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(fullShareMessage)}`, '_blank');
        }
        break;
      case 'copy':
        navigator.clipboard.writeText(fullShareMessage).then(() => {
          alert('링크가 복사되었습니다!');
        }).catch(() => {
          // 복사 실패시 대체 방법
          const textArea = document.createElement('textarea');
          textArea.value = fullShareMessage;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('링크가 복사되었습니다!');
        });
        break;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{categoryInfo.icon}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{categoryInfo.title}</h1>
          <p className="text-lg text-gray-600">{categoryInfo.description}</p>
        </div>

        {/* 이미지 업로드 섹션 */}
        <div className="mb-8">
          {!selectedImage ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
              <div className="text-4xl mb-4">📷</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">얼굴 사진을 업로드하세요</h3>
              <p className="text-gray-500 mb-4">얼굴이 선명하게 보이는 정면 사진을 선택해주세요</p>
              <label
                htmlFor="imageUpload"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors"
              >
                사진 선택하기
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
              </label>
            </div>
          ) : (
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={selectedImage}
                  alt="업로드된 사진"
                  className="w-64 h-64 object-cover rounded-lg shadow-md mx-auto"
                />
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  다른 사진 선택
                </button>
                <button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                >
                  {isAnalyzing ? '분석 중...' : '분석 시작'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-center py-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-600 font-medium mb-2">분석 실패</div>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-3 px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 분석 중 로딩 */}
        {isAnalyzing && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">AI가 당신의 얼굴을 분석하고 있습니다...</p>
            {!modelsLoaded && (
              <p className="text-gray-500 text-sm mt-2">AI 모델을 로드하는 중...</p>
            )}
          </div>
        )}

        {/* 분석 결과 */}
        {result && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-lg border-2 border-indigo-200">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">{categoryInfo.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">분석 결과</h2>
              <div className="text-3xl font-bold text-indigo-600 mb-4">{result}</div>
              <p className="text-gray-700">당신의 얼굴 특징과 가장 잘 어울리는 {categoryInfo.title.replace('내게 어울리는 ', '')}입니다!</p>
            </div>

            {/* 유료 서비스 안내 */}
            <div className="mt-8 p-6 bg-white rounded-lg border border-indigo-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">더 정확하고 자세한 분석을 원하신다면?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/gwansang/original-purchase" className="block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">👁️</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">정통 관상 분석</h4>
                      <p className="text-sm text-gray-600">4,900원 - 전문적인 관상 분석</p>
                    </div>
                  </div>
                </Link>

                <Link href="/gwansang/saju-purchase" className="block p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">🔮</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">관상 + 사주 분석</h4>
                      <p className="text-sm text-gray-600">9,900원 - 종합적인 운세 분석</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* 공유하기 */}
            <div className="text-center mt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🎉 결과를 친구들에게 공유해보세요!</h4>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <button
                  onClick={() => handleShare('kakao')}
                  className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center gap-2"
                >
                  <span>💬</span> 카카오톡
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <span>📘</span> 페이스북
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium flex items-center gap-2"
                >
                  <span>🐦</span> 트위터
                </button>
                <button
                  onClick={() => handleShare('instagram')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium flex items-center gap-2"
                >
                  <span>📷</span> 인스타그램
                </button>
                <button
                  onClick={() => handleShare('threads')}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
                >
                  <span>🧵</span> 스레드
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                >
                  <span>🔗</span> 링크복사
                </button>
              </div>
            </div>

            {/* 다시 테스트하기 */}
            <div className="text-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                다시 테스트하기
              </button>
            </div>
          </div>
        )}

        {/* 다른 테스트 링크 */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">다른 재미있는 테스트도 해보세요!</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(CATEGORIES).map(([key, info]) => {
              if (key === category) return null;
              return (
                <Link
                  key={key}
                  href={`/free-test/${key}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                >
                  {info.icon} {info.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}