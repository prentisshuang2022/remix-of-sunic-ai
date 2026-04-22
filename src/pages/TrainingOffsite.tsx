import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, ClipboardCheck, Archive, Sparkles, Search,
  Filter, Plus, Eye, Send, Check, AlertTriangle, ChevronRight,
  Trophy, Clock, Users, Download, FileCheck2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAPERS = {
  published: [
    { id: "P-1284", title: "激光打标机操作规范", dept: "生产管理部", site: "黄龙山", q: 32, dur: 60, takers: 14, done: 14, avg: 91.4, date: "11-13" },
    { id: "P-1283", title: "ISO9001 质量意识复训", dept: "品质管理部", site: "全集团", q: 40, dur: 60, takers: 22, done: 18, avg: 78.6, date: "11-12" },
    { id: "P-1280", title: "消防安全与应急处置", dept: "综合管理部", site: "全集团", q: 30, dur: 45, takers: 46, done: 46, avg: 68.1, date: "11-06" },
  ],
  draft: [
    { id: "D-009", title: "激光划片机安全操作复训", dept: "生产管理部", site: "黄龙山·鄂州", q: 40, dur: 60, takers: 32, done: 0, avg: 0, date: "草稿" },
    { id: "D-008", title: "外贸 INCOTERMS 2020 复训", dept: "营销中心", site: "总部", q: 25, dur: 30, takers: 12, done: 0, avg: 0, date: "草稿" },
  ],
  archived: [
    { id: "P-1282", title: "外贸业务员岗前培训", dept: "营销中心", site: "总部", q: 35, dur: 60, takers: 5, done: 5, avg: 84.2, date: "11-10" },
    { id: "P-1281", title: "太阳能组件装配 SOP", dept: "生产管理部", site: "黄龙山", q: 28, dur: 45, takers: 18, done: 18, avg: 79.3, date: "11-08" },
    { id: "P-1278", title: "EHS 月度安全教育", dept: "综合管理部", site: "全集团", q: 20, dur: 30, takers: 198, done: 198, avg: 86.7, date: "11-01" },
  ],
};

const QUEUE = [
  { id: "Q-302", paper: "激光划片机安全操作", emp: "黄锦阳", empId: "EMP-1042", dept: "生产管理部", q: 8, aiScore: 7.4, aiAvg: "中等", flag: "normal", time: "2h 前", status: "pending" },
  { id: "Q-301", paper: "ISO9001 质量意识复训", emp: "王美玲", empId: "EMP-0738", dept: "品质管理部", q: 6, aiScore: 5.2, aiAvg: "偏低", flag: "warn", time: "3h 前", status: "pending" },
  { id: "Q-300", paper: "ISO9001 质量意识复训", emp: "刘志刚", empId: "EMP-0921", dept: "品质管理部", q: 6, aiScore: 8.6, aiAvg: "优秀", flag: "good", time: "5h 前", status: "pending" },
  { id: "Q-299", paper: "外贸业务员岗前培训", emp: "陈晓琳", empId: "EMP-1156", dept: "营销中心", q: 5, aiScore: 7.0, aiAvg: "中等", flag: "normal", time: "今日", status: "pending" },
  { id: "Q-298", paper: "消防安全与应急处置", emp: "李建华", empId: "EMP-0612", dept: "综合管理部", q: 4, aiScore: 4.1, aiAvg: "需补考", flag: "warn", time: "昨日", status: "pending" },
];

const SCORES = [
  { emp: "黄锦阳", dept: "生产管理部·激光工艺组", site: "黄龙山", count: 5, avg: 88.2, last: "11-13", trend: "up" },
  { emp: "王美玲", dept: "品质管理部·体系组", site: "总部", count: 8, avg: 76.4, last: "11-12", trend: "down" },
  { emp: "刘志刚", dept: "品质管理部·体系组", site: "总部", count: 8, avg: 89.1, last: "11-12", trend: "up" },
  { emp: "陈晓琳", dept: "营销中心·外贸组", site: "总部", count: 3, avg: 84.2, last: "11-10", trend: "flat" },
  { emp: "李建华", dept: "供应链·仓储组", site: "鄂州", count: 12, avg: 72.5, last: "昨日", trend: "down" },
];

