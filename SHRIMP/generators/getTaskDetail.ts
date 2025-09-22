/**
 * getTaskDetail prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader";
import { Task } from "../../types/index";

/**
 * getTaskDetail prompt 參數介面
 */
export interface GetTaskDetailPromptParams {
  taskId: string;
  task?: Task | null;
  error?: string;
}

/**
 * 獲取 getTaskDetail 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export async function getGetTaskDetailPrompt(
  params: GetTaskDetailPromptParams
): Promise<string> {
  const { taskId, task, error } = params;

  // 如果有錯誤，顯示錯誤訊息
  if (error) {
    const errorTemplate = await loadPromptFromTemplate(
      "getTaskDetail/error.md"
    );
    return generatePrompt(errorTemplate, {
      errorMessage: error,
    });
  }

  // 如果找不到任務，顯示找不到任務的訊息
  if (!task) {
    const notFoundTemplate = await loadPromptFromTemplate(
      "getTaskDetail/notFound.md"
    );
    return generatePrompt(notFoundTemplate, {
      taskId,
    });
  }

  let notesPrompt = "";
  if (task.notes) {
    const notesTemplate = await loadPromptFromTemplate(
      "getTaskDetail/notes.md"
    );
    notesPrompt = generatePrompt(notesTemplate, {
      notes: task.notes,
    });
  }

  let dependenciesPrompt = "";
  if (task.dependencies && task.dependencies.length > 0) {
    const dependenciesTemplate = await loadPromptFromTemplate(
      "getTaskDetail/dependencies.md"
    );
    dependenciesPrompt = generatePrompt(dependenciesTemplate, {
      dependencies: task.dependencies
        .map((dep) => `\`${dep}\``)
        .join(", "),
    });
  }

  let implementationGuidePrompt = "";
  if (task.implementationGuide) {
    const implementationGuideTemplate = await loadPromptFromTemplate(
      "getTaskDetail/implementationGuide.md"
    );
    implementationGuidePrompt = generatePrompt(implementationGuideTemplate, {
      implementationGuide: task.implementationGuide,
    });
  }

  let verificationCriteriaPrompt = "";
  if (task.verificationCriteria) {
    const verificationCriteriaTemplate = await loadPromptFromTemplate(
      "getTaskDetail/verificationCriteria.md"
    );
    verificationCriteriaPrompt = generatePrompt(verificationCriteriaTemplate, {
      verificationCriteria: task.verificationCriteria,
    });
  }

  let relatedFilesPrompt = "";
  if (task.relatedFiles && task.relatedFiles.length > 0) {
    const relatedFilesTemplate = await loadPromptFromTemplate(
      "getTaskDetail/relatedFiles.md"
    );
    relatedFilesPrompt = generatePrompt(relatedFilesTemplate, {
      files: task.relatedFiles
        .map(
          (file) =>
            `- \`${file}\``
        )
        .join("\n"),
    });
  }

  let complatedSummaryPrompt = "";
  if (task.completedAt) {
    const complatedSummaryTemplate = await loadPromptFromTemplate(
      "getTaskDetail/complatedSummary.md"
    );
    complatedSummaryPrompt = generatePrompt(complatedSummaryTemplate, {
      completedTime: task.completedAt ? new Date(task.completedAt).toLocaleString("zh-TW") : "완료되지 않음",
      summary: task.notes || "*완료 요약 없음*",
    });
  }

  const indexTemplate = await loadPromptFromTemplate("getTaskDetail/index.md");

  // 開始構建基本 prompt
  let prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    status: task.status,
    description: task.description,
    notesTemplate: notesPrompt,
    dependenciesTemplate: dependenciesPrompt,
    implementationGuideTemplate: implementationGuidePrompt,
    verificationCriteriaTemplate: verificationCriteriaPrompt,
    relatedFilesTemplate: relatedFilesPrompt,
    createdTime: new Date(task.createdAt).toLocaleString("zh-TW"),
    updatedTime: task.updatedAt ? new Date(task.updatedAt).toLocaleString("zh-TW") : "업데이트 없음",
    complatedSummaryTemplate: complatedSummaryPrompt,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, "GET_TASK_DETAIL");
}
