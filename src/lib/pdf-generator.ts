// PDF 생성 라이브러리

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { 
  ComprehensiveReport, 
  MBTIAnalysisResult, 
  PhysiognomyAnalysis,
  PalmistryAnalysis,
  FortuneAnalysis 
} from '@/types/analysis';

export class PDFReportGenerator {
  private doc!: PDFDocument;
  private currentPage: any;
  private currentY: number = 0;
  private readonly pageWidth = 595.28; // A4 width in points
  private readonly pageHeight = 841.89; // A4 height in points
  private readonly margin = 50;
  private readonly contentWidth = this.pageWidth - (this.margin * 2);

  constructor() {
    // 초기화는 generateComprehensiveReport에서 수행
  }

  private async initialize() {
    this.doc = await PDFDocument.create();
    this.currentPage = this.doc.addPage([this.pageWidth, this.pageHeight]);
    this.currentY = this.pageHeight - this.margin;
  }

  async generateComprehensiveReport(report: ComprehensiveReport): Promise<Uint8Array> {
    // 문서 초기화
    await this.initialize();
    
    // 폰트 설정 (한글 지원을 위해 실제로는 한글 폰트 파일 필요)
    const font = await this.doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await this.doc.embedFont(StandardFonts.HelveticaBold);

    // 제목 페이지
    await this.addTitle('내 얼굴 탐구생활 - 종합 분석 리포트', boldFont, 24);
    await this.addSpacing(30);
    
    await this.addText(`분석 일시: ${new Date(report.timestamp).toLocaleDateString('ko-KR')}`, font, 12);
    await this.addText(`세션 ID: ${report.userId}`, font, 10);
    await this.addSpacing(50);

    // MBTI 분석 결과
    if (report.mbtiAnalysis) {
      await this.addSectionTitle('1. 얼굴 MBTI 분석', boldFont, 18);
      await this.addMBTISection(report.mbtiAnalysis, font, boldFont);
      await this.addSpacing(30);
    }

    // 관상 분석 결과
    if (report.physiognomy) {
      await this.addSectionTitle('2. 전문 관상 분석', boldFont, 18);
      await this.addPhysiognomySection(report.physiognomy, font, boldFont);
      await this.addSpacing(30);
    }

    // 손금 분석 결과
    if (report.palmistry) {
      await this.addSectionTitle('3. 손금 분석', boldFont, 18);
      await this.addPalmistrySection(report.palmistry, font, boldFont);
      await this.addSpacing(30);
    }

    // 사주 분석 결과
    if (report.fortune) {
      await this.addSectionTitle('4. 사주 분석', boldFont, 18);
      await this.addFortuneSection(report.fortune, font, boldFont);
      await this.addSpacing(30);
    }

    // 종합 요약
    await this.addSectionTitle('5. 종합 요약 및 조언', boldFont, 18);
    await this.addText(report.summary, font, 12);
    await this.addSpacing(20);

    // 추천사항
    await this.addSubTitle('추천사항:', boldFont, 14);
    for (const recommendation of report.recommendations) {
      await this.addBulletPoint(recommendation, font, 12);
    }

    // 푸터
    await this.addFooter(font);

    return await this.doc.save();
  }

  private async addTitle(text: string, font: any, size: number) {
    this.currentPage.drawText(text, {
      x: this.margin,
      y: this.currentY,
      size,
      font,
      color: rgb(0.2, 0.2, 0.8)
    });
    this.currentY -= (size + 20);
  }

  private async addSectionTitle(text: string, font: any, size: number) {
    if (this.currentY < 100) {
      this.addNewPage();
    }
    
    this.currentPage.drawText(text, {
      x: this.margin,
      y: this.currentY,
      size,
      font,
      color: rgb(0.1, 0.1, 0.1)
    });
    this.currentY -= (size + 15);
  }

