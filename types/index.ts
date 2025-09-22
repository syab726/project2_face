/**
 * SHRIMP Task Manager 관련 타입 정의
 */

// Task 상태 타입
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

// Task 우선순위 타입
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// Task 의존성 타입
export interface TaskDependency {
  taskId: string;
  type: 'blocks' | 'enhances' | 'relates_to';
  description?: string;
}

// 관련 파일 타입
export interface RelatedFile {
  path: string;
  type: 'source' | 'config' | 'documentation' | 'test';
  description?: string;
  lastModified?: Date;
}

// Task 타입 정의
export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies?: string[];
  tags?: string[];
  estimatedTime?: number; // 예상 소요 시간 (분)
  actualTime?: number;    // 실제 소요 시간 (분)
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  notes?: string;
  implementationGuide?: string;
  verificationCriteria?: string[];
  relatedFiles?: string[];
  assignee?: string;
}

// Task 생성 요청 타입
export interface CreateTaskRequest {
  name: string;
  description: string;
  priority?: TaskPriority;
  dependencies?: string[];
  tags?: string[];
  estimatedTime?: number;
  implementationGuide?: string;
  verificationCriteria?: string[];
  relatedFiles?: string[];
}

// Task 업데이트 요청 타입
export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dependencies?: string[];
  tags?: string[];
  estimatedTime?: number;
  actualTime?: number;
  notes?: string;
  implementationGuide?: string;
  verificationCriteria?: string[];
  relatedFiles?: string[];
}

// Task 조회 필터 타입
export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  tags?: string[];
  assignee?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

// Task 정렬 옵션 타입
export interface TaskSortOptions {
  field: 'priority' | 'createdAt' | 'updatedAt' | 'name';
  order: 'asc' | 'desc';
}

// Task 목록 응답 타입
export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page?: number;
  pageSize?: number;
  hasNext?: boolean;
}

// Task 분석 결과 타입
export interface TaskAnalysisResult {
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: number;
  requiredSkills: string[];
  potentialRisks: string[];
  recommendations: string[];
}

// Project Rules 타입
export interface ProjectRules {
  codingStandards: {
    language: string;
    framework?: string;
    styleGuide: string;
    linting: boolean;
    formatting: boolean;
  };
  architecture: {
    pattern: string;
    layers: string[];
    conventions: string[];
  };
  testing: {
    strategy: string;
    coverage: number;
    frameworks: string[];
  };
  documentation: {
    required: boolean;
    format: string;
    coverage: string[];
  };
  deployment: {
    strategy: string;
    environments: string[];
    automation: boolean;
  };
  createdAt: Date;
  updatedAt?: Date;
}

// Tool 실행 결과 타입
export interface ToolExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: number;
}

// Prompt 생성 파라미터 타입
export interface PromptParams {
  [key: string]: any;
}

// Template 정보 타입
export interface TemplateInfo {
  path: string;
  language: string;
  description?: string;
  parameters?: string[];
}

// 환경 설정 타입
export interface EnvironmentConfig {
  dataDir: string;
  templatesUse: string;
  enableGui: boolean;
  enableThoughtChain: boolean;
}

// 오류 타입
export interface ShrimpError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ShrimpError;
  timestamp: Date;
}
