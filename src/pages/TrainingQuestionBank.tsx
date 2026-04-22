import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Search, Sparkles, Plus, ChevronRight, Edit3, Trash2,
  ShoppingBasket, Star, Archive, Zap, Sun, Shield, Globe, X, Check,
  RefreshCw, BookOpen, AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TREE = [
  {
    key: "laser", icon: Zap, color: "primary", label: "激光设备操作", n: 412,
    children: [
      { key: "laser-safe", label: "安全规范", n: 96 },
      { key: "laser-mark", label: "激光打标", n: 84 },
      { key: "laser-cut", label: "激光划片", n: 112 },
      { key: "laser-maint", label: "保养与故障", n: 78 },
      { key: "laser-optic", label: "光路调整", n: 42 },
    ],
  },
  {
    key: "solar", icon: Sun, color: "warning", label: "太阳能组件", n: 286,
    children: [
      { key: "solar-asm", label: "组件装配", n: 102 },
      { key: "solar-test", label: "测试 / EL 检测", n: 78 },
      { key: "solar-weld", label: "串焊工艺", n: 64 },
      { key: "solar-pack", label: "包装与出货", n: 42 },
    ],
  },
  {
    key: "qa", icon: Shield, color: "success", label: "质量与合规", n: 324,
    children: [
      { key: "qa-iso", label: "ISO9001 体系", n: 120 },
      { key: "qa-3a", label: "3A 认证", n: 56 },
      { key: "qa-safe", label: "安全生产", n: 96 },
      { key: "qa-fire", label: "消防应急", n: 52 },
    ],
  },
  {
    key: "trade", icon: Globe, color: "ai", label: "外贸与销售", n: 262,
    children: [
      { key: "trade-export", label: "出口流程", n: 88 },
      { key: "trade-product", label: "产品知识", n: 76 },
      { key: "trade-talk", label: "客户话术", n: 58 },
      { key: "trade-quote", label: "报价规则", n: 40 },
    ],
  },
] as const;

type QType = "single" | "multi" | "judge" | "essay";
type Diff = "easy" | "mid" | "hard";

const QUESTIONS: { id: string; cat: string; sub: string; type: QType; diff: Diff; stem: string; kp: string; uses: number; avg: number; quality: number; lowQ?: boolean }[] = [
  { id: "Q-10284", cat: "laser", sub: "laser-safe", type: "single", diff: "easy", stem: "激光设备操作前，操作员必须佩戴的个人防护装备是？", kp: "激光防护眼镜佩戴标准", uses: 142, avg: 92, quality: 96 },
  { id: "Q-10283", cat: "laser", sub: "laser-safe", type: "judge", diff: "easy", stem: "激光器开机前必须检查冷却水循环系统是否正常运行。", kp: "激光器开机前安全检查清单", uses: 98, avg: 95, quality: 94 },
  { id: "Q-10282", cat: "laser", sub: "laser-cut", type: "multi", diff: "mid", stem: "下列哪些参数会直接影响激光划片的切口质量？（多选）", kp: "划片机参数设置：脉宽 / 频率 / 功率", uses: 84, avg: 76, quality: 88 },
  { id: "Q-10281", cat: "laser", sub: "laser-cut", type: "essay", diff: "hard", stem: "请简述激光划片机在出现异常停机时的 5 步标准处置流程，并说明每一步的关键控制点。", kp: "异常停机处置流程（5 步法）", uses: 36, avg: 71, quality: 90 },
  { id: "Q-10280", cat: "laser", sub: "laser-maint", type: "single", diff: "mid", stem: "激光器日常保养中，对镜片清洁应使用以下哪种材料？", kp: "光路调整与镜片清洁规范", uses: 62, avg: 84, quality: 86 },
  { id: "Q-10278", cat: "laser", sub: "laser-optic", type: "multi", diff: "hard", stem: "光路调整过程中可能引起激光功率衰减的因素有哪些？", kp: "光路调整与镜片清洁规范", uses: 24, avg: 58, quality: 62, lowQ: true },
  { id: "Q-10275", cat: "laser", sub: "laser-safe", type: "single", diff: "easy", stem: "下列哪种警示标识用于标识激光辐射区域？", kp: "激光防护眼镜佩戴标准", uses: 156, avg: 91, quality: 93 },
  { id: "Q-10271", cat: "laser", sub: "laser-mark", type: "judge", diff: "mid", stem: "激光打标参数中，频率越高则单脉冲能量越大。", kp: "划片机参数设置", uses: 48, avg: 52, quality: 58, lowQ: true },
];

