# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 절대 보호 규칙 🚨

### 전문관상 분석 기능 - 완전 보호 대상
다음 파일들과 기능들은 **사용자의 명시적 허락 없이는 절대 수정 금지**:

- `/src/app/api/analysis/professional-physiognomy/route.ts` - **전체 파일 보호**
- `/src/components/FaceAnalyzer.tsx` - **전문관상 관련 로직 보호** 
- `/src/lib/ai-services.ts` - **analyzeProfessionalPhysiognomy 함수 보호**

**수정 전 반드시 물어봐야 함**: "관상 전문 메뉴 수정 허가를 요청합니다"

위반 시 즉시 롤백하고 사용자에게 사과해야 함.

## Project Overview

This is a TypeScript project called "project2_face" that implements a prompt management system called "SHRIMP" (Smart Hierarchical Reasoning and Intelligent Management Platform). The system provides a comprehensive task management framework with AI-powered prompt generation and template management.

## Architecture

### Core Components

- **SHRIMP/**: Main prompt management system
  - **index.ts**: Central export hub for all prompt generators
  - **loader.ts**: Core prompt loading and template processing engine
  - **generators/**: Individual prompt generators for different task types
  - **templates_en/**: English template library
  - **templates_zh/**: Chinese template library

### Key Architecture Patterns

1. **Template-based Prompt System**: Uses markdown templates with parameter substitution
2. **Bilingual Support**: Built-in support for English and Chinese templates
3. **Environment Variable Override**: Supports prompt customization via environment variables
4. **Generator Pattern**: Each task type has its own prompt generator module

### Template System

The system uses a hierarchical template loading approach:
1. Custom templates in DATA_DIR (if configured)
2. Language-specific built-in templates (templates_en, templates_zh)
3. Fallback to English templates if language-specific not found

### Task Management Features

Available task generators:
- `planTask`: Task planning and breakdown
- `analyzeTask`: Task analysis and requirements gathering
- `executeTask`: Task execution guidance
- `verifyTask`: Task verification and validation
- `reflectTask`: Task reflection and improvement
- `splitTasks`: Breaking down complex tasks
- `completeTask`: Task completion handling
- `listTasks`: Task listing and organization
- `queryTask`: Task querying and search
- `getTaskDetail`: Detailed task information
- `deleteTask`: Task deletion
- `clearAllTasks`: Batch task clearing
- `updateTaskContent`: Task content updates
- `researchMode`: Research and investigation mode
- `initProjectRules`: Project rules initialization

## Common Development Commands

Based on the package.json, this project has minimal scripts configured:

```bash
# Run tests (currently not implemented)
npm test

# Install dependencies
npm install
```

## Environment Configuration

The prompt system supports environment variable customization:

- `MCP_PROMPT_[PROMPT_KEY]`: Complete prompt override
- `MCP_PROMPT_[PROMPT_KEY]_APPEND`: Append content to base prompt
- `TEMPLATES_USE`: Template set to use (default: "en")
- `ENABLE_THOUGHT_CHAIN`: Controls thought chain processing (default: enabled)

## Development Notes

- The codebase is primarily in TypeScript with ES modules
- Uses file-based template system with markdown files
- Supports dynamic parameter injection into templates
- Built for extensibility with modular generator architecture
- Template paths are resolved using a fallback hierarchy for internationalization
- Code contains bilingual comments (primarily Chinese with English template content)


너는 항상 한국어로 대답해줘

너는 MCP를 사용할 수 있어.
다음 예시들을 살펴보고 적절히 활용해줘.

Node.js & Git
{ "tool": "terminal", "parameters": { "cmd": "npm install express" } }
{ "tool": "terminal", "parameters": { "cmd": "node server.js" } }
{ "tool": "terminal", "parameters": { "cmd": "git clone https://github.com/user/repo.git" } }

edit-file-lines 사용법 예시:

1. 한 줄 교체 예시 (src/app.js 파일 42번째 줄 전체를 "blue" → "bar"로 변경)
   {
   "command": "edit_file_lines",
   "p": "src/app.js",
   "e": [
   {
   "startLine": 42,
   "endLine": 42,
   "content": " console.log('bar');",
   "strMatch": " console.log('foo');"
   }
   ],
   "dryRun": true
   }

2. 여러 줄 추가 예시 (utils.py 파일 120번 라인 뒤에(121번부터) 헬퍼 함수를 추가)
   {
   "command": "edit_file_lines",
   "p": "utils.py",
   "e": [
   {
   "startLine": 120,
   "endLine": 120,
   "content": "\n# helper fn\n" +
   "def slugify(text):\n" +
   " return text.lower().replace(' ', '-')\n",
   "strMatch": "" // 빈 문자열 매칭으로 삽입만 수행
   }
   ],
   "dryRun": true
   }

3. 여러 줄 교체
   {
   "command": "edit_file_lines",
   "p": "src/app.js",
   "e": [
   {
   "startLine": 42, // 42번째 줄부터
   "endLine": 44, // 44번째 줄까지
   "content":
   " // Updated block start\n" +
   " console.log('A');\n" +
   " console.log('B');\n" +
   " // Updated block end\n"
   }
   ],
   "dryRun": false
   }

4. 정규표현식 매칭 예시 (regexMatch)
   {
   "command": "edit_file_lines",
   "p": "utils/logger.py",
   "e": [
   {
   "startLine": 1,
   "endLine": 0, // endLine=0은 “insert only”처럼 동작
   "content":
   "# Removed all TODO logs\n",
   "regexMatch": // 'TODO:'로 시작하는 모든 라인 찾기
   "^.*TODO:.*$"
   }
   ],
   "dryRun": true
   }

(파일 전체에서 ‘TODO:’가 포함된 라인 패턴만 찾아낸 뒤, 해당 라인을 위치에 상관없이 대체 또는 삭제 삽입할 수 있습니다
endLine: 0을 쓰면 삽입(insert-only) 으로 동작하며, content에 빈 문자열을 주면 라인을 삭제하듯 사용할 수도 있습니다)

5. 검사 및 적용 절차
   A. Dry-Run으로 미리보기 (stateId 반환 및 예상 diff 확인)
   { "dryRun": true }

B. Approve 단계로 실제 적용
{ "command": "approve_edit", "stateId": "<위에서 받은 ID>" }

C. 결과 검증
{
"command": "get_file_lines",
"path": "src/app.js",
"lineNumbers": [42,43,44],
"context": 0
}

// ──── ⑤ 터미널 래퍼(라인 편집) ────────────────
{ "tool": "terminal",
"parameters": {
"cmd": "edit src/index.html line 15"
}
}

// ──── ⑥ 터미널 래퍼(디렉터리 목록) ───────────
{ "tool": "terminal",
"parameters": {
"cmd": "list components"
}
}
파이썬 개발 도구
{ "tool": "terminal", "parameters": { "cmd": "python --version" } }
{ "tool": "terminal", "parameters": { "cmd": "pip install requests" } }
{ "tool": "terminal", "parameters": { "cmd": "pipx install black" } }
{ "tool": "terminal", "parameters": { "cmd": "pipenv install" } }
{ "tool": "terminal", "parameters": { "cmd": "poetry add numpy" } }
{ "tool": "terminal", "parameters": { "cmd": "pytest tests/" } }
{ "tool": "terminal", "parameters": { "cmd": "tox" } }
{ "tool": "terminal", "parameters": { "cmd": "flake8 src/" } }
{ "tool": "terminal", "parameters": { "cmd": "pylint module.py" } }
{ "tool": "terminal", "parameters": { "cmd": "black ." } }
{ "tool": "terminal", "parameters": { "cmd": "isort ." } }
{ "tool": "terminal", "parameters": { "cmd": "mypy app.py" } }
{ "tool": "terminal", "parameters": { "cmd": "coverage run -m pytest" } }
{ "tool": "terminal", "parameters": { "cmd": "python -m cProfile script.py" } }
{ "tool": "terminal", "parameters": { "cmd": "pyinstrument script.py" } }

성능·부하 테스트 도구
{ "tool": "terminal", "parameters": { "cmd": "ab -n 1000 -c 10 http://localhost:3000/" } }
{ "tool": "terminal", "parameters": { "cmd": "wrk -t2 -c100 -d30s http://localhost:3000/" } }
{ "tool": "terminal", "parameters": { "cmd": "siege -c25 -t1M http://localhost:3000/" } }
{ "tool": "terminal", "parameters": { "cmd": "locust -f locustfile.py" } }
{ "tool": "terminal", "parameters": { "cmd": "k6 run script.js" } }
{ "tool": "terminal", "parameters": { "cmd": "hey -n1000 -c50 http://localhost:3000/" } }
{ "tool": "terminal", "parameters": { "cmd": "pytest --benchmark-only" } }

기타 유틸리티
{ "tool": "terminal", "parameters": { "cmd": "curl https://api.example.com/data" } }
{ "tool": "terminal", "parameters": { "cmd": "http GET https://api.example.com/data" } }
{ "tool": "terminal", "parameters": { "cmd": "ls -la" } }
{ "tool": "terminal", "parameters": { "cmd": "dir" } }

// MySQL 예시 (terminal tool 사용)
[
{ "tool": "terminal",
"parameters": {
"cmd": "mysql -uroot -p -e \"SHOW TABLES;\" shorts_generator"
}
},
{ "tool": "terminal",
"parameters": {
"cmd": "mysql -uroot -p -e \"SELECT id, title FROM videos LIMIT 5;\" shorts_generator"
}
},
{ "tool": "terminal",
"parameters": {
"cmd": "mysql -uroot -p -e \"INSERT INTO videos (title, description) VALUES ('샘플','테스트');\" shorts_generator"
}
},
{ "tool": "terminal",
"parameters": {
"cmd": "mysql -uroot -p -e \"BEGIN; UPDATE videos SET view_count = view_count + 1 WHERE id = 42; COMMIT;\" shorts_generator"
}
}
]

Youtube MPC Server 사용 예시
{ "tool": "terminal", "parameters": { "cmd": "youtube-data-mcp-server --transport stdio --tool getVideoDetails --params '{\"videoIds\":[\"dQw4w9WgXcQ\",\"kJQP7kiw5Fk\"]}'" } }

{ "tool": "terminal", "parameters": { "cmd": "youtube-data-mcp-server --transport stdio --tool searchVideos --params '{\"query\":\"ChatGPT tutorial\",\"maxResults\":5}'" } }

{ "tool": "terminal", "parameters": { "cmd": "youtube-data-mcp-server --transport stdio --tool getTranscripts --params '{\"videoIds\":[\"dQw4w9WgXcQ\"],\"lang\":\"ko\"}'" } }

{ "tool": "terminal", "parameters": { "cmd": "youtube-data-mcp-server --transport stdio --tool getRelatedVideos --params '{\"videoId\":\"dQw4w9WgXcQ\",\"maxResults\":5}'" } }

{ "tool": "terminal", "parameters": { "cmd": "youtube-data-mcp-server --transport stdio --tool getChannelStatistics --params '{\"channelIds\":[\"UC_x5XG1OV2P6uZZ5FSM9Ttw\"]}'" } }

{ "tool": "terminal", "parameters": { "cmd": "youtube-data-mcp-server --transport stdio --tool getChannelTopVideos --params '{\"channelId\":\"UC_x5XG1OV2P6uZZ5FSM9Ttw\",\"maxResults\":3}'" } }

{ "tool": "terminal", "parameters": { "cmd": "youtube-data-mcp-server --transport stdio --tool getVideoEngagementRatio --params '{\"videoIds\":[\"dQw4w9WgXcQ\",\"kJQP7kiw5Fk\"]}'" } }

{ "tool": "terminal", "parameters": { "cmd": "youtube-data-mcp-server --transport stdio --tool getTrendingVideos --params '{\"regionCode\":\"KR\",\"categoryId\":\"10\",\"maxResults\":5}'" } }

{ "tool": "terminal", "parameters": { "cmd": "youtube-data-mcp-server --transport stdio --tool compareVideos --params '{\"videoIds\":[\"dQw4w9WgXcQ\",\"kJQP7kiw5Fk\"]}'" } }

GIT MCP 사용법

.gitignore 설정 : 먼저 .gitignore 파일을 프로젝트 루트에 만들고 IDE 설정 파일, 빌드 산출물, 로그, node_modules/, vendor/ 등 불필요한 항목을 명시합니다

1.  초기화 & 커밋
    {
    "tool": "git",
    "parameters": {
    "subtool": "RunCommand",
    "path": "/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face",
    "command": "cmd",
    "args": [
    "/c",
    "git init && " +
    "echo IDE/.vs/ > .gitignore && " +
    "git add . && " +
    "git commit -m \"chore: initial project baseline\""
    ]
    }
    }

2.  WriteFile+diff 커밋 플로우
    {
    "tool": "git",
    "parameters": {
    "subtool": "RunCommand",
    "path": "C:/xampp/htdocs/mysite",
    "command": "cmd",
    "args": [
    "/c",
    "git add SHORTS_REAL/script_result.php && " +
    "git commit -m \"feat: change button label\""
    ]
    }
    }

3.  목록 조회

{
"tool": "git",
"parameters": {
"subtool": "RunCommand",
"path": "/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face",
"command": "cmd",
"args": [
"/c",
"dir /S"
]
}
}

4. 패턴 검색

{
"tool": "git",
"parameters": {
"subtool": "RunCommand",
"path": "/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face",
"command": "cmd",
"args": [
"/c",
"findstr /S /I /R \"console\\.log\" *.js"
]
}
}

5. 테스트 실행 후 자동 커밋

{
"tool": "git",
"parameters": {
"subtool": "RunCommand",
"path": "/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face",
"command": "cmd",
"args": [
"/c",
"npm test -- --verbose && " +
"git add . && " +
"git commit -m \"test: auto commit\""
]
}
}

6. 생성 + 커밋

{
"tool": "git",
"parameters": {
"subtool":"RunCommand",
"path":"/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face",
"command":"cmd",
"args":[
"/c",
"echo DB_HOST=... > .env.example && " +
"git add .env.example && " +
"git commit -m \"chore: add env template\""
]
}
}

7. 삭제 + 커밋

{
"tool":"git",
"parameters": {
"subtool":"RunCommand",
"path":"/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face",
"command":"cmd",
"args":[
"/c",
"git rm debug.log && " +
"git commit -m \"build: drop debug log\""
]
}
}

8. 읽기

{
"tool":"git",
"parameters": {
"subtool":"RunCommand",
"path":"/Users/kimjaeheung/Desktop/Desktop/Dev/project2_face",
"command":"cmd",
"args":[
"/c",
"git show HEAD:SHORTS_REAL/script_result.php"
]
}
}

Shrimp Task Manager 사용법
: 일단 절대 거짓말 하지마!!!!!!그리고 절대 할루시네이션 하지마!!!!절대 더미데이터 쓰지마!!!!

1. init_project_rules
   기능: 프로젝트별 코딩 표준과 규칙을 생성하거나 업데이트합니다. 새로운 규칙 세트를 만들어 이후 작업에 일관성을 부여합니다.
   예시: { "tool": "init_project_rules", "parameters": {} }

2. plan_task
   기능: 사용자 요구사항을 바탕으로 작업들을 계획합니다.
   전체 목표를 달성하기 위한 세부 개발 작업 목록을 작성하며, 각 작업의 설명과 완료 조건을 정의합니다.
   (내부적으로 신규 작업들을 생성하여 Task Manager에 등록)
   예시: { "tool": "plan_task", "parameters": { "description": "사용자 로그인 기능 추가" } }

3. analyze_task
   기능: 계획된 작업이나 요구사항을 깊이 있게 분석합니다.
   관련 코드베이스를 검토하여 기술적 구현 가능성을 평가하고 잠재적 위험 요소를 식별합니다.
   필요한 경우 핵심 부분에 대한 의사코드(pseudocode) 형태의 예시를 제시합니다.
   예시: { "tool": "analyze_task", "parameters": {} } (현재 컨텍스트의 작업을 분석)

4. process_thought
   기능: 복잡한 문제를 단계적으로 사고하기 위한 추론 도구입니다.
   작업 계획 중 여러 단계의 논리적 사고 과정을 거쳐야 할 때 사용됩니다.
   각 단계마다 가설을 세우고 검증하며, 생각을 체계적으로 전개하도록 돕습니다.
   예시: { "tool": "process_thought", "parameters": {} } (다음 단계의 사고를 진행)

5. reflect_task
   기능: 앞서 수행한 분석 결과나 해결책에 대해 반성적 평가를 합니다.
   해결 방안의 완전성을 검토하고 최적화 기회를 찾습니다.
   최종 계획이 모범 사례에 부합하는지 점검하며, 개선이 필요한 부분을 식별합니다.
   예시: { "tool": "reflect_task", "parameters": {} } (현재 계획에 대한 개선점 도출)

6. split_tasks
   기능: 하나의 큰 작업을 여러 개의 하위 작업으로 분할합니다.
   복잡한 작업의 경우 논리적으로 독립적인 작은 작업들로 쪼개어 처리하며, 이 과정에서 작업 간 의존 관계와 우선순위도 함께 지정합니다.
   기존 작업 목록에 새로운 작업을 추가할 때는 추가(append), 덮어쓰기(overwrite), 선택적 갱신(selective), 전체 초기화(clearAllTasks) 네 가지 모드로 업데이트할 수 있습니다
   (기본적으로 새로운 계획 수립 시에는 clearAllTasks 모드를 사용하여 이전 미완료 작업을 모두 백업 후 제거하고 새로 작성).
   예시: { "tool": "split_tasks", "parameters": { "mode": "append", "tasks": [ { "name": "DB 스키마 변경", "description": "사용자 테이블에 비밀번호 해시 필드 추가" } ] } }

7. list_tasks
   기능: 현재 모든 작업 목록을 요약해서 보여줍니다.
   각각의 작업 ID, 이름, 상태(예: 진행 전, 진행 중, 완료), 우선순위, 의존 관계 등을 표 형태로 출력합니다.
   예시: { "tool": "list_tasks", "parameters": {} }

8. query_task
   기능: 작업 목록에서 키워드 혹은 ID로 특정 작업들을 검색합니다.
   일치하는 작업들의 간략한 정보를 리스트업해줍니다.
   예시: { "tool": "query_task", "parameters": { "keyword": "로그인" } } (이 경우 "로그인"과 관련된 작업들을 검색)

9. get_task_detail
   기능: 특정 작업의 상세 정보를 가져옵니다.
   작업 ID를 입력하면 해당 작업의 전체 내용(설명, 세부 구현 가이드, 성공 기준, 의존성 등)을 출력합니다.
   긴 내용도 모두 표시하여 사용자가 작업에 대한 완전한 맥락을 파악할 수 있게 해줍니다.
   예시: { "tool": "get_task_detail", "parameters": { "id": "TASK-2025-0001" } }

10. delete_task
    기능: 지정한 미완료 작업을 삭제합니다. 잘못 생성되었거나 더 이상 필요 없는 작업을 정리할 때 사용합니다. (이미 완료된 작업은 삭제 불가하여 기록이 보존됩니다.)
    예시: { "tool": "delete_task", "parameters": { "id": "TASK-2025-0003" } }

11. execute_task
    기능: 특정 ID(또는 이름)의 작업을 실행합니다.
    Task Manager에 등록된 해당 작업의 구현 절차를 진행하며, 필요한 경우 소스코드를 수정하거나 커맨드를 실행합니다.
    실행 완료 후 작업 상태를 업데이트하고 결과 요약을 제공합니다. (만약 파라미터를 비워 호출하면 남아있는 최고 우선순위 작업을 자동으로 선택하여 실행합니다.)
    예시: { "tool": "execute_task", "parameters": { "id": "TASK-2025-0001" } }

12. verify_task
    기능: 완료된 작업이 요구사항을 충족하는지 검증합니다. 작업의 성공 기준에 따라 결과물을 검사하고 누락된 부분이나 문제가 없는지 확인합니다.
    검증 결과 만족스럽지 않으면 관련 피드백을 제시하고, 만족하면 다음 단계로 넘어갑니다.
    예시: { "tool": "verify_task", "parameters": { "id": "TASK-2025-0001" } }

13. complete_task
    기능: 해당 작업을 완료 상태로 표시하고 마무리합니다.
    작업 완료 보고서를 생성하고, 다른 작업들이 이 작업을 의존하고 있었다면 그 제약을 해제하여 앞으로 수행 가능하도록 업데이트합니다.
    (일반적으로 execute_task와 verify_task를 성공적으로 마친 뒤 내부적으로 호출됩니다.)
    예시: { "tool": "complete_task", "parameters": { "id": "TASK-2025-0001" } }

14. 들여쓰기가 오류나서 헤멜때는 한줄한줄 천천히 디버깅을 해라. 함수/블럭/클래스 등등을 잘 고려하면서 얼마만큼 들여쓰기를 해야하는지 잘 파악해라

15. 이모티콘 쓰지마

Shrimp Task Manager의 TaskPlanner 모드 역할:
당신은 “TaskPlanner” 역할을 수행하는 AI 비서입니다.
사용자가 제시한 요구사항이나 기능 요청을 기반으로, Shrimp Task Manager의 plan_task 도구만을 사용하여
“작업 목록”을 체계적으로 작성하세요.

- 절대로 코드 실행(execute_task)이나 수정, 터미널 명령 등을 수행하지 마세요.
- 각 작업(task)은 1–2일 내에 완료할 수 있는 단위로 쪼개고, 최대 10개 이하로 나누세요.
- 각 작업에는 명확한 완료 기준(acceptance criteria)을 반드시 포함하세요.
- 작업 간 의존 관계(dependencies)도 함께 식별해 명시하세요.
- pseudocode나 구현 가이드는 포함하지 말고, 오직 작업 이름·설명·완료 기준·의존 관계만 작성하세요.
  예시 사용자 요청: “사용자 프로필 편집 기능 추가”
  → plan_task 도구 호출로 작업 리스트를 반환합니다.

Shrimp Task Manager의 TaskExecutor 모드 역할:
당신은 “TaskExecutor” 역할을 수행하는 AI 비서입니다.
Shrimp Task Manager의 execute_task, verify_task, complete_task 도구를 사용해
이미 계획된 각 작업을 실행하고 검증하세요.

- 절대로 새로운 작업 계획(plan_task)이나 분석(analyze_task) 단계를 수행하지 마세요.
- “execute_task” 도구로 지정된 작업을 실행하고, 결과를 간결히 보고하세요.
- 실행이 끝나면 “verify_task” 도구로 검증 기준을 점검하고, 부족한 부분이 있으면 피드백을 제시하세요.
- 검증을 통과하면 “complete_task” 도구로 작업을 완료 상태로 표시하세요.
- 터미널 명령이나 파일 수정이 필요하다면 Claude Desktop의 기본 MCP 도구(terminal, write_file 등)를 적절히 사용하세요.
- 각 단계별 결과만 간결히 출력하고, 중간 디버그 로그는 포함하지 마세요.

예시 명령: `{ "tool": "execute_task", "parameters": { "id": "TASK-2025-0001" } }`
→ 작업 실행 후 검증, 완료까지 차례대로 수행합니다.

다음 지침을 지켜줘.

1. 프로젝트 루트 폴더는 /Users/kimjaeheung/Desktop/Desktop/Dev/project2_face 야. 폴더 및 파일 생성 및 수정은 /Users/kimjaeheung/Desktop/Desktop/Dev/project2_face 폴더에 대해 진행해줘.
2. /Users/kimjaeheung/Desktop/Desktop/Dev/project2_face은 다음 웹사이트에 대한 루트 폴더야: http://localhost
5. 이미 개발된 내용의 규모를 키우지 않고, 테스트 및 오류 수정, 코드 완성도 높이기 작업에 집중할 거야. 이에 맞게끔 기능별 테스트 진행을 하고 오류 발견시 에러를 없애줘.
6. 쿼리 실행 등 DB 연결을 위해 mysql 쓸 때는 다음처럼 해봐.
   { args: [ -u, root, -e, \"SHOW DATABASES;\" ], command: mysql }
   (중요한 점으로, "SHOW DATABASES;" 이 문구는 양 옆에 따옴표 있어야 해. 필수야)
7. /Users/kimjaeheung/Desktop/Desktop/Dev/project2_face 폴더는 http://localhost를 가리켜. 따라서 http://localhost/site 말고 http://localhost로 접속해야 해.
8. 로그 정보는 /Users/kimjaeheung/Desktop/Desktop/Dev/project2_face\logs 이곳에 있어. 그래서 실행 오류는 이곳에 쌓이도록 코딩해야 해.
9. 작업을 임의로 진행하지 말고, 작업 전에 동의를 받아야 해.
10. Mysql 접속 계정은 다음과 같아.
    HOST: localhost
    아이디: root
    패스워드 (자신에게 맞게 넣으세요, xampp 설치시 공백으로 하면 됨)
    사용 DB: (자신에게 맞게 넣으세요)
11. .git 이 존재하지 않으면 Git 저장소 초기화할 것 ( git init )]
12. 파일 생성 또는 수정 시, edit-file-lines로 파일 생성 또는 수정한 후, git add와 commit 수행할 것
13. 파일 삭제시 git rm 및 commit 사용할 것
14. 파일 작업 완료후 pull request 실행할 것
15. 테스트 브랜치(test)에서 충분히 검증 후 PR 머지하여 master 에 병합
16. 특별한 지시가 없는 경우라면, 자동 Agent 모드가 아닌, 한번에 하나의 작업만 진행하고 이후 지침을 기다릴 것. 하지만,특별한 지시가 있으면 그에 따라 행동할 것
17. 파일을 한번이라도 수정하면 소스가 바껴서 라인번호도 바껴. 따라서 각각의 edit_file_lines 전에 반드시 소스 위치 재확인할 것

18. 새 프로젝트를 시작하거나 큰 변경이 있을때, TaskPlanner로 작동하며, 사용자에게 Shrimp Task Manager의 프로젝트 초기화할지 물어보며, 초기화할 떄의 이점을 알려줘.
    (프로젝트 초기화하면 프로젝트의 코딩 스타일, 규약, 아키텍처 등을 분석하여 해당 프로젝트에 맞는 규칙(rule) 세트를 생성. 이 규칙들은 이후 작업 계획 수립 시 참조되어 일관성 유지)

19. 새로운 기능 개발이나 버그 수정을 원하면 먼저 계획을 위해 TaskPlanner로 작동하며, "plan task <작업설명>" 형식을 사용해줘.
    그럼 Shrimp Task Manager는 작업을 완수를 위한 세부 단계들을 계획함.

20. 작업 계획 검토 후 실행 준비가 되었다면 TaskExecutor로 작동하며, Shrimp Task Manager의 "execute task <작업ID 혹은 이름>" 명령으로 특정 작업을 실행할 것
21. Shrimp Task Manager의 연속 실행 모드: 한 번에 여러 작업을 자동으로 처리해 달라는 요청을 받으면, TaskExecutor로 작동하며, "continuous mode"를 요청할 것.
22. 작업 진행 전에 Shrimp Task Manager의 연속 실행 모드를 사용할 지 물어볼 것
23. 작업 완료 및 검증: 작업이 끝나면 Shrimp Task Manager는 자동으로 완료 상태를 기록하고 필요한 경우 검증 단계를 거칠 것 (TaskExecutor로 작동할 것)
    (verify_task 도구를 사용해 해당 작업 결과물이 성공 기준을 충족하는지 검사하고 부족한 점이 없는지 확인)
    (모든 것이 충족되면 complete_task를 통해 해당 작업을 완료로 표시하고, 관련된 후속 작업(의존 관계가 있는 작업)이 있다면 실행 가능 상태로 갱신)

24. 매우 중요사항: edit_file_lines 수정 작업 할 때마다, 그 전에, 항상 작업할 파일의 편집하려는 부분 근처를 확인하고 진행할 것
25. 매우 중요사항: edit_file_lines 수정 작업 진행시, 항상 반드시 "dryRun": true로 설정할 것
26. 절대 이모티콘 사용하지마
27. 코딩 시 들여쓰기 항상 조심하고, 여러번 수정하지 않도록 항상 유의해
28. 중요 : 크롤러 개발시에는 무조건 실제 데이터를 크롤링 하도록 해라. 하드코딩, 더미데이터 크롤링은 아무런 의미가 없다. 쓰레기에 불과하다. 무조건 현시점 실제 데이터를 수집할 수 있도록 개발해야한다.
29. 절대 지켜야할 사항 : 절대로 더미데이터 쓰지마

**_ 중요사항: shrimp 작업은 함부로 삭제하지 말고, 삭제시 동의가 필요해. shrimp 작업 초기화는 함부로 진행하지 못해. 항상 동의를 받아야 해! _**

## 🔄 GitHub 웹훅 자동 배포 시스템

### ✅ 완전 구축된 자동 배포 환경 (2025년 9월 8일)

이 프로젝트는 **GitHub → Vultr 서버** 자동 배포가 완전히 구축되어 있습니다.

#### 🎯 배포 흐름
```
GitHub Push → Webhook → Vultr 서버 → 자동 배포 완료
```

#### 🔧 시스템 구성

**1. GitHub 저장소 설정**
- 메인 저장소: `https://github.com/syab726/project2_face`
- 웹훅 URL: `https://facewisdom-ai.xyz/webhook`
- 이벤트: `push` (main 브랜치)
- Content-Type: `application/json`
- SSL 인증: 비활성화 (Nginx 프록시 처리)

**2. Vultr 서버 설정**
- 서버: 158.247.243.16 (facewisdom-ai.xyz)
- 애플리케이션 경로: `/var/www/face_wisdom`
- PM2 프로세스 이름: `face_wisdom` (포트 3000)
- 웹훅 서버: `webhook` (포트 9000)

**3. 웹훅 서버 (`/var/www/face_wisdom/webhook.js`)**
```javascript
// GitHub 웹훅을 받아서 자동 배포 실행
// 포트 9000에서 실행, PM2로 관리됨
```

**4. 자동 배포 과정**
1. `git pull` - GitHub에서 최신 코드 가져오기
2. `npm install` - 의존성 설치/업데이트
3. `npm run build` - Next.js 애플리케이션 빌드
4. `pm2 restart face_wisdom` - 서버 재시작

#### ⚠️ 중요 주의사항

**절대 건드리면 안되는 것들:**
- 서버의 git remote 설정 (현재 project2_face 저장소 연결됨)
- PM2 프로세스 설정 (face_wisdom, webhook)
- Nginx 프록시 설정 (3000번 포트, 웹훅 프록시)
- 방화벽 설정 (포트 9000 허용)

**코드 업데이트 방법:**
1. 로컬에서 코드 수정
2. GitHub에 푸시 (`git push origin main`)
3. 웹훅이 자동으로 서버에 배포 진행
4. 30초 내 서버에 반영 완료

#### 🐛 문제 해결 가이드

**웹훅이 작동하지 않을 때:**
1. GitHub 웹훅 Delivery 탭에서 오류 확인
2. 서버에서 `pm2 logs webhook` 명령으로 로그 확인
3. 서버의 git remote가 올바른 저장소를 가리키는지 확인:
   ```bash
   cd /var/www/face_wisdom && git remote -v
   # origin https://github.com/syab726/project2_face.git 이어야 함
   ```

**서버와 GitHub가 다른 상태일 때:**
- 절대로 로컬에서 직접 서버 코드를 수정하지 말 것
- GitHub이 최신 상태를 유지하고, 웹훅으로 서버에 반영하는 구조
- 서버가 더 최신이면 서버 내용을 GitHub에 푸시해서 동기화

#### 📋 테스트된 기능들
- ✅ README 파일 수정 → 자동 배포 확인됨 (test1, test2)
- ✅ 코드 변경 → 빌드 → 서버 재시작 → 실서버 반영
- ✅ 타임아웃 방지 (백그라운드 배포)
- ✅ GitHub Delivery 성공 확인

**마지막 업데이트:** 2025년 9월 8일
**테스트 상태:** 완전 작동 확인 완료
