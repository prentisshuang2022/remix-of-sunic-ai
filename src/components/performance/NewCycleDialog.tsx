import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const cycleTypes = [
  { value: "quarter", label: "季度考核", suggest: "2025 Q3 季度考核" },
  { value: "half", label: "半年度考核", suggest: "2025 下半年考核" },
  { value: "year", label: "年度考核", suggest: "2025 年度考核" },
  { value: "month", label: "月度考核", suggest: "2025-08 月度考核" },
  { value: "project", label: "项目专项", suggest: "新机型量产专项考核" },
];

const templates = [
  { value: "v3.2", label: "研发/生产/职能 V3.2", desc: "通用模板,覆盖 5 大序列,推荐" },
  { value: "rd", label: "研发序列 V2.1", desc: "侧重项目交付与专利产出" },
  { value: "mfg", label: "生产/工艺序列 V2.4", desc: "侧重 OEE / 良品率 / 工时" },
  { value: "sales", label: "销售序列 V2.0", desc: "侧重回款 / 新客 / 满意度" },
];

const allDepts = [
  "研发部",
  "生产管理部",
  "品质管理部",
  "项目管理部",
  "营销中心",
  "商务部",
  "市场营销部",
  "供应链",
  "财务中心",
  "综合管理部",
  "物业",
];

const deptHeadcount: Record<string, number> = {
  研发部: 36,
  生产管理部: 60,
  品质管理部: 14,
  项目管理部: 14,
  营销中心: 22,
  商务部: 12,
  市场营销部: 10,
  供应链: 18,
  财务中心: 6,
  综合管理部: 8,
  物业: 2,
};

