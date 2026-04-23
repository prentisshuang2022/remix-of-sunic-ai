import { useState, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTraining } from "@/components/training/TrainingContext";
import { employees, coursewares, type TaskType, type TrainingTask, type TraineeRecord, type Question } from "../training-store";
import { toast } from "sonner";
import { Sparkles, RefreshCw, Trash2, Pencil, Check, X, Loader2, Plus } from "lucide-react";

const taskTypes: { value: TaskType; label: string }[] = [
  { value: "newEmployee", label: "新员工入职" },
  { value: "positionSkill", label: "岗位技能" },
  { value: "safeRetraining", label: "安全复训" },
  { value: "newProcess", label: "新工艺导入" },
];

// [FRONTEND-ONLY] Mock AI question generation based on selected coursewares
const mockGenerateQuestions = (cwIds: string[]): Question[] => {
  const pool: { cw: string; cwId: string; questions: Omit<Question, "id" | "coursewareId">[] }[] = [
    {
      cw: "SMT贴片机操作规范", cwId: "c1",
      questions: [
        { text: "SMT贴片机开机前首先需要检查什么？", type: "single", topic: "SMT操作规范", options: ["气压表读数", "办公室温度", "午餐安排", "手机信号"], answer: "气压表读数", explanation: "开机前首先检查气压是否达到设备要求值。" },
        { text: "贴片机吸嘴堵塞时应立即停机处理。", type: "judge", topic: "SMT操作规范", options: ["正确", "错误"], answer: "正确", explanation: "吸嘴堵塞会导致贴装不良，必须停机清理。" },
        { text: "回流焊温度曲线的预热段温度一般为？", type: "single", topic: "回流焊工艺", options: ["50-100°C", "100-150°C", "150-200°C", "200-250°C"], answer: "150-200°C", explanation: "预热段一般控制在150-200°C，避免热冲击。" },
        { text: "SMT生产线上可以不戴防静电手环。", type: "judge", topic: "SMT操作规范", options: ["正确", "错误"], answer: "错误", explanation: "SMT生产线必须佩戴防静电手环，防止静电损坏元器件。" },
        { text: "锡膏开封后的有效使用时间是多久？", type: "single", topic: "SMT操作规范", options: ["2小时", "4小时", "8小时", "24小时"], answer: "8小时", explanation: "锡膏开封后一般需在8小时内用完，超时需废弃。" },
      ],
    },
    {
      cw: "无尘车间行为规范", cwId: "c2",
      questions: [
        { text: "进入无尘车间前必须经过风淋室吹淋。", type: "judge", topic: "无尘车间管理", options: ["正确", "错误"], answer: "正确", explanation: "风淋是去除身体表面灰尘颗粒的必要步骤。" },
        { text: "无尘车间内允许携带的物品是？", type: "single", topic: "无尘车间管理", options: ["手机", "无尘笔记本", "报纸", "零食"], answer: "无尘笔记本", explanation: "只能携带无尘专用物品，普通物品会产生颗粒污染。" },
        { text: "无尘车间的温度通常控制在多少度？", type: "single", topic: "无尘车间管理", options: ["15-18°C", "20-24°C", "28-32°C", "35-38°C"], answer: "20-24°C", explanation: "温度控制在20-24°C，确保产品质量和人员舒适。" },
        { text: "在无尘车间内可以快速奔跑赶工。", type: "judge", topic: "人员着装规范", options: ["正确", "错误"], answer: "错误", explanation: "快速移动会扬起灰尘颗粒，破坏洁净环境。" },
        { text: "防静电服应该怎样穿着？", type: "single", topic: "人员着装规范", options: ["松散穿着", "拉链拉到底、袖口扎紧", "只穿上衣即可", "穿在便服外面即可"], answer: "拉链拉到底、袖口扎紧", explanation: "必须全封闭穿着，防止体表颗粒和纤维外泄。" },
      ],
    },
    {
      cw: "静电防护ESD基础", cwId: "c3",
      questions: [
        { text: "静电的产生主要原因是什么？", type: "single", topic: "静电防护基础", options: ["摩擦起电", "电池漏电", "雷电感应", "磁场变化"], answer: "摩擦起电", explanation: "日常静电主要由不同材料间的摩擦引起。" },
        { text: "ESD损伤分为哪两类？", type: "single", topic: "静电防护基础", options: ["突发失效和潜在失效", "物理损伤和化学损伤", "可见损伤和不可见损伤", "永久损伤和临时损伤"], answer: "突发失效和潜在失效", explanation: "ESD损伤分为立即导致器件失效的突发型和降低可靠性的潜在型。" },
        { text: "离子风机可以消除物体表面静电。", type: "judge", topic: "ESD操作规程", options: ["正确", "错误"], answer: "正确", explanation: "离子风机通过产生正负离子中和物体表面静电。" },
        { text: "防静电接地电阻应小于多少欧姆？", type: "single", topic: "ESD操作规程", options: ["1Ω", "10Ω", "100Ω", "1MΩ"], answer: "10Ω", explanation: "接地电阻需小于10Ω以确保有效泄放静电。" },
        { text: "塑料包装袋可以用于存放ESD敏感器件。", type: "judge", topic: "静电防护基础", options: ["正确", "错误"], answer: "错误", explanation: "普通塑料袋会产生静电，必须使用防静电屏蔽袋。" },
      ],
    },
    {
      cw: "LED封装工艺入门", cwId: "c4",
      questions: [
        { text: "LED芯片固晶使用的胶水主要是？", type: "single", topic: "LED封装工艺", options: ["502胶水", "银胶或环氧胶", "热熔胶", "万能胶"], answer: "银胶或环氧胶", explanation: "固晶工序通常使用导电银胶或绝缘环氧胶。" },
        { text: "LED焊线（Wire Bonding）使用的金线直径一般是？", type: "single", topic: "LED封装工艺", options: ["0.1mm", "25μm", "1mm", "0.5mm"], answer: "25μm", explanation: "LED封装焊线常用25μm（1mil）金线。" },
        { text: "LED封装后需要进行光电参数测试。", type: "judge", topic: "LED封装工艺", options: ["正确", "错误"], answer: "正确", explanation: "封装完成后必须测试光通量、色温、正向电压等参数。" },
        { text: "灌胶工序中荧光粉的配比会影响什么？", type: "single", topic: "LED封装工艺", options: ["功耗", "色温", "体积", "重量"], answer: "色温", explanation: "荧光粉的种类和配比直接决定LED的色温。" },
        { text: "LED分光分色的目的是保证批次一致性。", type: "judge", topic: "LED封装工艺", options: ["正确", "错误"], answer: "正确", explanation: "分光分色将相近参数的LED归类，确保应用时颜色和亮度一致。" },
      ],
    },
    {
      cw: "新员工安全培训", cwId: "c5",
      questions: [
        { text: "车间安全通道的最小宽度要求是？", type: "single", topic: "安全生产常识", options: ["0.5m", "1.0m", "1.5m", "2.0m"], answer: "1.0m", explanation: "安全通道宽度不得小于1米，确保紧急疏散。" },
        { text: "干粉灭火器需要每年进行一次检测。", type: "judge", topic: "消防应急知识", options: ["正确", "错误"], answer: "正确", explanation: "灭火器需定期检测压力和有效期，确保紧急时可用。" },
        { text: "发生工伤事故后应在多少小时内上报？", type: "single", topic: "安全生产常识", options: ["1小时", "4小时", "24小时", "48小时"], answer: "24小时", explanation: "工伤事故需在24小时内向安全管理部门报告。" },
        { text: "特种作业人员必须持证上岗。", type: "judge", topic: "安全生产常识", options: ["正确", "错误"], answer: "正确", explanation: "电工、焊工等特种作业必须取得资质证书后方可作业。" },
        { text: "车间内化学品泄漏应首先怎么做？", type: "single", topic: "消防应急知识", options: ["用水冲洗", "撤离现场并报告", "继续工作", "拍照发群"], answer: "撤离现场并报告", explanation: "化学品泄漏先确保人员安全撤离，再报告专业人员处理。" },
      ],
    },
  ];

  const result: Question[] = [];
  let idx = 0;
  for (const cwId of cwIds) {
    const group = pool.find(p => p.cwId === cwId);
    if (!group) continue;
    for (const q of group.questions) {
      result.push({ ...q, id: `gen_${Date.now()}_${idx}`, coursewareId: cwId });
      idx++;
    }
  }
  return result;
};

