import { useMemo, useState } from "react";
import { CheckCircle2, Database, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface NewIndicatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFamily?: string; // 默认岗位族 key
}

// 三工光电 11 个真实部门（与主页 indicatorFamilies 对齐）
const FAMILY_OPTIONS = [
  { key: "rd",   name: "研发部",     prefix: "RD" },
  { key: "mfg",  name: "生产管理部", prefix: "MF" },
  { key: "qa",   name: "品质管理部", prefix: "QA" },
  { key: "pm",   name: "项目管理部", prefix: "PM" },
  { key: "sale", name: "营销中心",   prefix: "SL" },
  { key: "biz",  name: "商务部",     prefix: "BZ" },
  { key: "mkt",  name: "市场营销部", prefix: "MK" },
  { key: "scm",  name: "供应链",     prefix: "SC" },
  { key: "fin",  name: "财务中心",   prefix: "FN" },
  { key: "adm",  name: "综合管理部", prefix: "AD" },
  { key: "prop", name: "物业",       prefix: "PR" },
];

// 适用部门（与岗位族同一组）
const DEPT_OPTIONS = FAMILY_OPTIONS.map((f) => f.name);

// 数据来源（已联通的业务系统 + 手填）
const SOURCE_OPTIONS = [
  { value: "MES", label: "MES 制造执行", auto: true },
  { value: "ERP", label: "ERP / 财务", auto: true },
  { value: "QMS", label: "QMS 质量管理", auto: true },
  
  { value: "CRM", label: "CRM 客户系统", auto: true },
  { value: "PLM", label: "PLM 产品生命周期", auto: true },
  { value: "EHS", label: "EHS 安全环境", auto: true },
  { value: "OA", label: "OA 协同办公", auto: true },
  { value: "HR", label: "本系统-人事 AI", auto: true },
  { value: "manual", label: "上级评 / 手工填报", auto: false },
];

// 计分方式
const SCORE_METHODS = [
  { value: "linear", label: "线性达成（达成率 × 100）" },
  { value: "step", label: "阶梯式（达标 80 / 超标 100 / 未达 60）" },
  { value: "reverse", label: "反向（值越低越好，如 PPM、客诉）" },
  { value: "qualitative", label: "定性评估（A/B/C/D 四档）" },
];

