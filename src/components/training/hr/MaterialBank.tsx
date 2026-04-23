import { useState, useRef } from "react";
import { coursewares, questions } from "../training-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Upload, FileText, Video, Presentation, X, CheckCircle, Loader2, File, Sparkles } from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, typeof FileText> = { FileText, Video, Presentation };

// [FRONTEND-ONLY] Mock file type detection
const detectType = (name: string): "PDF" | "video" | "PPT" => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "avi", "mov", "mkv", "webm"].includes(ext)) return "video";
  if (["ppt", "pptx", "key"].includes(ext)) return "PPT";
  return "PDF";
};

const typeIcon = (t: string) => {
  if (t === "video") return Video;
  if (t === "PPT") return Presentation;
  return FileText;
};

type UploadStep = "select" | "uploading" | "extracting" | "preview" | "done";

interface PreviewQuestion {
  id: string;
  text: string;
  type: "single" | "judge";
  options: string[];
  answer: string;
}

// [FRONTEND-ONLY] Mock AI extraction based on file name keywords
const mockExtractQuestions = (fileName: string): PreviewQuestion[] => {
  const base: PreviewQuestion[] = [
    { id: "uq1", text: `关于"${fileName}"中提到的核心操作流程，以下哪项是正确的？`, type: "single", options: ["按照标准流程操作", "可以跳过检查步骤", "无需佩戴防护装备", "随意调整参数"], answer: "按照标准流程操作" },
    { id: "uq2", text: `"${fileName}"要求操作前必须进行安全检查。`, type: "judge", options: ["正确", "错误"], answer: "正确" },
    { id: "uq3", text: `根据"${fileName}"，设备异常时应首先做什么？`, type: "single", options: ["继续操作", "立即停机并报告", "自行维修", "等下班再说"], answer: "立即停机并报告" },
    { id: "uq4", text: `"${fileName}"中提到的操作记录需要保存至少多久？`, type: "single", options: ["1个月", "3个月", "6个月", "1年"], answer: "1年" },
    { id: "uq5", text: `该培训素材中强调的最重要原则是安全第一。`, type: "judge", options: ["正确", "错误"], answer: "正确" },
    { id: "uq6", text: `操作人员可以在未经培训的情况下独立上岗。`, type: "judge", options: ["正确", "错误"], answer: "错误" },
    { id: "uq7", text: `"${fileName}"中规定的标准作业温度范围是？`, type: "single", options: ["10-20°C", "18-26°C", "30-40°C", "不限"], answer: "18-26°C" },
    { id: "uq8", text: `根据该素材，质量检验应在哪个环节进行？`, type: "single", options: ["仅在成品阶段", "每个关键工序后", "仅在客户要求时", "月底统一检验"], answer: "每个关键工序后" },
    { id: "uq9", text: `该素材要求所有操作记录必须有操作者签名。`, type: "judge", options: ["正确", "错误"], answer: "正确" },
    { id: "uq10", text: `"${fileName}"中涉及的设备维护周期是？`, type: "single", options: ["每天", "每周", "每月", "每季度"], answer: "每周" },
  ];
  return base;
};

// [FRONTEND-ONLY] AI-generated question flow state
type AddQStep = "input" | "generating" | "preview";

interface AiGenQuestion {
  id: string;
  type: "single" | "judge";
  text: string;
  options: string[];
  answer: string;
  editing?: boolean;
}

