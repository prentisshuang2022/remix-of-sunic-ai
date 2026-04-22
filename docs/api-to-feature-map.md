# API 接口 - 功能映射表

> 基于 OpenAPI 契约 + 前端功能清单 · 2026-04-22

---

## 1. 认证模块 (Auth)

| 接口 ID | 方法 | 路径 | 对应页面 | 对应功能 | 前端调用位置 |
|---------|------|------|---------|---------|-------------|
| AUTH-01 | POST | /auth/login | 登录页（待建） | 用户登录 | 待建 |
| AUTH-02 | POST | /auth/logout | 全局 | 退出登录 | AppSidebar |
| AUTH-03 | POST | /auth/refresh | 全局 | Token 刷新 | API 拦截器 |
| AUTH-04 | GET | /auth/me | 全局 | 获取当前用户信息与权限 | AppLayout |

## 2. 员工管理模块 (Employees)

| 接口 ID | 方法 | 路径 | 对应页面 | 对应功能 | 前端调用位置 |
|---------|------|------|---------|---------|-------------|
| EMP-01 | GET | /employees | 员工列表 | F2.4 分页查询 | src/pages/Employees.tsx |
| EMP-02 | GET | /employees/:id | 员工详情 | F2.8 档案卡片 | src/pages/EmployeeDetail.tsx |
| EMP-03 | POST | /employees/sync | 员工列表 | F2.1 钉钉全量同步 | src/pages/Employees.tsx |
| EMP-04 | PUT | /employees/:id/resolve-diff | 员工列表 | F2.2 差异对比处理 | src/pages/Employees.tsx |
| EMP-05 | POST | /employees/batch | 员工列表 | F2.5 批量操作 | src/pages/Employees.tsx |
| EMP-06 | POST | /employees/:id/materials | 员工详情 | F2.6/F2.10 资料上传+OCR | src/components/employees/UpdateMaterialsDialog.tsx |
| EMP-07 | GET | /employees/:id/changes | 员工详情 | F2.11 异动记录 | src/pages/EmployeeDetail.tsx |
| EMP-08 | POST | /employees/export | 员工列表 | F2.7 导出 | src/pages/Employees.tsx |

## 3. 部门模块 (Departments)

| 接口 ID | 方法 | 路径 | 对应页面 | 对应功能 | 前端调用位置 |
|---------|------|------|---------|---------|-------------|
| DEPT-01 | GET | /departments/tree | 员工列表筛选 | 部门树形选择器 | src/pages/Employees.tsx |
| DEPT-02 | POST | /departments | 组织架构管理（待建） | 创建部门 | 待建 |
| DEPT-03 | PUT | /departments/:id | 组织架构管理（待建） | 更新部门 | 待建 |
| DEPT-04 | DELETE | /departments/:id | 组织架构管理（待建） | 删除部门 | 待建 |

## 4. 考勤模块 (Attendance)

| 接口 ID | 方法 | 路径 | 对应页面 | 对应功能 | 前端调用位置 |
|---------|------|------|---------|---------|-------------|
| ATT-01 | GET | /attendance/exceptions | 考勤助手 | F3.1 异常列表 | src/pages/Attendance.tsx |
| ATT-02 | GET | /attendance/exceptions/:id | 异常详情 | F3.7 异常详情卡 | src/pages/AttendanceException.tsx |
| ATT-03 | PUT | /attendance/exceptions/:id | 异常详情 | F3.8/F3.3 处理操作 | src/pages/AttendanceException.tsx |
| ATT-04 | POST | /attendance/exceptions/batch | 考勤助手 | F3.6 批量处理 | src/pages/Attendance.tsx |
| ATT-05 | GET | /attendance/overtime | 考勤助手 | F3.5 加班/调休列表 | src/pages/Attendance.tsx |
| ATT-06 | PUT | /attendance/overtime/:id | 考勤助手 | F3.6 核销加班 | src/pages/Attendance.tsx |
| ATT-07 | POST | /attendance/overtime/batch | 考勤助手 | F3.6 批量核销 | src/pages/Attendance.tsx |

## 5. 绩效模块 (Performance)

