import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  FileSpreadsheet,
  Gauge,
  LineChart,
  MessagesSquare,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { NewCycleDialog } from "@/components/performance/NewCycleDialog";
import { NewIndicatorDialog } from "@/components/performance/NewIndicatorDialog";

/* ================== 顶部核心指标 ================== */
const overviewStats = [
  {
    label: "在考周期",
    value: "2025 Q2",
    hint: "覆盖 11 部门 · 202 人",
    icon: Gauge,
    tone: "text-primary",
  },
  {
    label: "待我处理",
    value: "14",
    hint: "上级评分 11 · HR 复核 3",
    icon: ClipboardList,
    tone: "text-amber-600",
  },
  {
    label: "超期未提交",
    value: "5",
    hint: "已自动催办 2 轮",
    icon: Bell,
    tone: "text-rose-600",
  },
  {
    label: "AI 异常预警",
    value: "4",
    hint: "分数与目标达成不符",
    icon: AlertTriangle,
    tone: "text-orange-600",
  },
];

/* ================== 5 阶段流程 ================== */
type StageStatus = "已完成" | "进行中" | "未开始";
const stages: {
  key: string;
  name: string;
  total: number;
  done: number;
  overdue: number;
  status: StageStatus;
}[] = [
  { key: "self", name: "员工自评", total: 202, done: 197, overdue: 5, status: "已完成" },
  { key: "leader", name: "直属上级考评", total: 202, done: 168, overdue: 3, status: "进行中" },
  { key: "dept", name: "部门负责人考评", total: 9, done: 2, overdue: 0, status: "进行中" },
  { key: "hr", name: "HR 汇总复核", total: 1, done: 0, overdue: 0, status: "未开始" },
  { key: "gm", name: "总经理确认", total: 1, done: 0, overdue: 0, status: "未开始" },
];

const statusBadge: Record<StageStatus, string> = {
  已完成: "bg-emerald-50 text-emerald-700 border-emerald-200",
  进行中: "bg-blue-50 text-blue-700 border-blue-200",
  未开始: "bg-muted text-muted-foreground border-border",
};

/* ================== 历史周期 ================== */
const historyCycles = [
  { id: "2025Q1", name: "2025 Q1 季度考核", scope: "全员 198 人", status: "已结案", coef: "0.96", finishedAt: "2025-04-12" },
  { id: "2024H2", name: "2024 下半年考核", scope: "全员 193 人", status: "已结案", coef: "1.02", finishedAt: "2025-01-18" },
  { id: "2024Q3", name: "2024 Q3 季度考核", scope: "全员 188 人", status: "已结案", coef: "0.98", finishedAt: "2024-10-22" },
];

/* ================== 战略目标分解 ================== */
interface KpiItem { kpi: string; target: string; weight: string }
interface DeptStrategy { name: string; head: string; kpis: KpiItem[] }
interface CompanyStrategy { title: string; period: string; items: KpiItem[] }

const initialCompany: CompanyStrategy = {
  title: "2025 年公司战略目标",
  period: "2025 年度",
  items: [
    { kpi: "营业收入", target: "12.6 亿元", weight: "30%" },
    { kpi: "激光焊接订单交付率", target: "≥ 98%", weight: "20%" },
    { kpi: "新产品研发上市", target: "6 款", weight: "20%" },
    { kpi: "客户投诉响应时长", target: "≤ 4 小时", weight: "15%" },
    { kpi: "人均效能提升", target: "+12%", weight: "15%" },
  ],
};