const mockAiGenQuestions = (topic: string, count: number): AiGenQuestion[] => {
  const singles: Omit<AiGenQuestion, "id">[] = [
    { type: "single", text: `关于"${topic}"，以下哪项操作是规范的？`, options: ["按标准流程执行", "跳过安全检查", "凭经验操作", "无需记录"], answer: "按标准流程执行" },
    { type: "single", text: `在"${topic}"作业中，发现异常应首先？`, options: ["继续观察", "立即停机报告", "自行维修", "通知同事帮忙"], answer: "立即停机报告" },
    { type: "single", text: `"${topic}"要求的防护装备不包括？`, options: ["安全帽", "护目镜", "拖鞋", "防护手套"], answer: "拖鞋" },
    { type: "single", text: `"${topic}"中设备日常点检频率是？`, options: ["每班次", "每周", "每月", "每季度"], answer: "每班次" },
    { type: "single", text: `"${topic}"规定的标准作业环境温度范围？`, options: ["0-15°C", "18-26°C", "30-40°C", "不限"], answer: "18-26°C" },
  ];
  const judges: Omit<AiGenQuestion, "id">[] = [
    { type: "judge", text: `"${topic}"操作前必须确认设备安全状态。`, options: ["正确", "错误"], answer: "正确" },
    { type: "judge", text: `未经${topic}培训的员工可以独立上岗操作。`, options: ["正确", "错误"], answer: "错误" },
    { type: "judge", text: `${topic}相关操作记录需保存至少一年。`, options: ["正确", "错误"], answer: "正确" },
    { type: "judge", text: `${topic}作业中可以边操作边使用手机。`, options: ["正确", "错误"], answer: "错误" },
    { type: "judge", text: `${topic}的安全事故必须在24小时内上报。`, options: ["正确", "错误"], answer: "正确" },
  ];
  const pool = [...singles, ...judges].sort(() => Math.random() - 0.5).slice(0, count);
  return pool.map((q, i) => ({ ...q, id: `aq-${Date.now()}-${i}` }));
};

