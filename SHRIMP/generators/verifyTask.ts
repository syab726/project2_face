/**
 * verifyTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader";
import { Task } from "../../types/index";

/**
 * verifyTask prompt 參數介面
 */
export interface VerifyTaskPromptParams {
  task: Task;
  score: number;
  summary: string;
}

/**
 * 提取摘要內容
 * @param content 原始內容
 * @param maxLength 最大長度
 * @returns 提取的摘要
 */
function extractSummary(
  content: string | undefined,
  maxLength: number
): string {
  if (!content) return "";

  if (content.length <= maxLength) {
    return content;
  }

  // 簡單的摘要提取：截取前 maxLength 個字符並添加省略號
  return content.substring(0, maxLength) + "...";
}

/**
 * 獲取 verifyTask 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export async function getVerifyTaskPrompt(
  params: VerifyTaskPromptParams
): Promise<string> {
  const { task, score, summary } = params;
  if (score < 80) {
    const noPassTemplate = await loadPromptFromTemplate("verifyTask/noPass.md");
    const prompt = generatePrompt(noPassTemplate, {
      name: task.name,
      id: task.id,
      summary,
    });
    return prompt;
  }
  const indexTemplate = await loadPromptFromTemplate("verifyTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    description: task.description,
    notes: task.notes || "no notes",
    verificationCriteria:
      task.verificationCriteria || "no verification criteria",
    implementationGuideSummary:
      extractSummary(task.implementationGuide, 200) ||
      "no implementation guide",
    analysisResult:
      extractSummary(task.notes, 300) || "no analysis result",
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, "VERIFY_TASK");
}