export function NewCycleDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("quarter");
  const [name, setName] = useState("2025 Q3 季度考核");
  const [start, setStart] = useState<Date | undefined>(new Date(2025, 6, 1));
  const [end, setEnd] = useState<Date | undefined>(new Date(2025, 8, 30));
  const [scope, setScope] = useState<"all" | "dept">("all");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([...allDepts]);
  const [template, setTemplate] = useState("v3.2");
  const [linkStrategy, setLinkStrategy] = useState(true);
  const [aiValidate, setAiValidate] = useState(true);
  const [autoUrge, setAutoUrge] = useState(true);
  const [stageDays, setStageDays] = useState({ self: 7, leader: 7, dept: 4, hr: 3, gm: 2 });

  const headcount = useMemo(
    () =>
      scope === "all"
        ? 202
        : selectedDepts.reduce((s, d) => s + (deptHeadcount[d] || 0), 0),
    [scope, selectedDepts],
  );

  const totalDays =
    stageDays.self + stageDays.leader + stageDays.dept + stageDays.hr + stageDays.gm;

  const toggleDept = (d: string) =>
    setSelectedDepts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  const onTypeChange = (v: string) => {
    setType(v);
    const hit = cycleTypes.find((t) => t.value === v);
    if (hit) setName(hit.suggest);
  };

  const reset = () => {
    setStep(1);
    setType("quarter");
    setName("2025 Q3 季度考核");
    setStart(new Date(2025, 6, 1));
    setEnd(new Date(2025, 8, 30));
    setScope("all");
    setSelectedDepts([...allDepts]);
    setTemplate("v3.2");
    setLinkStrategy(true);
    setAiValidate(true);
    setAutoUrge(true);
    setStageDays({ self: 7, leader: 7, dept: 4, hr: 3, gm: 2 });
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const submit = () => {
    toast.success(`已创建『${name}』草稿,覆盖 ${headcount} 人,等待 HR 审核发布`);
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>新建考核周期</DialogTitle>
          <DialogDescription>
            按 4 步配置:基本信息 → 覆盖范围 → 流程与模板 → 确认发布
          </DialogDescription>
        </DialogHeader>

        {/* 步骤指示 */}
        <div className="flex items-center gap-2">
          {["基本信息", "覆盖范围", "流程与模板", "确认"].map((label, i) => {
            const idx = i + 1;
            const active = step === idx;
            const done = step > idx;
            return (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    active && "border-primary bg-primary text-primary-foreground",
                    !done && !active && "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx}
                </div>
                <span
                  className={cn(
                    "text-xs",
                    active ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
                {idx < 4 && <div className="h-px flex-1 bg-border" />}
              </div>
            );
          })}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-xs">周期类型</Label>
              <Select value={type} onValueChange={onTypeChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cycleTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">周期名称</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-xs">考核起始</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 justify-start text-left font-normal",
                        !start && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {start ? format(start, "yyyy-MM-dd") : "选择日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={start}
                      onSelect={setStart}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">考核截止</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 justify-start text-left font-normal",
                        !end && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {end ? format(end, "yyyy-MM-dd") : "选择日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={end}
                      onSelect={setEnd}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              AI 已根据上一周期 (2025 Q2) 自动推荐起止日期与命名,可手动修改。
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-xs">覆盖范围</Label>
              <Select value={scope} onValueChange={(v: "all" | "dept") => setScope(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全员 (202 人,9 个部门)</SelectItem>
                  <SelectItem value="dept">按部门选择</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {scope === "dept" && (
              <div className="grid gap-2">
                <Label className="text-xs">选择部门</Label>
                <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 sm:grid-cols-3">
                  {allDepts.map((d) => (
                    <label
                      key={d}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-xs hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedDepts.includes(d)}
                        onCheckedChange={() => toggleDept(d)}
                      />
                      <span className="flex-1">{d}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {deptHeadcount[d]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-xs">
              <Users className="h-4 w-4 text-primary" />
              <span>本次覆盖</span>
              <Badge variant="outline" className="text-[11px]">
                {headcount} 人
              </Badge>
              <span className="text-muted-foreground">
                · 其中已离职/试用期人员将由系统自动剔除
              </span>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-xs">评估模板</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex flex-col">
                        <span>{t.label}</span>
                        <span className="text-[11px] text-muted-foreground">{t.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs">流程阶段时长 (天)</Label>
              <div className="grid grid-cols-5 gap-2 rounded-lg border p-3">
                {(
                  [
                    { k: "self", n: "员工自评" },
                    { k: "leader", n: "上级考评" },
                    { k: "dept", n: "部门考评" },
                    { k: "hr", n: "HR 复核" },
                    { k: "gm", n: "总经理确认" },
                  ] as const
                ).map((s) => (
                  <div key={s.k} className="flex flex-col items-center gap-1">
                    <span className="text-[11px] text-muted-foreground">{s.n}</span>
                    <Input
                      type="number"
                      value={stageDays[s.k]}
                      onChange={(e) =>
                        setStageDays((p) => ({ ...p, [s.k]: Number(e.target.value) || 0 }))
                      }
                      className="h-8 text-center"
                    />
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-muted-foreground">
                合计 {totalDays} 天 · 系统将按此自动分配各阶段截止日并生成催办计划
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">关联 2025 年度战略目标</div>
                  <div className="text-[11px] text-muted-foreground">
                    自动把战略 KPI 带入对应部门评估表
                  </div>
                </div>
                <Switch checked={linkStrategy} onCheckedChange={setLinkStrategy} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">启用 AI 评分校验</div>
                  <div className="text-[11px] text-muted-foreground">
                    上级评分与业务系统达成偏差 ≥15% 自动预警
                  </div>
                </div>
                <Switch checked={aiValidate} onCheckedChange={setAiValidate} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">自动催办</div>
                  <div className="text-[11px] text-muted-foreground">
                    截止前 1 天 / 超期当天分别推送企微 + 邮件
                  </div>
                </div>
                <Switch checked={autoUrge} onCheckedChange={setAutoUrge} />
              </div>
            </div>

            {/* 指标库引用预览 */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                📊 本次考核将引用的指标（来自指标库）
              </div>
              <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
                {[
                  { dept: "研发部", count: 4, examples: "新产品 NPI 周期 / BOM 标准化率 / ..." },
                  { dept: "生产管理部", count: 4, examples: "OEE / 订单准时率 / 良品率 / ..." },
                  { dept: "品质管理部", count: 3, examples: "PPM / 首件合格率 / 客诉响应 / ..." },
                  { dept: "营销中心", count: 3, examples: "回款率 / 大客户渗透 / 新客户 / ..." },
                ].filter(() => scope === "all" || selectedDepts.length > 0).map((d) => (
                  <div key={d.dept} className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{d.dept}：</span>
                    <span>{d.count} 个指标（{d.examples}）</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[11px]">
                合计引用 <span className="font-medium text-foreground">38</span> 个指标，其中 <span className="font-medium text-foreground">30</span> 个自动抓取、<span className="font-medium text-foreground">8</span> 个需手工填报
              </div>
              <button
                className="mt-1.5 text-[11px] text-primary hover:underline"
                onClick={() => toast.info("跳转到配置中心 · 指标库")}
              >
                查看完整列表 →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
            <Row label="周期名称" value={name} />
            <Row
              label="周期类型"
              value={cycleTypes.find((t) => t.value === type)?.label || type}
            />
            <Row
              label="起止日期"
              value={`${start ? format(start, "yyyy-MM-dd") : "—"}  ~  ${end ? format(end, "yyyy-MM-dd") : "—"}`}
            />
            <Row
              label="覆盖范围"
              value={
                scope === "all"
                  ? `全员 ${headcount} 人 (9 个部门)`
                  : `${selectedDepts.length} 个部门 / ${headcount} 人`
              }
            />
            <Row
              label="评估模板"
              value={templates.find((t) => t.value === template)?.label || template}
            />
            <Row label="流程时长" value={`${totalDays} 天 (5 阶段)`} />
            <Row
              label="增强能力"
              value={
                [
                  linkStrategy && "战略目标关联",
                  aiValidate && "AI 评分校验",
                  autoUrge && "自动催办",
                ]
                  .filter(Boolean)
                  .join(" · ") || "无"
              }
            />

            <div className="mt-1 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50/60 p-2 text-xs text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              AI 预检通过:模板覆盖所有岗位序列,业务系统数据源已联通,可发布。
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              上一步
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => handleClose(false)}>
            取消
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)}>下一步</Button>
          ) : (
            <Button onClick={submit}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              创建并发布
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
