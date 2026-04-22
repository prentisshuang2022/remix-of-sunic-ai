import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileUp,
  Library,
  History,
  Type,
  Zap,
  Sun,
  Shield,
  Globe,
  RefreshCcw,
  Save,
  Send,
  X,
  FileText,
  Loader2,
  AlertTriangle,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SOURCE_OPTIONS = [
  { key: "topic", label: "输入主题关键词", desc: "AI 根据主题自动生成", icon: Type },
  { key: "kb", label: "从题库选题", desc: "复用现有题库分类", icon: Library },
  { key: "upload", label: "上传培训材料", desc: "AI 抽取 SOP / PDF 内容", icon: FileUp },
  { key: "history", label: "复用历史试卷", desc: "基于既有试卷改造", icon: History },
];

const KB_CATEGORIES = [
  { key: "laser", label: "激光设备操作", icon: Zap, count: 412 },
  { key: "solar", label: "太阳能组件", icon: Sun, count: 286 },
  { key: "qa", label: "质量与合规", icon: Shield, count: 324 },
  { key: "trade", label: "外贸与销售", icon: Globe, count: 262 },
];

const HISTORY_PAPERS = [
  { id: "P-1284", title: "激光打标机操作规范", date: "11-13", count: 40, score: 91.4 },
  { id: "P-1283", title: "ISO9001 质量意识复训", date: "11-12", count: 40, score: 78.6 },
  { id: "P-1281", title: "太阳能组件装配 SOP", date: "11-08", count: 35, score: 79.3 },
];

const DEPARTMENTS = ["生产管理部", "品质管理部", "供应链", "研发部", "营销中心", "商务部", "综合管理部"];
const SITES = ["黄龙山基地", "鄂州基地", "总部"];

interface QuestionPreview {
  id: number;
  type: "单选" | "多选" | "判断" | "简答";
  difficulty: "易" | "中" | "难";
  text: string;
  options?: string[];
  answer: string;
}

const SAMPLE_QUESTIONS: QuestionPreview[] = [
  { id: 1, type: "单选", difficulty: "易", text: "激光划片机开机前必须确认的安全防护项不包括以下哪一项？", options: ["A. 激光防护门已闭合", "B. 紧急停止按钮可正常按下", "C. 操作员佩戴防护眼镜", "D. 设备已连接互联网"], answer: "D" },
  { id: 2, type: "单选", difficulty: "中", text: "以下哪类材料属于光纤激光器加工的高反射风险材料？", options: ["A. 不锈钢板", "B. 紫铜板", "C. 钛合金板", "D. 普通碳钢"], answer: "B" },
  { id: 3, type: "多选", difficulty: "中", text: "激光设备日常点检需检查项包括（多选）：", options: ["A. 冷却水温度与流量", "B. 激光头镜片洁净度", "C. 急停按钮功能", "D. 工件装夹稳固性"], answer: "A, B, C, D" },
  { id: 4, type: "判断", difficulty: "易", text: "划片机运行过程中可以打开防护门取放工件以提高效率。", answer: "错误" },
  { id: 5, type: "单选", difficulty: "难", text: "晶圆划片精度异常（>±5μm）的最可能原因是？", options: ["A. 主轴跳动超差", "B. 工件清洁不到位", "C. 控制系统参数漂移", "D. 以上都有可能"], answer: "D" },
  { id: 6, type: "简答", difficulty: "中", text: "请简述激光设备发生异常停机时的标准应急处置流程（至少 4 步）。", answer: "AI 评分要点：1) 立即按急停 2) 切断激光电源 3) 通知主管/工艺工程师 4) 现场保护并填写异常记录单" },
];

type Step = 0 | 1 | 2 | 3;

interface PaperConfig {
  source: string;
  topic: string;
  kbSelected: string[];
  historyId: string;
  uploadedFile: string;
  title: string;
  dept: string;
  sites: string[];
  audienceCount: number;
  duration: number;
  difficulty: number; // 1-5
  total: number;
  typeMix: { single: number; multi: number; judge: number; essay: number };
}

