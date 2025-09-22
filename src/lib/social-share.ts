// SNS 공유 유틸리티

export interface ShareData {
  title: string;
  text: string;
  url: string;
  hashtags?: string[];
  imageUrl?: string;
}

export class SocialShareService {
  
  /**
   * 네이티브 Web Share API 사용 (모바일 우선)
   */
  static async shareNative(data: ShareData): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }

    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      });
      return true;
    } catch (error) {
      // 사용자가 공유를 취소한 경우
      console.log('Native share cancelled:', error);
      return false;
    }
  }

  /**
   * 클립보드에 복사
   */
  static async copyToClipboard(data: ShareData): Promise<boolean> {
    const shareText = this.formatShareText(data);
    
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch (error) {
      // 폴백: 구식 방법
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  }

  /**
   * 카카오톡 공유
   */
  static shareKakao(data: ShareData) {
    // 카카오 SDK가 로드되어 있다면
    if (typeof window !== 'undefined' && (window as any).Kakao) {
      const Kakao = (window as any).Kakao;
      
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: data.title,
          description: data.text,
          imageUrl: data.imageUrl || '/images/og-image.png',
          link: {
            mobileWebUrl: data.url,
            webUrl: data.url,
          },
        },
        buttons: [
          {
            title: '내 결과도 보기',
            link: {
              mobileWebUrl: data.url,
              webUrl: data.url,
            },
          },
        ],
      });
    } else {
      // 카카오톡 앱 실행 (모바일)
      const kakaoUrl = `kakaotalk://msg?text=${encodeURIComponent(this.formatShareText(data))}`;
      window.open(kakaoUrl, '_self');
    }
  }

  /**
   * 페이스북 공유
   */
  static shareFacebook(data: ShareData) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.text)}`;
    this.openPopup(facebookUrl, 'facebook-share', 600, 600);
  }

  /**
   * 트위터 공유
   */
  static shareTwitter(data: ShareData) {
    const tweetText = data.hashtags 
      ? `${data.text} ${data.hashtags.map(tag => `#${tag}`).join(' ')}`
      : data.text;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(data.url)}`;
    this.openPopup(twitterUrl, 'twitter-share', 600, 400);
  }

  /**
   * 인스타그램 공유 (스토리)
   */
  static shareInstagram(data: ShareData) {
    // 인스타그램은 직접 공유 API가 없으므로 텍스트 복사
    this.copyToClipboard(data).then(success => {
      if (success) {
        alert('내용이 복사되었습니다! 인스타그램에서 붙여넣기하여 공유하세요.');
        // 인스타그램 앱 실행 시도
        window.open('instagram://camera', '_self');
      }
    });
  }

  /**
   * 라인 공유
   */
  static shareLine(data: ShareData) {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}`;
    this.openPopup(lineUrl, 'line-share', 600, 600);
  }

  /**
   * 밴드 공유
   */
  static shareBand(data: ShareData) {
    const bandUrl = `http://www.band.us/plugin/share?body=${encodeURIComponent(data.text)}&route=${encodeURIComponent(data.url)}`;
    this.openPopup(bandUrl, 'band-share', 600, 600);
  }

  /**
   * 네이버 블로그 공유
   */
  static shareNaverBlog(data: ShareData) {
    const naverUrl = `https://share.naver.com/web/shareView?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}`;
    this.openPopup(naverUrl, 'naver-share', 600, 600);
  }

  /**
   * 텔레그램 공유
   */
  static shareTelegram(data: ShareData) {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}`;
    this.openPopup(telegramUrl, 'telegram-share', 600, 600);
  }

  /**
   * WhatsApp 공유
   */
  static shareWhatsApp(data: ShareData) {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(this.formatShareText(data))}`;
    this.openPopup(whatsappUrl, 'whatsapp-share', 600, 600);
  }

  /**
   * 공유 텍스트 포맷팅
   */
  private static formatShareText(data: ShareData): string {
    let text = `${data.title}\n\n${data.text}\n\n${data.url}`;
    
    if (data.hashtags && data.hashtags.length > 0) {
      text += `\n\n${data.hashtags.map(tag => `#${tag}`).join(' ')}`;
    }
    
    return text;
  }

  /**
   * 팝업 창 열기
   */
  private static openPopup(url: string, name: string, width: number, height: number) {
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      url,
      name,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  }

  /**
   * 통합 공유 함수
   */
  static async share(platform: string, data: ShareData): Promise<void> {
    switch (platform) {
      case 'native':
        const nativeSuccess = await this.shareNative(data);
        if (!nativeSuccess) {
          // 폴백: 클립보드 복사
          await this.copyToClipboard(data);
          alert('링크가 클립보드에 복사되었습니다!');
        }
        break;
      case 'kakao':
        this.shareKakao(data);
        break;
      case 'facebook':
        this.shareFacebook(data);
        break;
      case 'twitter':
        this.shareTwitter(data);
        break;
      case 'instagram':
        this.shareInstagram(data);
        break;
      case 'line':
        this.shareLine(data);
        break;
      case 'band':
        this.shareBand(data);
        break;
      case 'naver':
        this.shareNaverBlog(data);
        break;
      case 'telegram':
        this.shareTelegram(data);
        break;
      case 'whatsapp':
        this.shareWhatsApp(data);
        break;
      case 'copy':
        const copySuccess = await this.copyToClipboard(data);
        if (copySuccess) {
          alert('링크가 클립보드에 복사되었습니다!');
        } else {
          alert('복사에 실패했습니다.');
        }
        break;
      default:
        console.warn('Unsupported platform:', platform);
    }
  }
}

/**
 * OG 이미지 생성 유틸리티
 */
export class OGImageGenerator {
  static generateImageUrl(data: {
    title: string;
    subtitle?: string;
    mbtiType?: string;
    score?: number;
  }): string {
    const params = new URLSearchParams({
      title: data.title,
      ...(data.subtitle && { subtitle: data.subtitle }),
      ...(data.mbtiType && { mbti: data.mbtiType }),
      ...(data.score && { score: data.score.toString() })
    });
    
    return `/api/og-image?${params.toString()}`;
  }
}