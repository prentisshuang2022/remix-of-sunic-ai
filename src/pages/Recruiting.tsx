import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ResumeLibraryPanel } from "./ResumeLibrary";
import {
  Briefcase,
  Plus,
  Search,
  Users,
  FileText,
  Sparkles,
  MapPin,
  Clock,
  TrendingUp,
  Wand2,
  X,
  Check,
  AlertCircle,
  GripVertical,
  PlayCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

type JobStatus = "招聘中" | "画像待生成" | "已暂停" | "已完成";

interface Job {
  id: string;
  title: string;
  dept: string;
  location: string;
  headcount: number;
  resumeCount: number;
  matchedCount: number;
  status: JobStatus;
  urgency: "高" | "中" | "低";
  createdAt: string;
  owner: string;
  hasProfile: boolean;
}

interface ProfileItem {
  id: string;
  text: string;
}

interface Dimension {
  key: string;
  label: string;
  weight: number;
  threshold: number;
  desc: string;
}

const jobs: Job[] = [
  {
    id: "J001",
    title: "高级前端工程师",
    dept: "技术中心",
    location: "上海",
    headcount: 2,
    resumeCount: 86,
    matchedCount: 18,
    status: "招聘中",
    urgency: "高",
    createdAt: "2025-04-08",
    owner: "李婷",
    hasProfile: true,
  },
  {
    id: "J002",
    title: "数据分析师",
    dept: "运营中心",
    location: "杭州",
    headcount: 1,
    resumeCount: 42,
    matchedCount: 9,
    status: "招聘中",
    urgency: "中",
    createdAt: "2025-04-10",
    owner: "王磊",
    hasProfile: true,
  },
  {
    id: "J003",
    title: "生产线主管",
    dept: "生产一线",
    location: "苏州",
    headcount: 3,
    resumeCount: 28,
    matchedCount: 0,
    status: "画像待生成",
    urgency: "高",
    createdAt: "2025-04-15",
    owner: "陈芳",
    hasProfile: false,
  },
  {
    id: "J004",
    title: "财务经理",
    dept: "职能部门",
    location: "上海",
    headcount: 1,
    resumeCount: 15,
    matchedCount: 4,
    status: "招聘中",
    urgency: "中",
    createdAt: "2025-04-02",
    owner: "李婷",
    hasProfile: true,
  },
  {
    id: "J005",
    title: "QA 测试工程师",
    dept: "技术中心",
    location: "上海",
    headcount: 2,
    resumeCount: 0,
    matchedCount: 0,
    status: "画像待生成",
    urgency: "低",
    createdAt: "2025-04-16",
    owner: "王磊",
    hasProfile: false,
  },
  {
    id: "J006",
    title: "HRBP",
    dept: "职能部门",
    location: "深圳",
    headcount: 1,
    resumeCount: 22,
    matchedCount: 6,
    status: "已暂停",
    urgency: "低",
    createdAt: "2025-03-20",
    owner: "陈芳",
    hasProfile: true,
  },
];

const statusStyle: Record<JobStatus, string> = {
  招聘中: "bg-success-soft text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]",
  画像待生成: "bg-warning-soft text-[hsl(var(--warning-foreground))] border-[hsl(var(--warning)/0.4)]",
  已暂停: "bg-muted text-muted-foreground border-border",
  已完成: "bg-info-soft text-[hsl(var(--info))] border-[hsl(var(--info)/0.3)]",
};

const urgencyStyle: Record<string, string> = {
  高: "text-[hsl(var(--danger))]",
  中: "text-[hsl(var(--warning-foreground))]",
  低: "text-muted-foreground",
};

// [FRONTEND-ONLY] AI 生成画像的 mock 数据
const mockAIProfile = {
  summary:
    "该岗位偏向资深前端 + 技术管理过渡方向，建议优先考虑大厂背景、有 React 深度实践的候选人。已识别 4 项硬性要求、4 项加分项、2 项排除项，推荐权重以「技能匹配」与「工作经验」为主。",
  hardReqs: [
    { id: "h1", text: "本科及以上学历，计算机相关专业" },
    { id: "h2", text: "5 年以上前端开发经验" },
    { id: "h3", text: "精通 React 与 TypeScript" },
    { id: "h4", text: "工作地点：上海" },
  ],
  bonus: [
    { id: "b1", text: "有大型 C 端项目经验" },
    { id: "b2", text: "有团队管理经验" },
    { id: "b3", text: "熟悉 Vue / Next.js" },
    { id: "b4", text: "活跃的开源贡献" },
  ],
  excludes: [
    { id: "e1", text: "工作经验少于 3 年" },
    { id: "e2", text: "近 3 年平均跳槽周期 < 12 个月" },
  ],
  dims: [
    { key: "skill", label: "技能匹配", weight: 35, threshold: 60, desc: "技术栈与岗位要求的吻合度" },
    { key: "exp", label: "工作经验", weight: 25, threshold: 50, desc: "年限与项目背景" },
    { key: "edu", label: "教育背景", weight: 15, threshold: 40, desc: "学历与院校层次" },
    { key: "stable", label: "稳定性", weight: 15, threshold: 50, desc: "平均在职时长" },
    { key: "salary", label: "薪资契合", weight: 10, threshold: 30, desc: "期望薪资落在岗位区间内" },
  ],
};

export default function Recruiting() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mainTab = params.get("tab") === "resumes" ? "resumes" : "jobs";
  const setMainTab = (v: string) => {
    if (v === "jobs") params.delete("tab");
    else params.set("tab", v);
    setParams(params, { replace: true });
  };

  const [statusTab, setStatusTab] = useState<"all" | JobStatus>("all");
  const [keyword, setKeyword] = useState("");
  const [dept, setDept] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (statusTab !== "all" && j.status !== statusTab) return false;
      if (dept !== "all" && j.dept !== dept) return false;
      if (keyword && !j.title.includes(keyword) && !j.dept.includes(keyword)) return false;
      return true;
    });
  }, [statusTab, dept, keyword]);

  const stats = useMemo(
    () => ({
      total: jobs.length,
      active: jobs.filter((j) => j.status === "招聘中").length,
      pending: jobs.filter((j) => j.status === "画像待生成").length,
      resumes: jobs.reduce((s, j) => s + j.resumeCount, 0),
    }),
    [],
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        title="招聘助手"
        description="集中管理岗位需求与简历库，AI 协助生成岗位画像并智能匹配候选人"
        actions={
          mainTab === "jobs" ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />新建岗位需求
            </Button>
          ) : null
        }
      />

      <div className="border-b bg-card px-6">
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="h-10 bg-transparent p-0">
            <TabsTrigger
              value="jobs"
              className="h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Briefcase className="h-4 w-4" />招聘需求池
            </TabsTrigger>
            <TabsTrigger
              value="resumes"
              className="h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <FileText className="h-4 w-4" />简历库
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4 p-6">
        {mainTab === "jobs" ? (
          <>
            {/* 统计卡 */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard icon={Briefcase} label="岗位总数" value={stats.total} tone="primary" />
              <StatCard icon={TrendingUp} label="招聘中" value={stats.active} tone="success" />
              <StatCard icon={Sparkles} label="画像待生成" value={stats.pending} tone="warning" />
              <StatCard icon={FileText} label="累计简历" value={stats.resumes} tone="info" />
            </div>

            {/* 筛选 */}
            <Card className="p-3">
              <div className="flex flex-wrap items-center gap-3">
                <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as typeof statusTab)}>
                  <TabsList>
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="招聘中">招聘中</TabsTrigger>
                    <TabsTrigger value="画像待生成">画像待生成</TabsTrigger>
                    <TabsTrigger value="已暂停">已暂停</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger className="h-9 w-[140px]">
                      <SelectValue placeholder="部门" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部部门</SelectItem>
                      <SelectItem value="技术中心">技术中心</SelectItem>
                      <SelectItem value="运营中心">运营中心</SelectItem>
                      <SelectItem value="职能部门">职能部门</SelectItem>
                      <SelectItem value="生产一线">生产一线</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索岗位 / 部门"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="h-9 w-[200px] pl-8"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* 岗位卡片网格 */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {filtered.length === 0 && (
                <Card className="col-span-full p-10 text-center text-sm text-muted-foreground">
                  没有符合条件的岗位
                </Card>
              )}
            </div>
          </>
        ) : (
          <ResumeLibraryPanel />
        )}
      </div>

      <CreateJobDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(jobId, goProfile) => {
          setCreateOpen(false);
          if (goProfile) navigate(`/recruiting/job/${jobId}`);
        }}
      />
    </div>
  );
}