export function NewExamDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [questions, setQuestions] = useState<QuestionPreview[]>([]);
  const [config, setConfig] = useState<PaperConfig>({
    source: "topic",
    topic: "",
    kbSelected: [],
    historyId: "",
    uploadedFile: "",
    title: "",
    dept: "",
    sites: [],
    audienceCount: 32,
    duration: 60,
    difficulty: 3,
    total: 40,
    typeMix: { single: 24, multi: 10, judge: 6, essay: 0 },
  });

  const update = <K extends keyof PaperConfig>(k: K, v: PaperConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }));

  const reset = () => {
    setStep(0);
    setGenerating(false);
    setGenerated(false);
    setQuestions([]);
    setConfig({
      source: "topic",
      topic: "",
      kbSelected: [],
      historyId: "",
      uploadedFile: "",
      title: "",
      dept: "",
      sites: [],
      audienceCount: 32,
      duration: 60,
      difficulty: 3,
      total: 40,
      typeMix: { single: 24, multi: 10, judge: 6, essay: 0 },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canNext = () => {
    if (step === 0) {
      if (config.source === "topic") return config.topic.trim().length >= 2;
      if (config.source === "kb") return config.kbSelected.length > 0;
      if (config.source === "history") return !!config.historyId;
      if (config.source === "upload") return !!config.uploadedFile;
    }
    if (step === 1) return !!config.title && !!config.dept;
    if (step === 2) {
      const sum = config.typeMix.single + config.typeMix.multi + config.typeMix.judge + config.typeMix.essay;
      return sum === config.total;
    }
    return true;
  };

  const goNext = () => {
    if (step === 2) {
      // 生成
      setGenerating(true);
      setStep(3);
      setTimeout(() => {
        setGenerating(false);
        setGenerated(true);
        setQuestions(SAMPLE_QUESTIONS.slice(0, Math.min(6, config.total)));
      }, 1400);
      return;
    }
    setStep((s) => (s + 1) as Step);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1) as Step);

  const handlePublish = () => {
    toast.success(`试卷《${config.title}》已发布到钉钉，应考 ${config.audienceCount} 人`);
    handleClose();
  };

  const handleSaveTemplate = () => {
    toast.success(`已保存为模板：${config.title}`);
  };

  const replaceQuestion = (id: number) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id ? { ...q, text: q.text + "（已换题）", id: q.id + 100 } : q
      )
    );
    toast.success("已重新生成该题");
  };

  const adjustDifficulty = (delta: number) => {
    const next = Math.max(1, Math.min(5, config.difficulty + delta));
    update("difficulty", next);
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success(`难度已调整为「${["", "易", "易+", "中", "中+", "难"][next]}」并重新生成`);
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--ai))] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI 一键出卷
          </DialogTitle>
          <DialogDescription>
            4 步生成符合岗位要求的试卷，支持单题换题与一键调难度
          </DialogDescription>
          <Stepper step={step} />
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-5">
          {step === 0 && <StepSource config={config} update={update} />}
          {step === 1 && <StepBasic config={config} update={update} />}
          {step === 2 && <StepStructure config={config} update={update} />}
          {step === 3 && (
            <StepPreview
              config={config}
              questions={questions}
              generating={generating}
              generated={generated}
              onReplace={replaceQuestion}
              onAdjust={adjustDifficulty}
            />
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t flex-row sm:justify-between gap-2">
          <div className="text-xs text-muted-foreground self-center">
            {step < 3 && `第 ${step + 1} / 3 步`}
            {step === 3 && generated && (
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                已生成 {questions.length} 道预览题，完整 {config.total} 题已就绪
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={goBack} disabled={generating}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />上一步
              </Button>
            )}
            {step < 3 && (
              <Button size="sm" onClick={goNext} disabled={!canNext()}>
                {step === 2 ? (
                  <>
                    <Wand2 className="h-3.5 w-3.5 mr-1" />生成试卷
                  </>
                ) : (
                  <>下一步<ArrowRight className="h-3.5 w-3.5 ml-1" /></>
                )}
              </Button>
            )}
            {step === 3 && generated && (
              <>
                <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
                  <Save className="h-3.5 w-3.5 mr-1" />保存为模板
                </Button>
                <Button size="sm" onClick={handlePublish}>
                  <Send className="h-3.5 w-3.5 mr-1" />发布到钉钉
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps = ["选择素材", "基础信息", "题型结构", "生成预览"];
  return (
    <div className="flex items-center gap-2 mt-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className={cn(
            "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold border shrink-0",
            i < step && "bg-success text-success-foreground border-success",
            i === step && "bg-primary text-primary-foreground border-primary",
            i > step && "bg-background text-muted-foreground border-border",
          )}>
            {i < step ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
          </div>
          <span className={cn(
            "text-xs whitespace-nowrap",
            i === step ? "font-medium text-foreground" : "text-muted-foreground"
          )}>
            {s}
          </span>
          {i < steps.length - 1 && (
            <div className={cn("flex-1 h-px", i < step ? "bg-success" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  );
}

function StepSource({ config, update }: { config: PaperConfig; update: <K extends keyof PaperConfig>(k: K, v: PaperConfig[K]) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">题目素材来源</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {SOURCE_OPTIONS.map((s) => {
            const Icon = s.icon;
            const active = config.source === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => update("source", s.key)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <div className={cn(
                  "h-9 w-9 rounded-md flex items-center justify-center shrink-0",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 不同来源对应的输入区 */}
      {config.source === "topic" && (
        <div className="space-y-1.5">
          <Label className="text-xs">主题关键词</Label>
          <Textarea
            value={config.topic}
            onChange={(e) => update("topic", e.target.value)}
            placeholder="如：激光划片机安全操作 / 太阳能组件 EL 检测 / ISO9001 质量体系…"
            rows={3}
          />
          <div className="text-[11px] text-muted-foreground">建议描述具体场景，AI 将更精准匹配岗位知识图谱</div>
        </div>
      )}

      {config.source === "kb" && (
        <div className="space-y-1.5">
          <Label className="text-xs">选择题库分类（可多选）</Label>
          <div className="grid grid-cols-2 gap-2">
            {KB_CATEGORIES.map((k) => {
              const Icon = k.icon;
              const checked = config.kbSelected.includes(k.key);
              return (
                <label
                  key={k.key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                    checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      update(
                        "kbSelected",
                        checked
                          ? config.kbSelected.filter((x) => x !== k.key)
                          : [...config.kbSelected, k.key]
                      )
                    }
                  />
                  <Icon className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{k.label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{k.count} 题</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {config.source === "history" && (
        <div className="space-y-1.5">
          <Label className="text-xs">选择历史试卷复用</Label>
          <RadioGroup value={config.historyId} onValueChange={(v) => update("historyId", v)} className="space-y-1.5">
            {HISTORY_PAPERS.map((p) => (
              <label
                key={p.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md border cursor-pointer",
                  config.historyId === p.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                )}
              >
                <RadioGroupItem value={p.id} />
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground flex gap-2 mt-0.5">
                    <span className="font-mono">{p.id}</span>
                    <span>·</span>
                    <span>{p.count} 题</span>
                    <span>·</span>
                    <span>{p.date}</span>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 font-mono text-[10px]">
                  AVG {p.score}
                </Badge>
              </label>
            ))}
          </RadioGroup>
        </div>
      )}

      {config.source === "upload" && (
        <div className="space-y-1.5">
          <Label className="text-xs">上传培训材料</Label>
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => update("uploadedFile", "激光划片机操作手册_v3.2.pdf")}
          >
            {config.uploadedFile ? (
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  {config.uploadedFile}
                </div>
                <div className="text-[11px] text-muted-foreground">已识别 38 页内容 · AI 将基于该材料出题</div>
              </div>
            ) : (
              <>
                <FileUp className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                <div className="text-sm font-medium">点击或拖拽文件到此处</div>
                <div className="text-[11px] text-muted-foreground mt-1">支持 PDF / DOCX / PPTX，单文件 ≤ 50MB</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepBasic({ config, update }: { config: PaperConfig; update: <K extends keyof PaperConfig>(k: K, v: PaperConfig[K]) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">试卷名称 <span className="text-destructive">*</span></Label>
        <Input
          value={config.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="如：激光划片机安全操作复训"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">应考部门 <span className="text-destructive">*</span></Label>
          <Select value={config.dept} onValueChange={(v) => update("dept", v)}>
            <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">应考人数</Label>
          <Input
            type="number"
            value={config.audienceCount}
            onChange={(e) => update("audienceCount", parseInt(e.target.value || "0"))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">覆盖厂区</Label>
        <div className="flex flex-wrap gap-2">
          {SITES.map((s) => {
            const checked = config.sites.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() =>
                  update(
                    "sites",
                    checked ? config.sites.filter((x) => x !== s) : [...config.sites, s]
                  )
                }
                className={cn(
                  "px-3 py-1.5 rounded-md border text-xs transition-colors",
                  checked
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/40"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">考试时长（分钟）</Label>
          <Input
            type="number"
            value={config.duration}
            onChange={(e) => update("duration", parseInt(e.target.value || "0"))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">总题数</Label>
          <Input
            type="number"
            value={config.total}
            onChange={(e) => {
              const total = parseInt(e.target.value || "0");
              update("total", total);
              // 自动按比例分配
              update("typeMix", {
                single: Math.round(total * 0.6),
                multi: Math.round(total * 0.25),
                judge: Math.round(total * 0.15),
                essay: total - Math.round(total * 0.6) - Math.round(total * 0.25) - Math.round(total * 0.15),
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StepStructure({ config, update }: { config: PaperConfig; update: <K extends keyof PaperConfig>(k: K, v: PaperConfig[K]) => void }) {
  const { typeMix, total } = config;
  const sum = typeMix.single + typeMix.multi + typeMix.judge + typeMix.essay;
  const balanced = sum === total;

  const updateMix = (k: keyof typeof typeMix, v: number) => {
    update("typeMix", { ...typeMix, [k]: Math.max(0, v) });
  };

  const diffLabels = ["", "易", "易+", "中", "中+", "难"];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">题型结构</Label>
          <Badge variant="outline" className={cn(
            "font-mono text-[10px]",
            balanced ? "bg-success/10 text-success border-success/30" : "bg-warning/15 text-warning border-warning/30"
          )}>
            {sum} / {total} 题 {balanced ? "✓" : "需调整"}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: "single", label: "单选题", color: "primary" },
            { key: "multi", label: "多选题", color: "info" },
            { key: "judge", label: "判断题", color: "warning" },
            { key: "essay", label: "简答题（AI 评分 + 人工复核）", color: "ai" },
          ] as const).map((t) => (
            <div key={t.key} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{t.label}</span>
                <Badge variant="outline" className="font-mono text-[10px]">{typeMix[t.key]} 题</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateMix(t.key, typeMix[t.key] - 1)}>−</Button>
                <Input
                  type="number"
                  className="h-6 text-center"
                  value={typeMix[t.key]}
                  onChange={(e) => updateMix(t.key, parseInt(e.target.value || "0"))}
                />
                <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateMix(t.key, typeMix[t.key] + 1)}>+</Button>
              </div>
            </div>
          ))}
        </div>
        {!balanced && (
          <div className="mt-2 text-[11px] text-warning flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            题型合计 {sum} 与总题数 {total} 不一致
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">整体难度</Label>
          <Badge variant="outline" className="font-mono text-[10px]">
            {diffLabels[config.difficulty]}
          </Badge>
        </div>
        <Slider
          value={[config.difficulty]}
          onValueChange={(v) => update("difficulty", v[0])}
          min={1}
          max={5}
          step={1}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-mono">
          <span>易</span>
          <span>易+</span>
          <span>中</span>
          <span>中+</span>
          <span>难</span>
        </div>
      </div>

      <div className="rounded-md border bg-[hsl(var(--ai-soft))] border-[hsl(var(--ai))]/30 p-3 flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-[hsl(var(--ai))] mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground">
          <div className="font-medium text-foreground mb-0.5">AI 推荐</div>
          基于「{config.dept || "目标部门"}」过往考试数据，建议<b className="text-foreground"> 难度=中、单选 60%、多选 25%、判断 15%</b>，平均成绩可达 82 分以上。
        </div>
      </div>
    </div>
  );
}

function StepPreview({
  config,
  questions,
  generating,
  generated,
  onReplace,
  onAdjust,
}: {
  config: PaperConfig;
  questions: QuestionPreview[];
  generating: boolean;
  generated: boolean;
  onReplace: (id: number) => void;
  onAdjust: (delta: number) => void;
}) {
  if (generating) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--ai))] flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <Loader2 className="absolute inset-0 h-14 w-14 animate-spin text-primary/40" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-sm font-medium">AI 正在生成试卷…</div>
          <div className="text-xs text-muted-foreground">已读取材料 · 正在按题型与难度生成 {config.total} 道题目</div>
        </div>
        <div className="space-y-1.5 w-full max-w-sm text-[11px] text-muted-foreground">
          {[
            "✓ 解析素材关键概念",
            "✓ 匹配岗位知识图谱",
            "⏳ 按比例生成题目",
            "⏳ 校验答案与难度",
          ].map((s) => (
            <div key={s} className="flex items-center gap-2">
              {s.startsWith("✓") ? (
                <CheckCircle2 className="h-3 w-3 text-success" />
              ) : (
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
              )}
              <span>{s.slice(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!generated) return null;

  return (
    <div className="space-y-4">
      {/* 摘要卡 */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-base font-semibold">{config.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {config.dept} · {config.sites.join(" / ") || "全厂区"} · 应考 {config.audienceCount} 人
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => onAdjust(-1)} disabled={config.difficulty <= 1}>
              <RefreshCcw className="h-3 w-3 mr-1" />降难度
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAdjust(1)} disabled={config.difficulty >= 5}>
              <RefreshCcw className="h-3 w-3 mr-1" />升难度
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <Stat label="总题数" value={`${config.total} 题`} />
          <Stat label="时长" value={`${config.duration} 分钟`} />
          <Stat label="题型分布" value={`单${config.typeMix.single} 多${config.typeMix.multi} 判${config.typeMix.judge} 简${config.typeMix.essay}`} />
          <Stat label="难度" value={["", "易", "易+", "中", "中+", "难"][config.difficulty]} />
        </div>
      </div>

      {/* 题目预览 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">题目预览（前 {questions.length} 题，共 {config.total} 题）</Label>
          <span className="text-[11px] text-muted-foreground">点击单题可换题</span>
        </div>
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-md border bg-card p-3 hover:border-primary/40 transition-colors group">
              <div className="flex items-start gap-2">
                <span className="font-mono text-xs text-muted-foreground w-6 shrink-0 mt-0.5">{idx + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{q.type}</Badge>
                    <Badge variant="outline" className={cn(
                      "text-[10px] px-1.5 py-0 h-4",
                      q.difficulty === "易" && "bg-success/10 text-success border-success/30",
                      q.difficulty === "中" && "bg-warning/15 text-warning border-warning/30",
                      q.difficulty === "难" && "bg-destructive/10 text-destructive border-destructive/30",
                    )}>{q.difficulty}</Badge>
                  </div>
                  <div className="text-sm leading-relaxed">{q.text}</div>
                  {q.options && (
                    <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                      {q.options.map((o) => <div key={o}>{o}</div>)}
                    </div>
                  )}
                  <div className="mt-1.5 text-[11px] text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    答案：{q.answer}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onReplace(q.id)}
                  title="AI 换一题"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/60 rounded p-2 border border-border/50">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xs font-medium mt-0.5">{value}</div>
    </div>
  );
}
