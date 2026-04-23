import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTraining } from "../TrainingContext";
import { coursewares, employees, type TaskType, type TrainingTask } from "../training-store";
import { toast } from "@/hooks/use-toast";

const taskTypes: TaskType[] = ["新员工入职", "岗位技能", "安全复训", "新工艺导入"];
const depts = ["生产部-SMT组", "生产部-封装组", "品质部", "工程部"];

export default function NewTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTask } = useTraining();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("岗位技能");
  const [deadline, setDeadline] = useState("2026-05-30");
  const [selCourseware, setSelCourseware] = useState<string[]>([]);
  const [selDepts, setSelDepts] = useState<string[]>([]);

  const reset = () => { setStep(0); setTitle(""); setType("岗位技能"); setSelCourseware([]); setSelDepts([]); };

  const selectedEmps = employees.filter(e => selDepts.some(d => e.dept === d));

  const publish = (draft: boolean) => {
    const newTask: TrainingTask = {
      id: `t${Date.now()}`,
      title,
      type,
      status: draft ? "草稿" : "进行中",
      target: selDepts.join("、"),
      headcount: selectedEmps.length,
      deadline,
      createdBy: "HR 刘主管",
      createdAt: new Date().toISOString().slice(0, 10),
      coursewareIds: selCourseware,
      questionIds: [],
      passingScore: 80,
      examDuration: 30,
      examQuestionCount: 20,
      trainees: selectedEmps.map(e => ({
        empId: e.id, learnStatus: "未开始", learnProgress: 0, examScore: null, result: "未完成",
      })),
    };
    addTask(newTask);
    toast({
      title: draft ? "已保存草稿" : "发布成功！",
      description: draft ? undefined : `已发送到 ${selectedEmps.length} 名员工的手机，他们会收到企业微信/短信通知`,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>新建培训任务</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4">
          {["基本信息", "选课件与题目", "选培训对象"].map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                step === i ? "bg-sg-blue text-sg-blue-foreground" :
                step > i ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
              )}>{i + 1}</div>
              <span className={cn("text-xs", step === i ? "font-medium" : "text-muted-foreground")}>{s}</span>
              {i < 2 && <div className="w-6 h-[1px] bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">任务名称</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="如：SMT 贴片机操作规范培训" className="mt-1 rounded-lg" />
            </div>
            <div>
              <Label className="text-xs">培训类型</Label>
              <Select value={type} onValueChange={v => setType(v as TaskType)}>
                <SelectTrigger className="mt-1 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {taskTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">截止日期</Label>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="mt-1 rounded-lg" />
            </div>
          </div>
        )}

        {/* Step 2: Courseware */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">勾选关联的课件和题目（已有题目将自动关联）</p>
            {coursewares.map(c => (
              <label key={c.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/30 cursor-pointer transition-colors">
                <Checkbox
                  checked={selCourseware.includes(c.id)}
                  onCheckedChange={(checked) => {
                    setSelCourseware(prev => checked ? [...prev, c.id] : prev.filter(x => x !== c.id));
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.type}{c.pages ? ` · ${c.pages} 页` : ""}{c.duration ? ` · ${c.duration}` : ""}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Step 3: Select employees */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">按部门/班组勾选参训员工</p>
            {depts.map(d => {
              const emps = employees.filter(e => e.dept === d);
              return (
                <label key={d} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/30 cursor-pointer transition-colors">
                  <Checkbox
                    checked={selDepts.includes(d)}
                    onCheckedChange={(checked) => {
                      setSelDepts(prev => checked ? [...prev, d] : prev.filter(x => x !== d));
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium">{d}</p>
                    <p className="text-xs text-muted-foreground">{emps.length} 名员工</p>
                  </div>
                </label>
              );
            })}
            <div className="p-3 bg-sg-blue-soft rounded-lg text-sm text-sg-blue font-medium">
              已选 {selectedEmps.length} 人
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between pt-2">
          {step > 0 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)} className="rounded-lg">上一步</Button>
          ) : <div />}
          {step < 2 ? (
            <Button size="sm" className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg"
              disabled={step === 0 && !title}
              onClick={() => setStep(s => s + 1)}>下一步</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => publish(true)} className="rounded-lg">保存草稿</Button>
              <Button size="sm" className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg"
                disabled={selectedEmps.length === 0}
                onClick={() => publish(false)}>立即发布</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