const initialDepts: DeptStrategy[] = [
  {
    name: "研发部",
    head: "周建国",
    kpis: [
      { kpi: "新产品立项→量产周期", target: "≤ 9 个月", weight: "30%" },
      { kpi: "专利申请数", target: "≥ 24 项", weight: "20%" },
      { kpi: "BOM 成本下降率", target: "≥ 5%", weight: "20%" },
    ],
  },
  {
    name: "生产管理部",
    head: "高磊",
    kpis: [
      { kpi: "订单交付准时率", target: "≥ 98%", weight: "35%" },
      { kpi: "良品率", target: "≥ 99.2%", weight: "25%" },
      { kpi: "单台制造工时", target: "下降 8%", weight: "20%" },
    ],
  },
  {
    name: "营销中心",
    head: "陈航",
    kpis: [
      { kpi: "回款额", target: "10.8 亿元", weight: "40%" },
      { kpi: "新客户开发", target: "≥ 35 家", weight: "25%" },
      { kpi: "客户满意度", target: "≥ 90 分", weight: "15%" },
    ],
  },
];

/* ================== 指标库（按 11 部门）================== */
const indicatorFamilies = [
  { key: "rd",   name: "研发部",     count: 22, recent: "AI 推荐『激光器光路一次调试通过率』" },
  { key: "mfg",  name: "生产管理部", count: 26, recent: "更新『OEE 设备综合效率』基准 78%" },
  { key: "qa",   name: "品质管理部", count: 18, recent: "新增『激光焊接首件合格率』" },
  { key: "pm",   name: "项目管理部", count: 14, recent: "AI 推荐『重点项目里程碑达成率』" },
  { key: "sale", name: "营销中心",   count: 16, recent: "更新『大客户渗透率』口径" },
  { key: "biz",  name: "商务部",     count: 12, recent: "新增『投标响应时长』" },
  { key: "mkt",  name: "市场营销部", count: 10, recent: "AI 推荐『线索转化率』" },
  { key: "scm",  name: "供应链",     count: 15, recent: "新增『关键物料齐套率』" },
  { key: "fin",  name: "财务中心",   count: 11, recent: "更新『费用预算执行偏差』" },
  { key: "adm",  name: "综合管理部", count: 13, recent: "HR 新增『招聘到岗及时率』" },
  { key: "prop", name: "物业",       count: 6,  recent: "新增『园区安全巡检覆盖率』" },
];
const indicatorRows = [
  // 研发部
  { code: "RD-014", name: "需求按时交付率", family: "研发部", unit: "%", target: "≥ 95", source: "PLM 系统", aiTag: "行业基准 92%" },
  { code: "RD-021", name: "激光器光路一次调试通过率", family: "研发部", unit: "%", target: "≥ 92", source: "PLM 系统", aiTag: "AI 推荐" },
  { code: "RD-008", name: "新产品立项→量产周期", family: "研发部", unit: "月", target: "≤ 9", source: "PLM 系统", aiTag: "对标行业 12 月" },
  // 生产管理部
  { code: "MF-021", name: "OEE 设备综合效率", family: "生产管理部", unit: "%", target: "≥ 78", source: "MES 系统", aiTag: "对标行业 75%" },
  { code: "MF-014", name: "工时利用率", family: "生产管理部", unit: "%", target: "≥ 85", source: "MES 系统", aiTag: "—" },
  { code: "MF-031", name: "订单交付准时率", family: "生产管理部", unit: "%", target: "≥ 98", source: "MES 系统", aiTag: "—" },
  // 品质管理部
  { code: "QA-007", name: "千件不良数 (PPM)", family: "品质管理部", unit: "PPM", target: "≤ 320", source: "QMS 系统", aiTag: "AI 推荐" },
  { code: "QA-012", name: "激光焊接首件合格率", family: "品质管理部", unit: "%", target: "≥ 96", source: "QMS 系统", aiTag: "新增" },
  { code: "QA-019", name: "客户投诉响应时长", family: "品质管理部", unit: "h", target: "≤ 4", source: "CRM / QMS", aiTag: "—" },
  // 项目管理部
  { code: "PM-003", name: "重点项目里程碑达成率", family: "项目管理部", unit: "%", target: "100", source: "OA / 项目台账", aiTag: "AI 推荐" },
  { code: "PM-009", name: "项目预算执行偏差", family: "项目管理部", unit: "%", target: "≤ 5", source: "ERP / 财务", aiTag: "—" },
  // 营销中心
  { code: "SL-003", name: "回款及时率", family: "营销中心", unit: "%", target: "≥ 92", source: "ERP / 财务", aiTag: "—" },
  { code: "SL-011", name: "大客户渗透率（新能源/3C）", family: "营销中心", unit: "%", target: "≥ 35", source: "CRM 系统", aiTag: "AI 推荐" },
  { code: "SL-018", name: "新客户开发数", family: "营销中心", unit: "家", target: "≥ 35", source: "CRM 系统", aiTag: "—" },
  // 商务部
  { code: "BZ-005", name: "投标响应时长", family: "商务部", unit: "天", target: "≤ 3", source: "CRM 系统", aiTag: "新增" },
  { code: "BZ-012", name: "合同评审通过率", family: "商务部", unit: "%", target: "≥ 95", source: "OA / 合同台账", aiTag: "—" },
  // 市场营销部
  { code: "MK-004", name: "线索转化率", family: "市场营销部", unit: "%", target: "≥ 18", source: "CRM 系统", aiTag: "AI 推荐" },
  { code: "MK-010", name: "品牌曝光增长", family: "市场营销部", unit: "%", target: "≥ 30", source: "市场报告", aiTag: "—" },
  // 供应链
  { code: "SC-006", name: "关键物料齐套率", family: "供应链", unit: "%", target: "≥ 95", source: "ERP 系统", aiTag: "新增" },
  { code: "SC-013", name: "采购成本下降率", family: "供应链", unit: "%", target: "≥ 5", source: "ERP 系统", aiTag: "—" },
  // 财务中心
  { code: "FN-002", name: "费用预算执行偏差", family: "财务中心", unit: "%", target: "≤ 5", source: "ERP / 财务", aiTag: "—" },
  { code: "FN-008", name: "月结关账及时率", family: "财务中心", unit: "%", target: "100", source: "ERP / 财务", aiTag: "—" },
  // 综合管理部
  { code: "AD-019", name: "招聘到岗及时率", family: "综合管理部", unit: "%", target: "≥ 90", source: "本系统-招聘助手", aiTag: "新增" },
  { code: "AD-024", name: "员工培训完成率", family: "综合管理部", unit: "%", target: "≥ 95", source: "本系统-培训助手", aiTag: "—" },
  // 物业
  { code: "PR-002", name: "园区安全巡检覆盖率", family: "物业", unit: "%", target: "100", source: "EHS 系统", aiTag: "新增" },
  { code: "PR-007", name: "设施报修响应时长", family: "物业", unit: "h", target: "≤ 2", source: "OA 系统", aiTag: "—" },
];

