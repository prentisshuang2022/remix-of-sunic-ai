/**
 * 新增规则抽屉 — 3 步骤引导 HR 创建自动化规则
 * [BACKEND] AI 解析由后端 API 提供，当前使用 mock
 */
import { useState, useCallback, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sparkles, Check, X, ChevronRight, Upload, AlertTriangle,
  CalendarIcon, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AttendanceRule } from "@/mocks/attendance";

/* ─── 类型 ─── */

interface ParsedRule {
  name: string;
  category: string;
  iconColorKey: string;
  campus: string[];
  position: string[];
  employeeScope: "all" | "specific";
  triggerField: string;
  triggerOp: string;
  triggerValue: number;
  triggerUnit: string;
  actions: { type: string; amount: string; frequency: string; condition?: string }[];
  secondaryAction?: { type: string; target: string; period: string };
  impactEmployees: number;
  impactTriggers: number;
  impactAmount: number;
  description: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRuleCreated: (rule: AttendanceRule) => void;
}

/* ─── 常量 ─── */

const CATEGORIES = ["考勤异常", "加班费", "餐补", "调休", "扣款", "请假", "其他"];

const ICON_COLORS: Record<string, { iconColor: string; iconBg: string; icon: string }> = {
  cyan:   { iconColor: "text-teal-600",   iconBg: "bg-teal-50",   icon: "Repeat2" },
  orange: { iconColor: "text-orange-600", iconBg: "bg-orange-50", icon: "Coffee" },
  purple: { iconColor: "text-violet-600", iconBg: "bg-violet-50", icon: "Moon" },
  blue:   { iconColor: "text-blue-600",   iconBg: "bg-blue-50",   icon: "Briefcase" },
  red:    { iconColor: "text-red-600",    iconBg: "bg-red-50",    icon: "AlertTriangle" },
  gray:   { iconColor: "text-gray-600",   iconBg: "bg-gray-50",   icon: "Repeat2" },
};

const EXAMPLES = [
  { label: "生产岗周末加班 2 倍工资计算", text: "生产岗周末加班按 2 倍基本工资计算加班费" },
  { label: "病假连续超过 3 天需提交医院证明", text: "员工病假连续超过 3 天，需提交三甲医院证明，否则按事假处理" },
  { label: "武汉员工夏季高温补贴 ¥200/月", text: "武汉总部员工，6-8 月期间每月发放高温补贴 ¥200" },
];

/* ─── Mock AI 解析 ─── */

function parseRuleMock(input: string): ParsedRule {
  if (input.includes("迟到")) {
    return {
      name: "行政岗迟到累计扣款规则",
      category: "扣款",
      iconColorKey: "red",
      campus: ["武汉总部"],
      position: ["行政岗"],
      employeeScope: "all",
      triggerField: "迟到次数",
      triggerOp: "大于等于",
      triggerValue: 3,
      triggerUnit: "次/月",
      actions: [{ type: "扣款", amount: "¥50", frequency: "每次触发", condition: "从第 4 次起" }],
      secondaryAction: { type: "取消", target: "全勤奖", period: "当月" },
      impactEmployees: 12,
      impactTriggers: 3,
      impactAmount: 150,
      description: "行政岗员工月度迟到累计超过 3 次，从第 4 次起每次扣款 ¥50，并取消当月全勤奖。",
    };
  }
  if (input.includes("加班")) {
    return {
      name: "生产岗周末加班费计算",
      category: "加班费",
      iconColorKey: "purple",
      campus: ["鄂州工厂"],
      position: ["生产岗"],
      employeeScope: "all",
      triggerField: "加班日类型",
      triggerOp: "等于",
      triggerValue: 1,
      triggerUnit: "周末",
      actions: [{ type: "计算加班费", amount: "2倍基本工资", frequency: "每次触发" }],
      impactEmployees: 28,
      impactTriggers: 15,
      impactAmount: 4200,
      description: "生产岗员工周末加班按 2 倍基本工资计算加班费。",
    };
  }
  if (input.includes("餐补") || input.includes("补贴")) {
    return {
      name: "高温补贴自动发放",
      category: "餐补",
      iconColorKey: "orange",
      campus: ["武汉总部"],
      position: ["行政岗", "研发岗", "销售岗"],
      employeeScope: "all",
      triggerField: "当前月份",
      triggerOp: "属于",
      triggerValue: 6,
      triggerUnit: "6-8月",
      actions: [{ type: "发放补贴", amount: "¥200", frequency: "每月" }],
      impactEmployees: 35,
      impactTriggers: 3,
      impactAmount: 7000,
      description: "武汉总部员工 6-8 月期间每月自动发放高温补贴 ¥200。",
    };
  }
  // 通用模板
  return {
    name: "自定义规则",
    category: "其他",
    iconColorKey: "gray",
    campus: ["武汉总部", "鄂州工厂"],
    position: ["行政岗"],
    employeeScope: "all",
    triggerField: "自定义条件",
    triggerOp: "等于",
    triggerValue: 1,
    triggerUnit: "次",
    actions: [{ type: "自定义动作", amount: "待配置", frequency: "每次触发" }],
    impactEmployees: 0,
    impactTriggers: 0,
    impactAmount: 0,
    description: input.slice(0, 80),
  };
}

