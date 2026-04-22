import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ClipboardCheck,
  Clock,
  Trophy,
  TrendingUp,
  Plus,
  FileUp,
  Sparkles,
  ArrowRight,
  Search,
  Factory,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Target,
  BookOpen,
  Zap,
  Sun,
  Shield,
  Globe,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NewExamDialog } from "@/components/training/NewExamDialog";
import { ImportMaterialsSheet } from "@/components/training/ImportMaterialsSheet";

const KPIS = [
  { label: "本月考试场次", value: "24", unit: "场", trend: "↑ 18% 环比", trendKind: "up" as const, icon: ClipboardCheck, foot: "脱岗 18 场 · 在岗抽测 6 场", accent: "primary" },
  { label: "待 HR 复核", value: "36", unit: "份", trend: "7 份已逾期", trendKind: "down" as const, icon: Clock, foot: "主观题 AI 初评完成 · 待人工确认", accent: "warning" },
  { label: "在岗培训达成率", value: "87", unit: "%", trend: "↑ 4.2% 较上月", trendKind: "up" as const, icon: CheckCircle2, foot: "4 厂区节点打卡 · 黄龙山领先", accent: "success" },
  { label: "平均成绩", value: "82.4", unit: "分", trend: "→ 与上月持平", trendKind: "flat" as const, icon: Trophy, foot: "激光工艺岗 88.1 分 · 最高", accent: "ai" },
];

const TASKS = [
  { type: "改", typeColor: "warning", title: "《激光划片机安全操作》试卷待批改（主观题）", meta: ["生产管理部 · 激光工艺组", "8 人", "11-14 截止"], state: "urgent", stateLabel: "紧急 · 今日", time: "2h 前提交" },
  { type: "试", typeColor: "info", title: "ISO9001 质量体系复训 · 试卷生成待确认", meta: ["品质管理部 全员", "40 题", "建议难度 中"], state: "waiting", stateLabel: "待审核", time: "已等待 1 天" },
  { type: "带", typeColor: "success", title: "新员工在岗培训 · W2 导师记录未提交", meta: ["供应链 · 仓储组", "导师 李建华", "鄂州基地"], state: "progress", stateLabel: "进行中", time: "还差 2 天" },
  { type: "档", typeColor: "ai", title: "外贸业务员岗前培训考试 · 自动判分完成", meta: ["营销中心 · 外贸组", "5 人 / 平均 84.2"], state: "done", stateLabel: "待归档", time: "今日 10:24" },
  { type: "训", typeColor: "primary", title: "太阳能组件装配 SOP · 节点抽检", meta: ["生产管理部 · 组件车间", "黄龙山基地", "跨厂区协同"], state: "progress", stateLabel: "本周内", time: "计划 11-18" },
];

const EXAMS = [
  { num: "#1284", title: "激光打标机操作规范", dept: "生产管理部", count: 14, date: "11-13", score: 91.4, level: "high", chip: "已归档", chipKind: "success" },
  { num: "#1283", title: "ISO9001 质量意识复训", dept: "品质管理部", count: 22, date: "11-12", score: 78.6, level: "mid", chip: "批改中", chipKind: "info" },
  { num: "#1282", title: "外贸业务员岗前培训", dept: "营销中心", count: 5, date: "11-10", score: 84.2, level: "high", chip: "已归档", chipKind: "success" },
  { num: "#1281", title: "太阳能组件装配 SOP", dept: "生产管理部", count: 18, date: "11-08", score: 79.3, level: "mid", chip: "已归档", chipKind: "success" },
  { num: "#1280", title: "消防安全与应急处置", dept: "综合管理部", count: 46, date: "11-06", score: 68.1, level: "low", chip: "需补考", chipKind: "danger" },
];

