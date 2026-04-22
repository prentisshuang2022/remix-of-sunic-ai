# 代码现状审计报告

> 生成日期：2026-04-22 · 仅分析，不改动代码

---

## 1. 目录结构差异

| 规范要求目录 | 当前状态 | 说明 |
|---|---|---|
| `src/api/` | ❌ **不存在** | 所有数据请求函数应按模块分文件放在此目录 |
| `src/types/` | ❌ **不存在** | 共享类型定义散落在各页面文件中 |
| `src/mocks/` | ❌ **不存在** | Mock 数据全部内联在页面组件里 |
| `src/hooks/` | ✅ 存在 | 仅含 `use-mobile.tsx`、`use-toast.ts`，无业务 Hook |
| `src/components/` | ✅ 存在 | 结构合理，按模块分子目录 |
| `src/pages/` | ✅ 存在 | 23 个页面文件 |
| `docs/` | ✅ 存在 | 仅含 `backend-spec.md` |

**核心差距**：`src/api/`、`src/types/`、`src/mocks/` 三个规范目录完全缺失，数据、类型、Mock 全部耦合在页面组件中。

---

## 2. 组件中直接写数据 / Mock 数据（违反"数据请求通过 src/api/"规范）

当前项目无真实 API 调用（无 fetch/axios/supabase），但大量 Mock 数据直接硬编码在页面组件中，违反"数据与展示分离"原则：

| 文件 | 内联数据量 | 说明 |
|---|---|---|
| `src/pages/Performance.tsx` | ~6 组常量 | overviewStats, historyCycles, DeptStrategy, indicatorFamilies, indicatorRows, stages 等 |
| `src/pages/Candidates.tsx` | ~2 组常量 | candidates[], DimScore 数据 |
| `src/pages/Recruiting.tsx` | ~1 组常量 | jobs[] |
| `src/pages/PerformanceForm.tsx` | ~1 组常量 | initialKpis[] |
| `src/pages/PerformanceCycle.tsx` | ~1 组常量 | Row 数据 |
| `src/pages/PerformanceInterview.tsx` | ~4 组常量 | strengths, improvements, talkingPoints, goalsNext |
| `src/pages/TrainingQuestionBank.tsx` | ~3 组常量 | TREE, QUESTIONS, AI 生成 samples |
| `src/pages/TrainingOffsite.tsx` | ~2 组常量 | QUEUE, SCORES |
| `src/pages/TrainingMentors.tsx` | 大量内联数据 | 导师列表、评价数据等 |
| `src/pages/TrainingOnsite.tsx` | 内联数据 | 培训课程数据 |
| `src/pages/TrainingMaterials.tsx` | 内联数据 | 材料列表 |
| `src/pages/Employees.tsx` | 内联数据 | 员工列表 |
| `src/pages/EmployeeDetail.tsx` | 内联数据 | 员工详情 |
| `src/pages/Attendance.tsx` | 内联数据 | 考勤数据 |
| `src/pages/AttendanceException.tsx` | 内联数据 | 异常详情 |
| `src/pages/ChatNew.tsx` | 内联数据 | 预设对话和卡片数据 |
| `src/pages/Dashboard.tsx` | 内联数据 | 仪表盘统计数据 |
| `src/pages/JobProfile.tsx` | 内联数据 | 岗位画像数据 |
| `src/pages/ResumeLibrary.tsx` | 内联数据 | 简历数据 |

**结论**：几乎所有 19 个业务页面都包含内联 Mock 数据。

---

## 3. 类型定义问题

### 3.1 `any` 使用情况

✅ **未发现显式 `any` 类型**。项目在这一点上符合规范。

### 3.2 类型定义位置问题

所有 `interface` / `type` 定义散落在页面文件中，未抽取到 `src/types/`：

