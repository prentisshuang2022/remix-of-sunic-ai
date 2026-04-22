import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  FileUp,
  Upload,
  FileText,
  Link2,
  Scan,
  MessageSquare,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
  Sun,
  Shield,
  Globe,
  Loader2,
  X,
  ArrowLeft,
} from "lucide-react";

type SourceKind = "upload" | "dingtalk" | "paste" | "scan";

const SOURCES: { kind: SourceKind; icon: typeof Upload; label: string; desc: string }[] = [
  { kind: "upload", icon: Upload, label: "本地文件上传", desc: "PDF / Word / PPT / 视频 / 图片，支持批量" },
  { kind: "dingtalk", icon: MessageSquare, label: "钉钉知识库", desc: "从已有知识库文档中选择" },
  { kind: "paste", icon: Link2, label: "粘贴文本 / 链接", desc: "直接粘贴 SOP 文本或网页链接" },
  { kind: "scan", icon: Scan, label: "扫描纸质 SOP", desc: "上传扫描件，AI · OCR 识别" },
];

const CATEGORIES = [
  { key: "laser", icon: Zap, label: "激光设备操作", color: "primary" },
  { key: "solar", icon: Sun, label: "太阳能组件", color: "warning" },
  { key: "qa", icon: Shield, label: "质量与合规", color: "success" },
  { key: "trade", icon: Globe, label: "外贸与销售", color: "ai" },
] as const;

const POSITIONS = [
  "激光工艺工程师", "激光设备操作员", "组件装配技工",
  "品质检验员", "外贸业务员", "仓储管理员",
];

const MOCK_KP = [
  { id: 1, title: "激光器开机前安全检查清单", cat: "laser", confidence: 96 },
  { id: 2, title: "划片机参数设置：脉宽 / 频率 / 功率", cat: "laser", confidence: 93 },
  { id: 3, title: "光路调整与镜片清洁规范", cat: "laser", confidence: 91 },
  { id: 4, title: "激光防护眼镜佩戴标准", cat: "qa", confidence: 89 },
  { id: 5, title: "异常停机处置流程（5 步法）", cat: "laser", confidence: 88 },
  { id: 6, title: "设备日常 / 周 / 月保养项", cat: "laser", confidence: 86 },
  { id: 7, title: "废液 / 废料分类与登记", cat: "qa", confidence: 82 },
  { id: 8, title: "交接班记录填写规范", cat: "qa", confidence: 78 },
];