const colorMap = {
  primary: "text-primary bg-primary/10 border-primary/30",
  warning: "text-warning bg-warning/15 border-warning/30",
  success: "text-success bg-success/15 border-success/30",
  ai: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))] border-[hsl(var(--ai))]/30",
} as const;

const typeLabel: Record<QType, string> = { single: "单选", multi: "多选", judge: "判断", essay: "简答" };
const diffLabel: Record<Diff, { label: string; cls: string }> = {
  easy: { label: "易", cls: "bg-success/10 text-success border-success/30" },
  mid: { label: "中", cls: "bg-warning/15 text-warning border-warning/30" },
  hard: { label: "难", cls: "bg-destructive/10 text-destructive border-destructive/30" },
};

export default function TrainingQuestionBank() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initCat = TREE.find(c => c.key === searchParams.get("cat"))?.key ?? "laser";
  const [activeCat, setActiveCat] = useState<string>(initCat);
  const [activeSub, setActiveSub] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<QType | "all">("all");
  const [filterDiff, setFilterDiff] = useState<Diff | "all">("all");
  const [onlyLowQ, setOnlyLowQ] = useState(false);
  const [basket, setBasket] = useState<Set<string>>(new Set());
  const [basketOpen, setBasketOpen] = useState(false);
  const [expandSheet, setExpandSheet] = useState<{ open: boolean; kp: string }>({ open: false, kp: "" });

  const cat = TREE.find(c => c.key === activeCat)!;

  const filtered = useMemo(() => QUESTIONS.filter(q => {
    if (q.cat !== activeCat) return false;
    if (activeSub !== "all" && q.sub !== activeSub) return false;
    if (filterType !== "all" && q.type !== filterType) return false;
    if (filterDiff !== "all" && q.diff !== filterDiff) return false;
    if (onlyLowQ && !q.lowQ) return false;
    if (search && !q.stem.includes(search) && !q.kp.includes(search)) return false;
    return true;
  }), [activeCat, activeSub, filterType, filterDiff, onlyLowQ, search]);

  const toggleBasket = (id: string) => {
    const next = new Set(basket);
    next.has(id) ? next.delete(id) : next.add(id);
    setBasket(next);
  };

  return (
    <>
      <PageHeader
        title="题库"
        description="激光设备 · 太阳能 · 质量合规 · 外贸 · AI 扩题与批量出卷"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("/training")}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />返回
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBasketOpen(true)}>
              <ShoppingBasket className="h-4 w-4 mr-1.5" />试卷篮
              {basket.size > 0 && (
                <Badge className="ml-1.5 h-4 px-1.5 text-[10px] bg-primary text-primary-foreground">{basket.size}</Badge>
              )}
            </Button>
            <Button size="sm" onClick={() => toast.success("已新建题目")}>
              <Plus className="h-4 w-4 mr-1.5" />新建题目
            </Button>
          </>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-[260px_1fr] gap-5">
          {/* 左：分类树 */}
          <Card className="p-3 h-fit sticky top-20 space-y-1">
            {TREE.map(c => {
              const Icon = c.icon;
              const open = activeCat === c.key;
              return (
                <div key={c.key}>
                  <button
                    onClick={() => { setActiveCat(c.key); setActiveSub("all"); }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors",
                      open ? colorMap[c.color] : "hover:bg-muted/60 text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left font-medium">{c.label}</span>
                    <span className="text-[10px] font-mono tabular-nums opacity-70">{c.n}</span>
                  </button>
                  {open && (
                    <div className="ml-3 mt-1 mb-1 border-l border-border space-y-0.5">
                      <button
                        onClick={() => setActiveSub("all")}
                        className={cn(
                          "w-full flex items-center justify-between pl-3 pr-2 py-1.5 text-xs transition-colors",
                          activeSub === "all" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span>全部</span>
                        <span className="font-mono tabular-nums opacity-70">{c.n}</span>
                      </button>
                      {c.children.map(s => (
                        <button
                          key={s.key}
                          onClick={() => setActiveSub(s.key)}
                          className={cn(
                            "w-full flex items-center justify-between pl-3 pr-2 py-1.5 text-xs transition-colors",
                            activeSub === s.key ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span>{s.label}</span>
                          <span className="font-mono tabular-nums opacity-70">{s.n}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Card>

          {/* 右：题目列表 */}
          <div className="space-y-4 min-w-0">
            {/* 面包屑 + 工具栏 */}
            <Card className="p-3 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">题库</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{cat.label}</span>
                {activeSub !== "all" && (
                  <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{cat.children.find(s => s.key === activeSub)?.label}</span>
                  </>
                )}
                <div className="flex-1" />
                <span className="text-[10px] text-muted-foreground font-mono tracking-wider">共 {filtered.length} 题</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="题干 / 知识点关键词" className="h-8 pl-8 text-xs" />
                </div>
                <FilterChips label="题型" value={filterType} setValue={(v) => setFilterType(v as QType | "all")} options={[
                  { v: "all", l: "全部" }, { v: "single", l: "单选" }, { v: "multi", l: "多选" }, { v: "judge", l: "判断" }, { v: "essay", l: "简答" },
                ]} />
                <FilterChips label="难度" value={filterDiff} setValue={(v) => setFilterDiff(v as Diff | "all")} options={[
                  { v: "all", l: "全部" }, { v: "easy", l: "易" }, { v: "mid", l: "中" }, { v: "hard", l: "难" },
                ]} />
                <button
                  onClick={() => setOnlyLowQ(!onlyLowQ)}
                  className={cn(
                    "h-8 px-2.5 rounded-md border text-[11px] flex items-center gap-1 transition-colors",
                    onlyLowQ ? "bg-warning/15 text-warning border-warning/30" : "border-border hover:border-warning/40"
                  )}
                >
                  <AlertTriangle className="h-3 w-3" />仅低质题
                </button>
              </div>
            </Card>

            {/* 题目卡片列表 */}
            <div className="space-y-2.5">
              {filtered.length === 0 && (
                <Card className="p-12 text-center text-sm text-muted-foreground">
                  没有匹配的题目，试试调整筛选或 AI 扩题
                </Card>
              )}
              {filtered.map(q => {
                const checked = basket.has(q.id);
                return (
                  <Card key={q.id} className={cn("p-4 transition-all", checked && "border-primary bg-primary/5")}>
                    <div className="flex items-start gap-3">
                      <Checkbox checked={checked} onCheckedChange={() => toggleBasket(q.id)} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                          <span className="font-mono text-[10px] text-muted-foreground tracking-wider">{q.id}</span>
                          <Badge variant="outline" className="font-mono text-[10px] font-normal">{typeLabel[q.type]}</Badge>
                          <Badge variant="outline" className={cn("font-mono text-[10px] font-normal", diffLabel[q.diff].cls)}>{diffLabel[q.diff].label}</Badge>
                          <Badge variant="outline" className="font-mono text-[10px] font-normal text-muted-foreground">
                            {cat.children.find(s => s.key === q.sub)?.label}
                          </Badge>
                          {q.lowQ && (
                            <Badge variant="outline" className="font-mono text-[10px] font-normal bg-warning/15 text-warning border-warning/30">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />低质
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm leading-relaxed mb-2">{q.stem}</div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-[hsl(var(--ai))]" />
                            <span className="text-[hsl(var(--ai))]">知识点：</span>
                            <span className="text-foreground/70">{q.kp}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                            <span>使用 {q.uses}</span>
                            <span>平均 <span className={cn("font-semibold", q.avg >= 80 ? "text-success" : q.avg >= 60 ? "text-warning" : "text-destructive")}>{q.avg}</span></span>
                            <span className="flex items-center gap-0.5">
                              <Star className={cn("h-3 w-3", q.quality >= 80 ? "text-warning fill-warning" : "text-muted-foreground")} />
                              {q.quality}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-dashed">
                      <Button
                        size="sm" variant="outline"
                        className="h-7 text-xs bg-[hsl(var(--ai-soft))] text-[hsl(var(--ai))] border-[hsl(var(--ai))]/30 hover:bg-[hsl(var(--ai-soft))]/80"
                        onClick={() => setExpandSheet({ open: true, kp: q.kp })}
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1" />AI 扩题
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.success("已打开编辑")}>
                        <Edit3 className="h-3.5 w-3.5 mr-1" />编辑
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.success("已重新生成")}>
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />换题
                      </Button>
                      <div className="flex-1" />
                      {q.lowQ && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => toast.success("已归档")}>
                          <Archive className="h-3.5 w-3.5 mr-1" />归档
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => toast.success("已删除")}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 试卷篮 */}
      <BasketSheet open={basketOpen} onClose={() => setBasketOpen(false)} basket={basket} setBasket={setBasket} />
      {/* AI 扩题 */}
      <ExpandSheet open={expandSheet.open} onClose={() => setExpandSheet({ open: false, kp: "" })} kp={expandSheet.kp} />
    </>
  );
}

function FilterChips<T extends string>({ label, value, setValue, options }: {
  label: string; value: T; setValue: (v: T) => void; options: { v: T; l: string }[];
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-muted-foreground font-mono tracking-wider mr-0.5">{label}</span>
      {options.map(o => (
        <button
          key={o.v}
          onClick={() => setValue(o.v)}
          className={cn(
            "h-7 px-2 rounded text-[11px] transition-colors",
            value === o.v ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:bg-muted"
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function BasketSheet({ open, onClose, basket, setBasket }: {
  open: boolean; onClose: () => void; basket: Set<string>; setBasket: (s: Set<string>) => void;
}) {
  const items = QUESTIONS.filter(q => basket.has(q.id));
  const remove = (id: string) => {
    const next = new Set(basket);
    next.delete(id);
    setBasket(next);
  };
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="h-4 w-4 text-primary" />
            <SheetTitle className="text-base">试卷篮 · {items.length} 题</SheetTitle>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-12">
              勾选题目后将出现在这里
            </div>
          )}
          {items.map(q => (
            <div key={q.id} className="rounded-md border border-border p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant="outline" className="font-mono text-[10px] font-normal">{typeLabel[q.type]}</Badge>
                    <Badge variant="outline" className={cn("font-mono text-[10px] font-normal", diffLabel[q.diff].cls)}>{diffLabel[q.diff].label}</Badge>
                  </div>
                  <div className="text-xs leading-relaxed line-clamp-2">{q.stem}</div>
                </div>
                <button onClick={() => remove(q.id)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t bg-muted/30 p-4 space-y-2">
          {items.length > 0 && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
              <div><div className="font-semibold tabular-nums">{items.filter(q => q.type === "single").length}</div><div className="text-[10px] text-muted-foreground">单选</div></div>
              <div><div className="font-semibold tabular-nums">{items.filter(q => q.type === "multi").length}</div><div className="text-[10px] text-muted-foreground">多选</div></div>
              <div><div className="font-semibold tabular-nums">{items.filter(q => q.type === "essay" || q.type === "judge").length}</div><div className="text-[10px] text-muted-foreground">判断/简答</div></div>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" disabled={items.length === 0} onClick={() => { setBasket(new Set()); onClose(); }}>
              清空
            </Button>
            <Button size="sm" className="flex-1" disabled={items.length === 0} onClick={() => { toast.success(`已用 ${items.length} 题生成试卷草稿`); setBasket(new Set()); onClose(); }}>
              <Sparkles className="h-3.5 w-3.5 mr-1" />生成试卷
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ExpandSheet({ open, onClose, kp }: { open: boolean; onClose: () => void; kp: string }) {
  const [count, setCount] = useState(5);
  const [generated, setGenerated] = useState<{ id: string; type: QType; diff: Diff; stem: string; selected: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setGenerated([]);
    await new Promise(r => setTimeout(r, 1100));
    const samples: { type: QType; diff: Diff; stem: string }[] = [
      { type: "single", diff: "easy", stem: `关于「${kp}」，下列说法正确的是？` },
      { type: "judge", diff: "easy", stem: `「${kp}」中规定的步骤可根据实际情况自行调整。` },
      { type: "multi", diff: "mid", stem: `执行「${kp}」时，需要同时满足下列哪些条件？（多选）` },
      { type: "single", diff: "mid", stem: `若违反「${kp}」的规定，最严重可能造成什么后果？` },
      { type: "essay", diff: "hard", stem: `请结合实际工作，简述「${kp}」中你认为最容易被忽视的关键点及防控措施。` },
      { type: "single", diff: "mid", stem: `「${kp}」适用的最主要岗位是？` },
      { type: "judge", diff: "mid", stem: `「${kp}」属于年度强制复训内容。` },
      { type: "multi", diff: "hard", stem: `下列哪些情况下应立即停止操作并启动「${kp}」？` },
    ];
    setGenerated(samples.slice(0, count).map((s, i) => ({ ...s, id: `AI-${Date.now()}-${i}`, selected: true })));
    setLoading(false);
  };

  const toggle = (id: string) => setGenerated(g => g.map(q => q.id === id ? { ...q, selected: !q.selected } : q));
  const selectedCount = generated.filter(q => q.selected).length;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-md bg-[hsl(var(--ai-soft))] text-[hsl(var(--ai))] flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <SheetTitle className="text-base">AI 扩题</SheetTitle>
          </div>
          <div className="text-[11px] text-muted-foreground">
            基于知识点「<span className="text-foreground font-medium">{kp}</span>」批量生成新题目
          </div>
        </SheetHeader>
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">生成数量</span>
          <div className="flex gap-1">
            {[3, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={cn(
                  "h-7 w-10 rounded text-xs font-mono",
                  count === n ? "bg-primary text-primary-foreground" : "bg-background border border-border text-muted-foreground hover:border-primary/40"
                )}
              >{n}</button>
            ))}
          </div>
          <div className="flex-1" />
          <Button size="sm" className="h-8" onClick={generate} disabled={loading}>
            {loading ? <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            {generated.length > 0 ? "重新生成" : "开始生成"}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!loading && generated.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-16">
              点击「开始生成」让 AI 基于知识点扩展题目
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <RefreshCw className="h-6 w-6 text-[hsl(var(--ai))] animate-spin" />
              <div className="text-sm text-muted-foreground">AI 正在生成 {count} 道题…</div>
            </div>
          )}
          {generated.map(q => (
            <label key={q.id} className={cn("block rounded-md border p-3 cursor-pointer transition-colors", q.selected ? "border-primary bg-primary/5" : "border-border")}>
              <div className="flex items-start gap-2.5">
                <Checkbox checked={q.selected} onCheckedChange={() => toggle(q.id)} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant="outline" className="font-mono text-[10px] font-normal">{typeLabel[q.type]}</Badge>
                    <Badge variant="outline" className={cn("font-mono text-[10px] font-normal", diffLabel[q.diff].cls)}>{diffLabel[q.diff].label}</Badge>
                    <Badge variant="outline" className="font-mono text-[10px] font-normal bg-[hsl(var(--ai-soft))] text-[hsl(var(--ai))] border-[hsl(var(--ai))]/30">AI</Badge>
                  </div>
                  <div className="text-xs leading-relaxed">{q.stem}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
        {generated.length > 0 && (
          <div className="border-t bg-muted/30 p-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">已选 {selectedCount} / {generated.length} 题</span>
            <Button size="sm" disabled={selectedCount === 0} onClick={() => { toast.success(`已加入题库 · ${selectedCount} 题`); onClose(); }}>
              <Check className="h-3.5 w-3.5 mr-1" />加入题库
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
