/**
 * Prompt 管理系統索引文件
 * 匯出所有 prompt 生成器和載入工具
 */

// 匯出核心工具
export { loadPrompt, generatePrompt } from "./loader";

// 當完成各個模塊時，將在下方匯出各個 prompt 生成器
// 例如：
export { getPlanTaskPrompt } from "./generators/planTask";
export { getAnalyzeTaskPrompt } from "./generators/analyzeTask";
export { getReflectTaskPrompt } from "./generators/reflectTask";
export { getSplitTasksPrompt } from "./generators/splitTasks";
export { getExecuteTaskPrompt } from "./generators/executeTask";
export { getVerifyTaskPrompt } from "./generators/verifyTask";
export { getCompleteTaskPrompt } from "./generators/completeTask";
export { getListTasksPrompt } from "./generators/listTasks";
export { getQueryTaskPrompt } from "./generators/queryTask";
export { getGetTaskDetailPrompt } from "./generators/getTaskDetail";
export { getInitProjectRulesPrompt } from "./generators/initProjectRules";
export { getDeleteTaskPrompt } from "./generators/deleteTask";
export { getClearAllTasksPrompt } from "./generators/clearAllTasks";
export { getUpdateTaskContentPrompt } from "./generators/updateTaskContent";
export { getResearchModePrompt } from "./generators/researchMode";
