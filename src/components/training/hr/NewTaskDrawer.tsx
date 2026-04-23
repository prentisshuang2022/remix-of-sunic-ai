import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTraining } from "@/components/training/TrainingContext";
import { employees, coursewares, type TaskType, type TrainingTask, type TraineeRecord } from "../training-store";
import { toast } from "sonner";

const taskTypes: { value: TaskType; label: string }[] = [
  { value: "newEmployee", label: "新员工入职" },
  { value: "positionSkill", label: "岗位技能" },
  { value: "safeRetraining", label: "安全复训" },
  { value: "newProcess", label: "新工艺导入" },
];

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

  const reset = () => { setStep(0); setTitle(""); setType("positionSkill"); setDeadline("2026-05-30"); setSelEmps([]); setSelCw([]); setPassingScore(80); setExamDuration(30); setExamCount(20); };

  const publish = (draft: boolean) => {
    const trainees: TraineeRecord[] = selEmps.map(empId => ({
      empId, notifyStatus: draft ? "未推送" as const : "已推送" as const, learnStatus: "未开始" as const, learnProgress: 0, examScore: null, result: "未完成" as const,
    }));
    const newTask: TrainingTask = {
      id: `t${Date.now()}`, title, type, status: draft ? "draft" : "inProgress",
      target: "手动选择", headcount: selEmps.length, deadline, createdBy: "HR 李主管", createdAt: new Date().toISOString().slice(0, 10),
      coursewareIds: selCw, questionIds: [], passingScore, examDuration, examQuestionCount: examCount, trainees,
    };
    addTask(newTask);
    toast.success(draft ? "已保存草稿" : `已发布并推送给 ${selEmps.length} 名员工`);
    reset(); onClose();
  };

  const toggleEmp = (id: string) => setSelEmps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleCw = (id: string) => setSelCw(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>新建培训任务</SheetTitle>
        </SheetHeader>

        <div className="flex gap-2 my-4">
          {["基本信息", "选择素材", "考试设置"].map((s, i) => (
            <div key={i} className={`flex-1 text-center text-xs py-1.5 rounded-lg ${i === step ? "bg-[#1E6FFF] text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}. {s}</div>
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
            <Button variant="outline" className="w-full rounded-lg" onClick={() => toast.success("AI 已根据素材自动生成 10 道题目")}>
              🤖 AI 自动生成题目
            </Button>
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
