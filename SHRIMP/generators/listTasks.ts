/**
 * listTasks prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader";
import { Task, TaskStatus } from "../../types/index";

/**
 * listTasks prompt 參數介面
 */
export interface ListTasksPromptParams {
  status: string;
  tasks: Record<string, Task[]>;
  allTasks: Task[];
}

/**
 * 獲取 listTasks 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export async function getListTasksPrompt(
  params: ListTasksPromptParams
): Promise<string> {
  const { status, tasks, allTasks } = params;

  // 如果沒有任務，顯示通知
  if (allTasks.length === 0) {
    const notFoundTemplate = await loadPromptFromTemplate(
      "listTasks/notFound.md"
    );
    const statusText = status === "all" ? "任何" : `任何 ${status} 的`;
    return generatePrompt(notFoundTemplate, {
      statusText: statusText,
    });
  }

  // 獲取所有狀態的計數
  const statusCounts = (['pending', 'in_progress', 'completed', 'blocked', 'cancelled'] as const)
    .map((statusType) => {
      const count = tasks[statusType]?.length || 0;
      return `- **${statusType}**: ${count} 개 작업`;
    })
    .join("\n");

  let filterStatus = "all";
  switch (status) {
    case "pending":
      filterStatus = "pending";
      break;
    case "in_progress":
      filterStatus = "in_progress";
      break;
    case "completed":
      filterStatus = "completed";
      break;
  }

  let taskDetails = "";
  let taskDetailsTemplate = await loadPromptFromTemplate(
    "listTasks/taskDetails.md"
  );
  // 添加每個狀態下的詳細任務
  for (const statusType of ['pending', 'in_progress', 'completed', 'blocked', 'cancelled'] as const) {
    const tasksWithStatus = tasks[statusType] || [];
    if (
      tasksWithStatus.length > 0 &&
      (filterStatus === "all" || filterStatus === statusType)
    ) {
      for (const task of tasksWithStatus) {
        let dependencies = "沒有依賴";
        if (task.dependencies && task.dependencies.length > 0) {
          dependencies = task.dependencies
            .map((d) => `\`${d}\``)
            .join(", ");
        }
        taskDetails += generatePrompt(taskDetailsTemplate, {
          name: task.name,
          id: task.id,
          description: task.description,
          createAt: task.createdAt,
          complatedSummary:
            (task.notes || "").substring(0, 100) +
            ((task.notes || "").length > 100 ? "..." : ""),
          dependencies: dependencies,
          complatedAt: task.completedAt,
        });
      }
    }
  }

  const indexTemplate = await loadPromptFromTemplate("listTasks/index.md");
  let prompt = generatePrompt(indexTemplate, {
    statusCount: statusCounts,
    taskDetailsTemplate: taskDetails,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, "LIST_TASKS");
}
