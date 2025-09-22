/**
 * updateTaskContent prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader";
import { Task, RelatedFile } from "../../types/index";

/**
 * updateTaskContent prompt 參數介面
 */
export interface UpdateTaskContentPromptParams {
  taskId: string;
  task?: Task;
  success?: boolean;
  message?: string;
  validationError?: string;
  emptyUpdate?: boolean;
  updatedTask?: Task;
}

/**
 * 獲取 updateTaskContent 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export async function getUpdateTaskContentPrompt(
  params: UpdateTaskContentPromptParams
): Promise<string> {
  const {
    taskId,
    task,
    success,
    message,
    validationError,
    emptyUpdate,
    updatedTask,
  } = params;

  // 處理任務不存在的情況
  if (!task) {
    const notFoundTemplate = await loadPromptFromTemplate(
      "updateTaskContent/notFound.md"
    );
    return generatePrompt(notFoundTemplate, {
      taskId,
    });
  }

  // 處理驗證錯誤的情況
  if (validationError) {
    const validationTemplate = await loadPromptFromTemplate(
      "updateTaskContent/validation.md"
    );
    return generatePrompt(validationTemplate, {
      error: validationError,
    });
  }

  // 處理空更新的情況
  if (emptyUpdate) {
    const emptyUpdateTemplate = await loadPromptFromTemplate(
      "updateTaskContent/emptyUpdate.md"
    );
    return generatePrompt(emptyUpdateTemplate, {});
  }

  // 處理更新成功或失敗的情況
  const responseTitle = success ? "Success" : "Failure";
  let content = message || "";

  // 更新成功且有更新後的任務詳情
  if (success && updatedTask) {
    const successTemplate = await loadPromptFromTemplate(
      "updateTaskContent/success.md"
    );

    // 編合相關文件信息
    let filesContent = "";
    if (updatedTask.relatedFiles && updatedTask.relatedFiles.length > 0) {
      const fileDetailsTemplate = await loadPromptFromTemplate(
        "updateTaskContent/fileDetails.md"
      );

      // 관련 파일 목록 (단순 문자열 배열)
      const relatedFilesText = updatedTask.relatedFiles && updatedTask.relatedFiles.length > 0
        ? updatedTask.relatedFiles.map(file => `- ${file}`).join('\n')
        : '관련 파일 없음';

      // 파일 관련 내용 생성
      filesContent = generatePrompt(fileDetailsTemplate, {
        fileType: "관련 파일",
        fileCount: updatedTask.relatedFiles?.length || 0,
        filesList: relatedFilesText,
      });
    }

    // 處理任務備註
    const taskNotesPrefix = "- **Notes:** ";
    const taskNotes = updatedTask.notes
      ? `${taskNotesPrefix}${
          updatedTask.notes.length > 100
            ? `${updatedTask.notes.substring(0, 100)}...`
            : updatedTask.notes
        }\n`
      : "";

    // 生成成功更新的詳細信息
    content += generatePrompt(successTemplate, {
      taskName: updatedTask.name,
      taskDescription:
        updatedTask.description.length > 100
          ? `${updatedTask.description.substring(0, 100)}...`
          : updatedTask.description,
      taskNotes: taskNotes,
      taskStatus: updatedTask.status,
      taskUpdatedAt: updatedTask.updatedAt ? new Date(updatedTask.updatedAt).toISOString() : new Date().toISOString(),
      filesContent,
    });
  }

  const indexTemplate = await loadPromptFromTemplate(
    "updateTaskContent/index.md"
  );
  const prompt = generatePrompt(indexTemplate, {
    responseTitle,
    message: content,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, "UPDATE_TASK_CONTENT");
}
