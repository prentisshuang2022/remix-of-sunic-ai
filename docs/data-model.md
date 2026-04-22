# 数据模型 (Data Model)

> 基于前端类型定义 + 业务规则推导 · 2026-04-22

---

## 实体关系图 (ER Diagram)

> 见 `docs/er-diagram.mmd`（Mermaid 格式）

---

## 1. 员工模块

### Employee（员工）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string (PK) | ✅ | 员工编号 如 E001 |
| name | string | ✅ | 姓名 |
| status | enum | ✅ | active / leaving / pending |
| entity | string | ✅ | 合同归属实体（6 选 1） |
| department | string | ✅ | 所属部门 |
| position | string | ✅ | 职务 |
| hireDate | date | ✅ | 入职日期 |
| contractStart | date | ✅ | 合同开始 |
| contractEnd | date | ✅ | 合同结束 |
| contractStatus | enum | — | normal / soon / expired（计算字段） |
| idNumber | string | ✅ | 身份证号（脱敏） |
| idStart | date | ✅ | 身份证签发日 |
| idEnd | date | ✅ | 身份证到期日 |
| idStatus | enum | — | normal / soon / expired（计算字段） |
| gender | string | ✅ | 性别 |
| birth | date | ✅ | 出生日期 |
| phone | string | ✅ | 手机号（脱敏） |
| education | string | — | 学历 |
| school | string | — | 毕业院校 |
| major | string | — | 专业 |
| completeness | number | — | 资料完整度 (0-100) |
| syncStatus | enum | — | synced / pending / diff / failed |
| lastSyncAt | datetime | — | 上次同步时间 |
| lastChange | string | — | 最近异动 |
| createdAt | datetime | ✅ | 创建时间 |
| updatedAt | datetime | ✅ | 更新时间 |

### EmployeeDiff（钉钉差异）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| employeeId | string (FK) | 关联员工 |
| field | string | 差异字段名 |
| dingtalkValue | string | 钉钉值 |
| systemValue | string | 系统值 |
| resolvedAt | datetime | 处理时间 |
| action | enum | accept_dingtalk / keep_system / null |

### EmployeeMaterial（员工材料）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| employeeId | string (FK) | 关联员工 |
| type | enum | contract / id_card / diploma / cert |
| fileName | string | 文件名 |
| fileUrl | string | 存储路径 |
| ocrResult | json | OCR 识别结果 |
| uploadedAt | datetime | 上传时间 |

### ChangeRecord（异动记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| employeeId | string (FK) | 关联员工 |
| type | string | 入职 / 转正 / 调岗 / 续签 / 部门变动 等 |
| detail | string | 变动描述 |
| date | date | 异动日期 |

---

## 2. 考勤模块

### AttendanceException（考勤异常）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| employeeId | string (FK) | 关联员工 |
| date | date | 日期 |
| group | string | 考勤组 |
| clockIn | string | 上班打卡时间 |
| clockOut | string | 下班打卡时间 |
| type | enum | 迟到 / 早退 / 缺卡 / 旷工 |
| status | enum | pending / waiting-employee / approving / done |
| aiSuggestion | string | AI 处理建议 |
| resolvedAt | datetime | 处理时间 |
| resolvedBy | string | 处理人 |

### OvertimeRecord（加班记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| employeeId | string (FK) | 关联员工 |
| date | date | 加班日期 |
| group | string | 考勤组 |
| clockIn | string | 上班打卡 |
| clockOut | string | 下班打卡 |
| workHours | number | 工作时长(h) |
| deptType | enum | 职能部门 / 生产一线 |
| subsidyType | enum | 餐补 / 调休 / 金额 |
| subsidyValue | string | 补贴值 |
| status | enum | pending / approved / rejected |
| remark | string | 备注 |

---

## 3. 招聘模块

### Job（岗位需求）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| title | string | 岗位名称 |
| dept | string | 所属部门 |
| location | string | 工作地点 |
| headcount | number | 招聘人数 |
| salary | string | 薪资范围 |
| urgency | enum | 高 / 中 / 低 |
| status | enum | 招聘中 / 画像待生成 / 已暂停 / 已完成 |
| owner | string | 招聘负责人 |
| jd | text | 岗位描述 |
| hasProfile | boolean | 是否已生成画像 |
| resumeCount | number | 关联简历数 |
| matchedCount | number | 匹配候选人数 |
| createdAt | datetime | — |

### JobProfile（岗位画像）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| jobId | string (FK) | 关联岗位 |
| dimensions | json[] | 评分维度 [{key, label, weight, items[]}] |
| generatedAt | datetime | AI 生成时间 |

### Resume（简历）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| name | string | 候选人姓名 |
| phone | string | 联系方式 |
| fileUrl | string | 原始文件路径 |
| parseStatus | enum | 已解析 / 解析中 / 解析失败 |
| parsedData | json | 解析后的结构化数据 |
| uploadedAt | datetime | — |