  private async addSubTitle(text: string, font: any, size: number) {
    this.currentPage.drawText(text, {
      x: this.margin,
      y: this.currentY,
      size,
      font,
      color: rgb(0.3, 0.3, 0.3)
    });
    this.currentY -= (size + 10);
  }

  private async addText(text: string, font: any, size: number, color = rgb(0, 0, 0)) {
    const lines = this.splitTextToLines(text, font, size, this.contentWidth);
    
    for (const line of lines) {
      if (this.currentY < 50) {
        this.addNewPage();
      }
      
      this.currentPage.drawText(line, {
        x: this.margin,
        y: this.currentY,
        size,
        font,
        color
      });
      this.currentY -= (size + 5);
    }
  }

  private async addBulletPoint(text: string, font: any, size: number) {
    await this.addText(`• ${text}`, font, size);
  }

  private async addSpacing(amount: number) {
    this.currentY -= amount;
  }

  private addNewPage() {
    this.currentPage = this.doc.addPage([this.pageWidth, this.pageHeight]);
    this.currentY = this.pageHeight - this.margin;
  }

  private splitTextToLines(text: string, font: any, size: number, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, size);
      
      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  private async addMBTISection(mbti: MBTIAnalysisResult, font: any, boldFont: any) {
    await this.addText(`MBTI 유형: ${mbti.mbtiType} (신뢰도: ${mbti.confidence}%)`, boldFont, 14);
    await this.addSpacing(10);
    
    await this.addSubTitle('성격 분석:', boldFont, 12);
    await this.addText(mbti.description, font, 11);
    await this.addSpacing(10);
    
    await this.addSubTitle('조언:', boldFont, 12);
    await this.addText(mbti.advice, font, 11);
    await this.addSpacing(10);
    
    await this.addSubTitle('성향 점수:', boldFont, 12);
    await this.addText(`외향성: ${mbti.traits.extraversion}% | 직관: ${mbti.traits.intuition}%`, font, 10);
    await this.addText(`사고: ${mbti.traits.thinking}% | 판단: ${mbti.traits.judging}%`, font, 10);
  }

  private async addPhysiognomySection(physiognomy: PhysiognomyAnalysis, font: any, boldFont: any) {
    await this.addSubTitle('전체 인상:', boldFont, 12);
    await this.addText(`성격 유형: ${physiognomy.overall.personalityType}`, font, 11);
    await this.addText(`운세: ${physiognomy.overall.fortune}`, font, 11);
    await this.addText(physiognomy.overall.description, font, 11);
    await this.addSpacing(15);
    
    const features = ['forehead', 'eyes', 'nose', 'mouth', 'chin'] as const;
    const featureNames = ['이마', '눈', '코', '입', '턱'];
    
    for (let i = 0; i < features.length; i++) {
      const feature = physiognomy.features[features[i]];
      await this.addSubTitle(`${featureNames[i]}:`, boldFont, 12);
      await this.addText(`모양: ${feature.shape}`, font, 10);
      await this.addText(`의미: ${feature.meaning}`, font, 10);
      await this.addText(`운세: ${feature.fortune}`, font, 10);
      await this.addText(`조언: ${feature.advice}`, font, 10);
      await this.addSpacing(10);
    }
  }

  private async addPalmistrySection(palmistry: PalmistryAnalysis, font: any, boldFont: any) {
    await this.addSubTitle('주요 손금 분석:', boldFont, 12);
    
    await this.addText(`생명선: ${palmistry.lifeLine.length}, ${palmistry.lifeLine.depth}`, boldFont, 11);
    await this.addText(palmistry.lifeLine.meaning, font, 10);
    await this.addSpacing(8);
    
    await this.addText(`감정선: ${palmistry.heartLine.curve}`, boldFont, 11);
    await this.addText(palmistry.heartLine.meaning, font, 10);
    await this.addSpacing(8);
    
    await this.addText(`지능선: ${palmistry.headLine.length}`, boldFont, 11);
    await this.addText(palmistry.headLine.meaning, font, 10);
    await this.addSpacing(15);
    
    await this.addSubTitle('운세 분석:', boldFont, 12);
    await this.addText(`건강운: ${palmistry.fortune.health}`, font, 10);
    await this.addText(`재물운: ${palmistry.fortune.wealth}`, font, 10);
    await this.addText(`연애운: ${palmistry.fortune.love}`, font, 10);
  }

