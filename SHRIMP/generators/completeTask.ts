/**
 * completeTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader";
import { Task } from "../../types/index";

/**
 * completeTask prompt 參數介面
 */
export interface CompleteTaskPromptParams {
  task: Task;
  completionTime: string;
}

/**
 * 獲取 completeTask 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export async function getCompleteTaskPrompt(
  params: CompleteTaskPromptParams
): Promise<string> {
  const { task, completionTime } = params;

  const indexTemplate = await loadPromptFromTemplate("completeTask/index.md");

  // 開始構建基本 prompt
  let prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    completionTime: completionTime,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, "COMPLETE_TASK");
}
