import sharp from 'sharp';
import path from 'path';
export function getFieldDisplayName(field) {
    const fieldMap = {
        love: '연애',
        business: '사업',
        health: '건강',
        children: '자녀',
        comprehensive: '종합',
        personality: '성격',
        tendency: '성향',
        wealth: '재물운',
        relationships: '대인관계',
        career: '직업',
        marriage: '결혼'
    };
    return fieldMap[field] || field;
}
export function getFieldDescription(field) {
    const descriptions = {
        love: '연애 운세, 이성과의 관계, 로맨틱한 만남에 대한 분석',
        business: '사업 성공 가능성, 리더십, 사업 파트너십에 대한 분석',
        health: '건강 상태, 체질, 주의해야 할 건강 요소에 대한 분석',
        children: '자녀 운, 육아 능력, 가족 관계에 대한 분석',
        comprehensive: '모든 분야를 종합한 전반적인 운세 분석',
        personality: '성격 특성, 기질, 타고난 성향에 대한 분석',
        tendency: '행동 패턴, 습관, 성향에 대한 분석',
        wealth: '재물 운, 금전 관리 능력, 투자 성향에 대한 분석',
        relationships: '대인관계, 사회성, 인맥 관리에 대한 분석',
        career: '직업 적성, 커리어 발전, 업무 능력에 대한 분석',
        marriage: '결혼 운, 배우자 관계, 가정 생활에 대한 분석'
    };
    return descriptions[field] || '선택된 분야에 대한 상세 분석';
}
export function getFieldPrice(field) {
    return field === 'comprehensive' ? 19900 : 9900;
}
export function getFieldPriceString(field) {
    const price = getFieldPrice(field);
    return `${price.toLocaleString()}원`;
}
export function validateImageData(imageData) {
    try {
        if (!imageData.startsWith('data:image/')) {
            return {
                isValid: false,
                error: '올바른 이미지 형식이 아닙니다.'
            };
        }
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0];
        if (!supportedTypes.includes(mimeType)) {
            return {
                isValid: false,
                error: '지원되지 않는 이미지 형식입니다. JPEG, PNG, WebP만 지원됩니다.'
            };
        }
        const base64Data = imageData.split(',')[1];
        if (!base64Data || base64Data.length < 100) {
            return {
                isValid: false,
                error: '이미지 데이터가 올바르지 않습니다.'
            };
        }
        const estimatedSize = (base64Data.length * 3) / 4;
        const maxSize = 10 * 1024 * 1024;
        if (estimatedSize > maxSize) {
            return {
                isValid: false,
                error: '이미지 크기가 너무 큽니다. 10MB 이하의 이미지를 사용해주세요.'
            };
        }
        return { isValid: true };
    }
    catch (error) {
        return {
            isValid: false,
            error: '이미지 데이터 검증 중 오류가 발생했습니다.'
        };
    }
}
export async function preprocessImage(imageData) {
    try {
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0];
        const buffer = Buffer.from(base64Data, 'base64');
        const processedBuffer = await sharp(buffer)
            .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true
        })
            .jpeg({ quality: 85 })
            .toBuffer();
        const processedBase64 = processedBuffer.toString('base64');
        return `data:image/jpeg;base64,${processedBase64}`;
    }
    catch (error) {
        console.error('Image preprocessing failed:', error);
        return imageData;
    }
}
export function formatAnalysisResult(result) {
    if ('fiveFeatures' in result) {
        const freeResult = result;
        return `
## 오악 분석 결과

### 이마 (額)
${freeResult.fiveFeatures.forehead}

### 눈 (目)
${freeResult.fiveFeatures.eyes}

### 코 (鼻)
${freeResult.fiveFeatures.nose}

### 입 (口)
${freeResult.fiveFeatures.mouth}

### 턱 (頦)
${freeResult.fiveFeatures.chin}

## 종합 분석
${freeResult.summary}

## 조언
${freeResult.generalAdvice}
    `.trim();
    }
    else {
        const premiumResult = result;
        const fieldName = getFieldDisplayName(premiumResult.selectedField);
        let formatted = `
## ${fieldName} 분야 전문 분석

### 긍정적 요소
${premiumResult.detailedAnalysis.positiveAspects.map(aspect => `• ${aspect}`).join('\n')}

### 주의할 점
${premiumResult.detailedAnalysis.negativeAspects.map(aspect => `• ${aspect}`).join('\n')}

### 상세 해석
${premiumResult.detailedAnalysis.interpretation}

### 전문가 조언
${premiumResult.detailedAnalysis.advice}
    `.trim();
        if (premiumResult.comprehensiveSummary) {
            formatted += `

## 종합 요약

### 얼굴 균형과 조화
${premiumResult.comprehensiveSummary.balance}

### 전반적 운세 경향
${premiumResult.comprehensiveSummary.overallTendency}

### 인생 흐름 조언
${premiumResult.comprehensiveSummary.lifeFlowAdvice}
      `.trim();
        }
        return formatted;
    }
}
export function formatAnalysisResultAsHTML(result) {
    const markdownText = formatAnalysisResult(result);
    return markdownText
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^• (.+)$/gm, '<li>$1</li>')
        .replace(/(\n<li>.*\n)+/g, (match) => `<ul>${match}</ul>`)
        .replace(/\n\n/g, '</p><p>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<h[23]>)/g, '$1')
        .replace(/(<\/h[23]>)<\/p>/g, '$1');
}
export function generateSessionId() {
    return `face_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function calculateProgress(status) {
    const progressMap = {
        'detecting': 25,
        'analyzing': 50,
        'interpreting': 75,
        'completed': 100,
        'failed': 0
    };
    return progressMap[status] || 0;
}
export function getStatusMessage(status) {
    const messageMap = {
        'detecting': '얼굴 특징을 파악하고 있습니다...',
        'analyzing': '특징을 바탕으로 관상을 분석하고 있습니다...',
        'interpreting': '선택하신 분야에 대한 해석을 작성하고 있습니다...',
        'completed': '분석이 완료되었습니다!',
        'failed': '분석 중 오류가 발생했습니다.'
    };
    return messageMap[status] || '처리 중...';
}
export function getUserFriendlyErrorMessage(error) {
    const errorMap = {
        'QUOTA_EXCEEDED': 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        'SAFETY_VIOLATION': '안전 정책 위반으로 분석을 진행할 수 없습니다.',
        'NETWORK_ERROR': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
        'INVALID_IMAGE': '올바르지 않은 이미지입니다. 다른 이미지를 시도해주세요.',
        'NO_FACE_DETECTED': '얼굴을 인식할 수 없습니다. 명확한 얼굴 사진을 업로드해주세요.',
        'IMAGE_TOO_LARGE': '이미지 크기가 너무 큽니다. 10MB 이하의 이미지를 사용해주세요.',
        'UNSUPPORTED_FORMAT': '지원되지 않는 이미지 형식입니다. JPEG, PNG 형식만 지원됩니다.'
    };
    return errorMap[error] || '처리 중 오류가 발생했습니다. 다시 시도해주세요.';
}
export function generateAnalysisSummary(result) {
    if ('fiveFeatures' in result) {
        const freeResult = result;
        return `오악 분석을 통한 관상 해석 결과입니다. ${freeResult.summary.substring(0, 100)}...`;
    }
    else {
        const premiumResult = result;
        const fieldName = getFieldDisplayName(premiumResult.selectedField);
        return `${fieldName} 분야 전문 분석 결과입니다. ${premiumResult.detailedAnalysis.interpretation.substring(0, 100)}...`;
    }
}
export function canAnalyze(imageData) {
    const validation = validateImageData(imageData);
    if (!validation.isValid) {
        return {
            canAnalyze: false,
            reason: validation.error
        };
    }
    return { canAnalyze: true };
}
export function getMimeTypeFromExtension(filename) {
    const extension = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif'
    };
    return mimeTypes[extension] || 'application/octet-stream';
}
export function calculateImageSize(base64Data) {
    return Math.floor((base64Data.length * 3) / 4);
}
export function generateAnalysisStats(results) {
    const stats = {
        totalAnalyses: results.length,
        freeAnalyses: 0,
        premiumAnalyses: 0,
        fieldDistribution: {}
    };
    results.forEach(result => {
        if ('fiveFeatures' in result) {
            stats.freeAnalyses++;
            stats.fieldDistribution['free'] = (stats.fieldDistribution['free'] || 0) + 1;
        }
        else {
            stats.premiumAnalyses++;
            const field = result.selectedField;
            stats.fieldDistribution[field] = (stats.fieldDistribution[field] || 0) + 1;
        }
    });
    return stats;
}
//# sourceMappingURL=faceUtils.js.map