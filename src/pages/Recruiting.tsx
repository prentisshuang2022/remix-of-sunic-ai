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
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (jobId: string, goProfile: boolean) => void;
}

function CreateJobDialog({ open, onOpenChange, onCreated }: CreateJobDialogProps) {
  const [title, setTitle] = useState("");
  const [deptVal, setDeptVal] = useState("");
  const [location, setLocation] = useState("");
  const [headcount, setHeadcount] = useState("1");
  const [salary, setSalary] = useState("");
  const [urgency, setUrgency] = useState<"高" | "中" | "低">("中");
  const [owner, setOwner] = useState("");
  const [jd, setJd] = useState("");

  const reset = () => {
    setTitle(""); setDeptVal(""); setLocation(""); setHeadcount("1");
    setSalary(""); setUrgency("中"); setOwner(""); setJd("");
  };

  const canSubmit = title.trim() && deptVal && location.trim() && Number(headcount) > 0;

  const submit = (goProfile: boolean) => {
    if (!canSubmit) {
      toast({ title: "请完善必填信息", variant: "destructive" });
      return;
    }
    const newId = `J${String(Date.now()).slice(-3)}`;
    toast({
      title: "岗位需求已创建",
      description: goProfile ? "正在跳转到岗位画像页…" : `${title} · ${deptVal} · 招 ${headcount} 人`,
    });
    reset();
    onCreated(newId, goProfile);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>新建岗位需求</DialogTitle>
          <DialogDescription>
            填写岗位基本信息和 JD，提交后可由 AI 自动生成岗位画像
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-2">
          <Field label="岗位名称" required className="col-span-2">
            <Input
              placeholder="如：高级前端工程师"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
            <Input
              placeholder="如：上海"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Field>

          <Field label="招聘人数" required>
            <Input
              type="number"
              min={1}
              value={headcount}
              onChange={(e) => setHeadcount(e.target.value)}
            />
          </Field>

          <Field label="薪资范围">
            <Input
              placeholder="如：25-40K"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
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
            <Input
              placeholder="输入 HR 姓名"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </Field>

          <Field label="岗位 JD" hint="可粘贴现有 JD，AI 将基于此生成岗位画像" className="col-span-2">
            <Textarea
              placeholder="岗位职责：&#10;1. ...&#10;&#10;任职要求：&#10;1. ..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="min-h-[140px] text-sm"
            />
          </Field>
        </div>

        <div className="ai-card flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--ai))]" />
          <div className="text-xs leading-relaxed text-foreground/80">
            提交后选择「<strong>保存并生成画像</strong>」，AI 将从 JD 中提取硬性要求 / 加分项 / 排除项，
            并生成评分维度权重，可直接进入候选人智能匹配。
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => submit(false)}>
              仅保存草稿
            </Button>
            <Button onClick={() => submit(true)}>
              <Wand2 className="h-4 w-4" />保存并生成画像
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
