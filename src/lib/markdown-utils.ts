/**
 * 간단한 마크다운 -> HTML 변환 유틸리티
 * 헤더 레벨별로 적절한 크기와 스타일 적용
 */

export interface MarkdownElement {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'li' | 'strong';
  content: string;
  level?: number;
}

export function parseMarkdownToElements(text: any): MarkdownElement[] {
  // 타입 체크 및 문자열 변환
  if (!text) return [];

  // text가 문자열이 아닌 경우 처리
  let textStr: string;
  if (typeof text === 'string') {
    textStr = text;
  } else if (typeof text === 'object' && text !== null) {
    // 객체인 경우 JSON 문자열로 변환하거나 toString() 사용
    textStr = JSON.stringify(text);
  } else {
    textStr = String(text);
  }

  // 먼저 텍스트를 정리: ### 헤더 제거, 색상 괄호 제거, 불필요한 마크다운 제거
  let cleanText = textStr
    // ### 헤더들 완전 제거 (분야별 마지막에 나오는 다음 분야 헤더 포함)
    .replace(/###\s*.*?상세분석.*?\n?/gi, '')
    .replace(/###\s*.*?운세.*?\n?/gi, '')
    .replace(/###\s*.*?분석.*?\n?/gi, '')
    .replace(/###\s*.*?\n?/g, '')
    // ## 헤더들도 제거
    .replace(/##\s*.*?\n?/g, '')
    // 색상 괄호 표시 제거 (빨간색, 파란색 등)
    .replace(/^\s*\([^)]*색[^)]*\)\s*/gm, '')
    .replace(/^\s*\([^)]*\)\s*/gm, '')
    // 기타 불필요한 마크다운 제거
    .replace(/^\s*\*\*\*+.*?\*\*\*+\s*$/gm, '')
    .replace(/^\s*---+\s*$/gm, '')
    // 연속된 빈 줄 정리
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  const elements: MarkdownElement[] = [];
  const lines = cleanText.split('\n').filter(line => line.trim() !== '');

  for (const line of lines) {
    const trimmed = line.trim();

    // 빈 줄이나 너무 짧은 줄은 스킵
    if (trimmed.length < 3) continue;

    // 헤더 처리 (# ## ### ####) - 남아있는 것들만
    if (trimmed.startsWith('####')) {
      const content = trimmed.replace(/^####\s*/, '').trim();
      if (content.length > 0) {
        elements.push({
          type: 'h4',
          content: content,
          level: 4
        });
      }
    } else if (trimmed.startsWith('###')) {
      const content = trimmed.replace(/^###\s*/, '').trim();
      if (content.length > 0) {
        elements.push({
          type: 'h3',
          content: content,
          level: 3
        });
      }
    } else if (trimmed.startsWith('##')) {
      const content = trimmed.replace(/^##\s*/, '').trim();
      if (content.length > 0) {
        elements.push({
          type: 'h2',
          content: content,
          level: 2
        });
      }
    } else if (trimmed.startsWith('#')) {
      const content = trimmed.replace(/^#\s*/, '').trim();
      if (content.length > 0) {
        elements.push({
          type: 'h1',
          content: content,
          level: 1
        });
      }
    }
    // 강조 텍스트 처리 (**text**)
    else if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
      const content = trimmed.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
      if (content.length > 0) {
        elements.push({
          type: 'strong',
          content: content
        });
      }
    }
    // 리스트 항목 처리 (- text)
    else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.replace(/^[-*]\s*/, '').trim();
      if (content.length > 0) {
        elements.push({
          type: 'li',
          content: content
        });
      }
    }
    // 일반 텍스트
    else if (trimmed.length > 0) {
      // 색상 괄호나 기타 불필요한 문자가 남아있지 않은지 최종 확인
      const finalContent = trimmed
        .replace(/^\s*\([^)]*\)\s*/, '') // 앞의 괄호 제거
        .replace(/^\s*\[[^\]]*\]\s*/, '') // 앞의 대괄호 제거
        .trim();

      if (finalContent.length > 0) {
        elements.push({
          type: 'p',
          content: finalContent
        });
      }
    }
  }

  return elements;
}

export function getHeaderStyle(level: number, primaryColor: string = '#333'): React.CSSProperties {
  const baseStyles = {
    margin: '0 0 16px 0',
    fontWeight: 'bold' as const,
    color: primaryColor,
    lineHeight: '1.4'
  };
  
  switch (level) {
    case 1:
      return {
        ...baseStyles,
        fontSize: '3.0em',
        marginBottom: '40px',
        marginTop: '50px',
        borderBottom: `6px solid ${primaryColor}`,
        paddingBottom: '20px',
        textAlign: 'center' as const,
        fontWeight: 'bold' as const
      };
    case 2:
      return {
        ...baseStyles,
        fontSize: '1.4em',
        marginBottom: '16px',
        marginTop: '24px'
      };
    case 3:
      return {
        ...baseStyles,
        fontSize: '1.2em',
        marginBottom: '12px',
        marginTop: '20px'
      };
    case 4:
      return {
        ...baseStyles,
        fontSize: '1.0em',
        marginBottom: '10px',
        marginTop: '16px'
      };
    default:
      return baseStyles;
  }
}

export function getParagraphStyle(): React.CSSProperties {
  return {
    margin: '0 0 14px 0',
    lineHeight: '1.7',
    fontSize: '1em',
    color: '#333'
  };
}

export function getStrongStyle(accentColor: string = '#444'): React.CSSProperties {
  return {
    fontWeight: 'bold' as const,
    color: accentColor,
    fontSize: '1.05em',
    display: 'block',
    margin: '12px 0',
    padding: '8px 0',
    borderLeft: `4px solid ${accentColor}20`,
    paddingLeft: '12px',
    background: `${accentColor}05`
  };
}

export function getListItemStyle(): React.CSSProperties {
  return {
    margin: '8px 0',
    paddingLeft: '16px',
    position: 'relative' as const,
    lineHeight: '1.6',
    fontSize: '0.95em'
  };
}