# API 需求清单 (API Requirements)

> 基于前端功能清单推导 · 2026-04-22
>
> 约定：所有 API 返回 `{ success: boolean, data: T | null, error: string | null }` 统一结构

---

## 1. 员工模块 (Employee)

| # | API | Method | Path | 入参 | 返回 | 说明 |
|---|-----|--------|------|------|------|------|
| E-01 | 员工列表 | GET | `/api/employees` | `keyword, department, entity, contractStatus, syncStatus, page, pageSize` | `PaginatedData<Employee>` | 支持多条件筛选 |
| E-02 | 员工详情 | GET | `/api/employees/:id` | — | `Employee` (含完整字段 + 附件列表) | 包含数据源元信息 |
| E-03 | 钉钉全量同步 | POST | `/api/employees/sync` | — | `{ synced: number, diff: number, failed: number }` | 调用钉钉 API 拉取 |
| E-04 | 差异处理 | PUT | `/api/employees/:id/resolve-diff` | `{ action: "accept_dingtalk" \| "keep_system", fields: string[] }` | `Employee` | 逐条或批量 |
| E-05 | 批量操作 | POST | `/api/employees/batch` | `{ ids: string[], action: "sync" \| "accept" \| "remind" }` | `{ success: number, failed: number }` | — |
| E-06 | 上传材料 | POST | `/api/employees/:id/materials` | `FormData (file, type: "contract"\|"id_card"\|"diploma"\|"cert")` | `{ url, ocrResult? }` | OCR 可选 |
| E-07 | 异动记录 | GET | `/api/employees/:id/changes` | `page, pageSize` | `PaginatedData<ChangeRecord>` | — |
| E-08 | 导出 | POST | `/api/employees/export` | 同 E-01 筛选参数 | `{ fileUrl }` | 生成 Excel |

---

## 2. 考勤模块 (Attendance)

| # | API | Method | Path | 入参 | 返回 | 说明 |
|---|-----|--------|------|------|------|------|
| A-01 | 异常列表 | GET | `/api/attendance/exceptions` | `dateRange, type, status, page, pageSize` | `PaginatedData<AttendanceException>` | — |
| A-02 | 异常详情 | GET | `/api/attendance/exceptions/:id` | — | `AttendanceExceptionDetail` | 含 AI 建议 |
| A-03 | 处理异常 | PUT | `/api/attendance/exceptions/:id` | `{ action: "补卡"\|"核销"\|"联系"\|"升级", note? }` | `AttendanceException` | — |
| A-04 | 批量标记 | POST | `/api/attendance/exceptions/batch` | `{ ids, action }` | `{ success, failed }` | — |
| A-05 | 加班列表 | GET | `/api/attendance/overtime` | `dateRange, dept, status, page, pageSize` | `PaginatedData<OvertimeRecord>` | 区分职能/一线 |
| A-06 | 核销加班 | PUT | `/api/attendance/overtime/:id` | `{ action: "approve"\|"reject", note? }` | `OvertimeRecord` | — |
| A-07 | 批量核销 | POST | `/api/attendance/overtime/batch` | `{ ids, action }` | `{ success, failed }` | — |

---

## 3. 招聘模块 (Recruiting)