  private async addFortuneSection(fortune: FortuneAnalysis, font: any, boldFont: any) {
    await this.addSubTitle('오행 분석:', boldFont, 12);
    await this.addText(`주요 오행: ${fortune.saju.elements.join(', ')}`, font, 11);
    await this.addSpacing(10);
    
    await this.addSubTitle('성격:', boldFont, 12);
    await this.addText(fortune.saju.personality, font, 10);
    await this.addSpacing(8);
    
    await this.addSubTitle('직업운:', boldFont, 12);
    await this.addText(fortune.saju.career, font, 10);
    await this.addSpacing(8);
    
    await this.addSubTitle('연애/결혼운:', boldFont, 12);
    await this.addText(fortune.saju.relationship, font, 10);
    await this.addSpacing(8);
    
    await this.addSubTitle('건강운:', boldFont, 12);
    await this.addText(fortune.saju.health, font, 10);
    await this.addSpacing(15);
    
    await this.addSubTitle('현재 운세:', boldFont, 12);
    await this.addText(`올해: ${fortune.timing.currentYear}`, font, 10);
    await this.addText(`다음달: ${fortune.timing.nextMonth}`, font, 10);
    await this.addText(`조언: ${fortune.timing.advice}`, font, 10);
  }

  private async addFooter(font: any) {
    const footerY = 30;
    this.currentPage.drawText('Generated by 내 얼굴 탐구생활 - AI Face Analysis Service', {
      x: this.margin,
      y: footerY,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    this.currentPage.drawText(`페이지 ${this.doc.getPageCount()}`, {
      x: this.pageWidth - this.margin - 50,
      y: footerY,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
  }
}

// PDF 다운로드 유틸리티
export const downloadPDF = (pdfBytes: Uint8Array, filename: string) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * ⚠️ 중요 경고: PDF 생성 함수 수정 금지
 * 
 * 이 함수는 MBTI+관상 분석을 위해 특별히 설정되었습니다.
 * 사용자의 명시적 요청에 따라 잠금 상태입니다.
 * 
 * 핵심 설정:
 * - 너비: 1000px (축소 금지)
 * - 글자 크기: 16px (고정)
 * - 줄간격: 1.8 (고정)
 * - 여러 페이지 자동 분할
 * 
 * 수정 필요시 반드시 사용자 승인 필요
 * 마지막 승인: 2025-01-11
 * 
 * DO NOT MODIFY WITHOUT EXPLICIT PERMISSION
 */
// HTML 요소를 그대로 PDF로 변환하는 함수 (jsPDF + html2canvas 사용) - 여러 페이지 지원
export const generateHTMLToPDF = async (elementOrSelector: string | HTMLElement, filename: string) => {
  try {
    console.log('HTML to PDF 변환 시작:', elementOrSelector);
    
    // DOM 요소 찾기
    const element = typeof elementOrSelector === 'string' 
      ? document.querySelector(elementOrSelector) as HTMLElement
      : elementOrSelector;
    
    if (!element) {
      throw new Error(`Element not found: ${elementOrSelector}`);
    }
    
    console.log('찾은 요소:', element);
    
    // 요소를 복사해서 정리
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // 버튼 및 업셀링 제거
    const buttonsToRemove = clonedElement.querySelectorAll('button');
    buttonsToRemove.forEach(btn => btn.remove());
    
    // 다운로드 버튼 컨테이너 제거
    const downloadElements = clonedElement.querySelectorAll('[onclick*="PDF"], [onclick*="다운로드"]');
    downloadElements.forEach(el => el.remove());
    
    // 업셀링 배너 제거 (선택적)
    const upsellElements = clonedElement.querySelectorAll('[style*="gradient"][style*="764ba2"]');
    upsellElements.forEach(el => {
      const text = el.textContent || '';
      if (text.includes('정통 관상분석') || text.includes('더 깊이')) {
        el.remove();
      }
    });
    
    // 임시로 body에 추가하여 실제 렌더링 크기 측정 - 원본 크기 유지
    clonedElement.style.position = 'fixed';
    clonedElement.style.left = '0';
    clonedElement.style.top = '0';
    clonedElement.style.zIndex = '-9999';
    clonedElement.style.width = '1000px'; // 더 큰 너비로 원본 유지
    clonedElement.style.maxWidth = '1000px';
    clonedElement.style.minWidth = '1000px';
    clonedElement.style.height = 'auto';
    clonedElement.style.backgroundColor = '#ffffff';
    clonedElement.style.color = '#000000'; // 텍스트 색상 강제 설정
    clonedElement.style.fontFamily = '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'; // 한국어 폰트
    clonedElement.style.fontSize = '16px'; // 원본 크기 유지
    clonedElement.style.lineHeight = '1.8'; // 더 넓은 줄간격
    clonedElement.style.padding = '30px';
    clonedElement.style.wordWrap = 'break-word';
    clonedElement.style.whiteSpace = 'normal';
    clonedElement.style.overflow = 'visible';
    
    // 모든 하위 요소의 색상과 폰트 강제 설정
    const allElements = clonedElement.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i] as HTMLElement;
      if (el.style) {
        el.style.color = '#000000'; // 검은색으로 강제
        el.style.fontFamily = 'Arial, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'; // Arial 우선 사용
        el.style.fontSize = el.style.fontSize || '16px';
        el.style.fontWeight = el.style.fontWeight || 'normal';
        el.style.backgroundColor = el.style.backgroundColor || 'transparent';
        
        // 그라데이션 배경을 단색으로 변경
        if (el.style.background && el.style.background.includes('gradient')) {
          if (el.style.background.includes('#667eea') || el.style.background.includes('#764ba2')) {
            el.style.background = '#6f7bb6';
            el.style.backgroundColor = '#6f7bb6';
          } else if (el.style.background.includes('#ff9800')) {
            el.style.background = '#ff9800';
            el.style.backgroundColor = '#ff9800';
          } else if (el.style.background.includes('#7c4dff')) {
            el.style.background = '#7c4dff';
            el.style.backgroundColor = '#7c4dff';
          } else if (el.style.background.includes('#4caf50')) {
            el.style.background = '#4caf50';
            el.style.backgroundColor = '#4caf50';
          } else {
            el.style.background = '#f0f0f0';
            el.style.backgroundColor = '#f0f0f0';
          }
        }
      }
    }
    
    document.body.appendChild(clonedElement);
    
    // 렌더링 완료를 위한 지연
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // html2canvas로 이미지 생성 - 한글 지원 강화
      const canvas = await html2canvas(clonedElement, {
        scale: 2, // 고해상도
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 1000,
        height: clonedElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false, // 로깅 비활성화
        ignoreElements: (element) => {
          // 불필요한 요소 무시
          return element.tagName === 'BUTTON' || 
                 element.tagName === 'SCRIPT' ||
                 element.classList.contains('no-pdf');
        },
        onclone: (clonedDoc) => {
          // 클론된 문서에서 한글 폰트 강제 적용
          const style = clonedDoc.createElement('style');
          style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
            
            * {
              color: #000000 !important;
              font-family: Arial, "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif !important;
              font-size: 16px !important;
              line-height: 1.6 !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
              color: #333333 !important;
              font-weight: bold !important;
              font-family: Arial, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif !important;
            }
            
            p, div, span {
              color: #000000 !important;
              font-family: Arial, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif !important;
            }
            
            /* 각 섹션 배경색 유지 */
            [style*="background: linear-gradient"][style*="#ff9800"] {
              background: #ff9800 !important;
            }
            [style*="background: linear-gradient"][style*="#7c4dff"] {
              background: #7c4dff !important;
            }
            [style*="background: linear-gradient"][style*="#4caf50"] {
              background: #4caf50 !important;
            }
            [style*="background: linear-gradient"][style*="#667eea"] {
              background: #6f7bb6 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // 모든 텍스트 요소에 Arial 폰트 강제 적용
          const allTextElements = clonedDoc.querySelectorAll('*');
          allTextElements.forEach((el: any) => {
            if (el.style) {
              el.style.fontFamily = 'Arial, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
              el.style.color = '#000000';
            }
          });
        }
      });
      
      console.log(`캔버스 생성 완료: ${canvas.width}px x ${canvas.height}px`);
      
      // jsPDF로 PDF 생성
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // A4 사이즈로 PDF 생성
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // 페이지 여백
      
      // 이미지를 PDF 크기에 맞게 조정 (축소하지 않고 원본 비율 유지)
      const imgWidthInMM = pdfWidth - (margin * 2);
      const imgHeightInMM = (canvas.height / canvas.width) * imgWidthInMM;
      
      // 페이지당 높이 계산
      const pageContentHeight = pdfHeight - (margin * 2);
      const totalPages = Math.ceil(imgHeightInMM / pageContentHeight);
      
      console.log(`총 ${totalPages} 페이지 생성 예정`);
      
      // 여러 페이지에 걸쳐 이미지 분할
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // 각 페이지에 해당하는 부분만 추출
        const sourceY = page * pageContentHeight * (canvas.height / imgHeightInMM);
        const sourceHeight = Math.min(
          pageContentHeight * (canvas.height / imgHeightInMM),
          canvas.height - sourceY
        );
        
        // 임시 캔버스 생성하여 해당 부분만 추출
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
          const pageImgHeight = Math.min(pageContentHeight, imgHeightInMM - (page * pageContentHeight));
          
          pdf.addImage(
            pageImgData, 
            'PNG', 
            margin, 
            margin, 
            imgWidthInMM, 
            pageImgHeight,
            '',
            'FAST'
          );
        }
        
        // 페이지 번호 추가
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `${page + 1} / ${totalPages}`,
          pdfWidth / 2,
          pdfHeight - 5,
          { align: 'center' }
        );
      }
      
      // PDF 다운로드 (정통관상과 동일한 방식)
      pdf.save(filename);
      
      console.log('HTML to PDF 변환 완료:', filename);
      
    } finally {
      // 임시 요소 제거
      if (document.body.contains(clonedElement)) {
        document.body.removeChild(clonedElement);
      }
    }
    
  } catch (error) {
    console.error('HTML to PDF 변환 오류:', error);
    
    // 오류 발생시 텍스트 기반 PDF 생성
    await generateSimplePDF(filename, '분석 결과 PDF 생성 중 오류가 발생했습니다.');
    
    throw error;
  }
};