interface EditingQuestion {
  id: string;
  text: string;
  type: "single" | "judge";
  options: string[];
  answer: string;
  explanation: string;
}

export default function NewTaskDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTask } = useTraining();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("positionSkill");
  const [deadline, setDeadline] = useState("2026-05-30");
  const [selEmps, setSelEmps] = useState<string[]>([]);
  const [selCw, setSelCw] = useState<string[]>([]);
  const [passingScore, setPassingScore] = useState(80);
  const [examDuration, setExamDuration] = useState(30);
  const [examCount, setExamCount] = useState(20);

  // AI generated questions state
  const [generatedQs, setGeneratedQs] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditingQuestion | null>(null);

  const reset = () => {
    setStep(0); setTitle(""); setType("positionSkill"); setDeadline("2026-05-30");
    setSelEmps([]); setSelCw([]); setPassingScore(80); setExamDuration(30); setExamCount(20);
    setGeneratedQs([]); setEditingId(null); setEditForm(null);
  };

  const publish = (draft: boolean) => {
    const trainees: TraineeRecord[] = selEmps.map(empId => ({
      empId, notifyStatus: draft ? "未推送" as const : "已推送" as const, learnStatus: "未开始" as const, learnProgress: 0, examScore: null, result: "未完成" as const,
    }));
    const newTask: TrainingTask = {
      id: `t${Date.now()}`, title, type, status: draft ? "draft" : "inProgress",
      target: "手动选择", headcount: selEmps.length, deadline, createdBy: "HR 李主管", createdAt: new Date().toISOString().slice(0, 10),
      coursewareIds: selCw, questionIds: generatedQs.map(q => q.id), passingScore, examDuration, examQuestionCount: examCount, trainees,
    };
    addTask(newTask);
    toast.success(draft ? "已保存草稿" : `已发布并推送给 ${selEmps.length} 名员工`);
    reset(); onClose();
  };

  const toggleEmp = (id: string) => setSelEmps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleCw = (id: string) => setSelCw(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // [BACKEND] AI question generation - currently mocked, will call backend API
  const handleGenerate = useCallback(() => {
    if (selCw.length === 0) {
      toast.error("请先选择至少一份素材");
      return;
    }
    setGenerating(true);
    // Simulate AI processing delay
    setTimeout(() => {
      const qs = mockGenerateQuestions(selCw);
      setGeneratedQs(qs);
      setGenerating(false);
      toast.success(`AI 已根据 ${selCw.length} 份素材生成 ${qs.length} 道题目`);
    }, 1500);
  }, [selCw]);

  const handleRegenerate = useCallback(() => {
    setEditingId(null);
    setEditForm(null);
    handleGenerate();
  }, [handleGenerate]);

  const handleDeleteQ = (qId: string) => {
    setGeneratedQs(prev => prev.filter(q => q.id !== qId));
    if (editingId === qId) { setEditingId(null); setEditForm(null); }
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditForm({ id: q.id, text: q.text, type: q.type, options: [...q.options], answer: q.answer, explanation: q.explanation });
  };

  const saveEdit = () => {
    if (!editForm) return;
    setGeneratedQs(prev => prev.map(q => q.id === editForm.id ? { ...q, text: editForm.text, type: editForm.type, options: editForm.options, answer: editForm.answer, explanation: editForm.explanation } : q));
    setEditingId(null);
    setEditForm(null);
    toast.success("题目已更新");
  };

  const cancelEdit = () => { setEditingId(null); setEditForm(null); };

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
      <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>新建培训任务</SheetTitle>
        </SheetHeader>

        <div className="flex gap-2 my-4">
          {["基本信息", "选择素材", "考试设置"].map((s, i) => (
            <div key={i} className={`flex-1 text-center text-xs py-1.5 rounded-lg ${i === step ? "bg-[#1E6FFF] text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{i + 1}. {s}</div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div><Label>任务标题</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="如：SMT贴片机操作规范培训" /></div>
            <div><Label>培训类型</Label>
              <Select value={type} onValueChange={v => setType(v as TaskType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{taskTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>截止日期</Label><Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
            <div>
              <Label>参训人员（已选 {selEmps.length} 人）</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {employees.map(emp => (
                  <label key={emp.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={selEmps.includes(emp.id)} onCheckedChange={() => toggleEmp(emp.id)} />
                    {emp.name} · {emp.dept} · {emp.empNo}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Label>选择培训素材</Label>
            <div className="space-y-2">
              {coursewares.map(cw => (
                <label key={cw.id} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border hover:bg-muted/50">
                  <Checkbox checked={selCw.includes(cw.id)} onCheckedChange={() => toggleCw(cw.id)} />
                  <span>{cw.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{cw.type} · {cw.pages ? `${cw.pages}页` : cw.duration}</span>
                </label>
              ))}
            </div>

            {/* AI Generate Button */}
            <Button
              variant="outline"
              className="w-full rounded-lg border-dashed border-[#1E6FFF]/50 text-[#1E6FFF] hover:bg-[#1E6FFF]/5"
              onClick={generatedQs.length > 0 ? handleRegenerate : handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />AI 正在生成题目...</>
              ) : generatedQs.length > 0 ? (
                <><RefreshCw className="h-4 w-4 mr-1.5" />重新生成题目</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-1.5" />AI 自动生成题目</>
              )}
            </Button>

            {/* Generated Questions List */}
            {generatedQs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">已生成 {generatedQs.length} 道题目</p>
                  <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                    单选 {generatedQs.filter(q => q.type === "single").length} · 判断 {generatedQs.filter(q => q.type === "judge").length}
                  </Badge>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {generatedQs.map((q, idx) => {
                    const cw = coursewares.find(c => c.id === q.coursewareId);
                    const isEditing = editingId === q.id;

                    if (isEditing && editForm) {
                      return (
                        <Card key={q.id} className="rounded-xl border-[#1E6FFF]/30 border-2">
                          <CardContent className="p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-[#1E6FFF]">编辑第 {idx + 1} 题</span>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveEdit}><Check className="h-3.5 w-3.5 text-emerald-600" /></Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}><X className="h-3.5 w-3.5 text-red-500" /></Button>
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">题干</Label>
                              <Textarea value={editForm.text} onChange={e => setEditForm({ ...editForm, text: e.target.value })} className="text-sm mt-1 min-h-[60px]" />
                            </div>

                            <div>
                              <Label className="text-xs">题型</Label>
                              <Select value={editForm.type} onValueChange={v => {
                                const newType = v as "single" | "judge";
                                if (newType === "judge") {
                                  setEditForm({ ...editForm, type: newType, options: ["正确", "错误"], answer: editForm.answer === "正确" || editForm.answer === "错误" ? editForm.answer : "正确" });
                                } else {
                                  setEditForm({ ...editForm, type: newType, options: editForm.options.length < 4 ? [...editForm.options, "", "", "", ""].slice(0, 4) : editForm.options });
                                }
                              }}>
                                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single">单选</SelectItem>
                                  <SelectItem value="judge">判断</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs">选项（点击设为正确答案）</Label>
                              <div className="space-y-1.5 mt-1">
                                {editForm.options.map((opt, i) => (
                                  <div key={i} className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => setEditForm({ ...editForm, answer: opt })}
                                      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${editForm.answer === opt ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/30"}`}
                                    >
                                      {editForm.answer === opt && "✓"}
                                    </button>
                                    {editForm.type === "judge" ? (
                                      <span className="text-sm">{opt}</span>
                                    ) : (
                                      <Input
                                        value={opt}
                                        onChange={e => {
                                          const newOpts = [...editForm.options];
                                          const oldOpt = newOpts[i];
                                          newOpts[i] = e.target.value;
                                          setEditForm({ ...editForm, options: newOpts, answer: editForm.answer === oldOpt ? e.target.value : editForm.answer });
                                        }}
                                        className="h-7 text-xs"
                                        placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">解析</Label>
                              <Textarea value={editForm.explanation} onChange={e => setEditForm({ ...editForm, explanation: e.target.value })} className="text-xs mt-1 min-h-[40px]" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }

                    return (
                      <Card key={q.id} className="rounded-xl shadow-sm hover:shadow transition-shadow group">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-muted-foreground shrink-0 mt-0.5 tabular-nums w-5">{idx + 1}.</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{q.type === "single" ? "单选" : "判断"}</Badge>
                                {cw && <span className="text-[10px] text-muted-foreground truncate">来自《{cw.title}》</span>}
                              </div>
                              <p className="text-sm leading-relaxed">{q.text}</p>
                              <div className="mt-1.5 space-y-0.5">
                                {q.options.map((opt, i) => (
                                  <div key={i} className={`text-xs flex items-center gap-1 ${opt === q.answer ? "text-emerald-700 font-medium" : "text-muted-foreground"}`}>
                                    <span className="w-4">{String.fromCharCode(65 + i)}.</span>
                                    {opt}
                                    {opt === q.answer && <Check className="h-3 w-3 text-emerald-600" />}
                                  </div>
                                ))}
                              </div>
                              {q.explanation && (
                                <p className="text-[10px] text-muted-foreground mt-1 bg-muted/50 rounded px-2 py-1">💡 {q.explanation}</p>
                              )}
                            </div>
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(q)}>
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteQ(q.id)}>
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div><Label>及格分数</Label><Input type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} /></div>
            <div><Label>考试时长（分钟）</Label><Input type="number" value={examDuration} onChange={e => setExamDuration(Number(e.target.value))} /></div>
            <div><Label>题目数量</Label><Input type="number" value={examCount} onChange={e => setExamCount(Number(e.target.value))} /></div>
            <div className="p-3 rounded-xl bg-muted/50 text-sm space-y-1">
              <p className="font-medium">预览摘要</p>
              <p>标题：{title || "未填写"}</p>
              <p>素材：{selCw.length} 份 · 参训：{selEmps.length} 人</p>
              <p>AI 生成题目：{generatedQs.length} 道（单选 {generatedQs.filter(q => q.type === "single").length} + 判断 {generatedQs.filter(q => q.type === "judge").length}）</p>
              <p>考试：{examCount} 题 · {examDuration} 分钟 · 及格 {passingScore} 分</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          {step > 0 && <Button variant="outline" className="rounded-lg" onClick={() => setStep(s => s - 1)}>上一步</Button>}
          <div className="flex-1" />
          {step < 2 ? (
            <Button className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg" onClick={() => setStep(s => s + 1)} disabled={step === 0 && (!title || selEmps.length === 0)}>下一步</Button>
          ) : (
            <>
              <Button variant="outline" className="rounded-lg" onClick={() => publish(true)}>保存草稿</Button>
              <Button className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg" onClick={() => publish(false)} disabled={selEmps.length === 0}>立即发布</Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
