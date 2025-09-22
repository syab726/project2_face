/**
 * 경로 관련 유틸리티 함수
 */

import path from "path";
import os from "os";
import fs from "fs";

/**
 * 데이터 디렉토리 경로를 가져옵니다
 * @returns 데이터 디렉토리의 절대 경로
 */
export async function getDataDir(): Promise<string> {
  // 환경변수에서 DATA_DIR 확인
  if (process.env.DATA_DIR) {
    const dataDir = path.resolve(process.env.DATA_DIR);
    
    // 디렉토리가 존재하지 않으면 생성
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    return dataDir;
  }

  // 기본값: 프로젝트 루트의 data 디렉토리
  const projectRoot = process.cwd();
  const defaultDataDir = path.join(projectRoot, "data");
  
  // 디렉토리가 존재하지 않으면 생성
  if (!fs.existsSync(defaultDataDir)) {
    fs.mkdirSync(defaultDataDir, { recursive: true });
  }
  
  return defaultDataDir;
}

/**
 * 프로젝트 루트 디렉토리 경로를 가져옵니다
 * @returns 프로젝트 루트 디렉토리의 절대 경로
 */
export function getProjectRoot(): string {
  return process.cwd();
}

/**
 * 임시 디렉토리 경로를 가져옵니다
 * @returns 임시 디렉토리의 절대 경로
 */
export function getTempDir(): string {
  return os.tmpdir();
}

/**
 * 상대 경로를 절대 경로로 변환합니다
 * @param relativePath 상대 경로
 * @param basePath 기준 경로 (기본값: 현재 작업 디렉토리)
 * @returns 절대 경로
 */
export function resolveAbsolutePath(relativePath: string, basePath?: string): string {
  const base = basePath || process.cwd();
  return path.resolve(base, relativePath);
}