/* ─── 组件 ─── */

export default function AddRuleDrawer({ open, onOpenChange, onRuleCreated }: Props) {
  const [step, setStep] = useState(1);
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  // Step 1
  const [ruleText, setRuleText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 2
  const [parsed, setParsed] = useState<ParsedRule | null>(null);
  const [parsing, setParsing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editColorKey, setEditColorKey] = useState("");

  // Step 3
  const [effectMode, setEffectMode] = useState("future");
  const [effectDate, setEffectDate] = useState<Date | undefined>(new Date(2026, 4, 1));
  const [ruleEnabled, setRuleEnabled] = useState(true);
  const [notifyEmployee, setNotifyEmployee] = useState(false);
  const [notifyManager, setNotifyManager] = useState(false);
  const [notifyHR, setNotifyHR] = useState(true);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setDirty(false);
      setRuleText("");
      setSelectedCategories([]);
      setParsed(null);
      setEffectMode("future");
      setRuleEnabled(true);
      setNotifyEmployee(false);
      setNotifyManager(false);
      setNotifyHR(true);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    if (dirty) {
      setConfirmClose(true);
    } else {
      onOpenChange(false);
    }
  }, [dirty, onOpenChange]);

  const toggleCategory = (c: string) => {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
    setDirty(true);
  };

  const handleNext1 = async () => {
    setParsing(true);
    setDirty(true);
    // Simulate AI delay
    await new Promise((r) => setTimeout(r, 1800));
    const result = parseRuleMock(ruleText);
    setParsed(result);
    setEditName(result.name);
    setEditCategory(result.category);
    setEditColorKey(result.iconColorKey);
    setParsing(false);
    setStep(2);
  };

  const handleConfirm = () => {
    if (!parsed) return;
    const colors = ICON_COLORS[editColorKey] || ICON_COLORS.gray;
    const newRule: AttendanceRule = {
      id: `R${Date.now()}`,
      icon: colors.icon,
      iconColor: colors.iconColor,
      iconBg: colors.iconBg,
      category: editCategory,
      name: editName,
      description: parsed.description,
      enabled: ruleEnabled,
    };
    onRuleCreated(newRule);
    onOpenChange(false);
    toast.success("规则已创建并生效", {
      description: `"${editName}" 已添加到规则引擎`,
    });
  };

  /* ─── 步骤指示器 ─── */
  const StepIndicator = () => (
    <div className="flex items-center gap-2 py-4">
      {[
        { n: 1, label: "描述制度" },
        { n: 2, label: "AI解析" },
        { n: 3, label: "确认生效" },
      ].map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          {i > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                step === s.n
                  ? "bg-primary text-primary-foreground"
                  : step > s.n
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {step > s.n ? <Check className="h-3.5 w-3.5" /> : s.n}
            </span>
            <span
              className={cn(
                "text-sm",
                step === s.n ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  /* ─── Step 1 ─── */
  const Step1 = () => (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-24">
      {/* 提示卡 */}
      <div className="ai-card flex items-start gap-2.5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "hsl(var(--ai))" }} />
        <p className="text-sm text-muted-foreground leading-relaxed">
          用中文描述一条考勤或薪资制度，越具体越好。
          AI 会自动识别规则类型、触发条件和计算方式。
        </p>
      </div>

      {/* 分类 */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">规则分类（可选，帮助 AI 更准确解析）</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => toggleCategory(c)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                selectedCategories.includes(c)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 输入框 */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">制度描述</Label>
        <Textarea
          rows={8}
          value={ruleText}
          onChange={(e) => { setRuleText(e.target.value); setDirty(true); }}
          placeholder="例如：武汉总部行政岗员工，月度迟到累计超过 3 次，从第 4 次起每次扣款 ¥50，并取消当月全勤奖。"
          className="resize-none rounded-xl text-sm"
        />
      </div>

      {/* 示例 */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">不知道怎么写？试试这些示例 →</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setRuleText(ex.text); setDirty(true); }}
              className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* 文件上传 */}
      <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center">
        <Upload className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          或上传公司制度文档（PDF/Word），AI 自动提取规则条款
        </p>
        <p className="text-xs text-muted-foreground">支持 .pdf .docx 格式，最大 10MB</p>
      </div>
    </div>
  );

  /* ─── Step 2 ─── */
  const Step2 = () => {
    if (parsing || !parsed) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <Sparkles className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--ai))" }} />
          <p className="text-sm font-medium">AI 正在解析您的规则...</p>
          <div className="w-full max-w-xs space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-24">
        {/* 成功提示 */}
        <div className="flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ backgroundColor: "hsl(var(--success-soft))", borderColor: "hsl(var(--success) / 0.4)" }}>
          <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "hsl(var(--success))" }} />
          <span className="text-muted-foreground">
            AI 已识别为 1 条规则，请确认配置是否准确。所有字段均可手动调整。
          </span>
        </div>

        {/* 区块 1: 基本信息 */}
        <Section title="规则基本信息">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">规则名称</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">规则分类</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">图标色</Label>
              <div className="flex gap-2">
                {Object.entries(ICON_COLORS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setEditColorKey(key)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition-all",
                      val.iconBg,
                      editColorKey === key ? "border-primary scale-110" : "border-transparent",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 区块 2: 适用范围 */}
        <Section title="适用范围" subtitle="这条规则对谁生效？">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-12 shrink-0">厂区：</span>
              <div className="flex flex-wrap gap-1.5">
                {parsed.campus.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {c} <X className="h-3 w-3 cursor-pointer" />
                  </span>
                ))}
                <button className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:border-primary/50">+ 添加</button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-12 shrink-0">岗位：</span>
              <div className="flex flex-wrap gap-1.5">
                {parsed.position.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {p} <X className="h-3 w-3 cursor-pointer" />
                  </span>
                ))}
                <button className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:border-primary/50">+ 添加</button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-12 shrink-0">员工：</span>
              <span className="text-xs">全部员工</span>
            </div>
          </div>
        </Section>

        {/* 区块 3: 触发条件 */}
        <Section title="触发条件" subtitle="什么情况下触发？">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
            <Select defaultValue={parsed.triggerField}>
              <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={parsed.triggerField}>{parsed.triggerField}</SelectItem>
                <SelectItem value="迟到次数">迟到次数</SelectItem>
                <SelectItem value="早退次数">早退次数</SelectItem>
                <SelectItem value="缺卡次数">缺卡次数</SelectItem>
                <SelectItem value="加班时长">加班时长</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue={parsed.triggerOp}>
              <SelectTrigger className="h-8 w-auto min-w-[90px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="大于等于">大于等于</SelectItem>
                <SelectItem value="等于">等于</SelectItem>
                <SelectItem value="大于">大于</SelectItem>
                <SelectItem value="小于">小于</SelectItem>
                <SelectItem value="属于">属于</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              defaultValue={parsed.triggerValue}
              className="h-8 w-16 text-xs text-center"
            />
            <Select defaultValue={parsed.triggerUnit}>
              <SelectTrigger className="h-8 w-auto min-w-[70px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={parsed.triggerUnit}>{parsed.triggerUnit}</SelectItem>
                <SelectItem value="次/月">次/月</SelectItem>
                <SelectItem value="小时/月">小时/月</SelectItem>
                <SelectItem value="天">天</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button className="mt-2 text-xs text-muted-foreground hover:text-foreground">+ 添加条件（AND）</button>
          <button className="ml-4 mt-2 text-xs text-muted-foreground hover:text-foreground">+ 添加条件（OR）</button>
        </Section>

        {/* 区块 4: 执行动作 */}
        <Section title="执行动作" subtitle="触发后执行什么？">
          <div className="space-y-2">
            {parsed.actions.map((a, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground">动作 {i + 1}：</span>
                <Select defaultValue={a.type}>
                  <SelectTrigger className="h-8 w-auto min-w-[80px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={a.type}>{a.type}</SelectItem>
                    <SelectItem value="扣款">扣款</SelectItem>
                    <SelectItem value="计算加班费">计算加班费</SelectItem>
                    <SelectItem value="发放补贴">发放补贴</SelectItem>
                  </SelectContent>
                </Select>
                <Input defaultValue={a.amount} className="h-8 w-20 text-xs" />
                <Select defaultValue={a.frequency}>
                  <SelectTrigger className="h-8 w-auto min-w-[90px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="每次触发">每次触发</SelectItem>
                    <SelectItem value="每月">每月</SelectItem>
                    <SelectItem value="每日">每日</SelectItem>
                  </SelectContent>
                </Select>
                {a.condition && (
                  <span className="text-xs text-muted-foreground">条件：{a.condition}</span>
                )}
              </div>
            ))}
            {parsed.secondaryAction && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground">动作 2：</span>
                <Select defaultValue={parsed.secondaryAction.type}>
                  <SelectTrigger className="h-8 w-auto min-w-[70px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={parsed.secondaryAction.type}>{parsed.secondaryAction.type}</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue={parsed.secondaryAction.target}>
                  <SelectTrigger className="h-8 w-auto min-w-[70px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={parsed.secondaryAction.target}>{parsed.secondaryAction.target}</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue={parsed.secondaryAction.period}>
                  <SelectTrigger className="h-8 w-auto min-w-[70px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={parsed.secondaryAction.period}>{parsed.secondaryAction.period}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <button className="mt-2 text-xs text-muted-foreground hover:text-foreground">+ 添加动作</button>
        </Section>

        {/* 区块 5: 影响范围预览 */}
        <div className="rounded-xl bg-muted/50 p-4 space-y-1">
          <p className="text-sm font-medium">影响范围预览</p>
          <p className="text-xs text-muted-foreground">预计影响 <b className="text-foreground">{parsed.impactEmployees}</b> 名员工</p>
          <p className="text-xs text-muted-foreground">本月预计触发 <b className="text-foreground">~{parsed.impactTriggers}</b> 次</p>
          <p className="text-xs text-muted-foreground">预计月度金额 <b className="text-foreground">~¥{parsed.impactAmount}</b></p>
          <button className="mt-1 text-xs text-primary hover:underline">查看受影响员工列表 →</button>
        </div>
      </div>
    );
  };

  /* ─── Step 3 ─── */
  const Step3 = () => {
    if (!parsed) return null;
    const colors = ICON_COLORS[editColorKey] || ICON_COLORS.gray;

    return (
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-24">
        {/* 规则预览卡 */}
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", colors.iconBg)}>
            <Sparkles className={cn("h-5 w-5", colors.iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{editCategory}</span>
              <span className="text-sm font-semibold">{editName}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{parsed.description}</p>
          </div>
          <Switch checked={ruleEnabled} onCheckedChange={setRuleEnabled} />
        </div>

        {/* 生效设置 */}
        <Section title="生效设置">
          <RadioGroup value={effectMode} onValueChange={setEffectMode} className="space-y-3">
            <div className="flex items-start gap-2">
              <RadioGroupItem value="recalc" id="eff-recalc" className="mt-0.5" />
              <Label htmlFor="eff-recalc" className="text-sm font-normal">立即生效，并对本月已有数据重新计算</Label>
            </div>
            <div className="flex items-start gap-2">
              <RadioGroupItem value="future" id="eff-future" className="mt-0.5" />
              <Label htmlFor="eff-future" className="text-sm font-normal">立即生效，仅对未来数据生效</Label>
            </div>
            <div className="flex items-start gap-2">
              <RadioGroupItem value="scheduled" id="eff-scheduled" className="mt-0.5" />
              <Label htmlFor="eff-scheduled" className="text-sm font-normal">指定日期生效</Label>
            </div>
          </RadioGroup>

          {effectMode === "scheduled" && (
            <div className="mt-2 ml-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-xs">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {effectDate ? effectDate.toLocaleDateString("zh-CN") : "选择日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={effectDate}
                    onSelect={setEffectDate}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {effectMode === "recalc" && (
            <div className="warn-banner mt-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "hsl(var(--warning))" }} />
              <div className="space-y-1">
                <span className="text-muted-foreground">
                  重新计算会覆盖本月已核算的 {parsed.impactEmployees} 名员工数据，
                  原记录将被标记为"已作废"并保留审计日志。此操作不可撤销，建议先导出当前月报存档。
                </span>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 mt-1">
                  ↓ 导出当前月报
                </Button>
              </div>
            </div>
          )}
        </Section>

        {/* 通知设置 */}
        <Section title="通知设置">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="notify-emp" checked={notifyEmployee} onCheckedChange={(v) => setNotifyEmployee(!!v)} />
              <Label htmlFor="notify-emp" className="text-sm font-normal">规则触发时通知员工本人（微信/钉钉推送）</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="notify-mgr" checked={notifyManager} onCheckedChange={(v) => setNotifyManager(!!v)} />
              <Label htmlFor="notify-mgr" className="text-sm font-normal">规则触发时通知员工直属上级</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="notify-hr" checked={notifyHR} onCheckedChange={(v) => setNotifyHR(!!v)} />
              <Label htmlFor="notify-hr" className="text-sm font-normal">触发时记录到 HR 待办列表</Label>
            </div>
          </div>
        </Section>
      </div>
    );
  };

  /* ─── 底部栏 ─── */
  const Footer = () => (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t bg-card px-6 py-4">
      {step === 1 ? (
        <>
          <Button variant="ghost" onClick={handleClose}>取消</Button>
          <Button
            disabled={!ruleText.trim() || parsing}
            onClick={handleNext1}
            className="gap-1.5"
          >
            {parsing ? <><Loader2 className="h-4 w-4 animate-spin" />AI 解析中...</> : <>下一步：AI 解析 <ChevronRight className="h-4 w-4" /></>}
          </Button>
        </>
      ) : step === 2 ? (
        <>
          <Button variant="ghost" onClick={() => setStep(1)}>← 上一步</Button>
          <div className="flex gap-2">
            <Button variant="outline">保存为草稿</Button>
            <Button onClick={() => setStep(3)} className="gap-1.5">
              下一步：确认生效 <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={() => setStep(2)}>← 上一步</Button>
          <Button onClick={handleConfirm} className="gap-1.5">
            确认启用规则
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(true); }}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[560px] p-0 flex flex-col"
          onEscapeKeyDown={(e) => { if (dirty) { e.preventDefault(); setConfirmClose(true); } }}
        >
          {/* 顶部固定 */}
          <div className="shrink-0 border-b px-6 pt-5 pb-2">
            <SheetHeader className="space-y-0.5">
              <SheetTitle className="text-base">新增规则</SheetTitle>
              <SheetDescription className="text-xs">
                用自然语言描述公司制度，AI 帮你翻译成可执行规则
              </SheetDescription>
            </SheetHeader>
            <StepIndicator />
          </div>

          {/* 内容区 */}
          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto pt-4">
              {step === 1 && <Step1 />}
              {step === 2 && <Step2 />}
              {step === 3 && <Step3 />}
            </div>
            <Footer />
          </div>
        </SheetContent>
      </Sheet>

      {/* 关闭确认 */}
      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认放弃？</AlertDialogTitle>
            <AlertDialogDescription>
              您有未保存的规则配置，关闭后内容将丢失。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>继续编辑</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmClose(false); setDirty(false); onOpenChange(false); }}>
              确认放弃
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ─── 小节组件 ─── */
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5 rounded-xl border bg-card p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