/* ─── CreateJobDialog：新建岗位需求 + 内嵌 AI 画像生成 ─── */

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (jobId: string, goProfile: boolean) => void;
}

function CreateJobDialog({ open, onOpenChange, onCreated }: CreateJobDialogProps) {
  const navigate = useNavigate();

  // 基础信息
  const [title, setTitle] = useState("");
  const [deptVal, setDeptVal] = useState("");
  const [location, setLocation] = useState("");
  const [headcount, setHeadcount] = useState("1");
  const [salary, setSalary] = useState("");
  const [urgency, setUrgency] = useState<"高" | "中" | "低">("中");
  const [owner, setOwner] = useState("");
  const [jd, setJd] = useState("");

  // AI 画像
  const [profileGenerated, setProfileGenerated] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [hardReqs, setHardReqs] = useState<ProfileItem[]>([]);
  const [bonus, setBonus] = useState<ProfileItem[]>([]);
  const [excludes, setExcludes] = useState<ProfileItem[]>([]);
  const [dims, setDims] = useState<Dimension[]>([]);

  const totalWeight = dims.reduce((s, d) => s + d.weight, 0);

  const reset = () => {
    setTitle(""); setDeptVal(""); setLocation(""); setHeadcount("1");
    setSalary(""); setUrgency("中"); setOwner(""); setJd("");
    setProfileGenerated(false); setAiSummary("");
    setHardReqs([]); setBonus([]); setExcludes([]); setDims([]);
  };

  const canSubmit = title.trim() && deptVal && location.trim() && Number(headcount) > 0;

  // [FRONTEND-ONLY] AI 生成画像（mock）— 保留用户已调整的 weight/threshold
  const handleGenerateProfile = () => {
    if (!jd.trim()) {
      toast({ title: "请先填写岗位 JD", description: "AI 需要 JD 内容来生成岗位画像", variant: "destructive" });
      return;
    }

    // 保留用户已调整过的维度配置
    const existingDimMap = new Map(dims.map((d) => [d.key, d]));

    const newDims = mockAIProfile.dims.map((aiDim) => {
      const existing = existingDimMap.get(aiDim.key);
      if (existing) {
        // 保留用户调整过的 weight 和 threshold，刷新 label/desc
        return { ...aiDim, weight: existing.weight, threshold: existing.threshold };
      }
      return { ...aiDim };
    });

    setAiSummary(mockAIProfile.summary);
    setHardReqs(mockAIProfile.hardReqs.map((r) => ({ ...r })));
    setBonus(mockAIProfile.bonus.map((r) => ({ ...r })));
    setExcludes(mockAIProfile.excludes.map((r) => ({ ...r })));
    setDims(newDims);
    setProfileGenerated(true);

    toast({ title: "AI 已生成岗位画像", description: "可继续调整权重与阈值" });
  };

  const submit = (goProfile: boolean) => {
    if (!canSubmit) {
      toast({ title: "请完善必填信息", variant: "destructive" });
      return;
    }
    const newId = `J${String(Date.now()).slice(-3)}`;
    toast({
      title: "岗位需求已创建",
      description: profileGenerated
        ? `${title} · 画像已生成 · ${dims.length} 个评分维度`
        : `${title} · ${deptVal} · 招 ${headcount} 人`,
    });
    reset();
    onCreated(newId, goProfile);
  };

  const submitAndMatch = () => {
    if (!canSubmit) {
      toast({ title: "请完善必填信息", variant: "destructive" });
      return;
    }
    const newId = `J${String(Date.now()).slice(-3)}`;
    toast({ title: "已开始智能筛选", description: "正在从简历库匹配候选人..." });
    reset();
    onOpenChange(false);
    navigate(`/recruiting/job/${newId}/candidates`);
  };

  const addItem = (
    setter: React.Dispatch<React.SetStateAction<ProfileItem[]>>,
    prefix: string,
  ) => setter((arr) => [...arr, { id: `${prefix}${Date.now()}`, text: "" }]);

  const updateItem = (
    setter: React.Dispatch<React.SetStateAction<ProfileItem[]>>,
    id: string,
    text: string,
  ) => setter((arr) => arr.map((it) => (it.id === id ? { ...it, text } : it)));

  const removeItem = (
    setter: React.Dispatch<React.SetStateAction<ProfileItem[]>>,
    id: string,
  ) => setter((arr) => arr.filter((it) => it.id !== id));

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建岗位需求</DialogTitle>
          <DialogDescription>
            填写岗位基本信息和 JD，可直接由 AI 生成岗位画像并调整评分维度
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* ── 基础信息 ── */}
          <div>
            <SectionTitle title="基础信息" />
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="岗位名称" required className="col-span-2">
                <Input placeholder="如：高级前端工程师" value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="所属部门" required>
                <Select value={deptVal} onValueChange={setDeptVal}>
                  <SelectTrigger><SelectValue placeholder="选择部门" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="技术中心">技术中心</SelectItem>
                    <SelectItem value="运营中心">运营中心</SelectItem>
                    <SelectItem value="职能部门">职能部门</SelectItem>
                    <SelectItem value="生产一线">生产一线</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="工作地点" required>
                <Input placeholder="如：上海" value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
              <Field label="招聘人数" required>
                <Input type="number" min={1} value={headcount} onChange={(e) => setHeadcount(e.target.value)} />
              </Field>
              <Field label="薪资范围">
                <Input placeholder="如：25-40K" value={salary} onChange={(e) => setSalary(e.target.value)} />
              </Field>
              <Field label="紧急程度">
                <Select value={urgency} onValueChange={(v) => setUrgency(v as typeof urgency)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="高">高急（2 周内到岗）</SelectItem>
                    <SelectItem value="中">中（1 个月内到岗）</SelectItem>
                    <SelectItem value="低">低（无明确节点）</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="招聘负责人">
                <Input placeholder="输入 HR 姓名" value={owner} onChange={(e) => setOwner(e.target.value)} />
              </Field>
            </div>
          </div>

          {/* ── 岗位 JD ── */}
          <div>
            <div className="flex items-center justify-between">
              <SectionTitle title="岗位 JD" />
              <Button size="sm" variant="outline" onClick={handleGenerateProfile}>
                <Wand2 className="h-4 w-4 text-[hsl(var(--ai))]" />
                {profileGenerated ? "AI 重新生成画像" : "AI 生成岗位画像"}
              </Button>
            </div>
            <Textarea
              placeholder={"岗位职责：\n1. ...\n\n任职要求：\n1. ..."}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="mt-3 min-h-[140px] text-sm"
            />
            {!profileGenerated && (
              <div className="ai-card mt-3 flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--ai))]" />
                <div className="text-xs leading-relaxed text-foreground/80">
                  填写 JD 后点击「AI 生成岗位画像」，AI 将自动提取硬性要求 / 加分项 / 排除项，
                  并生成评分维度权重与合格阈值，可在创建流程中直接调整。
                </div>
              </div>
            )}
          </div>

          {/* ── AI 画像（生成后展示） ── */}
          {profileGenerated && (
            <>
              {/* AI 摘要 */}
              <div className="ai-card flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--ai))]" />
                <div>
                  <div className="text-sm font-medium text-[hsl(var(--ai))]">AI 画像摘要</div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">{aiSummary}</p>
                </div>
              </div>

              {/* 三组规则 */}
              <div>
                <SectionTitle title="筛选规则" />
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <RuleGroup
                    title="硬性要求" hint="必须满足" tone="success" icon={Check}
                    items={hardReqs}
                    onAdd={() => addItem(setHardReqs, "h")}
                    onChange={(id, t) => updateItem(setHardReqs, id, t)}
                    onRemove={(id) => removeItem(setHardReqs, id)}
                  />
                  <RuleGroup
                    title="加分项" hint="提升评分" tone="info" icon={Plus}
                    items={bonus}
                    onAdd={() => addItem(setBonus, "b")}
                    onChange={(id, t) => updateItem(setBonus, id, t)}
                    onRemove={(id) => removeItem(setBonus, id)}
                  />
                  <RuleGroup
                    title="排除项" hint="自动过滤" tone="danger" icon={X}
                    items={excludes}
                    onAdd={() => addItem(setExcludes, "e")}
                    onChange={(id, t) => updateItem(setExcludes, id, t)}
                    onRemove={(id) => removeItem(setExcludes, id)}
                  />
                </div>
              </div>

              {/* 评分维度 */}
              <div>
                <div className="flex items-center justify-between">
                  <SectionTitle title="匹配评分维度" />
                  <Badge
                    variant="outline"
                    className={
                      totalWeight === 100
                        ? "bg-success-soft text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]"
                        : "bg-warning-soft text-[hsl(var(--warning-foreground))] border-[hsl(var(--warning)/0.4)]"
                    }
                  >
                    {totalWeight === 100 ? <Check className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
                    总权重 {totalWeight}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  调整权重影响最终得分排序，阈值为该维度最低合格线（低于阈值的候选人将标记为弱匹配）
                </p>
                <div className="mt-3 space-y-3">
                  {dims.map((d, idx) => (
                    <div key={d.key} className="rounded-md border bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{d.label}</div>
                            <div className="text-xs text-muted-foreground">{d.desc}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">权重</span>
                            <span className="font-semibold tabular-nums text-primary">{d.weight}%</span>
                          </div>
                          <Slider
                            value={[d.weight]}
                            max={100}
                            step={5}
                            onValueChange={([v]) =>
                              setDims((arr) => arr.map((x, i) => (i === idx ? { ...x, weight: v } : x)))
                            }
                          />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">合格阈值</span>
                            <span className="font-semibold tabular-nums text-[hsl(var(--warning-foreground))]">{d.threshold}分</span>
                          </div>
                          <Slider
                            value={[d.threshold]}
                            max={100}
                            step={5}
                            onValueChange={([v]) =>
                              setDims((arr) => arr.map((x, i) => (i === idx ? { ...x, threshold: v } : x)))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => submit(false)}>仅保存草稿</Button>
            {profileGenerated ? (
              <>
                <Button variant="outline" onClick={() => submit(true)}>
                  <Wand2 className="h-4 w-4" />保存并编辑画像
                </Button>
                <Button onClick={submitAndMatch}>
                  <PlayCircle className="h-4 w-4" />保存并开始筛选
                </Button>
              </>
            ) : (
              <Button onClick={() => submit(true)}>
                <Wand2 className="h-4 w-4" />保存并生成画像
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── 通用子组件 ─── */

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-1 rounded-full bg-primary" />
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}

function RuleGroup({
  title,
  hint,
  tone,
  icon: Icon,
  items,
  onAdd,
  onChange,
  onRemove,
}: {
  title: string;
  hint: string;
  tone: "success" | "info" | "danger";
  icon: typeof Check;
  items: ProfileItem[];
  onAdd: () => void;
  onChange: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}) {
  const toneMap = {
    success: "bg-success-soft text-[hsl(var(--success))]",
    info: "bg-info-soft text-[hsl(var(--info))]",
    danger: "bg-danger-soft text-[hsl(var(--danger))]",
  };
  return (
    <Card className="flex flex-col p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`flex h-6 w-6 items-center justify-center rounded ${toneMap[tone]}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-sm font-medium">{title}</div>
            <div className="text-[10px] text-muted-foreground">{hint}</div>
          </div>
        </div>
        <Badge variant="secondary" className="text-[11px]">{items.length}</Badge>
      </div>
      <div className="flex-1 space-y-1.5">
        {items.map((it) => (
          <div key={it.id} className="group flex items-center gap-1">
            <Input
              value={it.text}
              onChange={(e) => onChange(it.id, e.target.value)}
              className="h-8 text-xs"
              placeholder="输入规则…"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
              onClick={() => onRemove(it.id)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" />添加
      </Button>
    </Card>
  );
}

function Field({
  label,
  required,
  hint,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 flex items-center gap-1 text-xs">
        {label}
        {required && <span className="text-[hsl(var(--danger))]">*</span>}
      </Label>
      {children}
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Briefcase;
  label: string;
  value: number;
  tone: "primary" | "success" | "warning" | "info";
}) {
  const toneMap = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-[hsl(var(--success))]",
    warning: "bg-warning-soft text-[hsl(var(--warning-foreground))]",
    info: "bg-info-soft text-[hsl(var(--info))]",
  };
  return (
    <div className="stat-card">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${toneMap[tone]}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <Card className="flex flex-col gap-3 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold">{job.title}</h3>
            <span className={`text-xs ${urgencyStyle[job.urgency]}`}>● {job.urgency}急</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{job.dept}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />招 {job.headcount} 人
            </span>
          </div>
        </div>
        <Badge variant="outline" className={statusStyle[job.status]}>
          {job.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted/30 p-3">
        <div>
          <div className="text-[11px] text-muted-foreground">简历库匹配池</div>
          <div className="text-lg font-semibold tabular-nums">{job.resumeCount}</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground">AI 推荐候选</div>
          <div className="text-lg font-semibold tabular-nums text-primary">{job.matchedCount}</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {job.createdAt} · {job.owner}
        </span>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" asChild>
            <Link to={`/recruiting/job/${job.id}`}>
              {job.hasProfile ? "查看画像" : "生成画像"}
            </Link>
          </Button>
          <Button size="sm" variant={job.matchedCount > 0 ? "default" : "outline"} asChild>
            <Link to={`/recruiting/job/${job.id}/candidates`}>候选人</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
