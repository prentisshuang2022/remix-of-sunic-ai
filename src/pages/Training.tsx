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
  Database,
  FileBarChart,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NewExamDialog } from "@/components/training/NewExamDialog";
import { ImportMaterialsSheet } from "@/components/training/ImportMaterialsSheet";


/* ───────── Mock Data ───────── */

const KPIS = [
  { label: "题库总题数", value: "1,284", sub: "本月新增 86", icon: Database, accent: "primary" as const },
  { label: "本月考试场次", value: "24", sub: "↑ 18% 环比", icon: ClipboardCheck, accent: "info" as const },
  { label: "在训人员", value: "32", sub: "跨 2 厂区", icon: Users, accent: "success" as const },
  { label: "逾期节点", value: "3", sub: "需立即处理", icon: AlertTriangle, accent: "danger" as const },
];

const TASKS = [
  { type: "改", typeColor: "warning" as const, title: "《激光划片机安全操作》试卷待批改（主观题）", dept: "生产管理部 · 激光工艺组", deadline: "11-14 截止", state: "urgent" as const, stateLabel: "紧急" },
  { type: "试", typeColor: "info" as const, title: "ISO9001 质量体系复训 · 试卷生成待确认", dept: "品质管理部 全员", deadline: "已等待 1 天", state: "waiting" as const, stateLabel: "待审核" },
  { type: "带", typeColor: "success" as const, title: "新员工在岗培训 · W2 导师记录未提交", dept: "供应链 · 仓储组 · 鄂州基地", deadline: "还差 2 天", state: "progress" as const, stateLabel: "进行中" },
  { type: "档", typeColor: "ai" as const, title: "外贸业务员岗前培训考试 · 自动判分完成", dept: "营销中心 · 外贸组", deadline: "今日 10:24", state: "done" as const, stateLabel: "待归档" },
  { type: "训", typeColor: "primary" as const, title: "太阳能组件装配 SOP · 节点抽检", dept: "生产管理部 · 组件车间 · 黄龙山基地", deadline: "计划 11-18", state: "progress" as const, stateLabel: "本周内" },
];

const TIMELINE = [
  { state: "done" as const, label: "W1 入厂认知", date: "10-28", desc: "导师 李建华 · 仓储主管 · 入厂安全培训完成" },
  { state: "done" as const, label: "W2 仓储 SOP", date: "11-04", desc: "覆盖 ERP 出入库、库位规则、激光器存储要求" },
  { state: "active" as const, label: "W4 中期评估", date: "11-18", desc: "导师需提交：实操表现、问题清单、下阶段目标" },
  { state: "pending" as const, label: "W6 跨厂轮岗", date: "12-02", desc: "激光器整机装配线见习（黄龙山基地）· 2 天" },
  { state: "pending" as const, label: "W8 出师考核", date: "12-16", desc: "笔试 40 题 + 实操演示 + 导师鉴定" },
];

const accentMap = {
  primary: "text-primary bg-primary/10",
  warning: "text-warning bg-warning/15",
  success: "text-success bg-success/15",
  info: "text-info bg-info/10",
  ai: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))]",
  danger: "text-destructive bg-destructive/10",
} as const;

const chipMap = {
  success: "bg-success/10 text-success border-success/30",
  info: "bg-info/10 text-info border-info/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  muted: "bg-muted text-muted-foreground border-border",
} as const;

const stateChip: Record<string, keyof typeof chipMap> = {
  urgent: "danger",
  waiting: "warning",
  progress: "info",
  done: "success",
};

/* ───────── Component ───────── */