| # | API | Method | Path | 入参 | 返回 | 说明 |
|---|-----|--------|------|------|------|------|
| R-01 | 岗位列表 | GET | `/api/jobs` | `status, dept, keyword, page, pageSize` | `PaginatedData<Job>` | — |
| R-02 | 创建岗位 | POST | `/api/jobs` | `{ title, dept, location, headcount, salary?, urgency, owner, jd? }` | `Job` | — |
| R-03 | 岗位详情 | GET | `/api/jobs/:id` | — | `Job` (含画像) | — |
| R-04 | 更新岗位 | PUT | `/api/jobs/:id` | `Partial<Job>` | `Job` | — |
| R-05 | AI 生成画像 | POST | `/api/jobs/:id/generate-profile` | `{ jd }` | `JobProfile` | 提取硬性/加分/排除/维度 |
| R-06 | 更新画像 | PUT | `/api/jobs/:id/profile` | `JobProfile` | `JobProfile` | — |
| R-07 | 简历列表 | GET | `/api/resumes` | `status, keyword, page, pageSize` | `PaginatedData<Resume>` | — |
| R-08 | 上传简历 | POST | `/api/resumes/upload` | `FormData (files[])` | `{ uploaded, parsed, failed }` | 批量 |
| R-09 | AI 解析简历 | POST | `/api/resumes/:id/parse` | — | `ParsedResume` | — |
| R-10 | AI 匹配候选人 | POST | `/api/jobs/:id/match` | `{ topN? }` | `Candidate[]` | 含匹配度评分 |
| R-11 | 候选人详情 | GET | `/api/jobs/:id/candidates/:candidateId` | — | `CandidateDetail` | 含多维评分 |

---

## 4. 绩效模块 (Performance)

| # | API | Method | Path | 入参 | 返回 | 说明 |
|---|-----|--------|------|------|------|------|
| P-01 | 概览统计 | GET | `/api/performance/overview` | — | `PerformanceOverview` | 在考周期/待处理/超期/异常 |
| P-02 | 考核周期列表 | GET | `/api/performance/cycles` | — | `Cycle[]` | — |
| P-03 | 创建周期 | POST | `/api/performance/cycles` | `{ name, type, dateRange, depts, template }` | `Cycle` | — |
| P-04 | 周期详情 | GET | `/api/performance/cycles/:id` | — | `CycleDetail` (含阶段 + 员工列表) | — |
| P-05 | 绩效表单 | GET | `/api/performance/forms/:id` | — | `PerformanceForm` | 含 KPI 列表 + AI 建议 |
| P-06 | 提交评分 | PUT | `/api/performance/forms/:id` | `{ kpis: KpiScore[], comment }` | `PerformanceForm` | — |
| P-07 | AI 校验 | POST | `/api/performance/forms/:id/validate` | — | `{ anomalies: Anomaly[] }` | 分数与数据一致性 |
| P-08 | 一键催办 | POST | `/api/performance/cycles/:id/remind` | — | `{ sent: number }` | — |
| P-09 | 战略目标 | GET | `/api/performance/strategy` | — | `{ company: CompanyStrategy, depts: DeptStrategy[] }` | — |
| P-10 | 更新战略目标 | PUT | `/api/performance/strategy` | `{ company?, depts? }` | 同上 | — |
| P-11 | AI 目标拆解 | POST | `/api/performance/strategy/ai-breakdown` | `{ companyKpis }` | `DeptStrategy[]` | — |
| P-12 | 指标库列表 | GET | `/api/performance/indicators` | `family, keyword, page, pageSize` | `PaginatedData<Indicator>` | — |
| P-13 | 创建指标 | POST | `/api/performance/indicators` | `Indicator` | `Indicator` | — |
| P-14 | 面谈队列 | GET | `/api/performance/interviews` | — | `InterviewItem[]` | — |
| P-15 | 面谈报告 | GET | `/api/performance/interviews/:id` | — | `InterviewReport` | 含 AI 话术 |
| P-16 | AI 重新生成 | POST | `/api/performance/interviews/:id/regenerate` | — | `InterviewReport` | — |
| P-17 | 保存面谈记录 | POST | `/api/performance/interviews/:id/notes` | `{ content, archive? }` | `InterviewNote` | — |
| P-18 | 过程数据源 | GET | `/api/performance/data-sources` | — | `DataSource[]` | MES/ERP/PLM 等状态 |
| P-19 | 过程进度 | GET | `/api/performance/progress` | — | `ProgressRow[]` | — |

---

## 5. 培训模块 (Training)