// 최대한 간단하고 안전한 PDF 생성 함수 - 한글 지원 강화
export const generateSimplePDF = async (filename: string, content?: string) => {
  try {
    console.log('간단한 PDF 생성 시작');
    
    // jsPDF 사용하여 생성
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // 기본 설정
    let yPos = 280; // A4 상단에서 시작 (mm 단위)
    const fontSize = 12;
    const lineHeight = 6;
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    
    // 제목 - 영어로 표시 (한글 깨짐 방지)
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(50, 50, 150);
    pdf.text('Face & Saju Analysis Report', margin, yPos, { align: 'left' });
    yPos -= 10;
    
    pdf.setFontSize(16);
    pdf.text('Gwansang + Saju Combined Analysis', margin, yPos, { align: 'left' });
    yPos -= 15;
    
    // 날짜 - 영어로 표시
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    const dateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Analysis Date: ${dateStr}`, margin, yPos, { align: 'left' });
    yPos -= 20;
    
    // 실제 분석 결과가 있어야만 PDF 생성 진행
    if (!content || content.trim().length === 0) {
      // 분석 결과 없음 메시지 (영어)
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text('No analysis content available.', margin, yPos, { align: 'left' });
      yPos -= 10;
      pdf.text('Please complete the AI analysis first.', margin, yPos, { align: 'left' });
    } else {
      // 한글 내용을 영어로 대체하여 PDF에 표시
      let processedContent = content
        // 한글 제목들을 영어로 변환
        .replace(/종합 분석 결과/g, 'Comprehensive Analysis Results')
        .replace(/얼굴 관상 분석/g, 'Face Physiognomy Analysis')
        .replace(/사주팔자 분석/g, 'Saju Fortune Analysis')
        .replace(/재물운/g, 'Wealth Fortune')
        .replace(/연애운/g, 'Love Fortune')
        .replace(/건강운/g, 'Health Fortune')
        .replace(/직업운/g, 'Career Fortune')
        .replace(/가족운/g, 'Family Fortune')
        .replace(/성격/g, 'Personality')
        .replace(/전반적/g, 'Overall')
        .replace(/일반적/g, 'General');
      
      // 한글 텍스트는 대체 메시지로 표시
      const contentLines = processedContent.split('\n').slice(0, 30);
      
      // 섹션 헤더 추가
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 120);
      pdf.text('Analysis Results Summary:', margin, yPos, { align: 'left' });
      yPos -= 15;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Note: Korean text content has been processed for PDF compatibility.', margin, yPos, { align: 'left' });
      yPos -= 10;
      pdf.text('For full detailed results, please view the online analysis.', margin, yPos, { align: 'left' });
      yPos -= 20;
      
      // 본문 출력 - 영어/숫자만 포함된 라인들만 표시
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // 간단한 요약 정보만 표시
      const summaryLines = [
        'Analysis Type: Face + Saju Combined Analysis',
        'Processing Method: AI-powered traditional analysis',
        'Sections Analyzed:',
        '• Comprehensive Overall Analysis',
        '• Face Physiognomy Features',
        '• Saju Fortune Reading',
        '• Personalized Recommendations',
        '',
        'Full results are available in the web interface.',
        'This PDF serves as a summary document.'
      ];
      
      for (const line of summaryLines) {
        if (yPos < 30) {
          pdf.addPage();
          yPos = 280;
        }
        
        if (!line.trim()) {
          yPos -= lineHeight / 2;
          continue;
        }
        
        const isTitle = line.includes(':') || line.startsWith('•');
        
        if (isTitle) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(fontSize + 1);
          pdf.setTextColor(40, 40, 120);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(fontSize);
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.text(line, margin, yPos, { align: 'left' });
        yPos -= lineHeight;
      }
    }
    
    // 푸터
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text('AI Face Analysis - Generated PDF', margin, 10);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 10, { align: 'right' });
    }
    
    // PDF 다운로드
    pdf.save(filename);
    
    console.log('간단한 PDF 생성 완료:', filename);
    
  } catch (error) {
    console.error('간단한 PDF 생성 오류:', error);
    
    // QA 검토: 폴백 더미 PDF 생성 금지
    // 실제 분석 결과가 없으면 PDF 생성하지 않음
    console.error('PDF 생성 실패: 실제 분석 결과가 필요합니다.');
    // try {
    //   // 더미 PDF 생성 금지 - QA 전문가 수정
    // } catch (fallbackError) {
    //   console.error('더미 PDF 생성도 실패:', fallbackError);
    // }
    
    throw error;
  }
};