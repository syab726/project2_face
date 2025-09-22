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

// HTML 요소를 그대로 PDF로 변환하는 함수 (jsPDF + html2canvas 사용)
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
    
    // 임시로 body에 추가 (렌더링용)
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    clonedElement.style.width = '800px'; // 고정 너비
    clonedElement.style.backgroundColor = '#ffffff';
    document.body.appendChild(clonedElement);
    
    try {
      // html2canvas로 이미지 생성 (용량 최적화)
      const canvas = await html2canvas(clonedElement, {
        scale: 1.2, // 해상도 적정하게 설정 (2에서 1.2로 줄임)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: Math.min(clonedElement.scrollHeight, 3000) // 최대 높이 제한
      });
      
      // jsPDF로 PDF 생성 (JPEG로 변환하여 용량 줄이기)
      const imgData = canvas.toDataURL('image/jpeg', 0.8); // PNG 대신 JPEG, 품질 80%
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 너비 (mm)
      const pageHeight = 295; // A4 높이 (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // 첫 페이지
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // 추가 페이지 (필요시)
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // PDF 다운로드 - 파일 확장자 확인 및 수정
      const finalFilename = filename.endsWith('.pdf') ? filename : filename + '.pdf';
      pdf.save(finalFilename);
      
      console.log('HTML to PDF 변환 완료:', filename);
      
    } finally {
      // 임시 요소 제거
      document.body.removeChild(clonedElement);
    }
    
  } catch (error) {
    console.error('HTML to PDF 변환 오류:', error);
    
    // 오류 발생시 기본 PDF 생성
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      page.drawText('PDF Generation Error', {
        x: 50,
        y: 750,
        size: 20,
        font: font,
        color: rgb(1, 0, 0)
      });
      
      page.drawText('Unable to convert HTML content to PDF.', {
        x: 50,
        y: 700,
        size: 14,
        font: font,
        color: rgb(0, 0, 0)
      });
      
      page.drawText('Please try again or check the console for details.', {
        x: 50,
        y: 670,
        size: 12,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const finalFilename = filename.endsWith('.pdf') ? filename : filename + '.pdf';
      const a = document.createElement('a');
      a.href = url;
      a.download = finalFilename;
      a.type = 'application/pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (fallbackError) {
      console.error('오류 PDF 생성도 실패:', fallbackError);
    }
    
    throw error;
  }
};

// 최대한 간단하고 안전한 PDF 생성 함수
export const generateSimplePDF = async (filename: string, content?: string) => {
  try {
    console.log('간단한 PDF 생성 시작');
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPos = 750;
    const fontSize = 16; // 크게 설정
    const lineHeight = 20;
    
    // 제목
    page.drawText('Face Analysis Report', {
      x: 50,
      y: yPos,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.1, 0.6)
    });
    yPos -= 40;
    
    // 날짜
    page.drawText(`Generated: ${new Date().toLocaleDateString('en-US')}`, {
      x: 50,
      y: yPos,
      size: 12,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });
    yPos -= 40;
    
    // 기본 내용 (영어로)
    const defaultContent = [
      'ANALYSIS RESULTS:',
      '',
      '1. MBTI Personality Analysis',
      '   - Detailed personality assessment based on facial features',
      '   - Career guidance and relationship insights',
      '   - Strengths and areas for development',
      '',
      '2. Traditional Face Reading (Physiognomy)',
      '   - Fortune analysis based on facial structure',
      '   - Health and wealth predictions',
      '   - Life path guidance',
      '',
      '3. Comprehensive Life Analysis',
      '   - Career recommendations',
      '   - Relationship compatibility',
      '   - Personal growth strategies',
      '',
      'NOTE: This is a simplified version of your analysis.',
      'The full Korean analysis is available on the website.',
      '',
      'AI-Powered Face Analysis System',
      'Combining MBTI Assessment and Traditional Physiognomy'
    ];
    
    const contentLines = content ? content.split('\n').slice(0, 20) : defaultContent;
    
    for (const line of contentLines) {
      if (yPos < 100) break; // 페이지 하단 근처에서 중단
      
      // 빈 줄 처리
      if (!line.trim()) {
        yPos -= lineHeight / 2;
        continue;
      }
      
      // 제목 또는 일반 텍스트 구분
      const isTitle = line.includes(':') || line.match(/^\d+\./); 
      const currentFont = isTitle ? boldFont : font;
      const currentSize = isTitle ? fontSize + 2 : fontSize;
      const color = isTitle ? rgb(0.2, 0.1, 0.6) : rgb(0, 0, 0);
      
      // 안전한 텍스트만 출력 (ASCII만)
      const safeText = line.replace(/[^\x20-\x7E]/g, '').trim();
      
      if (safeText) {
        page.drawText(safeText, {
          x: 50,
          y: yPos,
          size: currentSize,
          font: currentFont,
          color: color
        });
      }
      
      yPos -= lineHeight;
    }
    
    // PDF 저장 및 다운로드
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const finalFilename = filename.endsWith('.pdf') ? filename : filename + '.pdf';
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    a.type = 'application/pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('간단한 PDF 생성 완료:', filename);
    
  } catch (error) {
    console.error('간단한 PDF 생성 오류:', error);
    throw error;
  }
};