| # | API | Method | Path | 入参 | 返回 | 说明 |
|---|-----|--------|------|------|------|------|
| T-01 | 培训概览 | GET | `/api/training/overview` | — | `TrainingOverview` | KPI 4 项 |
| T-02 | 待办任务 | GET | `/api/training/tasks` | `filter?` | `TrainingTask[]` | — |
| T-03 | 考试列表 | GET | `/api/training/exams` | `period, page, pageSize` | `PaginatedData<Exam>` | — |
| T-04 | AI 出卷 | POST | `/api/training/exams/generate` | `{ category, questionCount, difficulty, depts, sites }` | `Exam` | — |
| T-05 | 批改队列 | GET | `/api/training/grading-queue` | — | `GradingItem[]` | AI 初评 + 待复核 |
| T-06 | HR 复核 | PUT | `/api/training/grading/:id` | `{ score, comment }` | `GradingItem` | — |
| T-07 | 成绩列表 | GET | `/api/training/scores` | `exam?, dept?, page, pageSize` | `PaginatedData<Score>` | — |
| T-08 | 题库树 | GET | `/api/training/question-bank/tree` | — | `CategoryTree[]` | — |
| T-09 | 题目列表 | GET | `/api/training/questions` | `category, sub, type, difficulty, keyword, page, pageSize` | `PaginatedData<Question>` | — |
| T-10 | AI 生成题目 | POST | `/api/training/questions/generate` | `{ knowledgePoint, count, types }` | `Question[]` | — |
| T-11 | 组卷 | POST | `/api/training/exams/compose` | `{ questionIds[], title, duration, passLine }` | `Exam` | — |
| T-12 | 培训材料列表 | GET | `/api/training/materials` | `category, keyword, page, pageSize` | `PaginatedData<Material>` | — |
| T-13 | 上传材料 | POST | `/api/training/materials/upload` | `FormData` | `Material` | — |
| T-14 | 导师列表 | GET | `/api/training/mentors` | `craft, site, level, keyword` | `Mentor[]` | — |
| T-15 | 新增导师 | POST | `/api/training/mentors` | `NewMentorPayload` | `Mentor` | — |
| T-16 | 导师详情 | GET | `/api/training/mentors/:id` | — | `MentorDetail` | 含评价 |
| T-17 | 在岗培训计划 | GET | `/api/training/onsite/plans` | — | `OnsitePlan[]` | — |
| T-18 | 节点记录提交 | POST | `/api/training/onsite/plans/:id/checkpoint` | `{ week, content, attachments? }` | `Checkpoint` | — |

---

## 6. AI 对话模块 (Chat)

| # | API | Method | Path | 入参 | 返回 | 说明 |
|---|-----|--------|------|------|------|------|
| C-01 | 发送消息 | POST | `/api/chat/send` | `{ sessionId?, scene, message }` | `SSE stream: ChatMessage` | 流式返回 |
| C-02 | 会话列表 | GET | `/api/chat/sessions` | `scene?, keyword?, page, pageSize` | `PaginatedData<Session>` | — |
| C-03 | 会话详情 | GET | `/api/chat/sessions/:id` | — | `Session` (含 messages[]) | — |
| C-04 | 会话操作 | PUT | `/api/chat/sessions/:id` | `{ action: "pin"\|"unpin"\|"rename"\|"delete", title? }` | `Session` | — |

---

## 7. 通用/工作台

| # | API | Method | Path | 入参 | 返回 | 说明 |
|---|-----|--------|------|------|------|------|
| G-01 | 工作台统计 | GET | `/api/dashboard/stats` | — | `DashboardStats` | 聚合各模块 |
| G-02 | 今日待办 | GET | `/api/dashboard/todos` | — | `Todo[]` | 跨模块 |
| G-03 | AI 日报洞察 | GET | `/api/dashboard/ai-insight` | — | `{ text }` | AI 生成 |
| G-04 | 通知推送 | POST | `/api/notifications/send` | `{ userId, channel: "dingtalk"\|"sms", content }` | `{ sent }` | 钉钉/短信 |

---

## API 总计

| 模块 | 接口数 |
|------|--------|
| 员工 | 8 |
| 考勤 | 7 |
| 招聘 | 11 |
| 绩效 | 19 |
| 培训 | 18 |
| 对话 | 4 |
| 通用 | 4 |
| **合计** | **71** |