const TIMELINE = [
  { state: "done", title: "入职导师指派", date: "W1 · 10-28", meta: "导师 李建华 · 仓储主管 · 入厂认知与安全培训完成", tags: [{ label: "已完成", kind: "success" }, { label: "评分 A", kind: "muted" }] },
  { state: "done", title: "仓储 SOP 学习", date: "W2 · 11-04", meta: "覆盖 ERP 出入库、库位规则、激光器及光学组件存储要求", tags: [{ label: "已完成", kind: "success" }, { label: "线下实操", kind: "muted" }] },
  { state: "active", title: "中期评估 · 导师记录", date: "W4 · 11-18", meta: "导师需在钉钉提交：实操表现、问题清单、下阶段目标", tags: [{ label: "还差 2 天", kind: "danger" }, { label: "待导师提交", kind: "muted" }] },
  { state: "pending", title: "跨厂区轮岗 · 黄龙山基地", date: "W6 · 12-02", meta: "激光器整机装配线见习 · 2 天", tags: [{ label: "未启动", kind: "muted" }] },
  { state: "pending", title: "出师考核", date: "W8 · 12-16", meta: "笔试（40 题）+ 实操演示 + 导师鉴定", tags: [{ label: "未启动", kind: "muted" }] },
];

const KB = [
  { key: "laser", icon: Zap, label: "激光设备操作", desc: "激光打标、雕刻、划片等设备操作 SOP 及安全规范", n1: 412, n2: 18, color: "primary" },
  { key: "solar", icon: Sun, label: "太阳能组件", desc: "组件装配 / 测试 / 串焊 / EL 检测等工艺流程", n1: 286, n2: 12, color: "warning" },
  { key: "qa", icon: Shield, label: "质量与合规", desc: "ISO9001 / 3A 认证 / 安全生产 / 消防应急", n1: 324, n2: 14, color: "success" },
  { key: "trade", icon: Globe, label: "外贸与销售", desc: "出口流程 / 产品知识 / 客户沟通话术 / 报价规则", n1: 262, n2: 9, color: "ai" },
];

const CHAT = [
  { role: "me", text: "@培训助手 本周给激光工艺组出一套安全操作复训试卷，40 题，覆盖黄龙山和鄂州两个厂区" },
  {
    role: "bot",
    text: "好的，已根据激光工艺组现有培训材料生成一套试卷，草案如下：",
    card: [
      { k: "试卷名称", v: "激光划片机安全操作复训" },
      { k: "题量 / 时长", v: "40 题 / 60 分钟" },
      { k: "题型分布", v: "单选 24 · 多选 10 · 判断 6" },
      { k: "覆盖厂区", v: "黄龙山基地 · 鄂州基地" },
      { k: "应考人数", v: "32 人" },
      { k: "难度", v: "中（可调）" },
    ],
    actions: ["发布到钉钉", "查看试卷", "调整难度", "换题"],
  },
  { role: "me", text: "主观题改完了吗？" },
  {
    role: "bot",
    text: "客观题已完成自动判分；主观题共 8 份，AI 初评完成，待您复核。\n初评结果：平均 7.2 / 10，有 2 份建议人工重点关注。",
    actions: ["打开批改队列", "只看异常"],
  },
];

const accentMap = {
  primary: "text-primary bg-primary/10",
  warning: "text-warning bg-warning/15",
  success: "text-success bg-success/15",
  ai: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))]",
  info: "text-info bg-info/10",
} as const;

const stripeMap = {
  primary: "from-primary to-transparent",
  warning: "from-warning to-transparent",
  success: "from-success to-transparent",
  ai: "from-[hsl(var(--ai))] to-transparent",
} as const;

const chipMap = {
  success: "bg-success/10 text-success border-success/30",
  info: "bg-info/10 text-info border-info/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  muted: "bg-muted text-muted-foreground border-border",
} as const;