| 接口 ID | 方法 | 路径 | 对应页面 | 对应功能 | 前端调用位置 |
|---------|------|------|---------|---------|-------------|
| PERF-01 | GET | /performance/overview | 绩效助手 | F5.1 核心指标 | src/pages/Performance.tsx |
| PERF-02 | GET | /performance/cycles | 绩效助手 | F5.2 考核周期列表 | src/pages/Performance.tsx |
| PERF-03 | POST | /performance/cycles | 绩效助手 | F5.3 新建考核周期 | src/components/performance/NewCycleDialog.tsx |
| PERF-04 | GET | /performance/cycles/:id | 周期详情 | F5.10/F5.11 阶段进度+明细 | src/pages/PerformanceCycle.tsx |
| PERF-05 | GET | /performance/forms/:id | 绩效表单 | F5.13 KPI评分表 | src/pages/PerformanceForm.tsx |
| PERF-06 | PUT | /performance/forms/:id | 绩效表单 | F5.15 提交评分 | src/pages/PerformanceForm.tsx |
| PERF-07 | POST | /performance/forms/:id/validate | 绩效表单 | F5.14 AI异常检测 | src/pages/PerformanceForm.tsx |
| PERF-08 | POST | /performance/cycles/:id/remind | 绩效助手 | F5.9 一键催办 | src/pages/Performance.tsx |
| PERF-09 | GET | /performance/strategy | 绩效助手 | F5.4 战略目标 | src/pages/Performance.tsx |
| PERF-10 | PUT | /performance/strategy | 绩效助手 | F5.4 更新战略目标 | src/pages/Performance.tsx |
| PERF-11 | POST | /performance/strategy/ai-breakdown | 绩效助手 | F5.4 AI目标拆解 | src/pages/Performance.tsx |
| PERF-12 | GET | /performance/indicators | 绩效助手 | F5.5 指标库列表 | src/pages/Performance.tsx |
| PERF-13 | POST | /performance/indicators | 绩效助手 | F5.6 新建指标 | src/components/performance/NewIndicatorDialog.tsx |
| PERF-14 | GET | /performance/interviews | 绩效助手 | F5.8 面谈队列 | src/pages/Performance.tsx |
| PERF-15 | GET | /performance/interviews/:id | 绩效面谈 | F5.16-F5.19 面谈报告 | src/pages/PerformanceInterview.tsx |
| PERF-16 | POST | /performance/interviews/:id/regenerate | 绩效面谈 | F5.16 AI重新生成 | src/pages/PerformanceInterview.tsx |
| PERF-17 | POST | /performance/interviews/:id/notes | 绩效面谈 | F5.18 保存面谈记录 | src/pages/PerformanceInterview.tsx |
| PERF-18 | GET | /performance/data-sources | 绩效助手 | F5.7 过程数据源 | src/pages/Performance.tsx |

## 6. 招聘模块 (Recruitment)

| 接口 ID | 方法 | 路径 | 对应页面 | 对应功能 | 前端调用位置 |
|---------|------|------|---------|---------|-------------|
| REC-01 | GET | /jobs | 招聘需求池 | F4.2 岗位列表 | src/pages/Recruiting.tsx |
| REC-02 | POST | /jobs | 招聘需求池 | F4.3 新建岗位 | src/pages/Recruiting.tsx |
| REC-03 | GET | /jobs/:id | 岗位画像 | F4.8 画像详情 | src/pages/JobProfile.tsx |
| REC-04 | PUT | /jobs/:id | 岗位画像 | 更新岗位 | src/pages/JobProfile.tsx |
| REC-05 | POST | /jobs/:id/generate-profile | 岗位画像 | F4.8 AI画像生成 | src/pages/JobProfile.tsx |
| REC-06 | PUT | /jobs/:id/profile | 岗位画像 | F4.9 画像编辑 | src/pages/JobProfile.tsx |
| REC-07 | GET | /resumes | 简历库 | F4.7 简历列表 | src/pages/ResumeLibrary.tsx |
| REC-08 | POST | /resumes/upload | 简历库 | F4.5 简历上传 | src/pages/ResumeLibrary.tsx |
| REC-09 | POST | /resumes/:id/parse | 简历库 | F4.6 AI解析 | src/pages/ResumeLibrary.tsx |
| REC-10 | POST | /jobs/:id/match | 候选人管理 | F4.10 AI匹配 | src/pages/Candidates.tsx |
| REC-11 | GET | /jobs/:id/candidates/:cid | 候选人管理 | F4.12 候选人详情 | src/pages/Candidates.tsx |

## 7. 面试模块 (Interview)

| 接口 ID | 方法 | 路径 | 对应页面 | 对应功能 | 前端调用位置 |
|---------|------|------|---------|---------|-------------|
| INT-01 | POST | /interviews | 候选人管理 | F4.13 面试安排 | src/pages/Candidates.tsx |
| INT-02 | POST | /interviews/:id/feedback | 面试反馈（待建） | 提交面试评价 | 待建 |

## 8. 培训模块 (Training)

