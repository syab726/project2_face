'use client';

import { useState, useRef } from 'react';

interface ShortsResult {
  success: boolean;
  celebrityName?: string;
  videoUrl?: string;
  duration?: number;
  downloadUrl?: string;
  error?: string;
}

export default function ShortsGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ShortsResult | null>(null);
  const [celebrityName, setCelebrityName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!celebrityName.trim() || !selectedImage) {
      alert('유명인 이름과 이미지를 모두 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('celebrityName', celebrityName.trim());
      formData.append('image', selectedImage);

      const response = await fetch('/api/shorts/generate', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          celebrityName: data.data.celebrityName,
          videoUrl: data.data.videoUrl,
          duration: data.data.duration,
          downloadUrl: data.data.downloadUrl
        });
      } else {
        setResult({
          success: false,
          error: data.error || '쇼츠 생성에 실패했습니다.'
        });
      }
    } catch (error) {
      console.error('쇼츠 생성 오류:', error);
      setResult({
        success: false,
        error: '네트워크 오류가 발생했습니다.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setCelebrityName('');
    setSelectedImage(null);
    setImagePreview('');
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className=\"max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg\">
      <div className=\"text-center mb-8\">
        <h1 className=\"text-3xl font-bold text-gray-800 mb-2\">
          🎬 유튜브 쇼츠 자동 생성기
        </h1>
        <p className=\"text-gray-600\">
          유명인 이름과 사진만 있으면 관상 분석 쇼츠를 자동으로 만들어드립니다!
        </p>
      </div>

      {!result && (
        <div className=\"space-y-6\">
          {/* 유명인 이름 입력 */}
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-2\">
              유명인 이름
            </label>
            <input
              type=\"text\"
              value={celebrityName}
              onChange={(e) => setCelebrityName(e.target.value)}
              placeholder=\"예: 김수현, 아이유, 손흥민...\"
              className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
              disabled={isGenerating}
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-2\">
              유명인 사진
            </label>
            <div className=\"border-2 border-dashed border-gray-300 rounded-lg p-6 text-center\">
              {imagePreview ? (
                <div className=\"space-y-4\">
                  <img
                    src={imagePreview}
                    alt=\"Preview\"
                    className=\"max-w-xs max-h-64 mx-auto rounded-lg shadow-md\"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className=\"text-blue-500 hover:text-blue-700\"
                    disabled={isGenerating}
                  >
                    다른 이미지 선택
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className=\"cursor-pointer\"
                >
                  <div className=\"text-gray-400 mb-2\">
                    <svg className=\"mx-auto h-12 w-12\" stroke=\"currentColor\" fill=\"none\" viewBox=\"0 0 48 48\">
                      <path d=\"M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02\" strokeWidth={2} strokeLinecap=\"round\" strokeLinejoin=\"round\" />
                    </svg>
                  </div>
                  <p className=\"text-gray-600\">클릭해서 이미지를 업로드하세요</p>
                  <p className=\"text-sm text-gray-400\">JPG, PNG 파일 지원</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type=\"file\"
                accept=\"image/*\"
                onChange={handleImageSelect}
                className=\"hidden\"
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !celebrityName.trim() || !selectedImage}
            className=\"w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200\"
          >
            {isGenerating ? (
              <div className=\"flex items-center justify-center space-x-2\">
                <div className=\"animate-spin rounded-full h-5 w-5 border-b-2 border-white\"></div>
                <span>쇼츠 생성 중... (1-2분 소요)</span>
              </div>
            ) : (
              '🎬 쇼츠 생성하기'
            )}
          </button>

          {isGenerating && (
            <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4\">
              <div className=\"flex items-center space-x-3\">
                <div className=\"animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500\"></div>
                <div>
                  <p className=\"text-blue-800 font-medium\">쇼츠 생성 중입니다...</p>
                  <p className=\"text-blue-600 text-sm\">
                    관상 분석 → 스크립트 생성 → 음성 생성 → 영상 제작 순으로 진행됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 결과 표시 */}
      {result && (
        <div className=\"space-y-6\">
          {result.success ? (
            <div className=\"bg-green-50 border border-green-200 rounded-lg p-6\">
              <div className=\"text-center space-y-4\">
                <div className=\"text-green-800\">
                  <svg className=\"mx-auto h-12 w-12 mb-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M5 13l4 4L19 7\" />
                  </svg>
                  <h3 className=\"text-xl font-bold\">🎉 쇼츠 생성 완료!</h3>
                  <p className=\"text-green-600\">
                    {result.celebrityName}의 관상 분석 쇼츠가 성공적으로 생성되었습니다.
                  </p>
                  {result.duration && (
                    <p className=\"text-sm text-green-500\">
                      생성 시간: {Math.round(result.duration / 1000)}초
                    </p>
                  )}
                </div>

                {/* 비디오 플레이어 */}
                {result.videoUrl && (
                  <div className=\"space-y-4\">
                    <video
                      controls
                      className=\"w-full max-w-md mx-auto rounded-lg shadow-lg\"
                      style={{ aspectRatio: '9/16' }}
                    >
                      <source src={result.videoUrl} type=\"video/mp4\" />
                      브라우저가 비디오를 지원하지 않습니다.
                    </video>

                    {/* 다운로드 버튼 */}
                    <div className=\"flex space-x-4 justify-center\">
                      <a
                        href={result.downloadUrl}
                        download={`${result.celebrityName}_관상분석_쇼츠.mp4`}
                        className=\"bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200\"
                      >
                        📥 다운로드
                      </a>
                      <button
                        onClick={resetForm}
                        className=\"bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200\"
                      >
                        🔄 새로 만들기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className=\"bg-red-50 border border-red-200 rounded-lg p-6\">
              <div className=\"text-center space-y-4\">
                <div className=\"text-red-800\">
                  <svg className=\"mx-auto h-12 w-12 mb-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" />
                  </svg>
                  <h3 className=\"text-xl font-bold\">❌ 생성 실패</h3>
                  <p className=\"text-red-600\">{result.error}</p>
                </div>
                <button
                  onClick={resetForm}
                  className=\"bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200\"
                >
                  🔄 다시 시도
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 사용법 안내 */}
      <div className=\"mt-8 bg-gray-50 rounded-lg p-4\">
        <h4 className=\"font-bold text-gray-800 mb-2\">💡 사용법</h4>
        <ul className=\"text-sm text-gray-600 space-y-1\">
          <li>1. 유명인의 이름을 정확히 입력하세요</li>
          <li>2. 얼굴이 잘 보이는 정면 사진을 업로드하세요</li>
          <li>3. 생성된 쇼츠를 다운로드해서 유튜브에 업로드하세요</li>
          <li>4. 생성에는 1-2분 정도 소요됩니다</li>
        </ul>
      </div>
    </div>
  );
}