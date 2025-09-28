import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// FFmpeg 경로 설정
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export interface ShortsConfig {
  celebrityName: string;
  imagePath: string;
  outputDir: string;
}

export interface ShortsResult {
  success: boolean;
  videoPath?: string;
  error?: string;
  duration?: number;
}

export class ShortsGenerator {
  private tempDir: string;

  constructor(outputDir: string = './temp/shorts') {
    this.tempDir = outputDir;
    this.ensureDirectoryExists(this.tempDir);
  }

  private ensureDirectoryExists(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 유명인 이름으로 관상 분석 스크립트 생성
   */
  private generateScript(celebrityName: string, analysisResult: any): string {
    const scripts = [
      `${celebrityName}의 관상을 분석해보겠습니다!`,
      `${celebrityName}의 얼굴에서 볼 수 있는 특징은...`,
      `이마가 넓고 깨끗한 것으로 보아 지적 능력이 뛰어나고,`,
      `눈매가 선명한 것은 의지력이 강함을 나타냅니다.`,
      `코의 형태로 보아 리더십이 있고,`,
      `입 모양은 소통 능력이 우수함을 보여줍니다.`,
      `전체적으로 성공한 인생을 살 관상을 가지고 있네요!`
    ];

    return scripts.join(' ');
  }

  /**
   * 시스템 TTS로 음성 생성 (무료)
   */
  private async generateAudio(text: string): Promise<string> {
    const audioPath = path.join(this.tempDir, `audio_${Date.now()}.wav`);

    try {
      // macOS say 명령어로 한국어 음성 생성
      const command = `say -v Yuna -r 200 -o "${audioPath}" "${text}"`;
      execSync(command, { stdio: 'pipe' });

      if (fs.existsSync(audioPath)) {
        return audioPath;
      } else {
        throw new Error('Audio file not generated');
      }
    } catch (error) {
      console.error('TTS 생성 실패:', error);

      // 폴백: 무음 오디오 생성
      const silentCommand = `ffmpeg -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -t 30 "${audioPath}"`;
      try {
        execSync(silentCommand, { stdio: 'pipe' });
        return audioPath;
      } catch (fallbackError) {
        throw new Error('음성 생성에 실패했습니다.');
      }
    }
  }

  /**
   * FFmpeg로 이미지를 9:16 비율로 변환하고 자막 추가
   */
  private async prepareVideoImage(imagePath: string): Promise<string> {
    const outputPath = path.join(this.tempDir, `prepared_${Date.now()}.png`);

    return new Promise((resolve, reject) => {
      ffmpeg(imagePath)
        .outputOptions([
          '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
          '-frames:v', '1'
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  /**
   * FFmpeg로 영상 생성
   */
  private async createVideo(imagePath: string, audioPath: string, subtitle: string): Promise<string> {
    const outputPath = path.join(this.tempDir, `shorts_${Date.now()}.mp4`);
    const preparedImagePath = await this.prepareVideoImage(imagePath);

    // 자막을 위한 텍스트 필터 생성
    const textFilter = `drawtext=fontfile=/System/Library/Fonts/Arial.ttf:text='${subtitle.replace(/'/g, "\\'")}':fontcolor=white:fontsize=40:box=1:boxcolor=black@0.8:boxborderw=5:x=(w-text_w)/2:y=h-150`;

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(preparedImagePath)
        .input(audioPath)
        .inputOptions(['-loop 1']) // 이미지 루프
        .outputOptions([
          '-c:v libx264',           // H.264 코덱
          '-t 30',                  // 30초 길이
          '-pix_fmt yuv420p',       // 호환성을 위한 픽셀 포맷
          '-r 30',                  // 30fps
          '-c:a aac',               // AAC 오디오 코덱
          '-b:a 128k',              // 오디오 비트레이트
          '-vf', textFilter,        // 자막 필터
          '-shortest'               // 짧은 입력에 맞춤
        ])
        .output(outputPath)
        .on('end', () => {
          // 임시 파일 정리
          if (fs.existsSync(preparedImagePath)) {
            fs.unlinkSync(preparedImagePath);
          }
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg 오류:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * 메인 쇼츠 생성 함수
   */
  async generateShorts(config: ShortsConfig): Promise<ShortsResult> {
    const startTime = Date.now();

    try {
      console.log(`🎬 ${config.celebrityName} 쇼츠 생성 시작...`);

      // 1. 관상 분석 (기존 시스템 활용)
      console.log('📊 관상 분석 중...');
      const analysisResult = {}; // 실제로는 기존 관상 분석 API 호출

      // 2. 스크립트 생성
      console.log('📝 스크립트 생성 중...');
      const script = this.generateScript(config.celebrityName, analysisResult);

      // 3. 음성 생성
      console.log('🎵 음성 생성 중...');
      const audioPath = await this.generateAudio(script);

      // 4. 영상 생성
      console.log('🎥 영상 제작 중...');
      const videoPath = await this.createVideo(config.imagePath, audioPath, script);

      // 5. 임시 파일 정리
      fs.unlinkSync(audioPath);

      const duration = Date.now() - startTime;
      console.log(`✅ 쇼츠 생성 완료! (${duration}ms)`);

      return {
        success: true,
        videoPath,
        duration
      };

    } catch (error) {
      console.error('❌ 쇼츠 생성 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 임시 파일 정리
   */
  cleanup() {
    if (fs.existsSync(this.tempDir)) {
      const files = fs.readdirSync(this.tempDir);
      files.forEach(file => {
        const filePath = path.join(this.tempDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
    }
  }
}