// AI 推荐指标库（按 11 个部门，结合三工光电激光焊接/精密装备行业）
const AI_RECOMMENDATIONS: Record<string, Array<{
  name: string; unit: string; target: string; source: string; method: string; reason: string;
}>> = {
  rd: [
    { name: "激光器光路一次调试通过率", unit: "%", target: "≥ 92", source: "PLM", method: "linear", reason: "三工核心工艺，影响交付节拍" },
    { name: "新产品 NPI 立项→量产周期", unit: "月", target: "≤ 9", source: "PLM", method: "reverse", reason: "对标行业 12 个月" },
    { name: "BOM 物料标准化率", unit: "%", target: "≥ 75", source: "PLM", method: "linear", reason: "降本核心抓手" },
    { name: "DFMEA 评审覆盖率", unit: "%", target: "100", source: "PLM", method: "linear", reason: "质量前置" },
  ],
  mfg: [
    { name: "OEE 设备综合效率", unit: "%", target: "≥ 78", source: "MES", method: "linear", reason: "对标行业 75%" },
    { name: "订单交付准时率", unit: "%", target: "≥ 98", source: "MES", method: "linear", reason: "客户履约关键" },
    { name: "工时利用率", unit: "%", target: "≥ 85", source: "MES", method: "linear", reason: "人效核心" },
    { name: "单台制造工时", unit: "h", target: "下降 8%", source: "MES", method: "reverse", reason: "降本指标" },
  ],
  qa: [
    { name: "激光焊接首件合格率", unit: "%", target: "≥ 96", source: "QMS", method: "linear", reason: "三工标志性工艺指标" },
    { name: "精密装配千件不良 (PPM)", unit: "PPM", target: "≤ 320", source: "QMS", method: "reverse", reason: "AI 推荐，行业先进 280" },
    { name: "客户投诉响应时长", unit: "h", target: "≤ 4", source: "QMS", method: "reverse", reason: "客户满意度关键" },
    { name: "供应商来料合格率", unit: "%", target: "≥ 98", source: "QMS", method: "linear", reason: "源头质量管控" },
  ],
  pm: [
    { name: "重点项目里程碑达成率", unit: "%", target: "100", source: "OA", method: "linear", reason: "战略项目关键" },
    { name: "项目预算执行偏差", unit: "%", target: "≤ 5", source: "ERP", method: "reverse", reason: "成本管控" },
    { name: "项目交付准时率", unit: "%", target: "≥ 95", source: "OA", method: "linear", reason: "客户履约" },
  ],
  sale: [
    { name: "大客户渗透率（新能源/3C）", unit: "%", target: "≥ 35", source: "CRM", method: "linear", reason: "三工战略客户结构" },
    { name: "订单回款及时率", unit: "%", target: "≥ 92", source: "ERP", method: "linear", reason: "现金流关键" },
    { name: "新客户开发数", unit: "家", target: "≥ 35", source: "CRM", method: "linear", reason: "—" },
    { name: "客户满意度 NPS", unit: "分", target: "≥ 90", source: "CRM", method: "linear", reason: "客户保留率指标" },
  ],
  biz: [
    { name: "投标响应时长", unit: "天", target: "≤ 3", source: "CRM", method: "reverse", reason: "商机响应速度" },
    { name: "投标中标率", unit: "%", target: "≥ 45", source: "CRM", method: "linear", reason: "AI 基于历史数据测算" },
    { name: "合同评审通过率", unit: "%", target: "≥ 95", source: "OA", method: "linear", reason: "合规风控" },
  ],
  mkt: [
    { name: "线索转化率", unit: "%", target: "≥ 18", source: "CRM", method: "linear", reason: "营销 ROI 核心" },
    { name: "品牌曝光增长", unit: "%", target: "≥ 30", source: "manual", method: "linear", reason: "品牌建设" },
    { name: "展会有效线索数", unit: "条", target: "≥ 200", source: "CRM", method: "linear", reason: "B2B 主渠道" },
  ],
  scm: [
    { name: "关键物料齐套率", unit: "%", target: "≥ 95", source: "ERP", method: "linear", reason: "保障生产节拍" },
    { name: "采购成本下降率", unit: "%", target: "≥ 5", source: "ERP", method: "linear", reason: "降本核心" },
    { name: "库存周转天数", unit: "天", target: "≤ 60", source: "ERP", method: "reverse", reason: "运营效率" },
  ],
  fin: [
    { name: "费用预算执行偏差", unit: "%", target: "≤ 5", source: "ERP", method: "reverse", reason: "财务管控" },
    { name: "月结关账及时率", unit: "%", target: "100", source: "ERP", method: "linear", reason: "财务规范" },
    { name: "应收账款周转天数", unit: "天", target: "≤ 75", source: "ERP", method: "reverse", reason: "现金流管控" },
  ],
  adm: [
    { name: "招聘到岗及时率", unit: "%", target: "≥ 90", source: "HR", method: "linear", reason: "本系统-招聘助手联动" },
    { name: "关键岗位人才储备覆盖率", unit: "%", target: "≥ 80", source: "HR", method: "linear", reason: "继任管理" },
    { name: "员工培训完成率", unit: "%", target: "≥ 95", source: "HR", method: "linear", reason: "本系统-培训助手联动" },
    { name: "OA 工单处理及时率", unit: "%", target: "≥ 95", source: "OA", method: "linear", reason: "服务效率" },
  ],
  prop: [
    { name: "园区安全巡检覆盖率", unit: "%", target: "100", source: "EHS", method: "linear", reason: "安全合规底线" },
    { name: "设施报修响应时长", unit: "h", target: "≤ 2", source: "OA", method: "reverse", reason: "员工服务" },
    { name: "园区能耗下降率", unit: "%", target: "≥ 3", source: "EHS", method: "linear", reason: "降本与 ESG" },
  ],
};