export default function Training() {
  const [taskFilter, setTaskFilter] = useState("all");
  const [examOpen, setExamOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const navigate = useNavigate();

  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <>
      <PageHeader
        title="培训助手 · 总览"
        description="脱岗培训 → 在岗培训 业务闭环一览"
        actions={
          <>
            <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">更新时间 {timeStr}</span>
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
        {/* ── 第一段：关键指标 ── */}
        <section>
          <SectionTitle>关键指标</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KPIS.map((k) => {
              const Icon = k.icon;
              const isDanger = k.accent === "danger";
              return (
                <Card key={k.label} className={cn("p-5 rounded-2xl hover:shadow-md transition-shadow", isDanger && "border-destructive/30")}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground">{k.label}</span>
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", accentMap[k.accent])}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className={cn("text-3xl font-semibold tabular-nums tracking-tight", isDanger && "text-destructive")}>{k.value}</div>
                  <div className={cn("text-xs mt-1", isDanger ? "text-destructive font-medium" : "text-muted-foreground")}>{k.sub}</div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── 第二段：两大核心场景 ── */}
        <section>
          <SectionTitle>核心场景入口</SectionTitle>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* 脱岗培训 */}
            <Card className="p-6 rounded-2xl overflow-hidden relative bg-gradient-to-br from-[hsl(239,84%,67%)/0.06] to-transparent border-[hsl(239,84%,67%)/0.2] hover:shadow-md transition-shadow">
              <div className="font-mono text-[10px] tracking-wider text-[hsl(239,84%,67%)] flex items-center gap-1.5 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(239,84%,67%)]" />
                脱岗培训 · 出卷改卷留档
              </div>
              <h3 className="text-lg font-semibold mb-1">材料进 → 试卷出 → 自动判分 → 成绩入档</h3>
              <p className="text-sm text-muted-foreground mb-5">基于培训材料自动生成题库，客观题自动判分，主观题 AI 初评后交 HR 复核。</p>

              {/* Flow bar */}
              <div className="flex items-center bg-background/60 rounded-xl p-3 mb-5 border border-border/50">
                {[
                  { n: "①", t: "材料导入", s: "done" },
                  { n: "②", t: "AI 出卷", s: "done" },
                  { n: "③", t: "在线考试", s: "cur" },
                  { n: "④", t: "批改留档", s: "pending" },
                ].map((f, i, arr) => (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => {
                        const paths = ["/training/question-bank", "/training/offsite", "/training/offsite", "/training/materials"];
                        navigate(paths[i]);
                      }}
                      className="flex flex-col items-center gap-1.5 flex-1 group cursor-pointer"
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-transform group-hover:scale-110",
                        f.s === "done" && "bg-[hsl(239,84%,67%)] text-white border-[hsl(239,84%,67%)]",
                        f.s === "cur" && "bg-background text-[hsl(239,84%,67%)] border-[hsl(239,84%,67%)] ring-4 ring-[hsl(239,84%,67%)/0.15]",
                        f.s === "pending" && "bg-background text-muted-foreground border-border",
                      )}>
                        {f.n}
                      </div>
                      <span className={cn("text-[10px]", f.s === "pending" ? "text-muted-foreground" : "text-foreground font-medium")}>{f.t}</span>
                    </button>
                    {i < arr.length - 1 && (
                      <div className={cn("h-px w-5 -mb-5 shrink-0", f.s === "done" ? "bg-[hsl(239,84%,67%)]" : "bg-border")} />
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[{ n: "18", l: "本月试卷" }, { n: "1,284", l: "累计题目" }, { n: "96%", l: "自动判分覆盖" }].map((s) => (
                  <div key={s.l} className="bg-background/60 rounded-lg px-3 py-2.5 border border-border/50 text-center">
                    <div className="text-lg font-semibold tabular-nums">{s.n}</div>
                    <div className="text-[10px] text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => navigate("/training/offsite")}>
                  进入脱岗培训 <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate("/training/question-bank")}>
                  查看题库
                </Button>
              </div>
            </Card>

            {/* 在岗培训 */}
            <Card className="p-6 rounded-2xl overflow-hidden relative bg-gradient-to-br from-[hsl(160,59%,46%)/0.06] to-transparent border-[hsl(160,59%,46%)/0.2] hover:shadow-md transition-shadow">
              <div className="font-mono text-[10px] tracking-wider text-[hsl(160,59%,46%)] flex items-center gap-1.5 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(160,59%,46%)]" />
                在岗培训 · 节点推进跨厂区协同
              </div>
              <h3 className="text-lg font-semibold mb-1">按周/月节点 → 导师记录 → 自动汇总</h3>
              <p className="text-sm text-muted-foreground mb-5">跨黄龙山、鄂州厂区统一归档，支持激光工艺、太阳能装配等带教追踪。</p>

              {/* Milestone bar */}
              <div className="flex items-center bg-background/60 rounded-xl p-3 mb-5 border border-border/50">
                {[
                  { n: "W1", t: "入厂认知", s: "done" },
                  { n: "W2", t: "导师指派", s: "done" },
                  { n: "W4", t: "中期评估", s: "cur" },
                  { n: "W8", t: "出师考核", s: "pending" },
                ].map((f, i, arr) => (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => toast.info(`查看节点：${f.t}`)}
                      className="flex flex-col items-center gap-1.5 flex-1 group cursor-pointer"
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-semibold border transition-transform group-hover:scale-110",
                        f.s === "done" && "bg-[hsl(160,59%,46%)] text-white border-[hsl(160,59%,46%)]",
                        f.s === "cur" && "bg-background text-[hsl(160,59%,46%)] border-[hsl(160,59%,46%)] ring-4 ring-[hsl(160,59%,46%)/0.15]",
                        f.s === "pending" && "bg-background text-muted-foreground border-border",
                      )}>
                        {f.n}
                      </div>
                      <span className={cn("text-[10px]", f.s === "pending" ? "text-muted-foreground" : "text-foreground font-medium")}>{f.t}</span>
                    </button>
                    {i < arr.length - 1 && (
                      <div className={cn("h-px w-5 -mb-5 shrink-0", f.s === "done" ? "bg-[hsl(160,59%,46%)]" : "bg-border")} />
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[{ n: "2", l: "协同厂区" }, { n: "32", l: "在带学徒" }, { n: "87%", l: "节点达成率" }].map((s) => (
                  <div key={s.l} className="bg-background/60 rounded-lg px-3 py-2.5 border border-border/50 text-center">
                    <div className="text-lg font-semibold tabular-nums">{s.n}</div>
                    <div className="text-[10px] text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="bg-[hsl(160,59%,46%)] text-white hover:bg-[hsl(160,59%,46%)]/90" onClick={() => navigate("/training/onsite")}>
                  进入在岗培训 <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate("/training/mentors")}>
                  查看导师
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 第三段：待办 + 学徒时间轴 ── */}
        <section>
          <SectionTitle>待办与培训进度</SectionTitle>
          <div className="grid gap-4 lg:grid-cols-3">
            {/* 左：待办任务 */}
            <Card className="lg:col-span-2 overflow-hidden rounded-2xl">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-base">待办任务</h3>
                <Tabs value={taskFilter} onValueChange={setTaskFilter}>
                  <TabsList className="h-7">
                    <TabsTrigger value="all" className="text-xs h-5 px-2.5">全部 {TASKS.length}</TabsTrigger>
                    <TabsTrigger value="urgent" className="text-xs h-5 px-2.5">紧急 1</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                {TASKS.filter(t => taskFilter === "all" || t.state === taskFilter).map((t, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b last:border-b-0 hover:bg-muted/40 transition-colors">
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center font-semibold text-sm shrink-0", accentMap[t.typeColor])}>
                      {t.type}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{t.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex gap-2 flex-wrap">
                        <span>{t.dept}</span>
                        <span className="text-border">·</span>
                        <span>{t.deadline}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("font-mono text-[10px] font-normal shrink-0", chipMap[stateChip[t.state]])}>
                      {t.stateLabel}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* 右：学徒时间轴 */}
            <Card className="overflow-hidden rounded-2xl">
              <div className="px-5 py-4 border-b">
                <h3 className="font-semibold text-base">在岗培训节点 · 王小明</h3>
                <div className="text-[11px] text-muted-foreground mt-0.5">供应链 / 仓储组 · 鄂州基地</div>
              </div>
              <div className="px-5 py-4">
                {TIMELINE.map((t, i) => (
                  <div key={i} className="relative grid grid-cols-[18px_1fr] gap-3 pb-4 last:pb-0 cursor-pointer group" onClick={() => toast.info(`查看节点：${t.label}`)}>
                    {i < TIMELINE.length - 1 && (
                      <div className={cn("absolute left-[5px] top-4 bottom-0 w-px", t.state === "done" ? "bg-[hsl(160,59%,46%)]" : "bg-border")} />
                    )}
                    <div className={cn(
                      "h-3 w-3 rounded-full mt-1 z-10 border-2 transition-transform group-hover:scale-125",
                      t.state === "done" && "bg-[hsl(160,59%,46%)] border-[hsl(160,59%,46%)]",
                      t.state === "active" && "bg-background border-[hsl(239,84%,67%)] ring-4 ring-[hsl(239,84%,67%)/0.15]",
                      t.state === "pending" && "bg-background border-dashed border-border",
                    )} />
                    <div className="min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={cn("text-sm", t.state !== "pending" ? "font-medium" : "text-muted-foreground")}>{t.label}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{t.date}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>

      <NewExamDialog open={examOpen} onClose={() => setExamOpen(false)} />
      <ImportMaterialsSheet open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}

/* ── Helper ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
      <span className="w-1 h-4 bg-primary rounded-sm" />
      {children}
    </h2>
  );
}
