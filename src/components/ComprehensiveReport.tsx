'use client';

import { useState } from 'react';
import { PDFReportGenerator, downloadPDF } from '@/lib/pdf-generator';
import type { 
  ComprehensiveReport as ReportType, 
  MBTIAnalysisResult,
  PhysiognomyAnalysis,
  PalmistryAnalysis,
  FortuneAnalysis 
} from '@/types/analysis';

interface ComprehensiveReportProps {
  mbtiResult: MBTIAnalysisResult;
  physiognomy?: PhysiognomyAnalysis;
  palmistry?: PalmistryAnalysis;
  fortune?: FortuneAnalysis;
  onBack: () => void;
}

export default function ComprehensiveReport({
  mbtiResult,
  physiognomy,
  palmistry,
  fortune,
  onBack
}: ComprehensiveReportProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // 종합 분석 데이터 구성
  const comprehensiveData: ReportType = {
    userId: `USER_${Date.now()}`,
    timestamp: new Date().toISOString(),
    mbtiAnalysis: mbtiResult,
    physiognomy,
    palmistry,
    fortune,
    summary: generateSummary(),
    recommendations: generateRecommendations()
  };

  function generateSummary(): string {
    const analyses = [];
    if (mbtiResult) analyses.push(`MBTI: ${mbtiResult.mbtiType}`);
    if (physiognomy) analyses.push(`관상: ${physiognomy.overall.personalityType}`);
    if (palmistry) analyses.push('손금 분석');
    if (fortune) analyses.push('사주 분석');

    return `${analyses.join(', ')}을 통한 종합 분석 결과, 당신은 ${mbtiResult.description} 
    ${physiognomy ? `관상학적으로는 ${physiognomy.overall.description}` : ''}
    ${palmistry ? `손금으로는 ${palmistry.lifeLine.meaning}` : ''}
    ${fortune ? `사주명리학적으로는 ${fortune.saju.personality}` : ''}
    전체적으로 균형잡힌 성격과 좋은 운세를 가지고 계시며, 꾸준한 노력으로 목표를 달성할 수 있는 분입니다.`;
  }

  function generateRecommendations(): string[] {
    const recommendations = [];
    
    if (mbtiResult) {
      if (mbtiResult.traits.extraversion > 70) {
        recommendations.push('사람들과의 교류를 통해 에너지를 얻으므로 네트워킹 활동을 적극적으로 하세요');
      }
      if (mbtiResult.traits.intuition > 70) {
        recommendations.push('창의적인 분야에서 능력을 발휘할 수 있으니 새로운 아이디어를 두려워하지 마세요');
      }
    }
    
    if (physiognomy?.overall.fortune === 'good') {
      recommendations.push('전체적으로 좋은 운세를 타고났으니 자신감을 가지고 도전하세요');
    }
    
    if (palmistry) {
      if (palmistry.lifeLine.length === 'long') {
        recommendations.push('건강한 생명력을 가지고 있으니 규칙적인 생활로 더욱 발전시키세요');
      }
    }
    
    if (fortune) {
      recommendations.push(`${fortune.timing.advice}`);
    }
    
    // 기본 추천사항
    recommendations.push('자신의 장점을 살리되 부족한 부분은 꾸준히 보완해나가세요');
    recommendations.push('인간관계에서 진실성을 유지하며 상대방을 이해하려 노력하세요');
    
    return recommendations;
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report: comprehensiveData }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'PDF 생성에 실패했습니다.');
      }

      // Base64 PDF를 다운로드
      const pdfBytes = Uint8Array.from(atob(data.data.pdf), c => c.charCodeAt(0));
      downloadPDF(pdfBytes, data.data.filename);

    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const shareReport = async () => {
    const shareText = `내 종합 운세 분석 결과! 🔮\n\n${comprehensiveData.summary.slice(0, 100)}...\n\n#종합분석 #운세 #내얼굴탐구생활`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '내 종합 운세 분석 결과',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            돌아가기
          </button>
          <div className="text-sm text-gray-500">
            📊 종합 리포트
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ✨ 종합 분석 리포트
        </h2>
        <p className="text-gray-600">
          모든 분석 결과를 종합한 상세 리포트입니다
        </p>
      </div>

      {/* 분석 개요 */}
      <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
        <h3 className="text-xl font-semibold mb-4 text-primary-900">📋 분석 개요</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-white/70 rounded-lg">
            <div className="text-2xl mb-2">🧠</div>
            <div className="font-medium">얼굴 MBTI</div>
            <div className="text-sm text-gray-600">{mbtiResult.mbtiType}</div>
          </div>
          {physiognomy && (
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium">관상 분석</div>
              <div className="text-sm text-gray-600">완료</div>
            </div>
          )}
          {palmistry && (
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="text-2xl mb-2">🖐️</div>
              <div className="font-medium">손금 분석</div>
              <div className="text-sm text-gray-600">완료</div>
            </div>
          )}
          {fortune && (
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="text-2xl mb-2">🔮</div>
              <div className="font-medium">사주 분석</div>
              <div className="text-sm text-gray-600">완료</div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white/90 rounded-lg">
          <h4 className="font-semibold mb-2">🎯 종합 요약</h4>
          <p className="text-gray-700 leading-relaxed">{comprehensiveData.summary}</p>
        </div>
      </div>

      {/* 상세 분석 결과들 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* MBTI 분석 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">🧠</span>
            얼굴 MBTI 분석
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900">유형: {mbtiResult.mbtiType}</div>
              <div className="text-sm text-blue-700">신뢰도: {mbtiResult.confidence}%</div>
            </div>
            <p className="text-sm text-gray-700">{mbtiResult.description}</p>
          </div>
        </div>

        {/* 관상 분석 */}
        {physiognomy && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">👤</span>
              관상 분석
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900">{physiognomy.overall.personalityType}</div>
                <div className="text-sm text-green-700">운세: {physiognomy.overall.fortune}</div>
              </div>
              <p className="text-sm text-gray-700">{physiognomy.overall.description}</p>
            </div>
          </div>
        )}

        {/* 손금 분석 */}
        {palmistry && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">🖐️</span>
              손금 분석
            </h3>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">생명선:</span> {palmistry.lifeLine.meaning}
              </div>
              <div className="text-sm">
                <span className="font-medium">감정선:</span> {palmistry.heartLine.meaning}
              </div>
              <div className="text-sm">
                <span className="font-medium">지능선:</span> {palmistry.headLine.meaning}
              </div>
            </div>
          </div>
        )}

        {/* 사주 분석 */}
        {fortune && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">🔮</span>
              사주 분석
            </h3>
            <div className="space-y-3">
              <div className="flex space-x-1 justify-center">
                {fortune.saju.elements.map((element, index) => (
                  <div 
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      element === '목' ? 'bg-green-500' :
                      element === '화' ? 'bg-red-500' :
                      element === '토' ? 'bg-yellow-500' :
                      element === '금' ? 'bg-gray-500' :
                      'bg-blue-500'
                    }`}
                  >
                    {element}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-700">{fortune.saju.personality}</p>
            </div>
          </div>
        )}
      </div>

      {/* 추천사항 */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-2">💡</span>
          맞춤 추천사항
        </h3>
        <div className="space-y-3">
          {comprehensiveData.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="text-yellow-600 font-bold text-lg">{index + 1}</div>
              <p className="text-yellow-800 text-sm">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">📱 리포트 활용하기</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className={`btn-primary flex items-center justify-center ${
              isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGeneratingPDF ? (
              <>
                <div className="loading-spinner w-4 h-4 mr-2"></div>
                PDF 생성 중...
              </>
            ) : (
              <>
                📄 PDF 다운로드
              </>
            )}
          </button>
          
          <button
            onClick={shareReport}
            className="btn-secondary"
          >
            📱 결과 공유하기
          </button>
          
          <button
            onClick={onBack}
            className="btn-outline"
          >
            🔙 이전으로
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          💾 PDF 리포트는 개인 보관용으로 저장하시고, 
          분석 결과를 친구들과 공유해보세요!
        </p>
      </div>
    </div>
  );
}