### Candidate（候选人匹配记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| jobId | string (FK) | 关联岗位 |
| resumeId | string (FK) | 关联简历 |
| rank | number | 排名 |
| matchScore | number | 匹配度 |
| dimScores | json[] | 各维度评分 [{key, label, score, max}] |
| aiComment | string | AI 评语 |
| status | string | 筛选阶段 |

---

## 4. 绩效模块

### PerformanceCycle（考核周期）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| name | string | 如 "2025 Q2 季度考核" |
| type | string | 季度 / 半年 / 年度 |
| startDate | date | — |
| endDate | date | — |
| scope | string | 覆盖范围 |
| status | enum | 进行中 / 已结案 |
| stages | json[] | 5 阶段状态 |

### PerformanceForm（绩效表单）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| cycleId | string (FK) | 关联周期 |
| employeeId | string (FK) | 关联员工 |
| kpis | json[] | KPI 评分列表 [{code, name, weight, target, achievement, source, selfScore, leaderScore, aiSuggested}] |
| selfTotal | number | 自评总分 |
| leaderTotal | number | 上级总分 |
| comment | text | 评语 |
| status | enum | 已提交 / 待上级评 / 待部门评 / 超期 / AI 异常 |
| anomaly | string | 异常说明 |

### Indicator（绩效指标）

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string (PK) | 如 MF-021 |
| name | string | 指标名称 |
| family | string | 所属部门 |
| unit | string | 单位 |
| target | string | 目标值 |
| source | string | 数据源 |
| aiTag | string | AI 标签 |

### CompanyStrategy（公司战略目标）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| title | string | — |
| period | string | — |
| items | json[] | [{kpi, target, weight}] |

### DeptStrategy（部门战略目标）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| deptName | string | — |
| head | string | 部门负责人 |
| kpis | json[] | [{kpi, target, weight}] |

### InterviewRecord（面谈记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| employeeId | string (FK) | — |
| cycleId | string (FK) | — |
| score | number | 总分 |
| level | string | 等级 A/B+/B/B-/C/D |
| status | enum | 待面谈 / 已完成 |
| talkingPoints | json | AI 生成话术 |
| notes | text | 面谈记录 |
| resultApplication | json | {coefficient, salaryBand, talentAction, trainingAdvice} |

---

## 5. 培训模块

### Exam（考试/试卷）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| title | string | 试卷名称 |
| category | string | 培训领域 |
| dept | string | 适用部门 |
| questionCount | number | 题量 |
| duration | number | 时长(分钟) |
| difficulty | enum | easy / mid / hard |
| passLine | number | 通过线 |
| sites | string[] | 适用厂区 |
| status | string | 已归档 / 批改中 / 需补考 |
| avgScore | number | 平均成绩 |
| createdAt | datetime | — |

### Question（题目）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| category | string | 所属大类 |
| subCategory | string | 子分类 |
| type | enum | single / multi / judge / essay |
| difficulty | enum | easy / mid / hard |
| stem | text | 题干 |
| knowledgePoint | string | 关联知识点 |
| answer | text | 标准答案 |
| uses | number | 使用次数 |
| avgScore | number | 平均正确率 |
| quality | number | 题目质量分 |
| lowQuality | boolean | 是否低质量 |

### GradingItem（批改记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| examId | string (FK) | — |
| employeeId | string (FK) | — |
| questionId | string (FK) | — |
| aiScore | number | AI 初评分 |
| hrScore | number | HR 复核分 |
| aiComment | string | AI 评语 |
| hrComment | string | HR 评语 |
| flagged | boolean | 需重点关注 |

### Material（培训材料）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| title | string | 材料名称 |
| category | string | 所属领域 |
| fileUrl | string | 文件路径 |
| fileType | string | PDF / Word / PPT |
| pageCount | number | 页数 |
| uploadedAt | datetime | — |

### Mentor（导师）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| employeeId | string (FK) | 关联员工 |
| name | string | 姓名 |
| title | string | 职务 |
| dept | string | 部门 |
| site | string | 所在厂区 |
| level | enum | 金牌 / 资深 / 认证 |
| years | number | 带教年限 |
| active | number | 当前在带 |
| capacity | number | 最大容量 |
| graduated | number | 已出师 |
| rating | number | 评分 |
| passRate | number | 通过率 |
| crafts | string[] | 擅长领域 |
| tags | string[] | 标签 |
| status | enum | available / full / rest |

### OnsitePlan（在岗培训计划）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| employeeId | string (FK) | 学员 |
| mentorId | string (FK) | 导师 |
| startDate | date | 开始日期 |
| checkpoints | json[] | [{week, title, status, meta}] |

---

## 6. 对话模块

### ChatSession（会话）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| scene | string | 场景 key |
| title | string | 会话标题 |
| pinned | boolean | 是否置顶 |
| createdAt | datetime | — |
| updatedAt | datetime | — |

### ChatMessage（消息）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (PK) | — |
| sessionId | string (FK) | 关联会话 |
| role | enum | user / assistant |
| text | text | 消息正文 |
| thinking | text | AI 思考过程 |
| sources | json[] | 引用来源 |
| card | json | 结构化卡片 |
| followups | string[] | 追问建议 |
| createdAt | datetime | — |