export default function MaterialBank() {
  const [tab, setTab] = useState<"courseware" | "questions">("courseware");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadStep>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedQs, setExtractedQs] = useState<PreviewQuestion[]>([]);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // [FRONTEND-ONLY] AI new question dialog state
  const [addQOpen, setAddQOpen] = useState(false);
  const [addQStep, setAddQStep] = useState<AddQStep>("input");
  const [addQTopic, setAddQTopic] = useState("");
  const [addQCount, setAddQCount] = useState(5);
  const [aiQuestions, setAiQuestions] = useState<AiGenQuestion[]>([]);
  const [aiRemovedIds, setAiRemovedIds] = useState<Set<string>>(new Set());
  const [editingQ, setEditingQ] = useState<AiGenQuestion | null>(null);

  const resetAddQ = () => {
    setAddQStep("input");
    setAddQTopic("");
    setAddQCount(5);
    setAiQuestions([]);
    setAiRemovedIds(new Set());
    setEditingQ(null);
  };

  const handleAiGenerate = () => {
    if (!addQTopic.trim()) { toast.error("请输入知识点主题"); return; }
    setAddQStep("generating");
    // [FRONTEND-ONLY] Simulate AI generation delay
    setTimeout(() => {
      setAiQuestions(mockAiGenQuestions(addQTopic, addQCount));
      setAiRemovedIds(new Set());
      setAddQStep("preview");
    }, 1800);
  };

  const handleAiRegenerate = () => {
    setAddQStep("generating");
    setTimeout(() => {
      setAiQuestions(mockAiGenQuestions(addQTopic, addQCount));
      setAiRemovedIds(new Set());
      setEditingQ(null);
      setAddQStep("preview");
    }, 1500);
  };

  const handleAiConfirm = () => {
    const kept = aiQuestions.filter(q => !aiRemovedIds.has(q.id));
    if (kept.length === 0) { toast.error("至少保留一道题目"); return; }
    setAddQOpen(false);
    resetAddQ();
    toast.success(`已添加 ${kept.length} 道 AI 生成题目到题库`);
  };

  const startEditQ = (q: AiGenQuestion) => setEditingQ({ ...q });
  const cancelEditQ = () => setEditingQ(null);
  const saveEditQ = () => {
    if (!editingQ) return;
    setAiQuestions(prev => prev.map(q => q.id === editingQ.id ? { ...editingQ, editing: false } : q));
    setEditingQ(null);
    toast.success("题目已修改");
  };

  const aiKeptCount = aiQuestions.filter(q => !aiRemovedIds.has(q.id)).length;

  const resetDialog = () => {
    setUploadStep("select");
    setSelectedFile(null);
    setUploadProgress(0);
    setExtractedQs([]);
    setRemovedIds(new Set());
  };

  const openDialog = () => {
    resetDialog();
    setDialogOpen(true);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleStartUpload = () => {
    if (!selectedFile) return;
    setUploadStep("uploading");
    setUploadProgress(0);

    // [FRONTEND-ONLY] Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(100);
        // Move to extraction step
        setTimeout(() => {
          setUploadStep("extracting");
          // Simulate AI extraction
          setTimeout(() => {
            const qs = mockExtractQuestions(selectedFile.name.replace(/\.[^.]+$/, ""));
            setExtractedQs(qs);
            setUploadStep("preview");
          }, 2000);
        }, 500);
      }
      setUploadProgress(Math.min(progress, 100));
    }, 400);
  };

  const handleConfirm = () => {
    const kept = extractedQs.filter(q => !removedIds.has(q.id));
    setUploadStep("done");
    setTimeout(() => {
      setDialogOpen(false);
      resetDialog();
      toast.success(`素材已入库，同时保存了 ${kept.length} 道 AI 生成题目`);
    }, 1200);
  };

  const toggleRemove = (id: string) => {
    setRemovedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const keptCount = extractedQs.filter(q => !removedIds.has(q.id)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button size="sm" variant={tab === "courseware" ? "default" : "outline"} className={tab === "courseware" ? "bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg" : "rounded-lg"} onClick={() => setTab("courseware")}>课件</Button>
          <Button size="sm" variant={tab === "questions" ? "default" : "outline"} className={tab === "questions" ? "bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg" : "rounded-lg"} onClick={() => setTab("questions")}>题库</Button>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => tab === "courseware" ? openDialog() : setAddQOpen(true)}>
          {tab === "courseware" ? <Upload className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
          {tab === "courseware" ? "上传素材" : "新增题目"}
        </Button>
      </div>

      {tab === "courseware" ? (
        <div className="grid grid-cols-3 gap-4">
          {coursewares.map(cw => {
            const Icon = iconMap[cw.icon] ?? FileText;
            return (
              <Card key={cw.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-50"><Icon className="h-5 w-5 text-blue-600" /></div>
                    <div>
                      <p className="font-medium text-sm">{cw.title}</p>
                      <p className="text-xs text-muted-foreground">{cw.type} · {cw.pages ? `${cw.pages}页` : cw.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>引用 {cw.refCount} 次</span>
                    <span>更新于 {cw.updatedAt}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium">题目</th>
                <th className="text-left p-3 font-medium">类型</th>
                <th className="text-left p-3 font-medium">知识点</th>
                <th className="text-left p-3 font-medium">所属素材</th>
              </tr></thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q.id} className="border-b last:border-0">
                    <td className="p-3 max-w-xs truncate">{q.text}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs">{q.type === "single" ? "单选" : "判断"}</Badge></td>
                    <td className="p-3 text-xs text-muted-foreground">{q.topic}</td>
                    <td className="p-3 text-xs text-muted-foreground">{coursewares.find(c => c.id === q.coursewareId)?.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) { resetDialog(); setDialogOpen(false); } }}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {uploadStep === "select" && "上传培训素材"}
              {uploadStep === "uploading" && "正在上传..."}
              {uploadStep === "extracting" && "AI 正在分析素材..."}
              {uploadStep === "preview" && "AI 生成题目预览"}
              {uploadStep === "done" && "完成！"}
            </DialogTitle>
            {uploadStep === "select" && (
              <DialogDescription>支持 PDF、PPT、视频文件，上传后 AI 将自动抽取 10 道题目</DialogDescription>
            )}
          </DialogHeader>

          {/* Step: Select File */}
          {uploadStep === "select" && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[#1E6FFF]/50 hover:bg-[#1E6FFF]/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    {(() => { const Icon = typeIcon(detectType(selectedFile.name)); return <Icon className="h-8 w-8 text-[#1E6FFF]" />; })()}
                    <div className="text-left">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB · {detectType(selectedFile.name)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={e => { e.stopPropagation(); setSelectedFile(null); }}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">点击或拖拽文件到此区域</p>
                    <p className="text-xs text-muted-foreground mt-1">支持 PDF、PPT、PPTX、MP4、AVI 等格式，单文件最大 100MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx,.mp4,.avi,.mov,.mkv,.webm,.key"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }}
              />
              <DialogFooter>
                <Button variant="outline" className="rounded-lg" onClick={() => { resetDialog(); setDialogOpen(false); }}>取消</Button>
                <Button className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg" disabled={!selectedFile} onClick={handleStartUpload}>
                  <Upload className="h-4 w-4 mr-1" />开始上传
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step: Uploading */}
          {uploadStep === "uploading" && (
            <div className="py-6 space-y-4">
              <div className="flex items-center gap-3">
                {(() => { const Icon = typeIcon(detectType(selectedFile?.name ?? "")); return <Icon className="h-6 w-6 text-[#1E6FFF]" />; })()}
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedFile?.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile?.size ?? 0 / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <span className="text-sm font-medium tabular-nums text-[#1E6FFF]">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 rounded-full" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress < 100 ? "正在上传文件..." : "上传完成，准备分析..."}
              </p>
            </div>
          )}

          {/* Step: AI Extracting */}
          {uploadStep === "extracting" && (
            <div className="py-12 text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <Loader2 className="h-16 w-16 animate-spin text-[#1E6FFF]" />
                <Sparkles className="h-6 w-6 text-[#1E6FFF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <p className="text-base font-medium">AI 正在分析素材内容</p>
                <p className="text-sm text-muted-foreground mt-1">自动抽取知识点并生成单选题和判断题...</p>
              </div>
            </div>
          )}

          {/* Step: Preview Generated Questions */}
          {uploadStep === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  已生成 <span className="font-bold text-[#1E6FFF]">{extractedQs.length}</span> 道题目，
                  保留 <span className="font-bold text-emerald-600">{keptCount}</span> 道
                </p>
                <Badge variant="secondary" className="text-xs">
                  单选 {extractedQs.filter(q => q.type === "single" && !removedIds.has(q.id)).length} ·
                  判断 {extractedQs.filter(q => q.type === "judge" && !removedIds.has(q.id)).length}
                </Badge>
              </div>

              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
                {extractedQs.map((q, idx) => {
                  const removed = removedIds.has(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border text-sm transition-all ${removed ? "opacity-40 bg-muted/30" : "bg-card"}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-muted-foreground tabular-nums w-5 shrink-0 mt-0.5">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{q.type === "single" ? "单选" : "判断"}</Badge>
                          </div>
                          <p className={`text-sm ${removed ? "line-through" : ""}`}>{q.text}</p>
                          <div className="mt-1 space-y-0.5">
                            {q.options.map((opt, i) => (
                              <div key={i} className={`text-xs ${opt === q.answer ? "text-emerald-700 font-medium" : "text-muted-foreground"}`}>
                                {String.fromCharCode(65 + i)}. {opt} {opt === q.answer && "✓"}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost" size="sm"
                          className={`h-7 text-xs shrink-0 ${removed ? "text-[#1E6FFF]" : "text-red-500"}`}
                          onClick={() => toggleRemove(q.id)}
                        >
                          {removed ? "恢复" : "移除"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <DialogFooter>
                <Button variant="outline" className="rounded-lg" onClick={() => { resetDialog(); setDialogOpen(false); }}>取消</Button>
                <Button className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg" onClick={handleConfirm} disabled={keptCount === 0}>
                  <CheckCircle className="h-4 w-4 mr-1" />确认入库（{keptCount} 题）
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step: Done */}
          {uploadStep === "done" && (
            <div className="py-12 text-center space-y-3">
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
              <p className="text-lg font-medium">素材上传成功！</p>
              <p className="text-sm text-muted-foreground">已自动入库并生成题目</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Add Question Dialog */}
      <Dialog open={addQOpen} onOpenChange={v => { if (!v) { resetAddQ(); setAddQOpen(false); } }}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {addQStep === "input" && "AI 智能出题"}
              {addQStep === "generating" && "AI 正在生成题目..."}
              {addQStep === "preview" && "AI 生成题目预览"}
            </DialogTitle>
            {addQStep === "input" && (
              <DialogDescription>输入知识点主题，AI 自动生成单选题和判断题，支持人工修改</DialogDescription>
            )}
          </DialogHeader>

          {/* Step: Input topic */}
          {addQStep === "input" && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium">知识点主题 *</Label>
                <Input className="mt-1" placeholder="例如：LED封装工艺安全规范" value={addQTopic} onChange={e => setAddQTopic(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-medium">生成数量</Label>
                <div className="flex gap-2 mt-1">
                  {[3, 5, 8, 10].map(n => (
                    <Button key={n} size="sm" variant={addQCount === n ? "default" : "outline"} className="rounded-lg" onClick={() => setAddQCount(n)}>{n} 题</Button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-lg" onClick={() => { resetAddQ(); setAddQOpen(false); }}>取消</Button>
                <Button className="rounded-lg" disabled={!addQTopic.trim()} onClick={handleAiGenerate}>
                  <Sparkles className="h-4 w-4 mr-1" />AI 生成
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step: Generating */}
          {addQStep === "generating" && (
            <div className="py-12 text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <p className="text-base font-medium">AI 正在围绕「{addQTopic}」生成题目</p>
                <p className="text-sm text-muted-foreground mt-1">预计生成 {addQCount} 道单选题和判断题...</p>
              </div>
            </div>
          )}

          {/* Step: Preview & Edit */}
          {addQStep === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  主题：<span className="font-medium">「{addQTopic}」</span>　
                  已生成 <span className="font-bold text-primary">{aiQuestions.length}</span> 道，
                  保留 <span className="font-bold text-emerald-600">{aiKeptCount}</span> 道
                </p>
                <Button variant="ghost" size="sm" className="text-xs" onClick={handleAiRegenerate}>
                  <Sparkles className="h-3.5 w-3.5 mr-1" />全部重新生成
                </Button>
              </div>

              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
                {aiQuestions.map((q, idx) => {
                  const removed = aiRemovedIds.has(q.id);
                  const isEditing = editingQ?.id === q.id;

                  if (isEditing && editingQ) {
                    return (
                      <div key={q.id} className="p-3 rounded-xl border-2 border-primary/30 bg-primary/5 text-sm space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{editingQ.type === "single" ? "单选" : "判断"}</Badge>
                          <span className="text-xs text-muted-foreground">编辑中</span>
                        </div>
                        <Input value={editingQ.text} onChange={e => setEditingQ({ ...editingQ, text: e.target.value })} placeholder="题干" />
                        {editingQ.type === "single" && (
                          <div className="grid grid-cols-2 gap-1.5">
                            {editingQ.options.map((opt, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <span className="text-xs font-medium w-4">{String.fromCharCode(65 + i)}.</span>
                                <Input className="h-8 text-xs" value={opt} onChange={e => {
                                  const newOpts = [...editingQ.options];
                                  newOpts[i] = e.target.value;
                                  setEditingQ({ ...editingQ, options: newOpts });
                                }} />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">正确答案：</span>
                          {editingQ.options.map((opt, i) => (
                            <Button key={i} size="sm" variant={editingQ.answer === opt ? "default" : "outline"} className="h-6 text-xs rounded px-2"
                              onClick={() => setEditingQ({ ...editingQ, answer: opt })}>
                              {String.fromCharCode(65 + i)}
                            </Button>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={cancelEditQ}>取消</Button>
                          <Button size="sm" className="h-7 text-xs rounded-lg" onClick={saveEditQ}>保存修改</Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={q.id} className={`p-3 rounded-xl border text-sm transition-all ${removed ? "opacity-40 bg-muted/30" : "bg-card"}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-muted-foreground tabular-nums w-5 shrink-0 mt-0.5">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{q.type === "single" ? "单选" : "判断"}</Badge>
                          </div>
                          <p className={`text-sm ${removed ? "line-through" : ""}`}>{q.text}</p>
                          <div className="mt-1 space-y-0.5">
                            {q.options.map((opt, i) => (
                              <div key={i} className={`text-xs ${opt === q.answer ? "text-emerald-700 font-medium" : "text-muted-foreground"}`}>
                                {String.fromCharCode(65 + i)}. {opt} {opt === q.answer && "✓"}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          {!removed && (
                            <Button variant="ghost" size="sm" className="h-6 text-xs text-primary" onClick={() => startEditQ(q)}>编辑</Button>
                          )}
                          <Button variant="ghost" size="sm" className={`h-6 text-xs ${removed ? "text-primary" : "text-destructive"}`}
                            onClick={() => setAiRemovedIds(prev => { const n = new Set(prev); n.has(q.id) ? n.delete(q.id) : n.add(q.id); return n; })}>
                            {removed ? "恢复" : "移除"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <DialogFooter>
                <Button variant="outline" className="rounded-lg" onClick={() => setAddQStep("input")}>返回修改主题</Button>
                <Button className="rounded-lg" onClick={handleAiConfirm} disabled={aiKeptCount === 0}>
                  <CheckCircle className="h-4 w-4 mr-1" />确认入库（{aiKeptCount} 题）
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
