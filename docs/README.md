# Sunic AI Employee — 后端交付文档索引

> 版本 1.0 · 2026-04-22

---

## 文档清单

| # | 文档 | 级别 | 用途 | 行数 |
|---|------|------|------|------|
| 1 | [openapi.yaml](./openapi.yaml) | L1 | API 契约（OpenAPI 3.0），83 个接口完整定义 | ~4450 |
| 2 | [data-model.sql](./data-model.sql) | L1 | PostgreSQL 建表语句，35+ 张表，可直接执行 | ~950 |
| 3 | [mock-data/](./mock-data/) | L1 | 16 个接口的 Mock 数据（真实中文数据） | — |
| 4 | [api-to-feature-map.md](./api-to-feature-map.md) | L1 | 接口 → 页面 → 功能点 → 前端文件路径映射 | ~180 |
| 5 | [business-rules.md](./business-rules.md) | L2 | 业务规则（含状态机、公式、伪代码、错误码） | ~720 |
| 6 | [permission-matrix.md](./permission-matrix.md) | L2 | 6 角色 × 全资源权限矩阵 + 数据可见性规则 | ~270 |
| 7 | [async-and-side-effects.md](./async-and-side-effects.md) | L2 | 事件副作用、定时任务、第三方集成、实时订阅 | ~150 |
| 8 | [non-functional-requirements.md](./non-functional-requirements.md) | L3 | 性能、安全、合规、AI 专项、可观测性、技术栈 | ~290 |
| 9 | [feature-inventory.md](./feature-inventory.md) | 参考 | 前端功能清单（75 项功能点） | ~294 |
| 10 | [api-requirements.md](./api-requirements.md) | 参考 | 早期 API 需求清单（已被 openapi.yaml 取代） | ~140 |
| 11 | [data-model.md](./data-model.md) | 参考 | 早期数据模型（已被 data-model.sql 取代） | ~371 |
| 12 | [er-diagram.mmd](./er-diagram.mmd) | 参考 | 实体关系图（Mermaid 格式） | — |
| 13 | [code-audit.md](./code-audit.md) | 参考 | 前端代码审计报告 | — |

---

## 推荐阅读顺序

### 给后端 AI（Cursor/Copilot/Devin 等）

1. `openapi.yaml` — 先理解全部接口契约
2. `data-model.sql` — 建表并理解数据结构
3. `business-rules.md` — 实现业务逻辑
4. `permission-matrix.md` — 实现权限控制
5. `async-and-side-effects.md` — 实现异步任务和集成
6. `non-functional-requirements.md` — 配置安全、性能、监控
7. `mock-data/` — 用于单元测试的参考数据

### 给人类后端研发

1. `feature-inventory.md` — 先了解产品全貌（5 分钟）
2. `api-to-feature-map.md` — 理解每个接口对应什么功能（10 分钟）
3. `business-rules.md` — 重点看状态机和计算规则（30 分钟）
4. `permission-matrix.md` — 理解角色和数据可见性（15 分钟）
5. `openapi.yaml` — 按模块实现时逐个查阅
6. `data-model.sql` — 建库时执行
7. `async-and-side-effects.md` — 实现后台任务时参考
8. `non-functional-requirements.md` — 架构设计时参考

---

## 已知待确认问题

| # | 问题 | 文档位置 | 当前默认值 |
|---|------|----------|------------|
| 1 | 是否需要钉钉扫码登录？ | openapi.yaml Auth | 仅工号+密码 |
| 2 | 员工每日 AI Token 上限 | business-rules.md BR-AI-006 | 50,000 tokens |
| 3 | HR/Admin AI Token 上限 | non-functional-requirements.md | 100,000 tokens |
| 4 | AI 流式响应超时 | business-rules.md BR-AI-010 | 首字节 5s / 整体 120s |
| 5 | 职能部门加班餐补金额 | business-rules.md BR-ATTENDANCE-006 | 20 元/次 |
| 6 | 登录异地告警是否需要 | non-functional-requirements.md | 建议开启 |
| 7 | 多端登录策略 | non-functional-requirements.md | 同类设备 1 个会话 |
| 8 | AI API 跨境数据合规 | non-functional-requirements.md | 待确认 |
| 9 | 多可用区部署 | non-functional-requirements.md | 建议但非必须 |
| 10 | 现有钉钉数据初始导入脚本 | — | 未包含 |

---

## 模块范围说明

| 模块 | 状态 |
|------|------|
| 员工管理 | ✅ 完整覆盖 |
| 组织架构 | ✅ 完整覆盖 |
| 考勤管理 | ✅ 完整覆盖 |
| 请假管理 | ⚠️ 后端预埋设计（前端未实现） |
| 排班管理 | ⚠️ 基础设计（前端未实现） |
| 绩效管理 | ✅ 完整覆盖 |
| 招聘管理 | ✅ 完整覆盖 |
| 培训管理 | ✅ 完整覆盖 |
| AI 数字员工 | ✅ 完整覆盖 |
| 薪资管理 | ❌ 不在范围 |

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0 | 2026-04-22 | 初始版本，L1+L2+L3 全部文档 |