const MOCK_ANSWER = {
  question: "请简述激光划片机在出现异常停机时的 5 步标准处置流程，并说明每一步的关键控制点。",
  reference: "1) 立即按下急停（关闭高压）；2) 切断激光电源与气源；3) 标识隔离设备并悬挂警示牌；4) 通知班组长与设备维护；5) 填写《异常处置单》并按 SOP 复盘。关键控制点：避免在通电状态接触光路、确保冷却水循环、留存现场照片。",
  answer: "看到报警先按急停按钮，然后关掉激光电源，挂个牌子告诉别人不要开机，叫维修过来看，最后填一下记录单。要注意的是不要乱动光路，水循环要保持。",
  aiNotes: [
    { kind: "good", text: "5 步骤基本完整，操作顺序正确" },
    { kind: "good", text: "提到了光路安全与水循环，关键点覆盖" },
    { kind: "warn", text: "未明确『切断气源』，存在气路残压风险" },
    { kind: "warn", text: "未提及『标识隔离设备 / 悬挂警示牌』的标准化要求" },
    { kind: "warn", text: "未提及现场照片留存（追溯要求）" },
  ],
};

export default function TrainingOffsite() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("queue");
  const [paperTab, setPaperTab] = useState<"published" | "draft" | "archived">("published");
  const [search, setSearch] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeQ, setActiveQ] = useState<typeof QUEUE[0] | null>(null);

  const openReview = (item: typeof QUEUE[0]) => {
    setActiveQ(item);
    setReviewOpen(true);
  };

  return (
    <>
      <PageHeader
        title="脱岗培训"
        description="试卷库 · 批改队列 · 成绩与档案"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("/training")}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />返回培训助手
            </Button>
            <Button size="sm" onClick={() => toast.success("已打开 AI 一键出卷")}>
              <Sparkles className="h-4 w-4 mr-1.5" />AI 一键出卷
            </Button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile icon={ClipboardCheck} label="本月场次" value="24" foot="脱岗 18 · 抽测 6" accent="primary" />
          <KpiTile icon={Clock} label="批改队列" value="36" foot="AI 初评完成 · 待复核" accent="warning" alert />
          <KpiTile icon={Trophy} label="平均成绩" value="82.4" unit="分" foot="较上月持平" accent="success" />
          <KpiTile icon={Archive} label="试卷沉淀" value="1,284" foot="题目累计 · 96% 自动判分" accent="ai" />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-9">
            <TabsTrigger value="queue" className="text-xs">
              <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />批改队列
              <Badge variant="outline" className="ml-2 h-4 px-1.5 text-[10px] bg-warning/15 text-warning border-warning/30">36</Badge>
            </TabsTrigger>
            <TabsTrigger value="papers" className="text-xs">
              <FileText className="h-3.5 w-3.5 mr-1.5" />试卷库
            </TabsTrigger>
            <TabsTrigger value="archive" className="text-xs">
              <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />成绩与档案
            </TabsTrigger>
          </TabsList>

          {/* 批改队列 */}
          <TabsContent value="queue" className="mt-4">
            <Card className="overflow-hidden">
              <div className="px-5 py-3.5 border-b flex items-center gap-3">
                <div className="text-sm font-medium">待批改主观题</div>
                <Badge variant="outline" className="font-mono text-[10px] font-normal bg-[hsl(var(--ai-soft))] text-[hsl(var(--ai))] border-[hsl(var(--ai))]/30">
                  <Sparkles className="h-2.5 w-2.5 mr-1" />AI 已完成初评
                </Badge>
                <div className="flex-1" />
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <Input placeholder="员工 / 试卷" className="h-8 pl-8 w-56 text-xs" />
                </div>
                <Button size="sm" variant="outline" className="h-8">
                  <Filter className="h-3.5 w-3.5 mr-1" />只看异常
                </Button>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-[11px] text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-5 py-2.5">试卷 / 员工</th>
                    <th className="text-left font-medium py-2.5">主观题</th>
                    <th className="text-left font-medium py-2.5">AI 初评</th>
                    <th className="text-left font-medium py-2.5">提交时间</th>
                    <th className="text-right font-medium px-5 py-2.5">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {QUEUE.map((q) => (
                    <tr key={q.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium">{q.paper}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[8px] bg-foreground text-background">{q.emp[0]}</AvatarFallback>
                          </Avatar>
                          {q.emp} · {q.dept}
                        </div>
                      </td>
                      <td className="py-3 text-xs"><span className="font-mono tabular-nums">{q.q}</span> 题</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-mono tabular-nums text-sm font-semibold",
                            q.flag === "good" && "text-success",
                            q.flag === "warn" && "text-destructive",
                            q.flag === "normal" && "text-foreground"
                          )}>{q.aiScore.toFixed(1)}</span>
                          <span className="text-[11px] text-muted-foreground">/10</span>
                          <Badge variant="outline" className={cn(
                            "font-mono text-[10px] font-normal",
                            q.flag === "good" && "bg-success/10 text-success border-success/30",
                            q.flag === "warn" && "bg-destructive/10 text-destructive border-destructive/30",
                            q.flag === "normal" && "bg-muted text-muted-foreground border-border",
                          )}>
                            {q.flag === "warn" && <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                            {q.aiAvg}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 text-[11px] text-muted-foreground font-mono">{q.time}</td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openReview(q)}>
                          <Eye className="h-3.5 w-3.5 mr-1" />进入批改
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          {/* 试卷库 */}
          <TabsContent value="papers" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Tabs value={paperTab} onValueChange={(v) => setPaperTab(v as typeof paperTab)}>
                <TabsList className="h-8">
                  <TabsTrigger value="published" className="text-xs h-6 px-2.5">已发布 {PAPERS.published.length}</TabsTrigger>
                  <TabsTrigger value="draft" className="text-xs h-6 px-2.5">草稿 {PAPERS.draft.length}</TabsTrigger>
                  <TabsTrigger value="archived" className="text-xs h-6 px-2.5">已归档 {PAPERS.archived.length}</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex-1" />
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="试卷名 / 部门 / 厂区" className="h-8 pl-8 w-64 text-xs" />
              </div>
              <Button size="sm" variant="outline" className="h-8"><Plus className="h-3.5 w-3.5 mr-1" />新建</Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-3">
              {PAPERS[paperTab].filter(p => !search || p.title.includes(search) || p.dept.includes(search)).map(p => (
                <Card key={p.id} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-muted-foreground tracking-wider">{p.id}</span>
                        <Badge variant="outline" className={cn(
                          "font-mono text-[10px] font-normal",
                          paperTab === "published" && "bg-success/10 text-success border-success/30",
                          paperTab === "draft" && "bg-warning/15 text-warning border-warning/30",
                          paperTab === "archived" && "bg-muted text-muted-foreground border-border",
                        )}>
                          {paperTab === "published" ? "已发布" : paperTab === "draft" ? "草稿" : "已归档"}
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold truncate">{p.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{p.dept} · {p.site}</div>
                    </div>
                    {paperTab === "published" && (
                      <div className="text-right">
                        <div className={cn("text-lg font-semibold tabular-nums", p.avg >= 80 ? "text-success" : p.avg >= 60 ? "text-warning" : "text-destructive")}>
                          {p.avg.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">平均</div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-dashed">
                    <Stat n={`${p.q}`} l="题量" />
                    <Stat n={`${p.dur}`} l="分钟" />
                    <Stat n={`${p.takers}`} l="应考" />
                    <Stat n={paperTab === "draft" ? "—" : `${p.done}`} l="完成" />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-muted-foreground font-mono">{p.date}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"><Eye className="h-3.5 w-3.5 mr-1" />预览</Button>
                      {paperTab === "draft" ? (
                        <Button size="sm" className="h-7 px-2 text-xs" onClick={() => toast.success("已发布到钉钉")}><Send className="h-3.5 w-3.5 mr-1" />发布</Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast.success("已复用为新草稿")}>复用</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 成绩与档案 */}
          <TabsContent value="archive" className="mt-4">
            <Card className="overflow-hidden">
              <div className="px-5 py-3.5 border-b flex items-center gap-3">
                <div className="text-sm font-medium">员工成绩档案</div>
                <Badge variant="outline" className="font-mono text-[10px] font-normal">自动写入员工档案</Badge>
                <div className="flex-1" />
                <Button size="sm" variant="outline" className="h-8" onClick={() => toast.success("已导出 Excel")}>
                  <Download className="h-3.5 w-3.5 mr-1" />导出
                </Button>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-[11px] text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-5 py-2.5">员工</th>
                    <th className="text-left font-medium py-2.5">所属</th>
                    <th className="text-left font-medium py-2.5">厂区</th>
                    <th className="text-left font-medium py-2.5">参考次数</th>
                    <th className="text-left font-medium py-2.5">平均</th>
                    <th className="text-left font-medium py-2.5">最近</th>
                    <th className="text-right font-medium px-5 py-2.5">档案</th>
                  </tr>
                </thead>
                <tbody>
                  {SCORES.map(s => (
                    <tr key={s.emp} className="border-t hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-foreground text-background">{s.emp[0]}</AvatarFallback></Avatar>
                          <span className="text-sm font-medium">{s.emp}</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{s.dept}</td>
                      <td className="py-3 text-xs">{s.site}</td>
                      <td className="py-3 text-xs font-mono tabular-nums">{s.count}</td>
                      <td className="py-3">
                        <span className={cn("font-mono tabular-nums font-semibold", s.avg >= 80 ? "text-success" : s.avg >= 60 ? "text-warning" : "text-destructive")}>{s.avg.toFixed(1)}</span>
                        <span className={cn("ml-1.5 text-[10px]", s.trend === "up" && "text-success", s.trend === "down" && "text-destructive", s.trend === "flat" && "text-muted-foreground")}>
                          {s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→"}
                        </span>
                      </td>
                      <td className="py-3 text-[11px] text-muted-foreground font-mono">{s.last}</td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-xs">查看 <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 批改分屏 Dialog */}
      <ReviewDialog open={reviewOpen} onClose={() => setReviewOpen(false)} item={activeQ} />
    </>
  );
}

function KpiTile({ icon: Icon, label, value, unit, foot, accent, alert }: {
  icon: typeof Trophy; label: string; value: string; unit?: string; foot: string;
  accent: "primary" | "warning" | "success" | "ai"; alert?: boolean;
}) {
  const accentMap = {
    primary: "text-primary bg-primary/10",
    warning: "text-warning bg-warning/15",
    success: "text-success bg-success/15",
    ai: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))]",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", accentMap[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-semibold tabular-nums tracking-tight">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <div className={cn("text-[11px] mt-2", alert ? "text-destructive" : "text-muted-foreground")}>{foot}</div>
    </Card>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-base font-semibold tabular-nums">{n}</div>
      <div className="text-[10px] text-muted-foreground">{l}</div>
    </div>
  );
}

function ReviewDialog({ open, onClose, item }: { open: boolean; onClose: () => void; item: typeof QUEUE[0] | null }) {
  const [score, setScore] = useState([7]);
  const [note, setNote] = useState("AI 评分合理，主流程正确，扣分项：未明确切断气源、未提及标识隔离与现场照片留存。");

  if (!item) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-muted-foreground">
            <span>{item.id}</span>
            <span>·</span>
            <span>{item.paper}</span>
            <span>·</span>
            <span>{item.emp} / {item.dept}</span>
            <Badge variant="outline" className="font-mono text-[10px] font-normal ml-2">第 1 / {item.q} 题</Badge>
          </div>
          <DialogTitle className="text-base mt-1">主观题批改 · 分屏复核</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[1.4fr_1fr] divide-x max-h-[70vh]">
          {/* 左：试卷 */}
          <div className="p-5 overflow-y-auto space-y-4">
            <div>
              <Badge variant="outline" className="font-mono text-[10px] font-normal mb-2">题干 · 简答 · 10 分</Badge>
              <div className="text-sm leading-relaxed font-medium">{MOCK_ANSWER.question}</div>
            </div>
            <div className="rounded-md border-l-2 border-primary bg-muted/40 p-3">
              <div className="text-[11px] text-muted-foreground mb-1.5 font-mono tracking-wider">参考答案</div>
              <div className="text-xs leading-relaxed text-foreground/80">{MOCK_ANSWER.reference}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="text-[11px] text-muted-foreground mb-1.5 font-mono tracking-wider">员工作答</div>
              <div className="text-sm leading-relaxed">{MOCK_ANSWER.answer}</div>
            </div>
          </div>

          {/* 右：评分 */}
          <div className="p-5 overflow-y-auto bg-muted/20 space-y-4">
            <div className="rounded-md border border-[hsl(var(--ai))]/30 bg-[hsl(var(--ai-soft))] p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--ai))]">
                  <Sparkles className="h-3.5 w-3.5" />AI 初评
                </div>
                <span className="font-mono tabular-nums text-2xl font-bold text-[hsl(var(--ai))]">{item.aiScore.toFixed(1)}</span>
              </div>
              <div className="space-y-1.5">
                {MOCK_ANSWER.aiNotes.map((n, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px]">
                    {n.kind === "good" ? <Check className="h-3 w-3 text-success shrink-0 mt-0.5" /> : <AlertTriangle className="h-3 w-3 text-warning shrink-0 mt-0.5" />}
                    <span className={cn(n.kind === "good" ? "text-foreground/80" : "text-foreground")}>{n.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">人工评分</span>
                <span className="font-mono tabular-nums text-2xl font-bold">{score[0].toFixed(1)} <span className="text-xs text-muted-foreground font-normal">/10</span></span>
              </div>
              <Slider value={score} onValueChange={setScore} min={0} max={10} step={0.5} />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1.5">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1.5">复核备注（可选）</div>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="text-xs resize-none" />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { toast.success("已采纳 AI 评分"); onClose(); }}>
                采纳 AI
              </Button>
              <Button size="sm" className="flex-1" onClick={() => { toast.success(`已提交 · ${score[0].toFixed(1)} 分`); onClose(); }}>
                <Check className="h-3.5 w-3.5 mr-1" />提交并下一题
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