export function NewIndicatorDialog({ open, onOpenChange, defaultFamily = "mfg" }: NewIndicatorDialogProps) {
  const [mode, setMode] = useState<"manual" | "ai">("ai");
  const [family, setFamily] = useState(defaultFamily);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [unit, setUnit] = useState("%");
  const [target, setTarget] = useState("");
  const [weight, setWeight] = useState("10");
  const [source, setSource] = useState("MES");
  const [method, setMethod] = useState("linear");
  const [depts, setDepts] = useState<string[]>(["生产管理部"]);
  const [autoFetch, setAutoFetch] = useState(true);
  const [aiValidate, setAiValidate] = useState(true);
  const [pickedAi, setPickedAi] = useState<number | null>(null);

  const familyMeta = FAMILY_OPTIONS.find((f) => f.key === family)!;
  const sourceMeta = SOURCE_OPTIONS.find((s) => s.value === source)!;
  const aiList = AI_RECOMMENDATIONS[family] || [];

  // 模拟生成下一个编码
  const nextCode = useMemo(() => {
    const seq = String(Math.floor(Math.random() * 90) + 10).padStart(3, "0");
    return `${familyMeta.prefix}-${seq}`;
  }, [familyMeta]);

  const applyAiPick = (i: number) => {
    const r = aiList[i];
    setPickedAi(i);
    setName(r.name);
    setUnit(r.unit);
    setTarget(r.target);
    setSource(r.source);
    setMethod(r.method);
  };

  const reset = () => {
    setMode("ai");
    setName(""); setDesc(""); setUnit("%"); setTarget(""); setWeight("10");
    setSource("MES"); setMethod("linear"); setDepts(["智能装备事业部"]);
    setAutoFetch(true); setAiValidate(true); setPickedAi(null);
  };

  const handleSubmit = () => {
    if (!name.trim() || !target.trim()) {
      toast.error("请填写指标名称和目标值");
      return;
    }
    toast.success(`已新增指标『${name}』· 编码 ${nextCode} · 已加入 ${familyMeta.name} 指标库`);
    reset();
    onOpenChange(false);
  };

  const toggleDept = (d: string) => {
    setDepts((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增绩效指标</DialogTitle>
          <DialogDescription>
            将新指标加入指标库，可被考核周期模板引用。AI 已结合三工光电激光焊接 / 精密装备行业基准提供推荐。
          </DialogDescription>
          <div className="mt-1 rounded-md border border-blue-200 bg-blue-50/60 px-3 py-2 text-[11px] text-blue-900">
            💡 新增的指标会加入【配置中心 · 指标库】，可被任意考核周期引用
          </div>
        </DialogHeader>

        {/* 模式切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("ai")}
            className={cn(
              "flex-1 rounded-lg border p-3 text-left transition-colors",
              mode === "ai" ? "border-primary bg-primary-soft/40" : "border-border hover:bg-muted/40",
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">AI 推荐指标</span>
              <Badge variant="outline" className="ml-auto text-[10px]">推荐</Badge>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              基于行业基准 + 三工岗位族，从 {aiList.length} 项备选中挑选
            </div>
          </button>
          <button
            onClick={() => { setMode("manual"); setPickedAi(null); }}
            className={cn(
              "flex-1 rounded-lg border p-3 text-left transition-colors",
              mode === "manual" ? "border-primary bg-primary-soft/40" : "border-border hover:bg-muted/40",
            )}
          >
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">手工创建指标</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">完全自定义指标名称、目标与来源</div>
          </button>
        </div>

        {/* Step 1：所属岗位族 + 编码 */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">所属岗位族</Label>
            <Select value={family} onValueChange={(v) => { setFamily(v); setPickedAi(null); }}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FAMILY_OPTIONS.map((f) => (
                  <SelectItem key={f.key} value={f.key}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">指标编码（自动生成）</Label>
            <Input value={nextCode} disabled className="h-9 font-mono" />
          </div>
        </div>

        {/* AI 推荐列表 */}
        {mode === "ai" && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI 为「{familyMeta.name}」推荐的指标（结合三工光电业务）
            </div>
            <div className="grid gap-2">
              {aiList.map((r, i) => (
                <button
                  key={r.name}
                  onClick={() => applyAiPick(i)}
                  className={cn(
                    "flex items-start gap-3 rounded-md border bg-background p-2.5 text-left transition-colors",
                    pickedAi === i ? "border-primary ring-1 ring-primary/30" : "border-border hover:bg-muted/40",
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border",
                    pickedAi === i ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
                  )}>
                    {pickedAi === i && <CheckCircle2 className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{r.name}</span>
                      <Badge variant="outline" className="text-[10px]">目标 {r.target} {r.unit}</Badge>
                      <Badge variant="outline" className="bg-primary-soft text-primary border-primary/20 text-[10px]">
                        {SOURCE_OPTIONS.find((s) => s.value === r.source)?.label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{r.reason}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2：基础信息 */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">指标名称 <span className="text-destructive">*</span></Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：激光焊接首件合格率"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">指标说明</Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="说明该指标的统计口径、计算公式与考核场景"
              rows={2}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">单位</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="% / PPM / 件" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">目标值 <span className="text-destructive">*</span></Label>
              <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="≥ 96" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">默认权重 (%)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9" />
            </div>
          </div>
        </div>

        {/* Step 3：数据来源 + 计分方式 */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">数据来源</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label} {s.auto && "· 已联通"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sourceMeta.auto && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                <Database className="h-3 w-3" />
                AI 将每日自动从该系统抓取数据
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">计分方式</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SCORE_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Step 4：适用部门 */}
        <div className="space-y-1.5">
          <Label className="text-xs">适用部门（可多选）</Label>
          <div className="flex flex-wrap gap-1.5">
            {DEPT_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDept(d)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  depts.includes(d)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Step 5：高级开关 */}
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <Label className="text-xs font-medium">自动抓取业务数据</Label>
              <div className="text-[11px] text-muted-foreground">每日 0 点从 {sourceMeta.label} 同步达成值</div>
            </div>
            <Switch checked={autoFetch} onCheckedChange={setAutoFetch} disabled={!sourceMeta.auto} />
          </div>
          <div className="flex items-start justify-between gap-3 border-t pt-2">
            <div className="flex-1">
              <Label className="text-xs font-medium">AI 评分校验</Label>
              <div className="text-[11px] text-muted-foreground">考核时 AI 自动比对业务数据与上级评分，偏差 ≥10 分预警</div>
            </div>
            <Switch checked={aiValidate} onCheckedChange={setAiValidate} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant="outline" onClick={() => toast.success("已保存为草稿")}>保存草稿</Button>
          <Button onClick={handleSubmit}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            创建并加入指标库
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
