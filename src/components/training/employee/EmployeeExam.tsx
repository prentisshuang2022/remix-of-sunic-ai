import { useState, useEffect, useCallback, useMemo } from "react";
import { useTraining } from "../TrainingContext";
import { getExamQuestions } from "../training-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EmployeeExam() {
  const { empTaskId, tasks, currentEmpId, submitExam, setEmpView } = useTraining();
  const task = tasks.find(t => t.id === empTaskId);
  const qs = useMemo(() => getExamQuestions(empTaskId ?? ""), [empTaskId]);

  const [confirmed, setConfirmed] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState((task?.examDuration ?? 30) * 60);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const unanswered = qs.length - answeredCount;

  const doSubmit = useCallback(() => {
    if (submitted || !task) return;
    setSubmitted(true);
    const timeSpent = (task.examDuration ?? 30) * 60 - timeLeft;
    submitExam(task.id, currentEmpId, answers, timeSpent);
  }, [submitted, task, timeLeft, answers, currentEmpId, submitExam]);

  useEffect(() => {
    if (!confirmed || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.info("时间到，已自动交卷");
          setTimeout(() => doSubmit(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [confirmed, submitted, doSubmit]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const isLowTime = timeLeft <= 300;

  const selectAnswer = (opt: string) => {
    setAnswers(prev => ({ ...prev, [qs[current].id]: opt }));
  };

  const toggleMark = () => {
    setMarked(prev => {
      const next = new Set(prev);
      next.has(current) ? next.delete(current) : next.add(current);
      return next;
    });
  };

  if (!confirmed) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Dialog open onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md" onPointerDownOutside={e => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>开始考试</DialogTitle>
              <DialogDescription>
                考试时长 {task?.examDuration ?? 30} 分钟，共 {qs.length} 题，及格分 {task?.passingScore ?? 80}<br />
                考试过程中请勿关闭浏览器
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEmpView("taskDetail")}>取消</Button>
              <Button className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90" onClick={() => setConfirmed(true)}>开始考试</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const q = qs[current];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <h2 className="font-semibold text-sm">{task?.title}</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">已答 {answeredCount}/{qs.length} 题</span>
          <span className={cn("font-mono text-sm font-bold tabular-nums", isLowTime && "text-red-600 animate-pulse")}>{mm}:{ss}</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-48 border-r bg-muted/20 p-3 overflow-y-auto shrink-0">
          <p className="text-xs text-muted-foreground mb-2">答题卡</p>
          <div className="grid grid-cols-5 gap-1.5">
            {qs.map((_, i) => {
              const isAnswered = answers[qs[i].id] !== undefined;
              const isCur = i === current;
              const isMarked = marked.has(i);
              return (
                <button key={i} onClick={() => setCurrent(i)}
                  className={cn(
                    "w-7 h-7 rounded text-xs font-medium transition-colors",
                    isCur && "ring-2 ring-[#1E6FFF]",
                    isAnswered ? "bg-emerald-500 text-white" : isMarked ? "bg-orange-100 text-orange-700 border border-orange-300" : "bg-muted text-muted-foreground",
                  )}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-bold text-[#1E6FFF]">第 {current + 1} 题</span>
              <Badge variant="outline" className="text-xs">{q.type === "single" ? "单选" : "判断"}</Badge>
            </div>
            <p className="text-base mb-6">{q.text}</p>
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === opt;
                return (
                  <button key={i} onClick={() => selectAnswer(opt)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border text-sm transition-all",
                      selected ? "bg-[#1E6FFF]/10 border-[#1E6FFF] text-[#1E6FFF] font-medium" : "hover:bg-muted/50 border-border"
                    )}>
                    <span className="inline-block w-6 h-6 rounded-full border text-center leading-6 mr-2 text-xs">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>← 上一题</Button>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={toggleMark}>
                {marked.has(current) ? "取消疑问" : "标记疑问"}
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setCurrent(Math.min(qs.length - 1, current + 1))} disabled={current === qs.length - 1}>下一题 →</Button>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-lg" onClick={() => setShowSubmit(true)}>交卷</Button>
          </div>
        </div>
      </div>

      <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认交卷</DialogTitle>
            <DialogDescription>
              {unanswered > 0
                ? `还有 ${unanswered} 题未答，未答计 0 分`
                : `已答 ${answeredCount}/${qs.length} 题，确认提交？提交后无法修改`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmit(false)}>{unanswered > 0 ? "继续作答" : "再检查"}</Button>
            <Button className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90" onClick={() => { setShowSubmit(false); doSubmit(); }}>确认提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