/* ================== 过程数据 ================== */
const dataSources = [
  { name: "MES 制造执行", status: "暂未联通", lastSync: "—", indicators: 14 },
  { name: "ERP / 财务", status: "已联通", lastSync: "12 分钟前", indicators: 9 },
  { name: "PLM 产品生命周期", status: "暂未联通", lastSync: "—", indicators: 11 },
  { name: "CRM 客户系统", status: "暂未联通", lastSync: "—", indicators: 7 },
  { name: "QMS 质量管理", status: "暂未联通", lastSync: "—", indicators: 6 },
];
const progressRows = [
  { dept: "生产管理部", kpi: "订单交付准时率", target: "98%", current: 96.4, trend: "down", risk: "预警" },
  { dept: "研发部", kpi: "新产品立项→量产", target: "≤ 9 月", current: 78, trend: "up", risk: "正常" },
  { dept: "营销中心", kpi: "回款额 (亿)", target: "10.8", current: 62, trend: "up", risk: "正常" },
  { dept: "品质管理部", kpi: "客户投诉响应", target: "≤ 4h", current: 51, trend: "down", risk: "滞后" },
  { dept: "项目管理部", kpi: "重点项目里程碑达成", target: "100%", current: 84, trend: "up", risk: "正常" },
  { dept: "供应链", kpi: "关键物料齐套率", target: "≥ 95%", current: 88, trend: "down", risk: "预警" },
];

