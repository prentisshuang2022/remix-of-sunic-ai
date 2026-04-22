import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Star, Award, Users, Sparkles, MapPin,
  Zap, Sun, Shield, Globe, Plus, Filter, MessageSquare,
  TrendingUp, Calendar, CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AddMentorDialog, type NewMentorPayload } from "@/components/training/AddMentorDialog";

type Craft = "laser" | "solar" | "qa" | "trade";
type Site = "黄龙山基地" | "鄂州基地" | "光谷研发中心" | "深圳分公司";
type Level = "金牌" | "资深" | "认证";

const CRAFTS: Record<Craft, { icon: typeof Zap; label: string; cls: string }> = {
  laser: { icon: Zap, label: "激光工艺", cls: "text-primary bg-primary/10 border-primary/30" },
  solar: { icon: Sun, label: "太阳能装配", cls: "text-warning bg-warning/15 border-warning/30" },
  qa: { icon: Shield, label: "质量体系", cls: "text-success bg-success/15 border-success/30" },
  trade: { icon: Globe, label: "外贸销售", cls: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))] border-[hsl(var(--ai))]/30" },
};

const levelCls: Record<Level, string> = {
  金牌: "bg-warning/15 text-warning border-warning/40",
  资深: "bg-primary/10 text-primary border-primary/30",
  认证: "bg-muted text-muted-foreground border-border",
};

interface Mentor {
  id: string;
  name: string;
  title: string;
  dept: string;
  site: Site;
  level: Level;
  years: number;
  active: number;
  capacity: number;
  graduated: number;
  rating: number;
  passRate: number;
  crafts: Craft[];
  tags: string[];
  status: "available" | "full" | "rest";
}

const INITIAL_MENTORS: Mentor[] = [
  { id: "M-001", name: "李建华", title: "仓储主管", dept: "供应链 / 仓储组", site: "鄂州基地", level: "金牌", years: 12, active: 3, capacity: 4, graduated: 28, rating: 4.9, passRate: 96, crafts: ["qa"], tags: ["ERP 出入库", "光学件存储", "新员工首选"], status: "available" },
  { id: "M-002", name: "陈志强", title: "激光工艺工程师", dept: "生产管理部 / 激光组", site: "黄龙山基地", level: "金牌", years: 9, active: 4, capacity: 4, graduated: 22, rating: 4.8, passRate: 93, crafts: ["laser"], tags: ["划片机参数", "光路调整", "异常处置"], status: "full" },
  { id: "M-003", name: "王慧敏", title: "品质主管", dept: "品质管理部", site: "黄龙山基地", level: "金牌", years: 11, active: 2, capacity: 3, graduated: 31, rating: 4.9, passRate: 98, crafts: ["qa"], tags: ["ISO9001", "3A 认证", "内审员"], status: "available" },
  { id: "M-004", name: "赵明远", title: "组件车间班长", dept: "生产管理部 / 组件车间", site: "鄂州基地", level: "资深", years: 7, active: 3, capacity: 4, graduated: 18, rating: 4.7, passRate: 91, crafts: ["solar"], tags: ["串焊工艺", "EL 检测", "节拍优化"], status: "available" },
  { id: "M-005", name: "Sophie Liu", title: "外贸主管", dept: "营销中心 / 外贸组", site: "深圳分公司", level: "资深", years: 8, active: 2, capacity: 3, graduated: 14, rating: 4.6, passRate: 89, crafts: ["trade"], tags: ["北美客户", "报价规则", "信用证"], status: "available" },
  { id: "M-006", name: "孙鹏飞", title: "高级工程师", dept: "研发中心 / 光学", site: "光谷研发中心", level: "资深", years: 10, active: 1, capacity: 2, graduated: 9, rating: 4.8, passRate: 94, crafts: ["laser", "qa"], tags: ["光学设计", "技术评审"], status: "available" },
  { id: "M-007", name: "周丽娜", title: "QA 工程师", dept: "品质管理部", site: "鄂州基地", level: "认证", years: 4, active: 2, capacity: 3, graduated: 6, rating: 4.5, passRate: 86, crafts: ["qa"], tags: ["来料检验", "客诉分析"], status: "available" },
  { id: "M-008", name: "黄文涛", title: "组件装配技师", dept: "生产管理部 / 组件车间", site: "黄龙山基地", level: "认证", years: 5, active: 0, capacity: 2, graduated: 4, rating: 4.4, passRate: 82, crafts: ["solar"], tags: ["层压工艺"], status: "rest" },
  { id: "M-009", name: "Marco Wang", title: "出口业务经理", dept: "营销中心 / 外贸组", site: "深圳分公司", level: "金牌", years: 13, active: 3, capacity: 4, graduated: 26, rating: 4.9, passRate: 95, crafts: ["trade"], tags: ["欧盟法规", "海运谈判", "DDP"], status: "available" },
];

