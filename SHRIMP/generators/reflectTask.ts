/**
 * reflectTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader";

/**
 * reflectTask prompt 參數介面
 */
export interface ReflectTaskPromptParams {
  summary: string;
  analysis: string;
}

/**
 * 獲取 reflectTask 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export async function getReflectTaskPrompt(
  params: ReflectTaskPromptParams
): Promise<string> {
  const indexTemplate = await loadPromptFromTemplate("reflectTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    summary: params.summary,
    analysis: params.analysis,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, "REFLECT_TASK");
}