const colorMap = {
  primary: "text-primary bg-primary/10 border-primary/30",
  warning: "text-warning bg-warning/15 border-warning/30",
  success: "text-success bg-success/15 border-success/30",
  ai: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))] border-[hsl(var(--ai))]/30",
} as const;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ImportMaterialsSheet({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [source, setSource] = useState<SourceKind>("upload");
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStage, setParseStage] = useState("");
  const [selectedKp, setSelectedKp] = useState<Set<number>>(new Set(MOCK_KP.map(k => k.id)));
  const [category, setCategory] = useState<string>("laser");
  const [positions, setPositions] = useState<Set<string>>(new Set(["激光工艺工程师", "激光设备操作员"]));
  const [genExamAfter, setGenExamAfter] = useState(true);

  const reset = () => {
    setStep(0);
    setSource("upload");
    setFiles([]);
    setPasteText("");
    setParsing(false);
    setParseProgress(0);
    setParseStage("");
    setSelectedKp(new Set(MOCK_KP.map(k => k.id)));
    setCategory("laser");
    setPositions(new Set(["激光工艺工程师", "激光设备操作员"]));
    setGenExamAfter(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const startParsing = async () => {
    setStep(2);
    setParsing(true);
    const stages = [
      { p: 18, s: "上传至安全沙箱…" },
      { p: 38, s: "OCR 识别 / 文本抽取…" },
      { p: 62, s: "AI 提取知识点…" },
      { p: 82, s: "匹配题库分类与岗位…" },
      { p: 100, s: "解析完成" },
    ];
    for (const st of stages) {
      await new Promise(r => setTimeout(r, 550));
      setParseProgress(st.p);
      setParseStage(st.s);
    }
    setParsing(false);
    await new Promise(r => setTimeout(r, 250));
    setStep(3);
  };

  const handleSubmit = () => {
    toast.success(`已导入 ${selectedKp.size} 个知识点到「${CATEGORIES.find(c => c.key === category)?.label}」`, {
      description: genExamAfter ? "正在跳转到 AI 一键出卷…" : "材料已归档，可在题库中查看",
    });
    handleClose();
  };

  const canNext = () => {
    if (step === 0) {
      if (source === "upload" || source === "scan") return files.length > 0;
      if (source === "paste") return pasteText.trim().length > 10;
      if (source === "dingtalk") return files.length > 0;
    }
    return true;
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <FileUp className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-base">导入培训材料</SheetTitle>
              <SheetDescription className="text-xs">SOP / 课件 / 视频 → AI 解析 → 知识点 → 题库</SheetDescription>
            </div>
          </div>
          <Stepper step={step} />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 0 && (
            <StepSource
              source={source}
              setSource={setSource}
              files={files}
              setFiles={setFiles}
              pasteText={pasteText}
              setPasteText={setPasteText}
            />
          )}
          {step === 1 && (
            <StepConfirm files={files} source={source} pasteText={pasteText} />
          )}
          {step === 2 && (
            <StepParsing progress={parseProgress} stage={parseStage} parsing={parsing} />
          )}
          {step === 3 && (
            <StepResult
              selectedKp={selectedKp}
              setSelectedKp={setSelectedKp}
              category={category}
              setCategory={setCategory}
              positions={positions}
              setPositions={setPositions}
              genExamAfter={genExamAfter}
              setGenExamAfter={setGenExamAfter}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/30">
          <div className="text-[11px] text-muted-foreground font-mono tracking-wider">
            {step === 3 ? `${selectedKp.size} / ${MOCK_KP.length} 个知识点已选` : `STEP ${step + 1} / 4`}
          </div>
          <div className="flex gap-2">
            {step > 0 && step !== 2 && (
              <Button variant="outline" size="sm" onClick={() => setStep(s => Math.max(0, s - 1))}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />上一步
              </Button>
            )}
            {step === 0 && (
              <Button size="sm" disabled={!canNext()} onClick={() => setStep(1)}>
                下一步<ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
            {step === 1 && (
              <Button size="sm" onClick={startParsing}>
                <Sparkles className="h-3.5 w-3.5 mr-1" />开始 AI 解析
              </Button>
            )}
            {step === 3 && (
              <Button size="sm" disabled={selectedKp.size === 0} onClick={handleSubmit}>
                <Check className="h-3.5 w-3.5 mr-1" />
                {genExamAfter ? "归档并出卷" : "归档到题库"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["选择来源", "确认材料", "AI 解析", "知识点归档"];
  return (
    <div className="flex items-center gap-1.5 mt-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5 flex-1 last:flex-none">
          <div className={cn(
            "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold border shrink-0",
            i < step && "bg-primary text-primary-foreground border-primary",
            i === step && "bg-background text-primary border-primary ring-4 ring-primary/15",
            i > step && "bg-background text-muted-foreground border-border",
          )}>
            {i < step ? <Check className="h-3 w-3" /> : i + 1}
          </div>
          <span className={cn(
            "text-[11px] whitespace-nowrap",
            i === step ? "text-foreground font-medium" : "text-muted-foreground"
          )}>{s}</span>
          {i < steps.length - 1 && <div className={cn("h-px flex-1 mx-1", i < step ? "bg-primary" : "bg-border")} />}
        </div>
      ))}
    </div>
  );
}

function StepSource({
  source, setSource, files, setFiles, pasteText, setPasteText,
}: {
  source: SourceKind; setSource: (s: SourceKind) => void;
  files: { name: string; size: string }[]; setFiles: (f: { name: string; size: string }[]) => void;
  pasteText: string; setPasteText: (s: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">材料来源</Label>
        <div className="grid grid-cols-2 gap-2">
          {SOURCES.map((s) => {
            const Icon = s.icon;
            const active = source === s.kind;
            return (
              <button
                key={s.kind}
                onClick={() => { setSource(s.kind); setFiles([]); setPasteText(""); }}
                className={cn(
                  "text-left p-3 rounded-lg border transition-all",
                  active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {(source === "upload" || source === "scan") && (
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            {source === "scan" ? "上传扫描件（JPG / PNG / 多页 PDF）" : "上传文件（≤ 50MB / 个，支持批量）"}
          </Label>
          <button
            onClick={() => {
              const mock = source === "scan"
                ? [{ name: "激光机操作 SOP_扫描.pdf", size: "8.4 MB" }]
                : [
                    { name: "激光划片机操作规范 v3.2.pdf", size: "4.1 MB" },
                    { name: "安全应急预案.docx", size: "1.2 MB" },
                  ];
              setFiles(mock);
              toast.success(`已选择 ${mock.length} 个文件`);
            }}
            className="w-full border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/40 hover:bg-muted/30 transition-colors"
          >
            <Upload className="h-6 w-6 mx-auto text-muted-foreground/60 mb-2" />
            <div className="text-sm font-medium">点击或拖拽文件到此处</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {source === "scan" ? "支持多页扫描件 · OCR 自动识别中文" : "支持 PDF / Word / PPT / MP4 / 图片"}
            </div>
          </button>
          {files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border">
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs flex-1 truncate">{f.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{f.size}</span>
                  <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {source === "paste" && (
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">粘贴 SOP 文本或链接</Label>
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="将培训材料文本或网页链接粘贴到此处（≥ 10 字）&#10;&#10;示例：https://wiki.sunic.com/laser-safety-sop"
            rows={8}
            className="text-sm resize-none"
          />
          <div className="text-[11px] text-muted-foreground mt-1.5 font-mono tracking-wider">
            {pasteText.length} 字符 · 自动识别链接并抓取
          </div>
        </div>
      )}

      {source === "dingtalk" && (
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">从钉钉知识库选择</Label>
          <div className="space-y-1.5">
            {[
              "三工光电 / 生产管理 / 激光工艺组",
              "三工光电 / 品质 / ISO9001 体系文件",
              "三工光电 / 营销 / 外贸业务培训库",
            ].map((path) => (
              <button
                key={path}
                onClick={() => {
                  setFiles([{ name: path.split(" / ").pop() ?? path, size: "钉钉知识库" }]);
                  toast.success("已选择钉钉知识库目录");
                }}
                className="w-full text-left px-3 py-2.5 rounded-md border border-border hover:border-primary/40 hover:bg-muted/30 flex items-center gap-2"
              >
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs flex-1">{path}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
          {files.length > 0 && (
            <div className="mt-3 px-3 py-2 rounded-md bg-success/10 border border-success/30 text-xs text-success">
              ✓ 已选择：{files[0].name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepConfirm({ files, source, pasteText }: { files: { name: string; size: string }[]; source: SourceKind; pasteText: string }) {
  const sourceLabel = SOURCES.find(s => s.kind === source)?.label;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-4 bg-muted/30">
        <div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">即将解析</div>
        <div className="space-y-2 text-sm">
          <Row k="来源" v={sourceLabel ?? ""} />
          {(source === "upload" || source === "scan" || source === "dingtalk") && (
            <Row k="材料数" v={`${files.length} 项`} />
          )}
          {source === "paste" && <Row k="字符数" v={`${pasteText.length} 字符`} />}
          <Row k="预计耗时" v="约 30 - 60 秒（异步任务）" />
          <Row k="解析模型" v="Lovable AI · GPT-4o-mini" />
        </div>
      </div>

      <div className="rounded-lg border border-[hsl(var(--ai))]/30 bg-[hsl(var(--ai-soft))] p-4">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--ai))] shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-semibold text-[hsl(var(--ai))] mb-1.5">AI 将自动完成</div>
            <ul className="text-xs space-y-1 text-foreground/80 list-disc list-inside">
              <li>提取关键知识点与操作步骤</li>
              <li>智能归类到 4 大题库分类</li>
              <li>识别适用岗位与工种</li>
              <li>生成可直接出卷的题目候选</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground">
        提示：解析过程在后台异步执行，您可以关闭弹窗稍后在「待办任务」中查看结果。
      </div>
    </div>
  );
}

function StepParsing({ progress, stage, parsing }: { progress: number; stage: string; parsing: boolean }) {
  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-[hsl(var(--ai-soft))] flex items-center justify-center">
          {parsing ? (
            <Loader2 className="h-6 w-6 text-[hsl(var(--ai))] animate-spin" />
          ) : (
            <Check className="h-6 w-6 text-success" />
          )}
        </div>
        <div className="text-sm font-medium">{stage || "准备中…"}</div>
      </div>

      <div className="px-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-[11px] text-muted-foreground font-mono mt-1.5 tracking-wider">
          <span>AI 解析进行中</span>
          <span>{progress}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-2">
        {[
          { p: 18, label: "上传 / 校验" },
          { p: 38, label: "OCR / 抽取" },
          { p: 62, label: "知识点提取" },
          { p: 82, label: "分类匹配" },
        ].map(s => (
          <div key={s.label} className={cn(
            "px-3 py-2 rounded-md border text-xs flex items-center gap-2",
            progress >= s.p ? "border-success/30 bg-success/10 text-success" : "border-border text-muted-foreground"
          )}>
            {progress >= s.p ? <Check className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepResult({
  selectedKp, setSelectedKp, category, setCategory, positions, setPositions, genExamAfter, setGenExamAfter,
}: {
  selectedKp: Set<number>; setSelectedKp: (s: Set<number>) => void;
  category: string; setCategory: (s: string) => void;
  positions: Set<string>; setPositions: (s: Set<string>) => void;
  genExamAfter: boolean; setGenExamAfter: (b: boolean) => void;
}) {
  const togglePos = (p: string) => {
    const next = new Set(positions);
    next.has(p) ? next.delete(p) : next.add(p);
    setPositions(next);
  };
  const toggleKp = (id: number) => {
    const next = new Set(selectedKp);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedKp(next);
  };
  return (
    <div className="space-y-5">
      {/* 题库分类 */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-[hsl(var(--ai))]" />归类到题库分类（AI 推荐：激光设备操作）
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-md border text-left transition-all",
                  active ? colorMap[c.color] : "border-border hover:border-primary/40 text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium flex-1">{c.label}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 关联岗位 */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">关联岗位 / 工种（{positions.size} 已选）</Label>
        <div className="flex flex-wrap gap-1.5">
          {POSITIONS.map(p => {
            const active = positions.has(p);
            return (
              <button
                key={p}
                onClick={() => togglePos(p)}
                className={cn(
                  "px-2.5 py-1 rounded-full border text-[11px] transition-colors",
                  active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/40"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* 知识点列表 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[hsl(var(--ai))]" />
            AI 抽取的知识点（{MOCK_KP.length} 项）
          </Label>
          <button
            onClick={() => setSelectedKp(selectedKp.size === MOCK_KP.length ? new Set() : new Set(MOCK_KP.map(k => k.id)))}
            className="text-[11px] text-primary hover:underline"
          >
            {selectedKp.size === MOCK_KP.length ? "全部取消" : "全部选择"}
          </button>
        </div>
        <div className="rounded-lg border border-border divide-y max-h-[280px] overflow-y-auto">
          {MOCK_KP.map((kp) => {
            const checked = selectedKp.has(kp.id);
            return (
              <label
                key={kp.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors",
                  checked && "bg-primary/5"
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleKp(kp.id)} />
                <span className="text-xs flex-1">{kp.title}</span>
                <Badge variant="outline" className="font-mono text-[10px] font-normal bg-[hsl(var(--ai-soft))] text-[hsl(var(--ai))] border-[hsl(var(--ai))]/30">
                  置信 {kp.confidence}%
                </Badge>
              </label>
            );
          })}
        </div>
      </div>

      {/* 后续动作 */}
      <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[hsl(var(--ai))]/30 bg-[hsl(var(--ai-soft))] cursor-pointer">
        <Checkbox checked={genExamAfter} onCheckedChange={(v) => setGenExamAfter(!!v)} />
        <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--ai))]" />
        <span className="text-xs flex-1">归档后立即跳转「AI 一键出卷」，使用本次知识点生成试卷</span>
      </label>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground text-xs">{k}</span>
      <span className="text-xs font-medium text-right">{v}</span>
    </div>
  );
}