| 文件 | 定义的类型 |
|---|---|
| `src/pages/ChatNew.tsx` | `Role`, `CardKind`, `Source`, `MsgCard`, `Message` |
| `src/pages/Candidates.tsx` | `DimScore`, `Candidate` |
| `src/pages/PerformanceCycle.tsx` | `Row` |
| `src/pages/TrainingQuestionBank.tsx` | `QType`, `Diff` |
| `src/pages/JobProfile.tsx` | `ProfileItem`, `Dimension` |
| `src/pages/ResumeLibrary.tsx` | `ParseStatus`, `Resume` |
| `src/pages/Employees.tsx` | `ContractStatus`, `IdStatus`, `EmployeeStatus`, `SyncStatus`, `DiffField`, `EmployeeRow` |
| `src/pages/Performance.tsx` | `StageStatus`, `KpiItem`, `DeptStrategy`, `CompanyStrategy` |
| `src/pages/PerformanceForm.tsx` | `KPI` |
| `src/pages/EmployeeDetail.tsx` | `FieldMeta` |
| `src/pages/AttendanceException.tsx` | `ExceptionDetail` |
| `src/pages/Recruiting.tsx` | `JobStatus`, `Job`, `CreateJobDialogProps` |

**结论**：12 个文件包含本地类型定义，应迁移至 `src/types/`。

---

## 4. JSDoc 注释缺失

`src/api/` 目录不存在，因此：

- **0 个 API 函数有 JSDoc 注释**
- **0 个 API 函数存在**

此项在 API 层创建时需一并补齐。当前页面组件中的数据操作函数（如 toast 回调、模拟异步操作）均无 JSDoc。

---

## 5. 其他发现

| 项目 | 状态 |
|---|---|
| `// [BACKEND]` / `// [FRONTEND-ONLY]` 标注 | ❌ 未使用 |
| API 统一返回 `{ success, data, error }` | ❌ 无 API 层 |
| 业务 Hooks（useUser 等） | ❌ 未创建 |
| `src/pages/Index.tsx` | 存在但未在 App.tsx 路由中注册 |
| `src/pages/ResumeLibrary.tsx` | 存在但未在 App.tsx 路由中注册 |

---

## 6. 整改批次建议（按工作量排序）

### 批次 1 — 基础设施搭建（最小工作量，无风险）
- 创建 `src/api/`、`src/types/`、`src/mocks/` 目录
- 创建统一的 API 响应类型 `ApiResponse<T>`
- 约 1-2 个文件

### 批次 2 — 类型抽取（低风险，12 个文件）
- 将 12 个页面中的 `interface` / `type` 迁移至 `src/types/`
- 按业务模块分文件：`employee.ts`、`performance.ts`、`recruiting.ts`、`training.ts`、`chat.ts`、`attendance.ts`
- 页面文件改为 `import` 引用

### 批次 3 — Mock 数据抽离（中等工作量，19 个文件，分 4 子批）
- **3a** 绩效模块（5 文件）：Performance, PerformanceCycle, PerformanceForm, PerformanceInterview, PerformanceSummary
- **3b** 培训模块（5 文件）：Training, TrainingMaterials, TrainingOffsite, TrainingOnsite, TrainingQuestionBank, TrainingMentors
- **3c** 员工 & 考勤（4 文件）：Employees, EmployeeDetail, Attendance, AttendanceException
- **3d** 招聘 & 其他（5 文件）：Recruiting, JobProfile, Candidates, ResumeLibrary, ChatNew, ChatHistory, Dashboard

### 批次 4 — API 层 & JSDoc（大工作量，需配合后端规格）
- 在 `src/api/` 按模块创建 API 函数（暂调用 Mock）
- 每个函数补齐 JSDoc（用途、HTTP method、path、入参、返回值、后端职责）
- 添加 `// [BACKEND]` / `// [FRONTEND-ONLY]` 标注

### 批次 5 — 业务 Hooks 封装（依赖批次 4）
- 创建 `useEmployees`、`usePerformance`、`useTraining` 等 Hooks
- 页面组件改为通过 Hooks 获取数据

---

## 总结

| 维度 | 合规度 | 备注 |
|---|---|---|
| 目录结构 | 🔴 30% | 缺 3 个核心目录 |
| 数据分离 | 🔴 0% | 19 个页面全部内联 |
| 类型管理 | 🟡 50% | 无 any，但位置不对 |
| JSDoc & 标注 | 🔴 0% | 无 API 层 |
| 组件纯净度 | 🟡 60% | 组件目录下较干净，页面耦合重 |
| 总体 | 🟠 ~28% | 需系统性整改，建议按 5 批次推进 |