export default function Training() {
  const [taskFilter, setTaskFilter] = useState("all");
  const [examOpen, setExamOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="培训助手"
        description="脱岗培训 · 在岗培训 · 题库沉淀 · 自动出卷 / 批改 / 节点推进"
        actions={
          <>
            <Button size="sm" onClick={() => setExamOpen(true)}>
              <Sparkles className="h-4 w-4 mr-1.5" />AI 一键出卷
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <FileUp className="h-4 w-4 mr-1.5" />导入培训材料
            </Button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI 4 张 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.label} className="p-4 relative overflow-hidden">
                <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", stripeMap[k.accent as keyof typeof stripeMap])} />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">{k.label}</span>
                  <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", accentMap[k.accent as keyof typeof accentMap])}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tabular-nums tracking-tight">{k.value}</span>
                  <span className="text-xs text-muted-foreground">{k.unit}</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-2 font-mono text-[10px] font-normal",
                    k.trendKind === "up" && "bg-success/10 text-success border-success/30",
                    k.trendKind === "down" && "bg-destructive/10 text-destructive border-destructive/30",
                    k.trendKind === "flat" && "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {k.trend}
                </Badge>
                <div className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-dashed">{k.foot}</div>
              </Card>
            );
          })}
        </div>

        {/* 双场景大卡 */}
        <div className="grid lg:grid-cols-2 gap-4">
          <SceneCard
            tag="SCENE 01 · 脱岗培训"
            tagColor="primary"
            title="自动出卷 · 改卷 · 留档"
            desc="基于培训材料自动生成题库与试卷，客观题自动判分，主观题智能打分后交 HR 复核，成绩与凭证一并写入员工培训档案。"
            stats={[
              { n: "18", l: "本月试卷" },
              { n: "1,284", l: "累计题目" },
              { n: "96%", l: "自动判分覆盖" },
            ]}
            flow={[
              { n: "1", t: "材料导入", state: "done" },
              { n: "2", t: "AI 出卷", state: "done" },
              { n: "3", t: "在线考试", state: "cur" },
              { n: "4", t: "批改留档", state: "pending" },
            ]}
            primaryLabel="进入脱岗培训"
            secondaryLabel="查看题库"
            onPrimary={() => navigate("/training/offsite")}
            onSecondary={() => navigate("/training/question-bank")}
          />
          <SceneCard
            tag="SCENE 02 · 在岗培训"
            tagColor="ai"
            title="节点推进 · 跨厂区协同"
            desc="按周/月节点自动提醒导师与员工提交培训记录，跨黄龙山、鄂州等厂区统一归档，支持激光工艺、太阳能装配等岗位的带教追踪。"
            stats={[
              { n: "4", l: "协同厂区" },
              { n: "32", l: "在带学徒" },
              { n: "87%", l: "节点达成率" },
            ]}
            flow={[
              { n: "W1", t: "入厂认知", state: "done" },
              { n: "W2", t: "导师指派", state: "done" },
              { n: "W4", t: "中期评估", state: "cur" },
              { n: "W8", t: "出师考核", state: "pending" },
            ]}
            primaryLabel="进入在岗培训"
            secondaryLabel="查看导师"
            onPrimary={() => navigate("/training/onsite")}
            onSecondary={() => navigate("/training/mentors")}
          />
        </div>

        {/* 待办任务 */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">待办任务</h3>
            <Tabs value={taskFilter} onValueChange={setTaskFilter}>
              <TabsList className="h-7">
                <TabsTrigger value="all" className="text-xs h-5 px-2.5">全部 12</TabsTrigger>
                <TabsTrigger value="urgent" className="text-xs h-5 px-2.5">紧急 3</TabsTrigger>
                <TabsTrigger value="overdue" className="text-xs h-5 px-2.5">已逾期 2</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div>
            {TASKS.map((t, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center px-5 py-3.5 border-b last:border-b-0 hover:bg-muted/40 transition-colors">
                <div className={cn("h-9 w-9 rounded-md flex items-center justify-center font-semibold text-sm", accentMap[t.typeColor as keyof typeof accentMap])}>
                  {t.type}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {t.meta.map((m, j) => (
                      <span key={j}>{m}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[10px] font-normal",
                      t.state === "urgent" && chipMap.danger,
                      t.state === "waiting" && chipMap.warning,
                      t.state === "progress" && chipMap.info,
                      t.state === "done" && chipMap.success,
                    )}
                  >
                    {t.stateLabel}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 考试速览 + 在岗时间线 */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">最近考试 · 成绩速览</h3>
              <Tabs defaultValue="week">
                <TabsList className="h-7">
                  <TabsTrigger value="week" className="text-xs h-5 px-2.5">本周</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs h-5 px-2.5">本月</TabsTrigger>
                  <TabsTrigger value="quarter" className="text-xs h-5 px-2.5">季度</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div>
              {EXAMS.map((e) => (
                <div key={e.num} className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center px-5 py-3 border-b last:border-b-0 hover:bg-muted/30">
                  <span className="font-mono text-[10px] text-muted-foreground tracking-wider w-12">{e.num}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    <div className="text-[11px] text-muted-foreground flex gap-2 mt-0.5">
                      <span>{e.dept}</span>
                      <span className="text-border">·</span>
                      <span>参考 {e.count} 人</span>
                      <span className="text-border">·</span>
                      <span>{e.date}</span>
                    </div>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <div className={cn(
                      "text-lg font-semibold tabular-nums",
                      e.level === "high" && "text-success",
                      e.level === "mid" && "text-warning",
                      e.level === "low" && "text-destructive",
                    )}>{e.score}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">AVG</div>
                  </div>
                  <Badge variant="outline" className={cn("font-mono text-[10px] font-normal", chipMap[e.chipKind as keyof typeof chipMap])}>
                    {e.chip}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">在岗培训节点 · 王小明</h3>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">供应链 / 仓储组 · 鄂州基地</div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">查看完整 <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button>
            </div>
            <div className="px-5 py-4">
              {TIMELINE.map((t, i) => (
                <div key={i} className="relative grid grid-cols-[18px_1fr] gap-3 pb-4 last:pb-0">
                  {i < TIMELINE.length - 1 && (
                    <div className={cn(
                      "absolute left-[5px] top-4 bottom-0 w-px",
                      t.state === "done" ? "bg-success" : "bg-border"
                    )} />
                  )}
                  <div className={cn(
                    "h-3 w-3 rounded-full mt-1 z-10 border-2",
                    t.state === "done" && "bg-success border-success",
                    t.state === "active" && "bg-background border-primary ring-4 ring-primary/15",
                    t.state === "pending" && "bg-background border-dashed border-border",
                  )} />
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium">{t.title}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{t.date}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{t.meta}</div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {t.tags.map((tag, j) => (
                        <Badge key={j} variant="outline" className={cn("font-mono text-[9px] font-normal py-0 px-1.5 h-4", chipMap[tag.kind as keyof typeof chipMap])}>
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 题库 4 卡 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-sm" />
              题库与知识沉淀
            </h2>
            <span className="text-xs text-muted-foreground">支持激光打标 · 太阳能装配 · 质量体系 · 外贸销售等岗位知识图谱</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KB.map((k) => {
              const Icon = k.icon;
              return (
                <Card
                  key={k.label}
                  className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                  onClick={() => navigate(`/training/question-bank?cat=${k.key}`)}
                >
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3", accentMap[k.color as keyof typeof accentMap])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold mb-1 flex items-center justify-between">
                    {k.label}
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed min-h-[34px]">{k.desc}</div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-dashed">
                    <div>
                      <div className="text-base font-semibold tabular-nums">{k.n1}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">题目</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold tabular-nums">{k.n2}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">试卷模板</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

      </div>

      <NewExamDialog open={examOpen} onClose={() => setExamOpen(false)} />
      <ImportMaterialsSheet open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}

function SceneCard({
  tag,
  tagColor,
  title,
  desc,
  stats,
  flow,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: {
  tag: string;
  tagColor: "primary" | "ai";
  title: string;
  desc: string;
  stats: { n: string; l: string }[];
  flow: { n: string; t: string; state: "done" | "cur" | "pending" }[];
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}) {
  return (
    <Card
      className={cn(
        "p-5 relative overflow-hidden",
        tagColor === "primary" && "bg-gradient-to-b from-primary/5 to-transparent border-primary/20",
        tagColor === "ai" && "bg-gradient-to-b from-[hsl(var(--ai-soft))] to-transparent border-[hsl(var(--ai))]/20",
      )}
    >
      <div className={cn(
        "font-mono text-[10px] tracking-wider mb-2 flex items-center gap-1.5",
        tagColor === "primary" ? "text-primary" : "text-[hsl(var(--ai))]"
      )}>
        <span className={cn(
          "h-1.5 w-1.5 rounded-full",
          tagColor === "primary" ? "bg-primary" : "bg-[hsl(var(--ai))]"
        )} />
        {tag}
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {stats.map((s) => (
          <div key={s.l} className="bg-background/60 rounded-md px-3 py-2.5 border border-border/50">
            <div className="text-lg font-semibold tabular-nums">{s.n}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-background/40 rounded-md p-3 mb-4 border border-border/40">
        {flow.map((f, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center font-mono text-[10px] font-semibold border",
                f.state === "done" && tagColor === "primary" && "bg-primary text-primary-foreground border-primary",
                f.state === "done" && tagColor === "ai" && "bg-[hsl(var(--ai))] text-[hsl(var(--ai-foreground))] border-[hsl(var(--ai))]",
                f.state === "cur" && tagColor === "primary" && "bg-background text-primary border-primary ring-4 ring-primary/15",
                f.state === "cur" && tagColor === "ai" && "bg-background text-[hsl(var(--ai))] border-[hsl(var(--ai))] ring-4 ring-[hsl(var(--ai))]/15",
                f.state === "pending" && "bg-background text-muted-foreground border-border",
              )}>
                {f.n}
              </div>
              <span className={cn(
                "text-[10px]",
                f.state === "pending" ? "text-muted-foreground" : "text-foreground font-medium"
              )}>{f.t}</span>
            </div>
            {i < flow.length - 1 && (
              <div className={cn(
                "h-px w-4 -mb-5 shrink-0",
                f.state === "done"
                  ? (tagColor === "primary" ? "bg-primary" : "bg-[hsl(var(--ai))]")
                  : "bg-border"
              )} />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className={cn(
            tagColor === "ai" && "bg-[hsl(var(--ai))] text-[hsl(var(--ai-foreground))] hover:bg-[hsl(var(--ai))]/90"
          )}
          onClick={onPrimary ?? (() => toast.success(`已进入${title}`))}
        >
          {primaryLabel}
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
        <Button size="sm" variant="outline" onClick={onSecondary ?? (() => toast.info(secondaryLabel))}>
          {secondaryLabel}
        </Button>
      </div>
    </Card>
  );
}

function ChatMsg({
  role,
  text,
  card,
  actions,
}: {
  role: string;
  text: string;
  card?: { k: string; v: string }[];
  actions?: string[];
}) {
  const me = role === "me";
  return (
    <div className={cn("flex gap-2 max-w-[92%]", me && "ml-auto flex-row-reverse")}>
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback className={cn(
          "text-[10px] font-semibold text-white",
          me ? "bg-foreground" : "bg-gradient-to-br from-primary to-[hsl(var(--ai))]"
        )}>
          {me ? "黄" : "S"}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        "rounded-lg px-3 py-2 text-sm leading-relaxed border whitespace-pre-line",
        me ? "bg-foreground text-background border-foreground" : "bg-background border-border"
      )}>
        {text}
        {card && (
          <div className="mt-2 p-2.5 bg-muted/60 rounded-md border-l-2 border-primary text-xs space-y-1">
            {card.map((row) => (
              <div key={row.k} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{row.k}</span>
                <span className="font-medium text-foreground text-right">{row.v}</span>
              </div>
            ))}
          </div>
        )}
        {actions && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {actions.map((a, i) => (
              <button
                key={a}
                onClick={() => toast.success(`已执行：${a}`)}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full border transition-colors",
                  i === 0
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                    : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
