import { useMemo, useState } from "react";
import {
  Sparkles,
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Phone,
  Mail,
  Star,
  Users,
  ArrowUpDown,
  Eye,
  GraduationCap,
  Briefcase,
  Tag,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Settings2,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DimScore {
  key: string;
  label: string;
  score: number;
  weight: number;
}

interface Candidate {
  id: string;
  rank: number;
  name: string;
  age: number;
  gender: "男" | "女";
  education: string;
  school: string;
  years: number;
  city: string;
  currentTitle: string;
  currentCompany: string;
  expectSalary: string;
  matchScore: number;
  level: "强匹配" | "可考虑" | "弱匹配";
  source: string;
  skills: string[];
  pros: string[];
  cons: string[];
  dims: DimScore[];
  aiSummary: string;
  status: "待评估" | "已加入面试" | "已 pass";
}

const candidates: Candidate[] = [
  {
    id: "C001",
    rank: 1,
    name: "李雨欣",
    age: 26,
    gender: "女",
    education: "本科",
    school: "华东师范大学",
    years: 3,
    city: "上海",
    currentTitle: "前端工程师",
    currentCompany: "携程",
    expectSalary: "22-28K",
    matchScore: 94,
    level: "强匹配",
    source: "猎聘",
    skills: ["React", "TypeScript", "Next.js", "TailwindCSS", "Vite"],
    pros: ["技术栈完全命中", "上海本地，无地域风险", "近 3 年稳定在一家公司"],
    cons: ["年限偏短，仅 3 年"],
    dims: [
      { key: "skill", label: "技能匹配", score: 98, weight: 35 },
      { key: "exp", label: "工作经验", score: 80, weight: 25 },
      { key: "edu", label: "教育背景", score: 92, weight: 15 },
      { key: "stable", label: "稳定性", score: 100, weight: 15 },
      { key: "salary", label: "薪资契合", score: 95, weight: 10 },
    ],
    aiSummary: "技术栈与岗位要求高度吻合，稳定性表现突出，薪资期望落在区间内。建议优先安排面试，重点考察项目深度与团队协作经验。",
    status: "待评估",
  },
  {
    id: "C002",
    rank: 2,
    name: "张子豪",
    age: 28,
    gender: "男",
    education: "硕士",
    school: "上海交通大学",
    years: 5,
    city: "上海",
    currentTitle: "高级前端工程师",
    currentCompany: "字节跳动",
    expectSalary: "30-40K",
    matchScore: 91,
    level: "强匹配",
    source: "Boss直聘",
    skills: ["React", "TypeScript", "Vue", "Webpack", "Node.js"],
    pros: ["大厂背景", "5 年经验贴合岗位要求", "硕士学历"],
    cons: ["薪资期望偏高，接近区间上限"],
    dims: [
      { key: "skill", label: "技能匹配", score: 95, weight: 35 },
      { key: "exp", label: "工作经验", score: 95, weight: 25 },
      { key: "edu", label: "教育背景", score: 100, weight: 15 },
      { key: "stable", label: "稳定性", score: 85, weight: 15 },
      { key: "salary", label: "薪资契合", score: 70, weight: 10 },
    ],
    aiSummary: "顶级院校 + 大厂经验，技术深度可期。注意薪资可能突破预算上限，建议提前对齐 HRBP 与用人部门预期。",
    status: "已加入面试",
  },
  {
    id: "C003",
    rank: 3,
    name: "周楠",
    age: 27,
    gender: "女",
    education: "本科",
    school: "浙江大学",
    years: 4,
    city: "杭州",
    currentTitle: "前端工程师",
    currentCompany: "蚂蚁集团",
    expectSalary: "25-32K",
    matchScore: 87,
    level: "强匹配",
    source: "内推",
    skills: ["React", "TypeScript", "微前端", "可视化"],
    pros: ["大厂经验", "可视化方向加分", "985 院校"],
    cons: ["杭州工作，需考虑搬迁意愿"],
    dims: [
      { key: "skill", label: "技能匹配", score: 88, weight: 35 },
      { key: "exp", label: "工作经验", score: 88, weight: 25 },
      { key: "edu", label: "教育背景", score: 95, weight: 15 },
      { key: "stable", label: "稳定性", score: 90, weight: 15 },
      { key: "salary", label: "薪资契合", score: 80, weight: 10 },
    ],
    aiSummary: "技术能力扎实，可视化经验为加分项。需在初筛沟通中确认是否接受上海 base。",
    status: "待评估",
  },
  {
    id: "C004",
    rank: 4,
    name: "孙晓东",
    age: 29,
    gender: "男",
    education: "本科",
    school: "北京邮电大学",
    years: 6,
    city: "上海",
    currentTitle: "全栈工程师",
    currentCompany: "美团",
    expectSalary: "32-40K",
    matchScore: 78,
    level: "可考虑",
    source: "Boss直聘",
    skills: ["React", "Node.js", "Go", "MySQL", "Redis"],
    pros: ["全栈背景", "大厂经验", "上海本地"],
    cons: ["技术栈偏后端，前端深度待考察", "薪资期望偏高"],
    dims: [
      { key: "skill", label: "技能匹配", score: 72, weight: 35 },
      { key: "exp", label: "工作经验", score: 90, weight: 25 },
      { key: "edu", label: "教育背景", score: 85, weight: 15 },
      { key: "stable", label: "稳定性", score: 85, weight: 15 },
      { key: "salary", label: "薪资契合", score: 65, weight: 10 },
    ],
    aiSummary: "全栈背景意味着前端深度可能不足，建议技术面重点考察 React 工程化与性能优化能力。",
    status: "待评估",
  },
  {
    id: "C005",
    rank: 5,
    name: "吴天宇",
    age: 30,
    gender: "男",
    education: "本科",
    school: "华中科技大学",
    years: 7,
    city: "上海",
    currentTitle: "前端架构师",
    currentCompany: "小红书",
    expectSalary: "38-45K",
    matchScore: 73,
    level: "可考虑",
    source: "猎聘",
    skills: ["React", "TypeScript", "微前端", "性能优化"],
    pros: ["架构师经验", "技术深度强"],
    cons: ["薪资严重超预算", "近 2 年跳槽 2 次，稳定性存疑"],
    dims: [
      { key: "skill", label: "技能匹配", score: 92, weight: 35 },
      { key: "exp", label: "工作经验", score: 95, weight: 25 },
      { key: "edu", label: "教育背景", score: 85, weight: 15 },
      { key: "stable", label: "稳定性", score: 50, weight: 15 },
      { key: "salary", label: "薪资契合", score: 40, weight: 10 },
    ],
    aiSummary: "技术能力突出但稳定性与薪资是双重风险，建议慎重评估或作为后备人选。",
    status: "待评估",
  },
  {
    id: "C006",
    rank: 6,
    name: "黄俊",
    age: 25,
    gender: "男",
    education: "本科",
    school: "上海大学",
    years: 2,
    city: "上海",
    currentTitle: "前端工程师",
    currentCompany: "B站",
    expectSalary: "18-22K",
    matchScore: 62,
    level: "弱匹配",
    source: "拉勾",
    skills: ["React", "JavaScript", "Vue"],
    pros: ["薪资低，性价比高"],
    cons: ["年限不足 3 年（命中排除项）", "TypeScript 经验不足"],
    dims: [
      { key: "skill", label: "技能匹配", score: 60, weight: 35 },
      { key: "exp", label: "工作经验", score: 50, weight: 25 },
      { key: "edu", label: "教育背景", score: 75, weight: 15 },
      { key: "stable", label: "稳定性", score: 80, weight: 15 },
      { key: "salary", label: "薪资契合", score: 60, weight: 10 },
    ],
    aiSummary: "经验不足以胜任高级岗位，但若放宽至中级或储备岗可考虑。",
    status: "已 pass",
  },
];

const levelStyle: Record<string, string> = {
  强匹配: "bg-success-soft text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]",
  可考虑: "bg-warning-soft text-[hsl(var(--warning-foreground))] border-[hsl(var(--warning)/0.4)]",
  弱匹配: "bg-muted text-muted-foreground border-border",
};

const statusStyle: Record<string, string> = {
  待评估: "bg-muted text-muted-foreground",
  已加入面试: "bg-primary-soft text-primary",
  "已 pass": "bg-danger-soft text-[hsl(var(--danger))]",
};

// [MOCK] 当前岗位画像数据 —— 重新匹配时可编辑
const defaultProfileDims = [
  { key: "skill", label: "技能匹配", weight: 35, threshold: 60, desc: "核心技术栈匹配度" },
  { key: "exp", label: "工作经验", weight: 25, threshold: 50, desc: "相关领域工作年限" },
  { key: "edu", label: "教育背景", weight: 15, threshold: 40, desc: "学历与院校" },
  { key: "stable", label: "稳定性", weight: 15, threshold: 50, desc: "跳槽频率与在职时长" },
  { key: "salary", label: "薪资契合", weight: 10, threshold: 30, desc: "期望薪资与预算匹配" },
];

const defaultHardReqs = [
  { id: "h1", text: "3 年以上前端开发经验" },
  { id: "h2", text: "熟练掌握 React + TypeScript" },
  { id: "h3", text: "本科及以上学历" },
];

const defaultExcludes = [
  { id: "e1", text: "近 1 年内跳槽超过 2 次" },
  { id: "e2", text: "无 TypeScript 项目经验" },
];

export default function Candidates() {
  const [tab, setTab] = useState<"all" | "强匹配" | "可考虑" | "弱匹配">("all");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rematchOpen, setRematchOpen] = useState(false);

  // 重新匹配时可编辑的岗位需求
  const [rematchDims, setRematchDims] = useState(defaultProfileDims.map(d => ({ ...d })));
  const [rematchHardReqs, setRematchHardReqs] = useState(defaultHardReqs.map(r => ({ ...r })));
  const [rematchExcludes, setRematchExcludes] = useState(defaultExcludes.map(r => ({ ...r })));

  const totalWeight = rematchDims.reduce((s, d) => s + d.weight, 0);

  const handleOpenRematch = () => {
    setRematchOpen(true);
  };

  const handleRematch = () => {
    if (totalWeight !== 100) {
      toast({ title: "权重之和必须为 100%", description: `当前为 ${totalWeight}%，请调整后重试`, variant: "destructive" });
      return;
    }
    setRematchOpen(false);
    toast({ title: "重新匹配已启动", description: "正在根据修改后的岗位需求重新计算匹配度…" });
    // [BACKEND] POST /api/candidates/rematch { dims, hardReqs, excludes }
  };

  const updateDimWeight = (key: string, val: number) => {
    setRematchDims(prev => prev.map(d => d.key === key ? { ...d, weight: val } : d));
  };
  const updateDimThreshold = (key: string, val: number) => {
    setRematchDims(prev => prev.map(d => d.key === key ? { ...d, threshold: val } : d));
  };
  const updateHardReq = (id: string, text: string) => {
    setRematchHardReqs(prev => prev.map(r => r.id === id ? { ...r, text } : r));
  };
  const removeHardReq = (id: string) => {
    setRematchHardReqs(prev => prev.filter(r => r.id !== id));
  };
  const addHardReq = () => {
    setRematchHardReqs(prev => [...prev, { id: `h-${Date.now()}`, text: "" }]);
  };
  const updateExclude = (id: string, text: string) => {
    setRematchExcludes(prev => prev.map(r => r.id === id ? { ...r, text } : r));
  };
  const removeExclude = (id: string) => {
    setRematchExcludes(prev => prev.filter(r => r.id !== id));
  };
  const addExclude = () => {
    setRematchExcludes(prev => [...prev, { id: `e-${Date.now()}`, text: "" }]);
  };

  const filtered = useMemo(() => {
    let list = candidates.filter((c) => {
      if (tab !== "all" && c.level !== tab) return false;
      if (keyword && !c.name.includes(keyword) && !c.currentCompany.includes(keyword)) return false;
      return true;
    });
    if (sortBy === "score") list = [...list].sort((a, b) => b.matchScore - a.matchScore);
    if (sortBy === "exp") list = [...list].sort((a, b) => b.years - a.years);
    return list;
  }, [tab, keyword, sortBy]);

  const opened = candidates.find((c) => c.id === openId);

  const stats = {
    total: candidates.length,
    strong: candidates.filter((c) => c.level === "强匹配").length,
    consider: candidates.filter((c) => c.level === "可考虑").length,
    avg: Math.round(candidates.reduce((s, c) => s + c.matchScore, 0) / candidates.length),
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="候选人推荐"
        description="高级前端工程师 · 技术中心 · 已从简历库匹配 86 份简历"
        backTo="/recruiting"
        backLabel="返回招聘需求池"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleOpenRematch}>
              <Settings2 className="h-4 w-4" />重新匹配
            </Button>
            <Button size="sm" disabled={selected.size === 0}>
              <Users className="h-4 w-4" />批量加入面试 {selected.size > 0 && `(${selected.size})`}
            </Button>
          </>
        }
      />

      <div className="space-y-4 p-6">
        {/* AI 推荐摘要 */}
        <div className="ai-card">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--ai))]" />
            <div className="flex-1">
              <div className="text-sm font-medium text-[hsl(var(--ai))]">AI 匹配总结</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                共筛选 <strong>86 份</strong> 简历，硬性要求过滤后剩 <strong>24 份</strong>，
                按岗位画像权重打分后推荐 <strong>{stats.total} 份</strong>。其中
                <strong className="text-[hsl(var(--success))]"> {stats.strong} 位强匹配</strong>，
                <strong className="text-[hsl(var(--warning-foreground))]"> {stats.consider} 位可考虑</strong>，
                平均匹配度 <strong>{stats.avg} 分</strong>。建议优先安排前 3 位面试。
              </p>
            </div>
          </div>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="推荐总数" value={stats.total} icon={Users} tone="primary" />
          <StatTile label="强匹配" value={stats.strong} icon={CheckCircle2} tone="success" />
          <StatTile label="可考虑" value={stats.consider} icon={Star} tone="warning" />
          <StatTile label="平均匹配度" value={stats.avg} icon={TrendingUp} tone="info" suffix="分" />
        </div>

        {/* 筛选条 */}
        <Card className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="all">全部 ({candidates.length})</TabsTrigger>
                <TabsTrigger value="强匹配">强匹配 ({stats.strong})</TabsTrigger>
                <TabsTrigger value="可考虑">可考虑 ({stats.consider})</TabsTrigger>
                <TabsTrigger value="弱匹配">弱匹配</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="姓名 / 公司"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="h-9 w-[180px] pl-8"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-[140px]">
                  <ArrowUpDown className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">按匹配度</SelectItem>
                  <SelectItem value="exp">按工作年限</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* 候选人卡片列表 */}
        <div className="space-y-3">
          {filtered.map((c) => (
            <CandidateRow
              key={c.id}
              c={c}
              checked={selected.has(c.id)}
              onCheck={() => toggle(c.id)}
              onOpen={() => setOpenId(c.id)}
            />
          ))}
          {filtered.length === 0 && (
            <Card className="p-10 text-center text-sm text-muted-foreground">无匹配候选人</Card>
          )}
        </div>
      </div>

      {/* 详情抽屉 */}
      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-[640px] overflow-y-auto sm:max-w-[640px]">
          {opened && <CandidateDetail c={opened} />}
        </SheetContent>
      </Sheet>

      {/* 重新匹配 - 修改岗位需求 */}
      <Dialog open={rematchOpen} onOpenChange={setRematchOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />修改岗位需求并重新匹配
            </DialogTitle>
            <DialogDescription>
              调整匹配维度权重、阈值和筛选条件后，系统将重新计算所有候选人的匹配分数
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* 评分维度 */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-sm font-semibold">匹配评分维度</Label>
                <span className={cn("text-xs tabular-nums", totalWeight === 100 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--danger))]")}>
                  权重合计：{totalWeight}%{totalWeight !== 100 && " ≠ 100%"}
                </span>
              </div>
              <div className="space-y-4">
                {rematchDims.map((d) => (
                  <div key={d.key} className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{d.label}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{d.desc}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                          <span>权重</span>
                          <span className="font-medium tabular-nums text-foreground">{d.weight}%</span>
                        </div>
                        <Slider
                          min={0} max={100} step={5}
                          value={[d.weight]}
                          onValueChange={([v]) => updateDimWeight(d.key, v)}
                        />
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                          <span>最低阈值</span>
                          <span className="font-medium tabular-nums text-foreground">{d.threshold}分</span>
                        </div>
                        <Slider
                          min={0} max={100} step={5}
                          value={[d.threshold]}
                          onValueChange={([v]) => updateDimThreshold(d.key, v)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 硬性要求 */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[hsl(var(--success))]" />硬性要求
                </Label>
                <Button variant="ghost" size="sm" onClick={addHardReq} className="h-7 text-xs">+ 添加</Button>
              </div>
              <div className="space-y-2">
                {rematchHardReqs.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <Input
                      value={r.text}
                      onChange={(e) => updateHardReq(r.id, e.target.value)}
                      placeholder="输入硬性要求…"
                      className="h-8 text-sm"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-[hsl(var(--danger))]" onClick={() => removeHardReq(r.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {/* 排除项 */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-[hsl(var(--danger))]" />排除项
                </Label>
                <Button variant="ghost" size="sm" onClick={addExclude} className="h-7 text-xs">+ 添加</Button>
              </div>
              <div className="space-y-2">
                {rematchExcludes.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <Input
                      value={r.text}
                      onChange={(e) => updateExclude(r.id, e.target.value)}
                      placeholder="输入排除条件…"
                      className="h-8 text-sm"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-[hsl(var(--danger))]" onClick={() => removeExclude(r.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRematchOpen(false)}>取消</Button>
            <Button onClick={handleRematch}>
              <Sparkles className="h-4 w-4" />确认并重新匹配
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CandidateRow({
  c,
  checked,
  onCheck,
  onOpen,
}: {
  c: Candidate;
  checked: boolean;
  onCheck: () => void;
  onOpen: () => void;
}) {
  return (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <Checkbox checked={checked} onCheckedChange={onCheck} className="mt-1" />

        {/* 排名 + 匹配度 */}
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={c.matchScore} />
          <Badge variant="outline" className="text-[10px]">No.{c.rank}</Badge>
        </div>

        {/* 主信息 */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{c.name}</h3>
            <Badge variant="outline" className={levelStyle[c.level]}>{c.level}</Badge>
            <Badge variant="outline" className={cn("text-[11px]", statusStyle[c.status])}>
              {c.status}
            </Badge>
            <span className="ml-auto text-xs text-muted-foreground">来源：{c.source}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{c.gender} · {c.age} 岁</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{c.city}</span>
            <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" />{c.education} · {c.school}</span>
            <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{c.years} 年 · {c.currentTitle} @ {c.currentCompany}</span>
            <span>期望 {c.expectSalary}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {c.skills.slice(0, 6).map((s) => (
              <Badge key={s} variant="secondary" className="text-[11px] font-normal">{s}</Badge>
            ))}
          </div>

          {/* 维度小条 */}
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 md:grid-cols-5">
            {c.dims.map((d) => (
              <div key={d.key} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-medium tabular-nums">{d.score}</span>
                </div>
                <Progress value={d.score} className="mt-0.5 h-1" />
              </div>
            ))}
          </div>

          {/* 匹配 / 不匹配 */}
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="rounded-md bg-success-soft/50 p-2">
              <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--success))]">
                <ThumbsUp className="h-3 w-3" />匹配点
              </div>
              <ul className="space-y-0.5 text-xs">
                {c.pros.slice(0, 2).map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md bg-danger-soft/40 p-2">
              <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--danger))]">
                <ThumbsDown className="h-3 w-3" />风险点
              </div>
              <ul className="space-y-0.5 text-xs">
                {c.cons.slice(0, 2).map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 操作 */}
        <div className="flex flex-col gap-1.5">
          <Button size="sm" onClick={onOpen}>
            <Eye className="h-4 w-4" />详情
          </Button>
          <Button size="sm" variant="outline">
            <CheckCircle2 className="h-4 w-4" />加入面试
          </Button>
          <Button size="sm" variant="ghost" className="text-muted-foreground">
            <XCircle className="h-4 w-4" />Pass
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ScoreRing({ score }: { score: number }) {
  const tone =
    score >= 85 ? "hsl(var(--success))" : score >= 70 ? "hsl(var(--warning))" : "hsl(var(--muted-foreground))";
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="relative h-16 w-16">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
        <circle
          cx="32" cy="32" r={r}
          stroke={tone}
          strokeWidth="6"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-base font-bold tabular-nums" style={{ color: tone }}>{score}</div>
        <div className="text-[9px] text-muted-foreground">匹配度</div>
      </div>
    </div>
  );
}

function StatTile({
  label, value, icon: Icon, tone, suffix,
}: {
  label: string; value: number; icon: typeof Users;
  tone: "primary" | "success" | "warning" | "info";
  suffix?: string;
}) {
  const map = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-[hsl(var(--success))]",
    warning: "bg-warning-soft text-[hsl(var(--warning-foreground))]",
    info: "bg-info-soft text-[hsl(var(--info))]",
  };
  return (
    <div className="stat-card">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${map[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold tabular-nums">
          {value}
          {suffix && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

function CandidateDetail({ c }: { c: Candidate }) {
  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3">
          <ScoreRing score={c.matchScore} />
          <div>
            <SheetTitle className="flex items-center gap-2">
              {c.name}
              <Badge variant="outline" className={levelStyle[c.level]}>{c.level}</Badge>
            </SheetTitle>
            <SheetDescription>
              {c.gender} · {c.age} 岁 · {c.city} · 期望 {c.expectSalary}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="mt-5 space-y-5">
        {/* AI 评估 */}
        <div className="ai-card">
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--ai))]">
            <Sparkles className="h-4 w-4" />AI 评估
          </div>
          <p className="text-sm leading-relaxed">{c.aiSummary}</p>
        </div>

        {/* 维度评分详情 */}
        <section>
          <div className="mb-2 text-sm font-medium">评分维度拆解</div>
          <div className="space-y-2.5">
            {c.dims.map((d) => (
              <div key={d.key}>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {d.label}
                    <span className="ml-1.5 text-xs text-muted-foreground">权重 {d.weight}%</span>
                  </span>
                  <span className="font-semibold tabular-nums">{d.score}</span>
                </div>
                <Progress value={d.score} className="mt-1 h-1.5" />
              </div>
            ))}
          </div>
        </section>

        {/* 匹配 / 风险 */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-success-soft/40 p-3">
            <div className="mb-2 flex items-center gap-1 text-sm font-medium text-[hsl(var(--success))]">
              <ThumbsUp className="h-4 w-4" />匹配点
            </div>
            <ul className="space-y-1 text-sm">
              {c.pros.map((p) => (
                <li key={p} className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--success))]" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border bg-danger-soft/30 p-3">
            <div className="mb-2 flex items-center gap-1 text-sm font-medium text-[hsl(var(--danger))]">
              <ThumbsDown className="h-4 w-4" />风险点
            </div>
            <ul className="space-y-1 text-sm">
              {c.cons.map((p) => (
                <li key={p} className="flex items-start gap-1.5">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--danger))]" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 基础档案 */}
        <section>
          <div className="mb-2 text-sm font-medium">候选人档案</div>
          <div className="space-y-2 rounded-lg border bg-muted/20 p-3 text-sm">
            <Row icon={GraduationCap} label="教育" value={`${c.education} · ${c.school}`} />
            <Row icon={Briefcase} label="经历" value={`${c.currentCompany} · ${c.currentTitle} (${c.years} 年)`} />
            <Row icon={Tag} label="技能" value={
              <div className="flex flex-wrap gap-1">
                {c.skills.map((s) => <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>)}
              </div>
            } />
          </div>
        </section>

        {/* 操作 */}
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button
            className="flex-1"
            onClick={() => toast({ title: `已将 ${c.name} 加入面试列表` })}
          >
            <CheckCircle2 className="h-4 w-4" />加入面试
          </Button>
          <Button variant="outline" size="icon"><Phone className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon"><Mail className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon"><MessageSquare className="h-4 w-4" /></Button>
          <Button
            variant="ghost"
            onClick={() => toast({ title: `${c.name} 已 pass`, variant: "destructive" })}
          >
            <XCircle className="h-4 w-4" />Pass
          </Button>
        </div>
      </div>
    </>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
}