const APPRENTICES: Record<string, { name: string; week: string; progress: number; next: string; status: "good" | "warn" | "ok" }[]> = {
  "M-001": [
    { name: "王小明", week: "W4 · 中期评估", progress: 50, next: "导师记录待提交", status: "warn" },
    { name: "李静", week: "W2 · 仓储 SOP", progress: 25, next: "ERP 操作演练", status: "good" },
    { name: "张伟", week: "W6 · 跨厂区轮岗", progress: 72, next: "黄龙山见习", status: "good" },
  ],
  "M-002": [
    { name: "陈昊", week: "W7 · 出师准备", progress: 88, next: "实操演示评分", status: "good" },
    { name: "刘洋", week: "W3 · 划片机实操", progress: 38, next: "参数调试练习", status: "ok" },
    { name: "高磊", week: "W5 · 故障处置", progress: 60, next: "案例复盘", status: "good" },
    { name: "郑斌", week: "W2 · 安全规范", progress: 22, next: "安全考试", status: "ok" },
  ],
};

const SITES: ("全部" | Site)[] = ["全部", "黄龙山基地", "鄂州基地", "光谷研发中心", "深圳分公司"];
const CRAFT_FILTER: ("全部" | Craft)[] = ["全部", "laser", "solar", "qa", "trade"];

const STATS = [
  { label: "在带导师", value: "62", unit: "人", trend: "↑ 6 较上月", trendKind: "up" as const, foot: "金牌 14 · 资深 28 · 认证 20", icon: Award, accent: "primary" },
  { label: "在带学徒", value: "118", unit: "人", trend: "覆盖 4 厂区", trendKind: "flat" as const, foot: "鄂州 42 · 黄龙山 51 · 其他 25", icon: Users, accent: "ai" },
  { label: "出师通过率", value: "92.4", unit: "%", trend: "↑ 1.8% 环比", trendKind: "up" as const, foot: "近 3 月平均 · 金牌导师 96%+", icon: CheckCircle2, accent: "success" },
  { label: "导师平均评分", value: "4.7", unit: "/5", trend: "学徒匿名打分", trendKind: "flat" as const, foot: "评分维度：教学 · 耐心 · 专业", icon: Star, accent: "warning" },
];

const accentMap = {
  primary: "text-primary bg-primary/10",
  warning: "text-warning bg-warning/15",
  success: "text-success bg-success/15",
  ai: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))]",
} as const;

const stripeMap = {
  primary: "from-primary to-transparent",
  warning: "from-warning to-transparent",
  success: "from-success to-transparent",
  ai: "from-[hsl(var(--ai))] to-transparent",
} as const;