| 接口 ID | 方法 | 路径 | 对应页面 | 对应功能 | 前端调用位置 |
|---------|------|------|---------|---------|-------------|
| TRN-01 | GET | /training/overview | 培训助手 | F6.1 KPI统计 | src/pages/Training.tsx |
| TRN-02 | GET | /training/tasks | 培训助手 | F6.3 待办任务 | src/pages/Training.tsx |
| TRN-03 | GET | /training/exams | 培训助手 | F6.4 考试速览 | src/pages/Training.tsx |
| TRN-04 | POST | /training/exams/generate | 培训助手 | F6.7 AI出卷 | src/components/training/NewExamDialog.tsx |
| TRN-05 | GET | /training/grading-queue | 脱岗培训 | F6.9 批改队列 | src/pages/TrainingOffsite.tsx |
| TRN-06 | PUT | /training/grading/:id | 脱岗培训 | F6.9 HR复核 | src/pages/TrainingOffsite.tsx |
| TRN-07 | GET | /training/scores | 脱岗培训 | F6.10 成绩列表 | src/pages/TrainingOffsite.tsx |
| TRN-08 | GET | /training/question-bank/tree | 题库管理 | F6.13 题库树 | src/pages/TrainingQuestionBank.tsx |
| TRN-09 | GET | /training/questions | 题库管理 | F6.14 题目列表 | src/pages/TrainingQuestionBank.tsx |
| TRN-10 | POST | /training/questions/generate | 题库管理 | F6.15 AI生成题目 | src/pages/TrainingQuestionBank.tsx |
| TRN-11 | POST | /training/exams/compose | 题库管理 | F6.16 组卷 | src/pages/TrainingQuestionBank.tsx |
| TRN-12 | GET | /training/materials | 培训材料 | F6.17 材料列表 | src/pages/TrainingMaterials.tsx |
| TRN-13 | POST | /training/materials/upload | 培训材料 | F6.8 上传材料 | src/components/training/ImportMaterialsSheet.tsx |
| TRN-14 | GET | /training/mentors | 导师管理 | F6.18 导师列表 | src/pages/TrainingMentors.tsx |
| TRN-15 | POST | /training/mentors | 导师管理 | F6.20 新增导师 | src/components/training/AddMentorDialog.tsx |
| TRN-16 | GET | /training/mentors/:id | 导师管理 | F6.19 导师详情 | src/pages/TrainingMentors.tsx |
| TRN-17 | GET | /training/onsite/plans | 在岗培训 | F6.11 培训计划 | src/pages/TrainingOnsite.tsx |
| TRN-18 | POST | /training/onsite/plans/:id/checkpoint | 在岗培训 | F6.12 节点打卡 | src/pages/TrainingOnsite.tsx |

## 9. AI 模块

| 接口 ID | 方法 | 路径 | 对应页面 | 对应功能 | 前端调用位置 |
|---------|------|------|---------|---------|-------------|
| AI-01 | POST | /ai/chat/send | 新建对话 | F7.3 流式对话 | src/pages/ChatNew.tsx |
| AI-02 | GET | /ai/chat/sessions | 历史对话 | F7.6 会话列表 | src/pages/ChatHistory.tsx |
| AI-03 | GET | /ai/chat/sessions/:id | 历史对话 | F7.8 会话回放 | src/pages/ChatHistory.tsx |
| AI-04 | PUT | /ai/chat/sessions/:id | 历史对话 | F7.7 会话操作 | src/pages/ChatHistory.tsx |
| AI-05 | POST | /ai/resume/screen | 简历库 | AI简历筛选 | src/pages/ResumeLibrary.tsx |
| AI-06 | GET | /ai/knowledge-bases | AI配置（待建） | 知识库管理 | 待建 |
| AI-07 | POST | /ai/knowledge-bases/:id/documents | AI配置（待建） | 上传知识文档 | 待建 |

## 10. 工作台 & 通用

| 接口 ID | 方法 | 路径 | 对应页面 | 对应功能 | 前端调用位置 |
|---------|------|------|---------|---------|-------------|
| DASH-01 | GET | /dashboard/stats | 工作台 | F1.1 统计卡片 | src/pages/Dashboard.tsx |
| DASH-02 | GET | /dashboard/todos | 工作台 | F1.3 今日待办 | src/pages/Dashboard.tsx |
| DASH-03 | GET | /dashboard/ai-insight | 工作台 | F1.4 AI今日洞察 | src/pages/Dashboard.tsx |
| SYS-01 | POST | /notifications/send | 全局 | 通知推送 | 多处调用 |

---

## 汇总

| 模块 | 接口数 | 已有前端页面 | 待建页面 |
|------|--------|-------------|---------|
| Auth | 4 | 0 | 1（登录页） |
| 员工 | 8 | 2 | 0 |
| 部门 | 4 | 0 | 1（组织架构） |
| 考勤 | 7 | 2 | 0 |
| 绩效 | 18 | 5 | 0 |
| 招聘 | 11 | 4 | 0 |
| 面试 | 2 | 0 | 1（面试反馈） |
| 培训 | 18 | 6 | 0 |
| AI | 7 | 2 | 1（知识库管理） |
| 工作台 | 4 | 1 | 0 |
| **合计** | **83** | **22** | **4** |
