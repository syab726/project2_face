/**
 * 간단한 마크다운 -> HTML 변환 유틸리티
 * 헤더 레벨별로 적절한 크기와 스타일 적용
 */

export interface MarkdownElement {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'li' | 'strong';
  content: string;
  level?: number;
}

export function parseMarkdownToElements(text: string): MarkdownElement[] {
  if (!text) return [];
  
  const elements: MarkdownElement[] = [];
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 헤더 처리 (# ## ###)
    if (trimmed.startsWith('####')) {
      elements.push({
        type: 'h4',
        content: trimmed.replace(/^####\s*/, '').trim(),
        level: 4
      });
    } else if (trimmed.startsWith('###')) {
      elements.push({
        type: 'h3',
        content: trimmed.replace(/^###\s*/, '').trim(),
        level: 3
      });
    } else if (trimmed.startsWith('##')) {
      elements.push({
        type: 'h2',
        content: trimmed.replace(/^##\s*/, '').trim(),
        level: 2
      });
    } else if (trimmed.startsWith('#')) {
      elements.push({
        type: 'h1',
        content: trimmed.replace(/^#\s*/, '').trim(),
        level: 1
      });
    }
    // 강조 텍스트 처리 (**text**)
    else if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
      elements.push({
        type: 'strong',
        content: trimmed.replace(/^\*\*/, '').replace(/\*\*$/, '').trim()
      });
    }
    // 리스트 항목 처리 (- text)
    else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      elements.push({
        type: 'li',
        content: trimmed.replace(/^[-*]\s*/, '').trim()
      });
    }
    // 일반 텍스트
    else if (trimmed.length > 0) {
      elements.push({
        type: 'p',
        content: trimmed
      });
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
        fontSize: '2.2em',
        marginBottom: '32px',
        marginTop: '40px',
        borderBottom: `4px solid ${primaryColor}`,
        paddingBottom: '16px',
        textAlign: 'center' as const
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