/* ================== 面谈辅助 ================== */
const interviewQueue = [
  { id: "I001", name: "王 磊", dept: "生产管理部", role: "高级工艺工程师", score: 87, level: "B+", status: "待面谈", reason: "OEE 显著提升，建议晋升沟通" },
  { id: "I002", name: "李 雪", dept: "营销中心", role: "大客户经理", score: 72, level: "B-", status: "待面谈", reason: "回款滞后，需改进计划" },
  { id: "I003", name: "张 涛", dept: "研发部", role: "光学算法工程师", score: 92, level: "A", status: "已完成", reason: "保留沟通 + 项目奖励" },
  { id: "I004", name: "孙 玥", dept: "供应链", role: "采购主管", score: 65, level: "C", status: "待面谈", reason: "成本指标未达成，需绩改" },
];

export default function Performance() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("cycle");
  const [family, setFamily] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [newCycleOpen, setNewCycleOpen] = useState(false);
  const [newIndicatorOpen, setNewIndicatorOpen] = useState(false);

  // 战略目标 state
  const [company, setCompany] = useState<CompanyStrategy>(initialCompany);
  const [depts, setDepts] = useState<DeptStrategy[]>(initialDepts);
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingDept, setEditingDept] = useState<string | null>(null);

  const companyWeightSum = company.items.reduce((s, it) => s + (parseInt(it.weight) || 0), 0);

  const updateCompanyItem = (i: number, key: keyof KpiItem, v: string) =>
    setCompany((c) => ({ ...c, items: c.items.map((it, idx) => (idx === i ? { ...it, [key]: v } : it)) }));
  const addCompanyItem = () =>
    setCompany((c) => ({ ...c, items: [...c.items, { kpi: "", target: "", weight: "0%" }] }));
  const removeCompanyItem = (i: number) =>
    setCompany((c) => ({ ...c, items: c.items.filter((_, idx) => idx !== i) }));

  const updateDeptKpi = (deptName: string, i: number, key: keyof KpiItem, v: string) =>
    setDepts((ds) => ds.map((d) => d.name === deptName
      ? { ...d, kpis: d.kpis.map((k, idx) => (idx === i ? { ...k, [key]: v } : k)) }
      : d));
  const addDeptKpi = (deptName: string) =>
    setDepts((ds) => ds.map((d) => d.name === deptName
      ? { ...d, kpis: [...d.kpis, { kpi: "", target: "", weight: "0%" }] }
      : d));
  const removeDeptKpi = (deptName: string, i: number) =>
    setDepts((ds) => ds.map((d) => d.name === deptName
      ? { ...d, kpis: d.kpis.filter((_, idx) => idx !== i) }
      : d));

  const aiBreakdown = () => {
    toast.success("AI 已基于公司目标重新生成 3 个部门的 KPI 草稿，请逐项确认");
    // 模拟 AI 拆解：清空并加入若干推荐项
    setDepts((ds) => ds.map((d) => ({
      ...d,
      kpis: d.name === "研发部"
        ? [
            { kpi: "新产品上市数量", target: "≥ 6 款", weight: "30%" },
            { kpi: "研发立项→量产周期", target: "≤ 9 个月", weight: "25%" },
            { kpi: "BOM 成本下降率", target: "≥ 5%", weight: "20%" },
            { kpi: "专利申请数", target: "≥ 24 项", weight: "15%" },
            { kpi: "客诉技术响应", target: "≤ 4 小时", weight: "10%" },
          ]
        : d.name === "生产管理部"
        ? [
            { kpi: "订单交付准时率", target: "≥ 98%", weight: "30%" },
            { kpi: "产值贡献", target: "8.4 亿元", weight: "25%" },
            { kpi: "良品率", target: "≥ 99.2%", weight: "20%" },
            { kpi: "单台制造工时", target: "下降 8%", weight: "15%" },
            { kpi: "人均产值", target: "+12%", weight: "10%" },
          ]
        : [
            { kpi: "回款额", target: "10.8 亿元", weight: "35%" },
            { kpi: "新客户开发", target: "≥ 35 家", weight: "20%" },
            { kpi: "激光焊接订单", target: "≥ 8 亿", weight: "20%" },
            { kpi: "客户满意度", target: "≥ 90 分", weight: "15%" },
            { kpi: "客诉响应时长", target: "≤ 4 小时", weight: "10%" },
          ],
    })));
  };

  const filteredIndicators = useMemo(() => {
    return indicatorRows.filter(
      (r) =>
        (family === "all" || r.family === indicatorFamilies.find((f) => f.key === family)?.name) &&
        (!search || r.name.includes(search) || r.code.includes(search)),
    );
  }, [family, search]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="绩效助手"
        description="战略目标分解 · 指标库 · 过程数据 · AI 评估校验 · 面谈辅助"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info("已推送催办给 5 名超期员工")}>
              <Bell className="mr-1.5 h-4 w-4" />
              一键催办
            </Button>
            <Button size="sm" onClick={() => setNewCycleOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              新建考核周期
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-6">
        {/* 顶部核心指标 */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {overviewStats.map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={cn("h-4 w-4", s.tone)} />
              </div>
              <div className="mt-2 text-2xl font-semibold">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
            </Card>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="cycle">考核周期</TabsTrigger>
            <TabsTrigger value="strategy">战略目标分解</TabsTrigger>
            <TabsTrigger value="library">指标库</TabsTrigger>
            <TabsTrigger value="data">过程数据</TabsTrigger>
            <TabsTrigger value="interview">面谈辅助</TabsTrigger>
          </TabsList>

          {/* ============ 考核周期 ============ */}
          <TabsContent value="cycle" className="space-y-4">
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">2025 Q2 季度考核</h2>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200" variant="outline">进行中</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    周期：2025-04-01 ~ 2025-06-30 · 评估对象 202 人 · 模板「研发/生产/职能 V3.2」
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/performance/cycle/2025Q2")}>
                  进入周期详情
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {/* 5 阶段流程 */}
              <div className="mt-5 grid gap-3 lg:grid-cols-5">
                {stages.map((st, i) => {
                  const pct = Math.round((st.done / st.total) * 100);
                  return (
                    <div key={st.key} className="rounded-lg border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">阶段 {i + 1}</span>
                        <Badge variant="outline" className={cn("text-[10px]", statusBadge[st.status])}>
                          {st.status}
                        </Badge>
                      </div>
                      <div className="mt-1.5 text-sm font-semibold">{st.name}</div>
                      <div className="mt-2 flex items-baseline gap-1 text-xs text-muted-foreground">
                        <span className="text-base font-semibold text-foreground">{st.done}</span>
                        <span>/ {st.total}</span>
                      </div>
                      <Progress value={pct} className="mt-2 h-1.5" />
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        {st.overdue > 0 ? (
                          <span className="text-rose-600">超期 {st.overdue}</span>
                        ) : (
                          <span className="text-muted-foreground">无超期</span>
                        )}
                        <button
                          onClick={() => toast.success(`已向${st.name}阶段未提交人员发送催办`)}
                          className="text-primary hover:underline"
                        >
                          催办
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI 校验提示 */}
              <div className="mt-5 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                <div className="flex-1 text-xs">
                  <div className="font-medium text-orange-900">AI 发现 4 项分数异常</div>
                  <div className="mt-0.5 text-orange-800/80">
                    上级评分与业务系统达成数据偏差超过 ±15%，建议复核后再进入下一阶段，避免 HR 返工。
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/performance/cycle/2025Q2?tab=anomaly")}>
                  查看异常
                </Button>
              </div>
            </Card>

            {/* 历史周期 */}
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">历史考核周期</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/performance/summary">
                    汇总分析
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>周期</TableHead>
                    <TableHead>覆盖范围</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>平均绩效系数</TableHead>
                    <TableHead>结案时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyCycles.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.scope}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.coef}</TableCell>
                      <TableCell className="text-muted-foreground">{c.finishedAt}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/performance/cycle/${c.id}`)}>
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ============ 战略目标分解 ============ */}
          <TabsContent value="strategy" className="space-y-4">
            {/* 公司战略目标 */}
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  {editingCompany ? (
                    <Input
                      value={company.title}
                      onChange={(e) => setCompany({ ...company, title: e.target.value })}
                      className="h-8 w-72 text-sm font-semibold"
                    />
                  ) : (
                    <h3 className="text-sm font-semibold">{company.title}</h3>
                  )}
                  <Badge variant="outline" className="text-[10px]">{company.period}</Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      companyWeightSum === 100
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200",
                    )}
                  >
                    权重合计 {companyWeightSum}%
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {editingCompany ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCompany(false);
                          setCompany(initialCompany);
                          toast.info("已撤销修改");
                        }}
                      >
                        <X className="mr-1.5 h-4 w-4" />
                        取消
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (companyWeightSum !== 100) {
                            toast.error(`权重合计为 ${companyWeightSum}%，需调整为 100% 后保存`);
                            return;
                          }
                          setEditingCompany(false);
                          toast.success("公司战略目标已保存");
                        }}
                      >
                        <Save className="mr-1.5 h-4 w-4" />
                        保存
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setEditingCompany(true)}>
                        <Pencil className="mr-1.5 h-4 w-4" />
                        编辑公司目标
                      </Button>
                      <Button size="sm" onClick={aiBreakdown}>
                        <Wand2 className="mr-1.5 h-4 w-4" />
                        AI 一键拆解到部门
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* 公司目标列表 */}
              {editingCompany ? (
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-12 gap-2 px-1 text-[11px] text-muted-foreground">
                    <div className="col-span-5">KPI 名称</div>
                    <div className="col-span-4">目标值</div>
                    <div className="col-span-2">权重</div>
                    <div className="col-span-1" />
                  </div>
                  {company.items.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 items-center gap-2">
                      <Input
                        value={it.kpi}
                        onChange={(e) => updateCompanyItem(i, "kpi", e.target.value)}
                        placeholder="如 营业收入"
                        className="col-span-5 h-9"
                      />
                      <Input
                        value={it.target}
                        onChange={(e) => updateCompanyItem(i, "target", e.target.value)}
                        placeholder="如 12.6 亿元"
                        className="col-span-4 h-9"
                      />
                      <Input
                        value={it.weight}
                        onChange={(e) => updateCompanyItem(i, "weight", e.target.value)}
                        placeholder="30%"
                        className="col-span-2 h-9"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="col-span-1 h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => removeCompanyItem(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addCompanyItem} className="w-full">
                    <Plus className="mr-1.5 h-4 w-4" />
                    新增 KPI 行
                  </Button>
                  <div className="rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground">
                    提示：保存公司目标后，可点击「AI 一键拆解到部门」自动生成各部门 KPI 草稿，再由部门负责人微调。
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-2 md:grid-cols-5">
                  {company.items.map((it, i) => (
                    <div key={i} className="rounded-lg border bg-muted/30 p-3">
                      <div className="text-xs text-muted-foreground">{it.kpi || "未命名"}</div>
                      <div className="mt-1 text-sm font-semibold">{it.target || "—"}</div>
                      <Badge variant="outline" className="mt-2 text-[10px]">权重 {it.weight}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 部门 KPI 卡片 */}
            <div className="grid gap-3 lg:grid-cols-3">
              {depts.map((d) => {
                const isEditing = editingDept === d.name;
                const wSum = d.kpis.reduce((s, k) => s + (parseInt(k.weight) || 0), 0);
                return (
                  <Card key={d.name} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{d.name}</div>
                        <div className="text-xs text-muted-foreground">负责人：{d.head}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            wSum === 100
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200",
                          )}
                        >
                          {d.kpis.length} 项 · {wSum}%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditingDept(isEditing ? null : d.name)}
                        >
                          {isEditing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {d.kpis.map((k, i) =>
                        isEditing ? (
                          <div key={i} className="space-y-1.5 rounded-md border bg-muted/20 p-2">
                            <div className="flex gap-1.5">
                              <Input
                                value={k.kpi}
                                onChange={(e) => updateDeptKpi(d.name, i, "kpi", e.target.value)}
                                placeholder="KPI 名称"
                                className="h-8 text-xs"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removeDeptKpi(d.name, i)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="flex gap-1.5">
                              <Input
                                value={k.target}
                                onChange={(e) => updateDeptKpi(d.name, i, "target", e.target.value)}
                                placeholder="目标值"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={k.weight}
                                onChange={(e) => updateDeptKpi(d.name, i, "weight", e.target.value)}
                                placeholder="权重"
                                className="h-8 w-20 text-xs"
                              />
                            </div>
                          </div>
                        ) : (
                          <div key={i} className="rounded-md border bg-card p-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium">{k.kpi || "未命名"}</span>
                              <span className="text-[10px] text-muted-foreground">权重 {k.weight}</span>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">目标：{k.target || "—"}</div>
                          </div>
                        ),
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => addDeptKpi(d.name)}>
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          新增
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (wSum !== 100) {
                              toast.error(`${d.name} 权重合计 ${wSum}%，需为 100%`);
                              return;
                            }
                            setEditingDept(null);
                            toast.success(`${d.name} KPI 已保存`);
                          }}
                        >
                          <Save className="mr-1 h-3.5 w-3.5" />
                          保存
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => toast.info(`已展开${d.name}的个人 KPI 拆解`)}
                      >
                        继续拆解到个人
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ============ 指标库 ============ */}
          <TabsContent value="library" className="space-y-4">

            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="搜索指标编码或名称"
                      className="h-9 w-64 pl-8"
                    />
                  </div>
                  <Select value={family} onValueChange={setFamily}>
                    <SelectTrigger className="h-9 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部部门</SelectItem>
                      {indicatorFamilies.map((f) => (
                        <SelectItem key={f.key} value={f.key}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.success("AI 已基于行业最新基准更新 4 项指标")}>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    AI 同步行业基准
                  </Button>
                  <Button size="sm" onClick={() => setNewIndicatorOpen(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    新增指标
                  </Button>
                </div>
              </div>

              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>编码</TableHead>
                    <TableHead>指标名称</TableHead>
                    <TableHead>岗位族</TableHead>
                    <TableHead>单位</TableHead>
                    <TableHead>目标值</TableHead>
                    <TableHead>数据来源</TableHead>
                    <TableHead>AI 标签</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIndicators.map((r) => (
                    <TableRow key={r.code}>
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.family}</TableCell>
                      <TableCell>{r.unit}</TableCell>
                      <TableCell>{r.target}</TableCell>
                      <TableCell className="text-muted-foreground">{r.source}</TableCell>
                      <TableCell>
                        {r.aiTag === "—" ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Badge variant="outline" className="bg-primary-soft text-primary border-primary/20 text-[10px]">
                            {r.aiTag}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ============ 过程数据 ============ */}
          <TabsContent value="data" className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">业务系统数据接入</h3>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success("已重新同步全部数据源")}>
                  立即同步
                </Button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
                {dataSources.map((s) => (
                  <div key={s.name} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{s.name}</span>
                      {s.status === "已联通" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : s.status === "暂未联通" ? (
                        <Database className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">最近同步：{s.lastSync}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">驱动指标：{s.indicators}</div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-2 text-[10px]",
                        s.status === "已联通"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : s.status === "暂未联通"
                          ? "bg-muted text-muted-foreground border-border"
                          : "bg-rose-50 text-rose-700 border-rose-200",
                      )}
                    >
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">实时进度看板</h3>
                <span className="text-xs text-muted-foreground">数据来自业务系统，每 15 分钟刷新</span>
              </div>
              <Table className="mt-3">
                <TableHeader>
                  <TableRow>
                    <TableHead>部门</TableHead>
                    <TableHead>核心 KPI</TableHead>
                    <TableHead>目标</TableHead>
                    <TableHead>当前进度</TableHead>
                    <TableHead>趋势</TableHead>
                    <TableHead>风险</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {progressRows.map((r) => (
                    <TableRow key={r.dept + r.kpi}>
                      <TableCell className="font-medium">{r.dept}</TableCell>
                      <TableCell>{r.kpi}</TableCell>
                      <TableCell className="text-muted-foreground">{r.target}</TableCell>
                      <TableCell className="w-56">
                        <div className="flex items-center gap-2">
                          <Progress value={typeof r.current === "number" && r.current <= 100 ? r.current : 60} className="h-1.5" />
                          <span className="w-12 text-right text-xs">{r.current}{typeof r.current === "number" && r.current <= 100 ? "%" : ""}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.trend === "up" ? (
                          <span className="inline-flex items-center text-xs text-emerald-600">
                            <TrendingUp className="mr-1 h-3.5 w-3.5" />上升
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-rose-600">
                            <TrendingDown className="mr-1 h-3.5 w-3.5" />下降
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            r.risk === "正常" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            r.risk === "预警" && "bg-amber-50 text-amber-700 border-amber-200",
                            r.risk === "滞后" && "bg-rose-50 text-rose-700 border-rose-200",
                          )}
                        >
                          {r.risk}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ============ 面谈辅助 ============ */}
          <TabsContent value="interview" className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessagesSquare className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">绩效面谈队列</h3>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success("AI 已为 3 位待面谈员工生成建议报告")}>
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  批量生成面谈建议
                </Button>
              </div>

              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>部门 / 岗位</TableHead>
                    <TableHead>得分</TableHead>
                    <TableHead>等级</TableHead>
                    <TableHead>AI 沟通要点</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviewQueue.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>{p.dept}</div>
                        <div className="text-[11px]">{p.role}</div>
                      </TableCell>
                      <TableCell>{p.score}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            p.level.startsWith("A") && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            p.level.startsWith("B") && "bg-blue-50 text-blue-700 border-blue-200",
                            p.level === "C" && "bg-amber-50 text-amber-700 border-amber-200",
                          )}
                        >
                          {p.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[260px] text-xs text-muted-foreground">{p.reason}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[10px]",
                          p.status === "已完成"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-muted text-muted-foreground",
                        )}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/performance/interview/${p.id}`)}>
                          打开报告
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">绩效结果应用建议</h3>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {[
                  { title: "薪酬调整", count: 12, hint: "AI 推荐入薪绩效系数 0.8 ~ 1.2" },
                  { title: "晋升提名", count: 5, hint: "连续 2 周期 A 级，建议晋升评审" },
                  { title: "绩改 / PIP", count: 3, hint: "C 级员工需进入 60 天改进计划" },
                ].map((c) => (
                  <div key={c.title} className="rounded-lg border bg-card p-4">
                    <div className="text-sm font-semibold">{c.title}</div>
                    <div className="mt-1 text-2xl font-semibold">{c.count} 人</div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.hint}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <NewCycleDialog open={newCycleOpen} onOpenChange={setNewCycleOpen} />
      <NewIndicatorDialog
        open={newIndicatorOpen}
        onOpenChange={setNewIndicatorOpen}
        defaultFamily={family !== "all" ? family : "mfg"}
      />
    </div>
  );
}
