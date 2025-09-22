import React from 'react';
import { 
  parseMarkdownToElements, 
  getHeaderStyle, 
  getParagraphStyle, 
  getStrongStyle, 
  getListItemStyle,
  MarkdownElement 
} from '@/lib/markdown-utils';

interface MarkdownRendererProps {
  content: any; // 타입을 any로 변경하여 다양한 데이터 타입 허용
  primaryColor?: string;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  primaryColor = '#333',
  accentColor = '#666',
  className,
  style 
}) => {
  if (!content) return null;

  const elements = parseMarkdownToElements(content);
  if (elements.length === 0) return <p style={getParagraphStyle()}>{content}</p>;

  return (
    <div className={className} style={style}>
      {elements.map((element, index) => {
        switch (element.type) {
          case 'h1':
            return (
              <h1 key={index} style={getHeaderStyle(1, primaryColor)}>
                {element.content}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={index} style={getHeaderStyle(2, primaryColor)}>
                {element.content}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} style={getHeaderStyle(3, primaryColor)}>
                {element.content}
              </h3>
            );
          case 'h4':
            return (
              <h4 key={index} style={getHeaderStyle(4, primaryColor)}>
                {element.content}
              </h4>
            );
          case 'strong':
            return (
              <div key={index} style={getStrongStyle(accentColor)}>
                {element.content}
              </div>
            );
          case 'li':
            return (
              <div key={index} style={getListItemStyle()}>
                <span style={{ position: 'absolute', left: '0', color: accentColor }}>•</span>
                {element.content}
              </div>
            );
          case 'p':
          default:
            return (
              <p key={index} style={getParagraphStyle()}>
                {element.content}
              </p>
            );
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;