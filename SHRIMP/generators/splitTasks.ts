/**
 * splitTasks prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader";
import { Task } from "../../types/index";

/**
 * splitTasks prompt 參數介面
 */
export interface SplitTasksPromptParams {
  updateMode: string;
  createdTasks: Task[];
  allTasks: Task[];
}

/**
 * 獲取 splitTasks 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export async function getSplitTasksPrompt(
  params: SplitTasksPromptParams
): Promise<string> {
  const taskDetailsTemplate = await loadPromptFromTemplate(
    "splitTasks/taskDetails.md"
  );

  const tasksContent = params.createdTasks
    .map((task, index) => {
      let implementationGuide = "no implementation guide";
      if (task.implementationGuide) {
        implementationGuide =
          task.implementationGuide.length > 100
            ? task.implementationGuide.substring(0, 100) + "..."
            : task.implementationGuide;
      }

      let verificationCriteria = "no verification criteria";
      if (task.verificationCriteria && task.verificationCriteria.length > 0) {
        const criteriaText = task.verificationCriteria.join(', ');
        verificationCriteria =
          criteriaText.length > 100
            ? criteriaText.substring(0, 100) + "..."
            : criteriaText;
      }

      const dependencies = task.dependencies
        ? task.dependencies
            .map((d: any) => {
              // 查找依賴任務的名稱，提供更友好的顯示
              const depTask = params.allTasks.find((t) => t.id === d.taskId);
              return depTask
                ? `"${depTask.name}" (\`${d.taskId}\`)`
                : `\`${d.taskId}\``;
            })
            .join(", ")
        : "no dependencies";

      return generatePrompt(taskDetailsTemplate, {
        index: index + 1,
        name: task.name,
        id: task.id,
        description: task.description,
        notes: task.notes || "no notes",
        implementationGuide: implementationGuide,
        verificationCriteria: verificationCriteria,
        dependencies: dependencies,
      });
    })
    .join("\n");

  const indexTemplate = await loadPromptFromTemplate("splitTasks/index.md");
  const prompt = generatePrompt(indexTemplate, {
    updateMode: params.updateMode,
    tasksContent,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, "SPLIT_TASKS");
}