export default function TrainingMentors() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [site, setSite] = useState<(typeof SITES)[number]>("全部");
  const [craft, setCraft] = useState<(typeof CRAFT_FILTER)[number]>("全部");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<Mentor | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>(INITIAL_MENTORS);
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = (p: NewMentorPayload) => {
    const id = `M-${String(mentors.length + 1).padStart(3, "0")}`;
    const m: Mentor = {
      id, name: p.name, title: p.title, dept: p.dept,
      site: p.site, level: p.level, years: p.years,
      active: 0, capacity: p.capacity, graduated: 0,
      rating: 5.0, passRate: 100,
      crafts: p.crafts, tags: p.tags,
      status: "available",
    };
    setMentors([m, ...mentors]);
    toast.success(`已新增导师「${p.name}」，进入认证名册`);
    setSelected(m);
  };

  const filtered = useMemo(() => {
    return mentors.filter((m) => {
      if (q && !m.name.includes(q) && !m.title.includes(q) && !m.tags.some((t) => t.includes(q))) return false;
      if (site !== "全部" && m.site !== site) return false;
      if (craft !== "全部" && !m.crafts.includes(craft)) return false;
      if (tab === "gold" && m.level !== "金牌") return false;
      if (tab === "available" && m.status !== "available") return false;
      if (tab === "full" && m.status !== "full") return false;
      return true;
    });
  }, [mentors, q, site, craft, tab]);

  return (
    <>
      <PageHeader
        title="导师库"
        description="跨厂区导师档案 · 在带学徒 · 评分与带教记录 · 智能匹配推荐"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("/training")}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />返回培训助手
            </Button>
            <Button size="sm" onClick={() => toast.success("AI 已根据岗位与厂区匹配出 3 位候选导师")}>
              <Sparkles className="h-4 w-4 mr-1.5" />智能匹配导师
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />新增导师
            </Button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4 relative overflow-hidden">
                <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", stripeMap[s.accent as keyof typeof stripeMap])} />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", accentMap[s.accent as keyof typeof accentMap])}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tabular-nums tracking-tight">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.unit}</span>
                </div>
                <Badge variant="outline" className={cn(
                  "mt-2 font-mono text-[10px] font-normal",
                  s.trendKind === "up" && "bg-success/10 text-success border-success/30",
                  s.trendKind === "flat" && "bg-muted text-muted-foreground border-border",
                )}>
                  {s.trend}
                </Badge>
                <div className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-dashed">{s.foot}</div>
              </Card>
            );
          })}
        </div>

        <Card className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索导师姓名 / 岗位 / 技能标签" className="pl-9 h-9" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground mr-0.5" />
              <span className="text-[11px] text-muted-foreground mr-1">厂区</span>
              {SITES.map((s) => (
                <Badge key={s} variant="outline"
                  className={cn("cursor-pointer text-[11px] font-normal", site === s ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/40")}
                  onClick={() => setSite(s)}>
                  {s}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground mr-1">工艺</span>
              {CRAFT_FILTER.map((c) => (
                <Badge key={c} variant="outline"
                  className={cn("cursor-pointer text-[11px] font-normal", craft === c ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/40")}
                  onClick={() => setCraft(c)}>
                  {c === "全部" ? "全部" : CRAFTS[c].label}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="h-7">
                <TabsTrigger value="all" className="text-xs h-5 px-2.5">全部 {mentors.length}</TabsTrigger>
                <TabsTrigger value="gold" className="text-xs h-5 px-2.5">金牌导师</TabsTrigger>
                <TabsTrigger value="available" className="text-xs h-5 px-2.5">可接收</TabsTrigger>
                <TabsTrigger value="full" className="text-xs h-5 px-2.5">已满员</TabsTrigger>
              </TabsList>
            </Tabs>
            <span className="text-[11px] text-muted-foreground font-mono">命中 {filtered.length} / {mentors.length}</span>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MentorCard key={m.id} mentor={m} onOpen={() => setSelected(m)} />
          ))}
          {filtered.length === 0 && (
            <Card className="p-10 col-span-full text-center text-sm text-muted-foreground">未匹配到导师，试试调整筛选条件</Card>
          )}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
          {selected && <MentorDetail mentor={selected} />}
        </SheetContent>
      </Sheet>

      <AddMentorDialog open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAdd} />
    </>
  );
}

function MentorCard({ mentor, onOpen }: { mentor: Mentor; onOpen: () => void }) {
  const loadPct = mentor.capacity ? (mentor.active / mentor.capacity) * 100 : 0;
  return (
    <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer" onClick={onOpen}>
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{mentor.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate">{mentor.name}</span>
            <Badge variant="outline" className={cn("font-mono text-[9px] py-0 px-1.5 h-4", levelCls[mentor.level])}>{mentor.level}</Badge>
          </div>
          <div className="text-[11px] text-muted-foreground truncate">{mentor.title} · {mentor.years}年</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />{mentor.site}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-0.5 text-warning">
            <Star className="h-3.5 w-3.5 fill-warning" />
            <span className="font-semibold text-sm tabular-nums">{mentor.rating}</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">通过率 {mentor.passRate}%</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {mentor.crafts.map((c) => {
          const C = CRAFTS[c];
          const Icon = C.icon;
          return (
            <Badge key={c} variant="outline" className={cn("font-normal text-[10px] gap-1 py-0 px-1.5 h-5", C.cls)}>
              <Icon className="h-3 w-3" />{C.label}
            </Badge>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {mentor.tags.slice(0, 3).map((t) => (
          <span key={t} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{t}</span>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-dashed">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-muted-foreground">在带学徒</span>
          <span className="font-mono tabular-nums">{mentor.active} / {mentor.capacity}</span>
        </div>
        <Progress value={loadPct} className="h-1.5" />
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground font-mono">
          <span>累计出师 {mentor.graduated} 人</span>
          <Badge variant="outline" className={cn("font-normal text-[10px] py-0 px-1.5 h-4",
            mentor.status === "available" && "bg-success/10 text-success border-success/30",
            mentor.status === "full" && "bg-warning/15 text-warning border-warning/30",
            mentor.status === "rest" && "bg-muted text-muted-foreground border-border",
          )}>
            {mentor.status === "available" ? "可接收" : mentor.status === "full" ? "已满员" : "暂停带教"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

function MentorDetail({ mentor }: { mentor: Mentor }) {
  const apprentices = APPRENTICES[mentor.id] ?? [];
  const loadPct = mentor.capacity ? (mentor.active / mentor.capacity) * 100 : 0;

  return (
    <>
      <SheetHeader className="px-6 py-4 border-b">
        <SheetTitle className="text-base">导师档案</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5 border-b bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">{mentor.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{mentor.name}</span>
                <Badge variant="outline" className={cn("font-mono text-[10px]", levelCls[mentor.level])}>{mentor.level}导师</Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">{mentor.title}</div>
              <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                <span>{mentor.dept}</span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{mentor.site}</span>
                <span className="text-border">·</span>
                <span>{mentor.years} 年经验</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-4">
            <Stat label="评分" value={mentor.rating.toString()} unit="/5" icon={Star} />
            <Stat label="通过率" value={`${mentor.passRate}`} unit="%" icon={CheckCircle2} />
            <Stat label="累计出师" value={mentor.graduated.toString()} unit="人" icon={Award} />
            <Stat label="在带" value={`${mentor.active}/${mentor.capacity}`} unit="人" icon={Users} />
          </div>
        </div>

        <Section title="覆盖工艺与专长">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {mentor.crafts.map((c) => {
              const C = CRAFTS[c];
              const Icon = C.icon;
              return (
                <Badge key={c} variant="outline" className={cn("font-normal gap-1", C.cls)}>
                  <Icon className="h-3 w-3" />{C.label}
                </Badge>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mentor.tags.map((t) => (
              <span key={t} className="text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded">{t}</span>
            ))}
          </div>
        </Section>

        <Section title={`当前在带学徒 · ${mentor.active}/${mentor.capacity}`}
          right={<Progress value={loadPct} className="h-1.5 w-24" />}>
          {apprentices.length === 0 ? (
            <div className="text-[11px] text-muted-foreground py-2">暂无在带学徒</div>
          ) : (
            <div className="space-y-2">
              {apprentices.map((a, i) => (
                <Card key={i} className="p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">{a.name.slice(0, 1)}</AvatarFallback></Avatar>
                      <div>
                        <div className="text-xs font-medium">{a.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{a.week}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("font-mono text-[10px]",
                      a.status === "good" && "bg-success/10 text-success border-success/30",
                      a.status === "warn" && "bg-destructive/10 text-destructive border-destructive/30",
                      a.status === "ok" && "bg-info/10 text-info border-info/30",
                    )}>
                      {a.progress}%
                    </Badge>
                  </div>
                  <Progress value={a.progress} className="h-1" />
                  <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />下一节点：{a.next}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title="学徒匿名评价 · 近期">
          <div className="space-y-2">
            {[
              { score: 5, text: "讲解非常细致，会带我手把手过 SOP，遇到设备异常随叫随到。", date: "11-12" },
              { score: 5, text: "导师对工艺理解深，案例复盘讲得清楚，建议人选。", date: "11-05" },
              { score: 4, text: "节奏稍快，但给的练习材料质量很高。", date: "10-28" },
            ].map((r, i) => (
              <div key={i} className="text-[11px] border-l-2 border-primary/30 pl-3 py-1">
                <div className="flex items-center gap-1 mb-0.5">
                  {Array.from({ length: r.score }).map((_, j) => <Star key={j} className="h-2.5 w-2.5 fill-warning text-warning" />)}
                  <span className="text-muted-foreground font-mono ml-1">{r.date}</span>
                </div>
                <div className="text-foreground/80 leading-relaxed">{r.text}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="历史带教成果">
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat label="累计学徒" value={mentor.graduated + mentor.active} />
            <MiniStat label="平均出师周期" value="8.2 周" />
            <MiniStat label="一次通过率" value={`${mentor.passRate}%`} />
          </div>
        </Section>
      </div>

      <div className="px-6 py-3 border-t flex items-center justify-between bg-muted/30">
        <Button variant="ghost" size="sm" onClick={() => toast.info("已发送钉钉沟通")}>
          <MessageSquare className="h-3.5 w-3.5 mr-1" />联系导师
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("已加入带教名单")}>
            <TrendingUp className="h-3.5 w-3.5 mr-1" />查看带教轨迹
          </Button>
          <Button size="sm" disabled={mentor.status !== "available"} onClick={() => toast.success(`已为该导师指派新学徒（剩余名额 ${mentor.capacity - mentor.active - 1}）`)}>
            <Plus className="h-3.5 w-3.5 mr-1" />指派学徒
          </Button>
        </div>
      </div>
    </>
  );
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-b">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h4>
        {right}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, unit, icon: Icon }: { label: string; value: string; unit: string; icon: typeof Star }) {
  return (
    <div className="bg-background border rounded-md p-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <Icon className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-base font-semibold tabular-nums">{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted/40 rounded-md p-2">
      <div className="text-base font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
